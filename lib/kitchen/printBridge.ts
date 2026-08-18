"use client"

// Puente hacia la impresora de comandas.
//
// La impresora no habla con nosotros: cuelga de la tablet por Bluetooth, y
// quien le escribe es el caparazón nativo de Android. Este módulo solo le
// pasa los bytes ya armados por lib/kitchen/escpos.ts.
//
// Fuera del caparazón — Chrome normal, el celular del dueño, cualquier tablet
// sin la app — todo esto es no-op silencioso. La pantalla de cocina tiene que
// seguir funcionando idéntica para quien no compró impresora.
//
// Misma promesa que la cola de acciones (foodtruckos-tiemporeal): un ticket se
// guarda ANTES de mandarlo y se reintenta solo. Si la impresora está apagada,
// sin papel o fuera de alcance, la comanda sale cuando vuelva — no se pierde.

type NativePrinter = {
  print: (base64: string, copies: number) => void
  status?: () => string
}

type QueuedTicket = { id: string; base64: string; copies: number; attempts: number }

/** Después de esto se descarta: la orden ya se preparó o se canceló hace rato,
 *  e imprimirla tarde confunde más de lo que ayuda. */
const MAX_ATTEMPTS = 20

function bridge(): NativePrinter | null {
  if (typeof window === "undefined") return null
  const w = window as unknown as { FoodTruckOSPrinter?: NativePrinter }
  const b = w.FoodTruckOSPrinter
  return b && typeof b.print === "function" ? b : null
}

/** Si esta pantalla puede imprimir de verdad. False en navegador normal. */
export function isPrintingAvailable(): boolean {
  return bridge() !== null
}

/** Qué dice la impresora — "ready", "no-paper", "offline"... Depende del
 *  caparazón; si no lo implementa todavía, devuelve null. */
export function printerStatus(): string | null {
  try {
    return bridge()?.status?.() ?? null
  } catch {
    return null
  }
}

function storageKey(unitId: string) {
  return `ft_cocina_impresion_${unitId}`
}

function readQueue(unitId: string): QueuedTicket[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey(unitId)) || "[]")
  } catch {
    return []
  }
}

function writeQueue(unitId: string, queue: QueuedTicket[]) {
  try {
    localStorage.setItem(storageKey(unitId), JSON.stringify(queue))
  } catch {
    // Si localStorage falla se pierde la garantía de reintento, no el intento
    // en curso. La comanda de todos modos se manda abajo.
  }
}

function toBase64(bytes: Uint8Array): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

/** Encola la comanda y trata de sacarla de inmediato. */
export function enqueueTicket(unitId: string, bytes: Uint8Array, copies = 1) {
  if (!isPrintingAvailable()) return
  const queue = readQueue(unitId)
  queue.push({ id: crypto.randomUUID(), base64: toBase64(bytes), copies, attempts: 0 })
  writeQueue(unitId, queue)
  drainTickets(unitId)
}

export function pendingTickets(unitId: string): number {
  return readQueue(unitId).length
}

let draining = false

/** Vacía la cola de tickets. Se llama al encolar y desde el intervalo del
 *  tablero, igual que drainQueue de las acciones. */
export function drainTickets(unitId: string, onChange?: () => void) {
  if (draining) return
  const printer = bridge()
  if (!printer) return

  draining = true
  let algoSalio = false
  try {
    let queue = readQueue(unitId)
    while (queue.length > 0) {
      const [next, ...rest] = queue
      try {
        printer.print(next.base64, next.copies)
        algoSalio = true
        queue = rest
        writeQueue(unitId, queue)
        onChange?.()
      } catch {
        next.attempts++
        if (next.attempts >= MAX_ATTEMPTS) {
          // Se rinde con este y sigue con los demás: un ticket atorado no
          // puede bloquear los que vienen atrás.
          queue = rest
          writeQueue(unitId, queue)
          onChange?.()
          continue
        }
        writeQueue(unitId, [next, ...rest])
        break // el intervalo de fuera vuelve a intentar
      }
    }
  } finally {
    draining = false
  }

  // El aviso se manda solo cuando el papel salió de verdad, no al encolar.
  // Si se marcara al encolar, printer_last_ok_at nunca se vería caído y la
  // alerta "tu impresora no responde desde las 3pm" sería inútil.
  if (algoSalio) void reportPrinterAlive()
}

/** Avisa al servidor que sí se imprimió, para poder decirle al dueño "tu
 *  impresora no responde desde las 3pm" sin ir al truck. Es informativo: si
 *  falla, la impresión ya ocurrió igual. */
export async function reportPrinterAlive() {
  try {
    await fetch("/api/kitchen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "printerAlive" }),
    })
  } catch {
    // sin red no pasa nada: es telemetría, no parte de imprimir
  }
}
