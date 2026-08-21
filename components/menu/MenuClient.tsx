"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useLang } from "@/lib/i18n/LangProvider"
import { createOrder, type CartItemInput } from "@/lib/orders/actions"
import type { ActiveMenuData } from "@/lib/menu/getMenuData"
import { displayFont } from "@/lib/fonts"
import { MOTIFS, isBrandMotif } from "@/lib/branding/motifs"
import { dateInTimezone, parseWeeklyHours } from "@/lib/units/hours"
import { CustomizeSheet } from "./CustomizeSheet"

const WEEKDAY_FULL: Record<"es" | "en", string[]> = {
  es: ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"],
  en: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
}
const WEEKDAY_INDEX: Record<string, number> = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 }

// Formato pedido para este badge específicamente: siempre con minutos y
// AM/PM en mayúsculas ("9:00 AM"), a diferencia de formatClock (que usa
// minúsculas y omite ":00") que ya se usa en Trucks y en otras pantallas.
function formatHourFull(hhmm: string) {
  const [hStr, mStr] = hhmm.split(":")
  const h = Number(hStr)
  const period = h >= 12 ? "PM" : "AM"
  const h12 = h % 12 || 12
  return `${h12}:${mStr.padStart(2, "0")} ${period}`
}

type CartLine = CartItemInput & { key: string }

const LINE = "#E4DCD0"
const INK = "#1A1512"
const INK_SOFT = "#6B615A"
const PANEL = "#FFFDF9"
const SOLD = "#9A8F86"

function monogram(name: string) {
  const words = name.trim().split(/\s+/)
  return words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

// Ninguna orden se pierde por mala conexión (regla de oro): el carrito se
// guarda local antes de intentar enviarlo, para que perder la señal, recargar
// sin querer o que el navegador libere memoria de fondo no borre el pedido a
// medio armar. Se limpia solo cuando el pedido ya se confirmó con el servidor.
const CART_STORAGE_VERSION = 1

function cartStorageKey(orderPointId: string) {
  return `foodtruckos:cart:${orderPointId}`
}

function loadStoredCart(orderPointId: string): { cart: CartLine[]; customerName: string } | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(cartStorageKey(orderPointId))
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed.v !== CART_STORAGE_VERSION || !Array.isArray(parsed.cart)) return null
    return { cart: parsed.cart, customerName: parsed.customerName ?? "" }
  } catch {
    return null
  }
}

export function MenuClient({ data }: { data: ActiveMenuData }) {
  const { lang, setLang, t } = useLang()
  const router = useRouter()
  const storageKey = cartStorageKey(data.orderPoint.id)
  const [cart, setCart] = useState<CartLine[]>([])
  const [customerName, setCustomerName] = useState("")
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [staleReload, setStaleReload] = useState(false)
  const [cartCleared, setCartCleared] = useState(false)
  const [customizing, setCustomizing] = useState<(typeof data.products)[number] | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // El carrito guardado se restaura DESPUÉS de montar, nunca en el render
  // inicial: leerlo durante useState/render produciría un HTML distinto al
  // que ya mandó el servidor y rompería la hidratación de React.
  useEffect(() => {
    const stored = loadStoredCart(data.orderPoint.id)
    if (stored) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restaurar carrito post-montaje, ver comentario arriba
      setCart(stored.cart)
      setCustomerName(stored.customerName)
    }
    setHydrated(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo debe correr una vez, al montar
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      if (cart.length === 0) {
        window.localStorage.removeItem(storageKey)
      } else {
        window.localStorage.setItem(storageKey, JSON.stringify({ v: CART_STORAGE_VERSION, cart, customerName }))
      }
    } catch {
      // Almacenamiento lleno o bloqueado (modo privado, etc.) — el carrito
      // sigue funcionando en memoria, solo no sobrevive un cierre de pestaña.
    }
  }, [cart, customerName, storageKey, hydrated])

  const vibrante = data.business.menu_style !== "tradicional"

  const offeredByUnit = useMemo(() => {
    const map = new Map(data.unitProducts.map((up) => [up.product_id, up]))
    return map
  }, [data.unitProducts])

  // Un grupo sin ninguna opción todavía (el dueño lo creó pero no le ha
  // agregado nada) no cuenta como personalización real — mostrarlo confunde
  // al comensal con un encabezado vacío y nada que elegir debajo.
  const groupsByProduct = useMemo(() => {
    const groupsWithOptions = new Set(data.options.map((o) => o.group_id))
    const map = new Map<string, typeof data.optionGroups>()
    for (const g of data.optionGroups) {
      if (!groupsWithOptions.has(g.id)) continue
      if (!map.has(g.product_id)) map.set(g.product_id, [])
      map.get(g.product_id)!.push(g)
    }
    return map
  }, [data.optionGroups, data.options])


  // Qué categoría se está viendo. Antes ninguna se marcaba: las pastillas se
  // pintaban todas iguales siempre, y en un menú largo el comensal perdía de
  // vista en qué parte iba.
  const [catActiva, setCatActiva] = useState<string | null>(null)
  const navRef = useRef<HTMLElement | null>(null)

  // Se resuelve leyendo posiciones en el scroll, no con IntersectionObserver.
  // No es por gusto: IO existe pero puede no entregar nada en navegadores
  // empotrados, y ahí el realce simplemente no aparecería sin ningún error que
  // lo delate. Un detector de scroll funciona en todo y se puede comprobar.
  useEffect(() => {
    // Un poco más abajo de la barra pegajosa: la categoría se marca cuando su
    // título cruza la barra, que es justo cuando el comensal deja de verlo.
    const CORTE = 88
    let programado = false

    const recalcular = () => {
      programado = false
      const secciones = [...document.querySelectorAll<HTMLElement>("section[id^='cat-']")]
      if (!secciones.length) return
      // La última que ya pasó el corte es en la que vas parado. Si ninguna
      // pasó todavía (estás hasta arriba), manda la primera.
      let actual = secciones[0]
      for (const s of secciones) {
        if (s.getBoundingClientRect().top <= CORTE) actual = s
      }
      setCatActiva(actual.id.replace("cat-", ""))
    }

    // Se agrupa por cuadro: en un celular de gama baja, recalcular en cada
    // evento de scroll es de las cosas que hacen sentir la página pegajosa.
    const alHacerScroll = () => {
      if (programado) return
      programado = true
      requestAnimationFrame(recalcular)
    }

    recalcular()
    window.addEventListener("scroll", alHacerScroll, { passive: true })
    window.addEventListener("resize", alHacerScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", alHacerScroll)
      window.removeEventListener("resize", alHacerScroll)
    }
  }, [])

  // La pastilla marcada tiene que verse: con seis categorías, la activa puede
  // quedar fuera del scroll horizontal y el realce no serviría de nada.
  useEffect(() => {
    if (!catActiva || !navRef.current) return
    const chip = navRef.current.querySelector<HTMLElement>(`[data-cat="${catActiva}"]`)
    chip?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" })
  }, [catActiva])

  const productsByCategory = useMemo(() => {
    const groups = new Map<string | null, typeof data.products>()
    for (const p of data.products) {
      const up = offeredByUnit.get(p.id)
      if (up && up.is_offered === false) continue // exclusivo de otro truck
      const key = p.category_id
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(p)
    }
    return groups
  }, [data.products, offeredByUnit])

  function addToCart(product: (typeof data.products)[number]) {
    setCart((c) => {
      const existing = c.find((l) => l.productId === product.id && l.customizations.length === 0)
      if (existing) {
        return c.map((l) => (l.key === existing.key ? { ...l, quantity: l.quantity + 1 } : l))
      }
      const name = lang === "es" ? product.name_es : product.name_en
      return [
        ...c,
        {
          key: `${product.id}-${Date.now()}`,
          productId: product.id,
          quantity: 1,
          unitPrice: product.price,
          productName: name,
          customizations: [],
        },
      ]
    })
  }

  // Un platillo con extras/quita siempre abre la hoja de personalización,
  // aunque sea para confirmar sin elegir nada — cada combinación distinta se
  // agrega como su propia línea, nunca se fusiona con otra (a diferencia del
  // "agregar rápido" de un platillo sin opciones).
  function handleTap(product: (typeof data.products)[number]) {
    if ((groupsByProduct.get(product.id)?.length ?? 0) > 0) {
      setCustomizing(product)
    } else {
      addToCart(product)
    }
  }

  function addCustomizedToCart(line: CartItemInput) {
    setCart((c) => [...c, { ...line, key: `${line.productId}-${Date.now()}` }])
    setCustomizing(null)
  }

  function changeQty(key: string, delta: number) {
    setCart((c) =>
      c
        .map((l) => (l.key === key ? { ...l, quantity: l.quantity + delta } : l))
        .filter((l) => l.quantity > 0),
    )
  }

  const cartCount = cart.reduce((s, l) => s + l.quantity, 0)

  const cartSubtotal = cart.reduce((s, l) => s + (l.unitPrice + l.customizations.reduce((a, c) => a + c.priceDelta, 0)) * l.quantity, 0)

  async function handleCheckout() {
    setSending(true)
    setSendError(null)
    let result: Awaited<ReturnType<typeof createOrder>>
    try {
      result = await createOrder({
        businessId: data.business.id,
        unitId: data.unit.id,
        orderPointId: data.orderPoint.id,
        taxIncluded: data.business.tax_included,
        customerName: customerName || undefined,
        items: cart,
      })
    } catch {
      // La llamada en sí truena (no una respuesta con { error }) casi
      // siempre porque el navegador sigue con el código de antes del último
      // despliegue y el servidor ya no reconoce esa versión de la acción.
      // Reintentar con el mismo código roto vuelve a fallar igual — hay que
      // recargar para traer el código nuevo. El carrito ya vive en
      // localStorage (regla de oro), así que la recarga no pierde el pedido:
      // vuelve a aparecer solo y el comensal nada más toca "enviar" otra vez.
      setSending(false)
      setStaleReload(true)
      window.setTimeout(() => window.location.reload(), 1500)
      return
    }
    setSending(false)
    if ("error" in result) {
      // Un carrito que el servidor no puede procesar se tira aquí mismo. Si no,
      // se queda guardado, se restaura al volver a escanear el QR, y el
      // comensal repite el mismo error para siempre sin forma de salir.
      if (result.error === "badCart") {
        setCart([])
        setCustomerName("")
        try {
          window.localStorage.removeItem(storageKey)
        } catch {
          // sin almacenamiento el carrito ya vive solo en memoria, y acaba de vaciarse
        }
        // El aviso va aparte del carrito a propósito: al vaciarlo desaparece
        // toda la barra de abajo, y con ella se iría el mensaje. El comensal
        // vería su pedido esfumarse sin ninguna explicación.
        setCartCleared(true)
        setSendError(null)
        return
      }
      // El servidor manda un código (truck cerrado, en pausa, suspendido,
      // etc.), nunca el texto — mostrar siempre el mismo mensaje genérico
      // aquí escondía el motivo real, y un texto fijo en español no habría
      // respetado el idioma que el comensal tiene activo en la pantalla.
      setSendError(t.menu.orderError[result.error])
      return
    }
    try {
      window.localStorage.removeItem(storageKey)
    } catch {
      // no pasa nada si no se pudo limpiar — el pedido ya se confirmó
    }
    router.push(`/orden/${result.orderId}`)
  }

  const blackHeader = data.business.header_style === "black"
  const motif = isBrandMotif(data.business.brand_motif) ? data.business.brand_motif : "tacos"
  const today = dateInTimezone(data.business.timezone, new Date())
  const todayHours = parseWeeklyHours(data.unit.hours)[today.dayKey]
  const todayLabel = WEEKDAY_FULL[lang][WEEKDAY_INDEX[today.dayKey]]

  return (
    <div style={{ background: PANEL, minHeight: "100vh" }}>
    {/* La columna sigue midiendo max-w-lg, pero el crema ya no vive solo
        dentro de ella: en cualquier ventana más ancha que 512 px — un
        navegador con el zoom por debajo del 100 %, una tablet, la vista de
        escritorio — el menú se veía como una tarjeta suelta flotando sobre
        una página blanca. */}
    <div className={`${displayFont.variable} relative mx-auto max-w-lg pb-8`} style={{ background: PANEL, color: INK }}>
      {/* El fondo liso se sentía genérico. La textura es el MISMO motivo que
          el dueño ya eligió para su marca — tacos, mariscos, café — así que
          cada cliente tiene un fondo distinto sin que nadie lo diseñe aparte,
          y no hay un color nuevo en juego: es el suyo, casi transparente.

          Al 3.5% no compite con nada ni estorba bajo el sol: la información
          sigue siendo el platillo y el precio. pointer-events-none para que
          no se coma ningún toque. */}
      <svg
        width="100%"
        height="100%"
        className="pointer-events-none absolute inset-0 z-0"
        style={{ color: "var(--brand-primary)", opacity: 0.035 }}
        aria-hidden="true"
      >
        <defs>
          <pattern id="menuPageMotif" width="112" height="112" patternUnits="userSpaceOnUse">
            <g
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              dangerouslySetInnerHTML={{ __html: MOTIFS[motif].pat }}
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#menuPageMotif)" />
      </svg>

      <div className="relative z-[1]">
      {data.unit.photo_url && (
        // Foto de portada del truck, la que el dueño sube en Trucks — no
        // tenía dónde mostrarse en el menú del comensal hasta ahora.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={data.unit.photo_url} alt="" className="h-40 w-full object-cover" />
      )}
      <header
        className="relative overflow-hidden px-4 pb-5 pt-4"
        style={blackHeader ? { background: "#0A0A0A", color: "#fff" } : { background: "var(--brand-primary)", color: "var(--brand-on-primary)" }}
      >
        {/* width/height="100%" explícitos, no solo el posicionamiento por CSS
            (inset-0) — sin esto, algunos navegadores (Safari en particular)
            caen al tamaño por defecto de un SVG sin atributos (~300x150) en
            vez de estirarlo, dejando sin patrón cualquier parte del header
            más ancha que eso. */}
        <svg width="100%" height="100%" className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true">
          <defs>
            <pattern id="menuHeaderMotif" width="112" height="112" patternUnits="userSpaceOnUse">
              <g
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                dangerouslySetInnerHTML={{ __html: MOTIFS[motif].pat }}
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#menuHeaderMotif)" />
        </svg>
        <div className="relative flex items-center gap-3">
          {data.business.logo_url ? (
            // Montado directo sobre el header, sin placa — el logo adopta el
            // fondo del encabezado (color de marca o negro). Si el PNG es
            // transparente se funde; si trae su propio lienzo, ese lienzo se
            // ve, y es justo lo que se espera al subir un logo así.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.business.logo_url} alt="" className="h-20 w-20 flex-none object-contain" />
          ) : (
            <div
              className="grid h-20 w-20 flex-none place-items-center rounded-full"
              style={blackHeader ? { background: "rgba(255,255,255,0.1)" } : { background: "var(--brand-on-primary)", color: "var(--brand-primary)" }}
            >
              <span style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>{monogram(data.business.name)}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1
              className="truncate uppercase leading-[0.95] tracking-tight"
              style={{ fontFamily: "var(--font-display)", fontSize: 27 }}
            >
              {data.business.name}
            </h1>
            <div className="mt-0.5 text-xs font-medium opacity-90">{data.unit.name}</div>
          </div>
          <button
            className="flex-none rounded-full border border-current px-3 py-1 text-xs font-semibold"
            onClick={() => setLang(lang === "es" ? "en" : "es")}
          >
            {lang === "es" ? "EN" : "ES"}
          </button>
        </div>
        <div className="relative mt-3.5 flex flex-wrap items-center gap-1.5">
          <div
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${blackHeader ? "bg-white/15" : "bg-black/20"}`}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={
                data.openStatus.open
                  ? { background: "#4ADE80", boxShadow: "0 0 0 3px rgba(74,222,128,.28)" }
                  : { background: "#9CA3AF", boxShadow: "0 0 0 3px rgba(156,163,175,.28)" }
              }
            />
            {data.openStatus.open ? t.menu.openNowLabel : t.menu.closedNowLabel}
          </div>
          {todayHours && (
            <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${blackHeader ? "bg-white/15" : "bg-black/20"}`}>
              {t.menu.todayHoursLabel(todayLabel, `${formatHourFull(todayHours.open)} – ${formatHourFull(todayHours.close)}`)}
            </div>
          )}
        </div>
        <div
          className="absolute inset-x-0 bottom-0 h-1.5"
          style={{
            backgroundImage: blackHeader
              ? "repeating-linear-gradient(90deg, rgba(255,255,255,.12) 0 14px, transparent 14px 28px)"
              : "repeating-linear-gradient(90deg, rgba(0,0,0,.22) 0 14px, transparent 14px 28px)",
          }}
        />
      </header>

      <nav
        ref={navRef}
        className="sticky top-0 z-10 flex gap-2 overflow-x-auto border-b px-4 py-2.5"
        style={{ background: PANEL, borderColor: LINE, scrollbarWidth: "none" }}
      >
        {data.categories.map((cat) => {
          const activa = cat.id === catActiva
          return (
            <a
              key={cat.id}
              href={`#cat-${cat.id}`}
              data-cat={cat.id}
              // Se marca al tocar, sin esperar a que el scroll llegue: en un
              // celular lento el rebote de medio segundo se siente a avería.
              onClick={() => setCatActiva(cat.id)}
              aria-current={activa ? "true" : undefined}
              className="flex-none rounded-full border px-3.5 py-1.5 text-xs font-bold transition-colors"
              style={
                activa
                  ? // El color de marca del cliente, con el texto que
                    // onColorFor() ya calcula por contraste. Así el realce se
                    // sostiene con las diez opciones de la paleta y no solo
                    // con la que se ve bien en el monitor.
                    { borderColor: "var(--brand-primary)", backgroundColor: "var(--brand-primary)", color: "var(--brand-on-primary)" }
                  : { borderColor: LINE, color: INK_SOFT }
              }
            >
              {lang === "es" ? cat.name_es : cat.name_en}
            </a>
          )
        })}
      </nav>

      {cartCleared && (
        <div className="mx-4 mt-4 rounded-xl border-2 px-4 py-3 text-sm font-semibold" style={{ background: "#FDF3E0", borderColor: "#F0D9A8", color: "#6B4A12" }}>
          {t.menu.orderError.badCart}
          <button onClick={() => setCartCleared(false)} className="mt-1.5 block font-bold underline">
            {t.menu.cancel}
          </button>
        </div>
      )}

      <div className="space-y-7 px-4 pt-5">
        {[...productsByCategory.entries()].map(([catId, products]) => {
          const category = data.categories.find((c) => c.id === catId)
          return (
            <section key={catId ?? "sin-categoria"} id={category ? `cat-${category.id}` : undefined}>
              {category && (
                <div className="mb-2.5 flex items-baseline gap-2 border-t-4 pt-2" style={{ borderColor: "var(--brand-primary)" }}>
                  <h2
                    className="uppercase tracking-wide"
                    style={{ fontFamily: "var(--font-display)", fontSize: 22, lineHeight: 1 }}
                  >
                    {lang === "es" ? category.name_es : category.name_en}
                  </h2>
                  <span className="text-[11px] font-semibold" style={{ color: INK_SOFT }}>
                    {products.length}
                  </span>
                </div>
              )}
              <div className={vibrante ? "space-y-2.5" : ""}>
                {products.map((p) => {
                  const up = offeredByUnit.get(p.id)
                  const soldOut = up?.sold_out === true
                  const name = lang === "es" ? p.name_es : p.name_en
                  const desc = lang === "es" ? p.description_es : p.description_en
                  const customizable = (groupsByProduct.get(p.id)?.length ?? 0) > 0
                  const buildYourOwn = (groupsByProduct.get(p.id) ?? []).some((g) => g.required)

                  if (buildYourOwn) {
                    return (
                      <button
                        key={p.id}
                        onClick={() => !soldOut && handleTap(p)}
                        disabled={soldOut}
                        className="flex w-full items-start gap-3 rounded-xl border-2 border-dashed p-3.5 text-left disabled:opacity-60"
                        style={{ borderColor: "var(--brand-primary)" }}
                      >
                        {p.photo_url && (
                          <div className="grid h-[68px] w-[68px] flex-none place-items-center overflow-hidden rounded-md">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.photo_url} alt="" className="h-full w-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="uppercase leading-tight" style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--brand-primary)" }}>
                            {name}
                          </div>
                          {desc && (
                            <div className="mt-1 text-[12.5px] leading-snug" style={{ color: INK_SOFT }}>
                              {desc}
                            </div>
                          )}
                          {soldOut ? (
                            <SoldOutTag label={t.menu.soldOut} />
                          ) : (
                            <span
                              className="mt-2.5 inline-block rounded-full px-3.5 py-1.5 text-xs font-bold"
                              style={{ background: "var(--brand-primary)", color: "var(--brand-on-primary)" }}
                            >
                              {p.price > 0 ? `${t.menu.buildFrom} $${p.price.toFixed(2)}` : t.menu.buildCta}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  }

                  if (vibrante) {
                    return (
                      <div
                        key={p.id}
                        className="flex items-start gap-3 rounded-xl border p-3"
                        style={{ borderColor: LINE, opacity: soldOut ? 0.65 : 1 }}
                      >
                        <div
                          className="grid h-[68px] w-[68px] flex-none place-items-center overflow-hidden rounded-md"
                          style={{ background: soldOut ? SOLD : "var(--brand-primary)", color: "var(--brand-on-primary)" }}
                        >
                          {p.photo_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.photo_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span style={{ fontFamily: "var(--font-display)", fontSize: 30 }}>{name[0]}</span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="uppercase leading-tight" style={{ fontFamily: "var(--font-display)", fontSize: 19 }}>
                            {name}
                          </div>
                          {desc && (
                            <div className="mt-1 text-[13px] leading-snug" style={{ color: INK_SOFT }}>
                              {desc}
                            </div>
                          )}
                          {soldOut && <SoldOutTag label={t.menu.soldOut} />}
                          {!soldOut && customizable && <CustomizableTag etiqueta={t.menu.customizable} />}
                        </div>
                        <div className="flex flex-none flex-col items-end gap-2">
                          <div style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>${p.price.toFixed(2)}</div>
                          <AddButton disabled={soldOut} onClick={() => handleTap(p)} label={t.menu.addToCart} />
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div key={p.id} className="border-b py-2.5" style={{ borderColor: LINE, opacity: soldOut ? 0.65 : 1 }}>
                      <div className="flex items-baseline gap-2">
                        <span
                          className="flex-none uppercase"
                          style={{ fontFamily: "var(--font-display)", fontSize: 18, maxWidth: "62%" }}
                        >
                          {name}
                        </span>
                        <span
                          className="-translate-y-1 flex-1 border-b border-dotted"
                          style={{ borderColor: LINE, minWidth: 12 }}
                        />
                        <span className="flex-none" style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>
                          ${p.price.toFixed(2)}
                        </span>
                        <AddButton disabled={soldOut} onClick={() => handleTap(p)} label={t.menu.addToCart} small />
                      </div>
                      {desc && (
                        <div className="mt-1 truncate text-xs" style={{ color: INK_SOFT }}>
                          {desc}
                        </div>
                      )}
                      {soldOut && <SoldOutTag label={t.menu.soldOut} />}
                      {!soldOut && customizable && <CustomizableTag etiqueta={t.menu.customizable} />}
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {customizing && (
        <CustomizeSheet
          product={customizing}
          groups={groupsByProduct.get(customizing.id) ?? []}
          options={data.options}
          onClose={() => setCustomizing(null)}
          onAdd={addCustomizedToCart}
        />
      )}

      <footer className="px-4 pb-8 pt-6 text-center text-xs" style={{ color: INK_SOFT }}>
        <div className="opacity-60">FoodTruckOS</div>
      </footer>

      {cartCount > 0 && (
        <div className="sticky bottom-0 p-3" style={{ background: INK }}>
          <div className="mx-auto max-w-lg space-y-2.5">
            <div className="max-h-36 space-y-2 overflow-y-auto">
              {cart.map((l) => (
                <div key={l.key} className="flex items-center justify-between gap-2 text-sm text-white">
                  <div className="min-w-0 pr-2">
                    <div className="truncate">{l.productName}</div>
                    {l.customizations.length > 0 && (
                      <div className="mt-0.5 flex flex-wrap gap-1">
                        {l.customizations.map((c, i) => (
                          <span
                            key={i}
                            className="rounded px-1.5 py-0.5 text-[10px] font-bold"
                            style={
                              c.kind === "add"
                                ? { background: "#1F3D2A", color: "#8BE9B0" }
                                : { background: "#3A1E1F", color: "#FFB3B5" }
                            }
                          >
                            {c.kind === "add" ? "+ " : "− "}
                            {c.optionName}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-none items-center gap-2">
                    <button
                      onClick={() => changeQty(l.key, -1)}
                      className="grid h-6 w-6 place-items-center rounded border border-white/30 font-bold"
                    >
                      −
                    </button>
                    <span style={{ fontFamily: "var(--font-display)" }}>{l.quantity}</span>
                    <button
                      onClick={() => changeQty(l.key, 1)}
                      className="grid h-6 w-6 place-items-center rounded border border-white/30 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder={t.menu.customerNameLabel}
              className="w-full rounded-lg border-2 px-3 py-2 text-sm"
              style={{ background: "#fff", color: INK, borderColor: "#3A332C" }}
            />
            {staleReload ? (
              <div className="rounded-lg bg-amber-50 p-2 text-sm text-amber-800">{t.menu.updatedReloading}</div>
            ) : (
              sendError && (
                <div className="rounded-lg bg-red-50 p-2 text-sm text-red-700">
                  {sendError}
                  {/* Salida de emergencia. Si el pedido falla por algo que
                      viene del propio carrito, reintentar con el mismo carrito
                      falla igual y el comensal se queda encerrado. */}
                  <button
                    onClick={() => {
                      setCart([])
                      setCustomerName("")
                      setSendError(null)
                      try {
                        window.localStorage.removeItem(storageKey)
                      } catch {
                        // ya se vació en memoria, que es lo que importa
                      }
                    }}
                    className="mt-1.5 block font-bold underline"
                  >
                    {t.menu.emptyCart}
                  </button>
                </div>
              )
            )}
            <button
              onClick={handleCheckout}
              disabled={sending || staleReload}
              className="w-full rounded-lg py-3 uppercase tracking-wide disabled:opacity-60"
              style={{ fontFamily: "var(--font-display)", fontSize: 18, background: "var(--brand-primary)", color: "var(--brand-on-primary)" }}
            >
              {sending
                ? t.menu.sending
                : `${sendError ? t.menu.retry + " · " : ""}${t.menu.checkout} · $${cartSubtotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
    </div>
  )
}

function SoldOutTag({ label }: { label: string }) {
  return (
    <span className="mt-1.5 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white" style={{ background: INK }}>
      {label}
    </span>
  )
}

// Antes era gris sobre gris y desaparecía. Ahora el color de marca lo lleva el
// BORDE y el punto, nunca el texto: así el realce cambia con cada cliente pero
// la palabra se sigue leyendo igual de negra con las diez opciones de la
// paleta — incluidas las claras, donde texto de color perdería contraste bajo
// el sol.
function CustomizableTag({ etiqueta }: { etiqueta: string }) {
  return (
    <span
      className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-[3px] text-[10px] font-black uppercase tracking-[0.06em]"
      style={{ borderColor: "var(--brand-primary)", color: INK, background: PANEL }}
    >
      <span className="h-[5px] w-[5px] flex-none rounded-full" style={{ background: "var(--brand-primary)" }} aria-hidden="true" />
      {etiqueta}
    </span>
  )
}

function AddButton({
  onClick,
  disabled,
  label,
  small,
}: {
  onClick: () => void
  disabled: boolean
  label: string
  small?: boolean
}) {
  const size = small ? "h-7 w-7 text-base" : "h-9 w-9 text-lg"
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className={`grid flex-none place-items-center rounded-full font-bold disabled:cursor-not-allowed ${size}`}
      style={{ background: disabled ? "#D8D2C8" : "var(--brand-primary)", color: "var(--brand-on-primary)" }}
    >
      +
    </button>
  )
}
