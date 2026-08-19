// Genera los bytes de la comanda de cocina en ESC/POS.
//
// Vive en la web a propósito: así el formato del ticket se cambia publicando
// como cualquier otro cambio, sin republicar la app nativa en la tienda. Y
// como corre en el cliente, el pedido de ventanilla se imprime aunque el
// truck esté sin señal — que es la razón de ser de toda esta arquitectura.
//
// El caparazón nativo solo recibe estos bytes y los escribe al socket
// Bluetooth. No interpreta nada.

const ESC = 0x1b
const GS = 0x1d

// Tabla de caracteres 2 = CP850 (multilingüe). Es la que trae los acentos y la
// ñ del español. Sin esto la impresora escupe "Ã±" en vez de "ñ".
const CODE_PAGE_CP850 = 2

// Papel que se avanza antes de cortar, en puntos (203 ppp: 8 puntos ≈ 1 mm).
// 220 ≈ 27 mm, con holgura sobre los ~8 renglones que retiene la P047.
// Si un modelo desperdicia papel, se baja midiendo: imprime, corta, y mide
// cuánto sobra en blanco debajo del último renglón.
const CORTE_AVANCE_PUNTOS = 220

// CP850 solo para lo que de verdad aparece en un menú en español. Lo que no
// esté aquí cae al equivalente sin acento antes que imprimir basura.
const CP850: Record<string, number> = {
  "á": 0xa0, "é": 0x82, "í": 0xa1, "ó": 0xa2, "ú": 0xa3,
  "Á": 0xb5, "É": 0x90, "Í": 0xd6, "Ó": 0xe0, "Ú": 0xe9,
  "ñ": 0xa4, "Ñ": 0xa5, "ü": 0x81, "Ü": 0x9a,
  "¿": 0xa8, "¡": 0xad, "°": 0xf8, "ª": 0xa6, "º": 0xa7,
}

const SIN_ACENTO: Record<string, string> = {
  "á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u",
  "Á": "A", "É": "E", "Í": "I", "Ó": "O", "Ú": "U",
  "ñ": "n", "Ñ": "N", "ü": "u", "Ü": "U",
  "–": "-", "—": "-", "…": "...", "“": '"', "”": '"', "‘": "'", "’": "'",
}

function encodeText(text: string): number[] {
  const out: number[] = []
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 63
    if (code < 128) {
      out.push(code)
      continue
    }
    const mapped = CP850[ch]
    if (mapped !== undefined) {
      out.push(mapped)
      continue
    }
    // Último recurso: quitarle el acento, y si tampoco se puede, un signo de
    // interrogación. Nunca un byte suelto que descuadre la impresión.
    const fallback = SIN_ACENTO[ch]
    if (fallback) {
      for (const f of fallback) out.push(f.charCodeAt(0))
    } else {
      out.push(63)
    }
  }
  return out
}

export type TicketLabels = {
  order: string
  note: string
  toCollect: string
  paid: string
  counter: string
  qr: string
  reprint: string
}

export type TicketOrder = {
  folio: number | null
  channel: string
  customer_name: string | null
  payment_status: string
  total: number
  notes: string | null
  created_at: string
}

export type TicketItem = {
  id: string
  quantity: number
  product_name_snapshot: string
  customizations_snapshot: unknown
  notes: string | null
}

export type TicketInput = {
  unitName: string
  order: TicketOrder
  items: TicketItem[]
  labels: TicketLabels
  /** 48 para 80 mm en fuente A. 32 para 58 mm. */
  widthChars?: number
  /** Chicharra al entrar una orden. APAGADA por omisión: la P047 no soporta
   *  `ESC B` y lo imprime como texto (probado 18/08/2026). Solo encender en un
   *  modelo donde se haya verificado que suena. */
  buzzer?: boolean
  /** Marca el ticket como copia, para que cocina no prepare el platillo dos veces. */
  isReprint?: boolean
}

type Customization = { groupName?: string; optionName?: string; kind?: string }

function parseCustomizations(raw: unknown): Customization[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((c): c is Customization => typeof c === "object" && c !== null)
}

/** Corta respetando palabras. Un nombre de platillo largo no se debe partir a la mitad. */
function wrap(text: string, width: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  if (!words.length) return [""]
  const lines: string[] = []
  let current = ""
  for (const word of words) {
    if (!current) {
      current = word
    } else if (current.length + 1 + word.length <= width) {
      current += " " + word
    } else {
      lines.push(current)
      current = word
    }
    // Una sola palabra más larga que el renglón sí se parte, no hay opción.
    while (current.length > width) {
      lines.push(current.slice(0, width))
      current = current.slice(width)
    }
  }
  if (current) lines.push(current)
  return lines
}

function leftRight(left: string, right: string, width: number): string {
  // Si no caben los dos, se recorta la izquierda: la hora y el total son lo
  // que no se puede perder, un nombre largo sí se puede acortar.
  const room = width - right.length - 1
  const cut = left.length > room ? left.slice(0, Math.max(0, room)) : left
  const gap = width - cut.length - right.length
  return cut + " ".repeat(Math.max(1, gap)) + right
}

export function buildTicket(input: TicketInput): Uint8Array {
  const width = input.widthChars ?? 48
  const { order, items, labels } = input
  const bytes: number[] = []

  const raw = (...b: number[]) => bytes.push(...b)
  const text = (s: string) => bytes.push(...encodeText(s))
  const feed = (n = 1) => raw(ESC, 0x64, n)
  const bold = (on: boolean) => raw(ESC, 0x45, on ? 1 : 0)
  const align = (a: 0 | 1 | 2) => raw(ESC, 0x61, a)
  const size = (double: boolean) => raw(GS, 0x21, double ? 0x11 : 0x00)
  const rule = () => {
    text("-".repeat(width))
    feed()
  }

  raw(ESC, 0x40) // inicializar
  raw(ESC, 0x74, CODE_PAGE_CP850)

  // --- Encabezado: de qué truck es ---
  align(1)
  bold(true)
  text(input.unitName.toUpperCase())
  bold(false)
  feed()

  if (input.isReprint) {
    text(labels.reprint.toUpperCase())
    feed()
  }

  align(0)
  rule()

  // --- El folio: es el número que el comensal ve en su celular y el que va a
  // decir en la ventanilla. Va grande porque es lo que se busca de un vistazo
  // cuando hay diez tickets colgados en el riel.
  align(1)
  size(true)
  bold(true)
  text(`${labels.order} #${order.folio ?? "?"}`)
  bold(false)
  size(false)
  feed()
  align(0)

  rule()
  feed()

  // --- Platillos ---
  for (const item of items) {
    const qty = `${item.quantity}`.padStart(2, " ")
    const nameWidth = width - 5
    const nameLines = wrap(item.product_name_snapshot.toUpperCase(), nameWidth)

    bold(true)
    text(`${qty}  ${nameLines[0]}`)
    bold(false)
    feed()
    for (const extra of nameLines.slice(1)) {
      bold(true)
      text(`    ${extra}`)
      bold(false)
      feed()
    }

    for (const c of parseCustomizations(item.customizations_snapshot)) {
      const name = c.optionName ?? ""
      if (!name) continue
      // Lo que se quita va en mayúsculas: es el error caro en cocina, y en
      // pantalla ya se pinta en rojo por la misma razón.
      const isRemove = c.kind === "remove"
      const mark = isRemove ? "-" : "+"
      const label = isRemove ? name.toUpperCase() : name
      for (const l of wrap(`${mark} ${label}`, width - 6)) {
        text(`      ${l}`)
        feed()
      }
    }

    if (item.notes) {
      for (const l of wrap(`"${item.notes}"`, width - 6)) {
        text(`      ${l}`)
        feed()
      }
    }

    feed()
  }

  // --- Nota de toda la orden ---
  if (order.notes) {
    rule()
    for (const l of wrap(`${labels.note}: ${order.notes}`, width)) {
      text(l)
      feed()
    }
  }

  // --- Pie: de dónde vino, a qué hora, y si hay que cobrar ---
  rule()
  const canal = order.channel === "ventanilla" ? labels.counter : labels.qr
  // La tablet está físicamente en el truck, así que la hora local del aparato
  // es la hora correcta del pedido.
  const hora = new Date(order.created_at).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })
  const quien = order.customer_name ? ` ${order.customer_name}` : ""
  text(leftRight(canal + quien, hora, width))
  feed()

  bold(true)
  const pagado = order.payment_status === "pagada"
  text(leftRight(pagado ? labels.paid : labels.toCollect, `$${order.total.toFixed(2)}`, width))
  bold(false)
  feed()

  if (input.buzzer === true) {
    // Apagada por omisión, y no por prudencia: se probó en la MUNBYN P047 el
    // 18/08/2026 y NO entiende ESC B — imprime los bytes como texto en vez de
    // sonar. Dejarla activada ensuciaría cada comanda en la impresora que
    // justamente recomendamos. Queda como opción por si algún modelo futuro sí
    // la soporta; el aviso sonoro real lo da la tablet.
    raw(ESC, 0x42, 3, 2)
  }

  // Cortar avanzando primero. La cuchilla está más arriba que el cabezal, así
  // que al cortar sin avance los últimos renglones siguen dentro del mecanismo
  // y el ticket sale partido a la mitad — pasó en la P047, que retiene unos
  // 8 renglones.
  //
  // GS V 66 n corta avanzando n puntos. A 203 ppp, 8 puntos ≈ 1 mm.
  raw(GS, 0x56, 0x42, CORTE_AVANCE_PUNTOS)

  return new Uint8Array(bytes)
}

/** Vista previa en texto plano. Para probar el formato sin impresora. */
export function previewTicket(input: TicketInput): string {
  const bytes = buildTicket(input)
  const out: string[] = []
  let i = 0
  while (i < bytes.length) {
    const b = bytes[i]
    if (b === ESC || b === GS) {
      // Saltar comandos: solo interesa el texto para revisar el maquetado.
      const next = bytes[i + 1]
      if (b === ESC && next === 0x64) { out.push("\n"); i += 3; continue }
      if (b === ESC && (next === 0x45 || next === 0x61 || next === 0x74)) { i += 3; continue }
      if (b === ESC && next === 0x40) { i += 2; continue }
      if (b === ESC && next === 0x42) { i += 4; continue }
      if (b === GS && next === 0x21) { i += 3; continue }
      if (b === GS && next === 0x56) { i += 4; continue }
      i += 2
      continue
    }
    const char = Object.entries(CP850).find(([, code]) => code === b)?.[0]
    out.push(char ?? String.fromCharCode(b))
    i += 1
  }
  return out.join("")
}
