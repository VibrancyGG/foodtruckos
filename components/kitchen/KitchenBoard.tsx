"use client"

import { useEffect, useState, useCallback, useMemo, useRef, useSyncExternalStore } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { toNumber } from "@/lib/supabase/numeric"
import { useLang } from "@/lib/i18n/LangProvider"
import { enqueueAction, drainQueue, pendingCount, pendingOrderActions } from "@/lib/kitchen/offlineQueue"
import { useWakeLock } from "@/lib/kitchen/useWakeLock"
import { buildTicket } from "@/lib/kitchen/escpos"
import { enqueueTicket, drainTickets, isPrintingAvailable } from "@/lib/kitchen/printBridge"
import { VentanillaForm } from "./VentanillaForm"
import { DaySummaryModal } from "./DaySummaryModal"
import { OrderLookupModal } from "./OrderLookupModal"
import { SoldOutScreen } from "./SoldOutScreen"
import type { KitchenData } from "@/lib/kitchen/getKitchenData"

const sinSuscripcion = () => () => {}

const COLUMNS = ["recibido", "preparando", "listo"] as const
type Column = (typeof COLUMNS)[number]
const NEXT_CTA: Record<Column, "start" | "ready" | "deliver"> = { recibido: "start", preparando: "ready", listo: "deliver" }
const HAS_BACK: Record<Column, boolean> = { recibido: false, preparando: true, listo: true }

function beep() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ac = new Ctx()
    ;[0, 0.18].forEach((d, i) => {
      const o = ac.createOscillator()
      const g = ac.createGain()
      o.connect(g)
      g.connect(ac.destination)
      o.type = "sine"
      o.frequency.value = i ? 1046 : 784
      const t = ac.currentTime + d
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.25, t + 0.012)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
      o.start(t)
      o.stop(t + 0.32)
    })
  } catch {
    // sin audio no pasa nada — el pedido sigue llegando igual, solo sin sonido
  }
}

// Aviso de que un comensal llegó a la ventanilla. A propósito NO se parece al
// de orden nueva: aquel sube (784 → 1046) y este baja, con tres toques cortos.
// En hora pico la cajera tiene que poder distinguirlos sin mirar la pantalla.
function tinLlegada() {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ac = new Ctx()
    ;[0, 0.13, 0.26].forEach((d, i) => {
      const o = ac.createOscillator()
      const g = ac.createGain()
      o.connect(g)
      g.connect(ac.destination)
      o.type = "triangle"
      o.frequency.value = [880, 740, 620][i]
      const t = ac.currentTime + d
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16)
      o.start(t)
      o.stop(t + 0.18)
    })
  } catch {
    // sin audio la insignia y el latido siguen avisando igual
  }
}

export function KitchenBoard({
  unitId,
  businessId,
  unitName,
  staffName,
  amberMinutes,
  redMinutes,
  taxIncluded,
  printsTickets = false,
  ticketCopies = 1,
  syncPrinting = false,
  initial,
  onBack,
  backHref,
  readOnly = false,
  logoUrl,
  trialDaysLeft = null,
}: {
  unitId: string
  businessId: string
  unitName: string
  staffName: string
  amberMinutes: number
  redMinutes: number
  taxIncluded: boolean
  printsTickets?: boolean
  ticketCopies?: number
  syncPrinting?: boolean
  initial: KitchenData
  onBack?: () => void
  backHref?: string
  readOnly?: boolean
  logoUrl?: string | null
  trialDaysLeft?: number | null
}) {
  const { lang, setLang, t } = useLang()
  const router = useRouter()
  const [orders, setOrders] = useState(initial.orders)
  const [items, setItems] = useState(initial.items)
  const [unitProducts, setUnitProducts] = useState(initial.unitProducts)
  const [options, setOptions] = useState(initial.options)
  const [online, setOnline] = useState(true)
  const [pending, setPending] = useState(0)
  const [showVentanilla, setShowVentanilla] = useState(false)
  const [showSoldOut, setShowSoldOut] = useState(false)
  const [showDaySummary, setShowDaySummary] = useState(false)
  const [showLookup, setShowLookup] = useState(false)
  const [askPayFor, setAskPayFor] = useState<string | null>(null)
  const [askCancelFor, setAskCancelFor] = useState<string | null>(null)
  const [askCollectFor, setAskCollectFor] = useState<string | null>(null)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [soundOn, setSoundOn] = useState(true)
  const [activeTab, setActiveTab] = useState<Column>("recibido")

  useWakeLock()
  const [todayCount, setTodayCount] = useState(0)
  const knownOrderIds = useRef<Set<string>>(new Set(initial.orders.map((o) => o.id)))
  // Se siembra con lo que ya venía marcado: si no, al abrir la pantalla sonaría
  // una llegada por cada comensal que avisó hace rato.
  const yaLlegaron = useRef<Set<string>>(
    new Set(initial.orders.filter((o) => o.customer_arrived_at).map((o) => o.id)),
  )

  // El sonido y la impresión se leen por ref, no por dependencia: si entraran
  // en las deps de refetch, tocar el botón de sonido destruiría y recrearía el
  // canal de tiempo real y los cinco intervalos de abajo.
  const soundOnRef = useRef(true)
  const [printing, setPrinting] = useState({ enabled: printsTickets, copies: ticketCopies })
  const printRef = useRef(printing)

  // El diccionario también por ref, y por el mismo motivo: LangProvider
  // resuelve el idioma guardado DESPUÉS de montar, así que `t` cambia de
  // identidad una vez al arranque. Si eso llegara a las deps de refetch, el
  // canal se destruiría y recrearía en cada carga de la pantalla.
  const tRef = useRef(t)

  // El caso de soporte más probable: compraron la impresora, abrieron Chrome
  // en vez de la app, y llaman porque "no imprime". Mejor decírselo en
  // pantalla que descubrirlo por teléfono.
  const puedeImprimir = useSyncExternalStore(sinSuscripcion, isPrintingAvailable, () => false)
  const printerMissing = printing.enabled && !puedeImprimir

  // Consecutivo propio del truck, no el folio global del negocio (que puede
  // saltar de orden en orden si otro truck vende al mismo tiempo). Se arma
  // con lo que ya se pedía para el badge "N pedidos hoy" (entregados) más el
  // lugar de cada pedido activo en la fila de este truck — sin consulta
  // nueva, y siempre en vivo porque se recalcula con cada cambio de estado.
  const queuePosition = useMemo(() => {
    const activeSorted = [...orders].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    const map = new Map<string, number>()
    activeSorted.forEach((o, i) => map.set(o.id, todayCount + i + 1))
    return map
  }, [orders, todayCount])

  // Un solo camino para imprimir: lo usan tanto la orden que acaba de entrar
  // como el botón de reimprimir, para que la copia salga idéntica al original.
  const printOrder = useCallback(
    (
      order: { id: string; folio: number | null; channel: string; customer_name: string | null; payment_status: string; total: number; notes: string | null; created_at: string },
      lines: { id: string; quantity: number; product_name_snapshot: string; customizations_snapshot: unknown; notes: string | null }[],
      isReprint = false,
    ) => {
      if (!printRef.current.enabled) return
      const bytes = buildTicket({
        unitName,
        order,
        // order_items no tiene columna de orden, así que se ordena por id para
        // que la reimpresión salga igual que la primera vez.
        items: [...lines].sort((a, b) => a.id.localeCompare(b.id)),
        labels: {
          order: tRef.current.kitchen.ticket.order,
          note: tRef.current.kitchen.ticket.note,
          toCollect: tRef.current.kitchen.ticket.toCollect,
          paid: tRef.current.kitchen.ticket.paid,
          counter: tRef.current.kitchen.ventanilla,
          qr: "QR",
          reprint: tRef.current.kitchen.ticket.reprint,
        },
        isReprint,
      })
      // Solo se encola: quien avisa que la impresora respondió es el puente,
      // cuando el papel salió de verdad.
      enqueueTicket(unitId, bytes, printRef.current.copies)
    },
    [unitId, unitName],
  )

  const fetchTodayCount = useCallback(async () => {
    const supabase = createClient()
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)
    const { count } = await supabase
      .from("order_status_events")
      .select("order_id, orders!inner(unit_id)", { count: "exact", head: true })
      .eq("to_status", "entregado")
      .eq("orders.unit_id", unitId)
      .gte("created_at", startOfDay.toISOString())
    setTodayCount(count ?? 0)
  }, [unitId])

  useEffect(() => {
    soundOnRef.current = soundOn
  }, [soundOn])

  useEffect(() => {
    printRef.current = printing
  }, [printing])

  useEffect(() => {
    tRef.current = t
  }, [t])

  // Relee las preferencias de impresión de la sesión. Sin esto, prender la
  // impresión en el panel no se notaría hasta recargar la tablet — y nadie
  // recarga la pantalla de cocina.
  const syncPrintingPrefs = useCallback(async () => {
    if (!syncPrinting) return
    try {
      const res = await fetch("/api/kitchen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "settings" }),
      })
      if (!res.ok) return
      const data = (await res.json()) as { printsTickets?: boolean; ticketCopies?: number }
      if (typeof data.printsTickets !== "boolean") return
      const next = { enabled: data.printsTickets, copies: data.ticketCopies ?? 1 }
      // Solo si cambió: si no, esto repintaría el tablero cada minuto.
      setPrinting((prev) => (prev.enabled === next.enabled && prev.copies === next.copies ? prev : next))
    } catch {
      // sin red no pasa nada: se reintenta al siguiente ciclo
    }
  }, [syncPrinting])

  const refetch = useCallback(async () => {
    const supabase = createClient()
    const { data: freshOrders } = await supabase
      .from("orders")
      .select("*")
      .eq("unit_id", unitId)
      .not("status", "in", "(entregado,cancelado)")
      .order("created_at")
    const ids = (freshOrders ?? []).map((o) => o.id)
    const { data: freshItems } = ids.length
      ? await supabase.from("order_items").select("*").in("order_id", ids)
      : { data: [] }
    const { data: freshUnitProducts } = await supabase.from("unit_products").select("*").eq("unit_id", unitId)
    const { data: freshOptions } = await supabase.from("product_options").select("*").eq("business_id", businessId).order("sort_order")

    // Lista, no booleano: si entran dos órdenes en el mismo ciclo hay que
    // imprimir dos comandas, no una. Se captura antes de pisar el set de ids.
    const isNew = (id: string) => !knownOrderIds.current.has(id)
    const nuevas = (freshOrders ?? []).filter((o) => o.status === "recibido" && isNew(o.id))
    knownOrderIds.current = new Set((freshOrders ?? []).map((o) => o.id))
    if (nuevas.length && soundOnRef.current) beep()

    // Quién avisó que ya llegó al truck. Se compara contra la foto anterior
    // para sonar SOLO en la llegada nueva: al abrir la pantalla no debe sonar
    // por cada comensal que ya estaba esperando desde antes.
    const reciénLlegadas = (freshOrders ?? []).filter(
      (o) => o.customer_arrived_at && !yaLlegaron.current.has(o.id),
    )
    yaLlegaron.current = new Set(
      (freshOrders ?? []).filter((o) => o.customer_arrived_at).map((o) => o.id),
    )
    // Sonido distinto al de orden nueva: la cajera necesita distinguir "entró
    // un pedido" de "hay alguien parado en la ventanilla esperando".
    if (reciénLlegadas.length && soundOnRef.current) tinLlegada()
    for (const o of nuevas) {
      printOrder(
        { ...o, total: toNumber(o.total) },
        (freshItems ?? []).filter((i) => i.order_id === o.id),
      )
    }

    // La cola de acciones pendientes manda sobre esta foto: si "avanzar" o
    // "regresar" sigue sin confirmarse, se respeta el estado que ya se ve en
    // pantalla en vez del de la base (que puede seguir sin el cambio por
    // conexión lenta); si "entregar"/"cancelar" sigue sin confirmarse, la
    // orden se mantiene fuera de la lista como ya la quitó la acción local.
    const pendingActions = pendingOrderActions(unitId)
    setOrders((prev) => {
      const prevById = new Map(prev.map((o) => [o.id, o]))
      return (freshOrders ?? [])
        .filter((o) => {
          const action = pendingActions.get(o.id)
          return action !== "deliver" && action !== "cancel"
        })
        .map((o) => {
          const mapped = { ...o, subtotal: toNumber(o.subtotal), tax_amount: toNumber(o.tax_amount), total: toNumber(o.total) }
          const action = pendingActions.get(o.id)
          if (action === "advance" || action === "regress") {
            const local = prevById.get(o.id)
            if (local) return { ...mapped, status: local.status }
          }
          // El cobro que todavía no se confirma se respeta igual que un avance.
          // Sin esto, la cajera cobra, ve "pagado", y unos segundos después la
          // consulta de respaldo trae el estado viejo y vuelve a decir "por
          // cobrar" — que en hora pico termina en un doble cobro.
          if (action === "markPaid") {
            const local = prevById.get(o.id)
            if (local) return { ...mapped, payment_status: local.payment_status, payment_method: local.payment_method }
          }
          return mapped
        })
    })
    setItems((freshItems ?? []).map((i) => ({ ...i, unit_price_snapshot: toNumber(i.unit_price_snapshot), line_total: toNumber(i.line_total) })))
    setUnitProducts(freshUnitProducts ?? [])
    setOptions((freshOptions ?? []).map((o) => ({ ...o, price_delta: toNumber(o.price_delta) })))
  }, [unitId, businessId, printOrder])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`cocina-${unitId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `unit_id=eq.${unitId}` }, () => refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "unit_products", filter: `unit_id=eq.${unitId}` }, () => refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "product_options", filter: `business_id=eq.${businessId}` }, () => refetch())
      .subscribe((status) => {
        setOnline(status === "SUBSCRIBED")
        if (status === "SUBSCRIBED") refetch() // re-sincroniza todo al conectar/reconectar, no confía solo en eventos
      })

    const poll = setInterval(refetch, 10000)
    const drain = setInterval(() => {
      drainQueue(unitId, () => setPending(pendingCount(unitId)), () => setSessionExpired(true))
      setPending(pendingCount(unitId))
      drainTickets(unitId)
    }, 4000)
    const clock = setInterval(() => setNow(Date.now()), 15000)
    const countPoll = setInterval(() => {
      fetchTodayCount()
      syncPrintingPrefs()
    }, 60000)
    const countKick = setTimeout(fetchTodayCount, 0)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(poll)
      clearInterval(drain)
      clearInterval(clock)
      clearInterval(countPoll)
      clearTimeout(countKick)
    }
  }, [unitId, businessId, refetch, fetchTodayCount, syncPrintingPrefs])

  // Cierra la sesión de la persona, no el emparejamiento del dispositivo —
  // el siguiente en el turno solo teclea su PIN (lib/staff/session.ts:
  // startStaffSession sigue viendo el mismo ft_device).
  async function handleLogout() {
    await fetch("/api/staff/logout", { method: "POST" })
    router.push("/cocina")
  }

  function act(body: Record<string, unknown>) {
    // El Encargado puede operar un truck que no es el de su dispositivo
    // emparejado (foodtruckos-accesos) — el servidor solo lo honra si el rol
    // verificado en la sesión es "encargado" y el truck es del mismo negocio
    // (verifyStaffSession vuelve a comprobarlo, nunca confía en esto solo).
    enqueueAction(unitId, { ...body, unitId })
    setPending(pendingCount(unitId))
    drainQueue(unitId, () => setPending(pendingCount(unitId)), () => setSessionExpired(true))
  }

  function advance(orderId: string) {
    const NEXT: Record<string, string> = { recibido: "preparando", preparando: "listo" }
    setOrders((os) => os.map((o) => (o.id === orderId ? { ...o, status: NEXT[o.status] ?? o.status } : o)))
    act({ action: "advance", orderId })
  }

  function regress(orderId: string) {
    const PREV: Record<string, string> = { preparando: "recibido", listo: "preparando" }
    setOrders((os) => os.map((o) => (o.id === orderId ? { ...o, status: PREV[o.status] ?? o.status } : o)))
    act({ action: "regress", orderId })
  }

  function deliver(orderId: string, paid: boolean, paymentMethod?: "efectivo" | "tarjeta") {
    setOrders((os) => os.filter((o) => o.id !== orderId))
    act({ action: "deliver", orderId, paid, paymentMethod })
    setAskPayFor(null)
    setTodayCount((n) => n + 1)
  }

  // Cobrar sin entregar: el comensal pidió por QR y vino a pagar mientras su
  // orden se prepara. No mueve la orden de columna — pagar y preparar son dos
  // cosas distintas, y confundirlas sacaría el platillo de la fila del cocinero.
  function markPaid(orderId: string, paymentMethod: "efectivo" | "tarjeta") {
    setOrders((os) => os.map((o) => (o.id === orderId ? { ...o, payment_status: "pagada" } : o)))
    act({ action: "markPaid", orderId, paymentMethod })
    setAskCollectFor(null)
  }

  function cancelOrder(orderId: string) {
    setOrders((os) => os.filter((o) => o.id !== orderId))
    act({ action: "cancel", orderId })
    setAskCancelFor(null)
  }

  function toggleSoldOut(unitProductId: string, soldOut: boolean) {
    setUnitProducts((ups) => ups.map((up) => (up.id === unitProductId ? { ...up, sold_out: soldOut } : up)))
    act({ action: "soldOut", unitProductId, soldOut })
  }

  function toggleOptionSoldOut(optionId: string, soldOut: boolean) {
    setOptions((opts) => opts.map((o) => (o.id === optionId ? { ...o, sold_out: soldOut } : o)))
    act({ action: "optionSoldOut", optionId, soldOut })
  }

  // Color con función, no decoración (foodtruckos-diseno): listo siempre en
  // verde; en nuevas/preparando, ámbar al pasar el umbral del truck y rojo al
  // doble — la columna "nuevas" usa la mitad de esos minutos, porque una orden
  // recién llegada se vuelve urgente mucho antes que una que ya se está
  // cocinando.
  function level(order: (typeof orders)[number], col: Column): "green" | "red" | "amber" | "nueva" | "" {
    if (col === "listo") return "green"
    const min = (now - new Date(order.created_at).getTime()) / 60000
    const amber = amberMinutes
    const red = redMinutes
    if (col === "recibido") {
      const nuevaA = Math.max(1, Math.round(amber / 2))
      const nuevaR = Math.max(2, Math.round(red / 2))
      return min >= nuevaR ? "red" : min >= nuevaA ? "amber" : "nueva"
    }
    return min >= red ? "red" : min >= amber ? "amber" : ""
  }
  const LEVEL_COLOR: Record<string, string> = { green: "#30A46C", red: "#E5484D", amber: "#F5A524", nueva: "#5B8DEF", "": "#332F29" }
  const AGE_TEXT_COLOR: Record<string, string> = { green: "#30A46C", red: "#E5484D", amber: "#F5A524", nueva: "#F6F3ED", "": "#F6F3ED" }

  function ageLabel(order: (typeof orders)[number]) {
    const m = Math.floor((now - new Date(order.created_at).getTime()) / 60000)
    return m < 1 ? (lang === "es" ? "ahora" : "now") : `${m} min`
  }

  const openUnpaidCount = orders.filter((o) => o.payment_status !== "pagada").length

  return (
    <div className="flex h-screen flex-col overflow-hidden" style={{ background: "#100F0D", color: "#F6F3ED" }}>
      {trialDaysLeft !== null && (
        <div className="flex-none px-4 py-2 text-center text-sm font-bold" style={{ background: "#F5A524", color: "#231602" }}>
          {t.panel.trialBanner(trialDaysLeft)}
        </div>
      )}
      {printerMissing && (
        <div className="flex-none px-4 py-2.5 text-center text-sm font-semibold" style={{ background: "#3A2A12", color: "#FFCB6B" }}>
          {t.kitchen.printerMissingApp}
        </div>
      )}
      {sessionExpired && (
        <div className="flex flex-none items-center justify-between px-4 py-3 text-sm font-semibold" style={{ background: "#3A1E1F", color: "#FFB3B5" }}>
          <span>{t.kitchen.sessionExpired}</span>
          <Link href="/cocina" className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-red-900">
            {t.kitchen.reenter}
          </Link>
        </div>
      )}

      <header className="flex flex-none flex-wrap items-center gap-3.5 border-b px-4.5 py-3" style={{ background: "#1B1917", borderColor: "#332F29" }}>
        {onBack && (
          <button
            onClick={onBack}
            className="rounded-full border px-2.5 py-1.5 text-xs font-bold"
            style={{ borderColor: "#332F29", color: "#F6F3ED" }}
          >
            {t.kitchen.backToTrucks}
          </button>
        )}
        {!onBack && backHref && (
          <Link
            href={backHref}
            className="rounded-full border px-2.5 py-1.5 text-xs font-bold"
            style={{ borderColor: "#332F29", color: "#F6F3ED" }}
          >
            {t.kitchen.backToTrucks}
          </Link>
        )}
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoUrl} alt="" className="h-7 w-7 flex-none object-contain" />
        )}
        <div className="text-[15px] font-bold tracking-tight">
          {unitName} {staffName && <span className="font-semibold text-neutral-400">· {staffName}</span>}
        </div>
        <div
          className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13.5px] font-bold"
          style={online ? { background: "#232019", color: "#F6F3ED" } : { background: "#3A1E1F", color: "#FFB3B5" }}
        >
          <span className="h-[9px] w-[9px] rounded-full" style={{ background: online ? "#30A46C" : "#E5484D" }} />
          {online ? t.kitchen.connLive : t.kitchen.connOff}
        </div>
        <div className="rounded-full px-3 py-1.5 text-[13.5px] font-bold text-neutral-400" style={{ background: "#232019" }}>
          {t.kitchen.ordersToday(todayCount)}
        </div>
        {pending > 0 && <span className="text-xs" style={{ color: "#F5A524" }}>{t.kitchen.queuedActions(pending)}</span>}
        <button
          onClick={() => setLang(lang === "es" ? "en" : "es")}
          className="rounded-full border px-2.5 py-1.5 text-xs font-bold"
          style={{ borderColor: "#332F29", color: "#F6F3ED" }}
        >
          {lang === "es" ? "EN" : "ES"}
        </button>
        {!readOnly &&
          (confirmingLogout ? (
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <span style={{ color: "#FFB3B5" }}>{t.kitchen.confirmLogout}</span>
              <button onClick={handleLogout} className="rounded-full px-2.5 py-1.5" style={{ background: "#E5484D", color: "#fff" }}>
                {t.kitchen.logout}
              </button>
              <button
                onClick={() => setConfirmingLogout(false)}
                className="rounded-full border px-2.5 py-1.5"
                style={{ borderColor: "#332F29", color: "#F6F3ED" }}
              >
                {t.kitchen.back}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingLogout(true)}
              className="rounded-full border px-2.5 py-1.5 text-xs font-bold"
              style={{ borderColor: "#332F29", color: "#F6F3ED" }}
            >
              {t.kitchen.logout}
            </button>
          ))}
        <div className="ml-auto flex w-full flex-wrap gap-2 md:w-auto">
          <ToolButton onClick={() => setShowDaySummary(true)} label={t.kitchen.salesButton} />
          <ToolButton onClick={() => setShowLookup(true)} label={t.kitchen.lookupButton} />
          {!readOnly && (
            <>
              <ToolButton onClick={() => setSoundOn((s) => !s)} label={soundOn ? t.kitchen.soundOn : t.kitchen.soundOff} on={soundOn} />
              <ToolButton onClick={() => setShowSoldOut(true)} label={t.kitchen.soldOutToggle} />
              <ToolButton onClick={() => setShowVentanilla(true)} label={t.kitchen.newVentanillaOrder} />
            </>
          )}
        </div>
      </header>

      <div className="flex flex-none md:hidden" style={{ background: "#332F29", gap: 1 }}>
        {COLUMNS.map((col) => (
          <button
            key={col}
            onClick={() => setActiveTab(col)}
            className="flex-1 py-3.5 text-[13px] font-extrabold uppercase tracking-wide"
            style={activeTab === col ? { background: "#100F0D", color: "#F6F3ED" } : { background: "#1B1917", color: "#9C948A" }}
          >
            {col === "recibido" ? t.kitchen.newColumn : col === "preparando" ? t.kitchen.prepColumn : t.kitchen.readyColumn}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-px md:grid-cols-3" style={{ background: "#332F29" }}>
        {COLUMNS.map((col) => {
          // En NUEVAS mandan primero las pagadas, y dentro de cada grupo la más
          // vieja arriba. Una orden pagada es dinero comprometido; una sin pagar
          // puede no reclamarse nunca, y ese es el desperdicio que queremos
          // reducir.
          //
          // Las otras dos columnas se quedan por antigüedad pura: ahí ya se está
          // cocinando y reordenar cambiaría el trabajo a media plancha.
          //
          // Una orden sin pagar no se hunde en silencio: el color de la tarjeta
          // pasa a ámbar y luego a rojo con los minutos, así que sigue gritando
          // aunque quede abajo.
          const list = orders
            .filter((o) => o.status === col)
            .sort((a, b) => {
              if (col === "recibido") {
                // Quien está parado en la ventanilla manda sobre todo lo demás.
                // Si avisar que llegaste no cambiara el orden, el botón sería
                // solo una insignia bonita — y quien espera enfrente es siempre
                // más urgente que quien pidió desde su casa, haya pagado o no.
                const llegoA = a.customer_arrived_at ? 0 : 1
                const llegoB = b.customer_arrived_at ? 0 : 1
                if (llegoA !== llegoB) return llegoA - llegoB

                const pagadaA = a.payment_status === "pagada" ? 0 : 1
                const pagadaB = b.payment_status === "pagada" ? 0 : 1
                if (pagadaA !== pagadaB) return pagadaA - pagadaB
              }
              return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            })
          return (
            <div
              key={col}
              className={`flex min-h-0 flex-col ${activeTab === col ? "flex" : "hidden"} md:flex`}
              style={{ background: "#100F0D" }}
            >
              <div className="flex flex-none items-center gap-2.5 border-b-2 px-4 py-3" style={{ borderColor: col === "listo" ? "#30A46C" : "#332F29" }}>
                <h2 className="text-[15px] font-black uppercase tracking-wide" style={{ color: col === "listo" ? "#30A46C" : "#F6F3ED" }}>
                  {col === "recibido" ? t.kitchen.newColumn : col === "preparando" ? t.kitchen.prepColumn : t.kitchen.readyColumn}
                </h2>
                <span className="rounded-full px-2.5 py-0.5 text-sm font-extrabold tabular-nums" style={{ background: "#232019", color: col === "listo" ? "#30A46C" : "#F6F3ED" }}>
                  {list.length}
                </span>
              </div>
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
                {list.length === 0 && (
                  <div className="px-3 py-6 text-center text-sm font-semibold text-neutral-600">
                    {col === "recibido" ? t.kitchen.emptyNew : col === "preparando" ? t.kitchen.emptyPrep : t.kitchen.emptyReady}
                  </div>
                )}
                {list.map((o) => {
                  const lv = level(o, col)
                  // Late mientras haya alguien esperando enfrente Y sin pagar:
                  // ese es el momento en que la cajera tiene algo que hacer.
                  // Al cobrar deja de latir, aunque la insignia se queda — si
                  // latiera para siempre, dejaría de significar nada.
                  const esperandoCobro = Boolean(o.customer_arrived_at) && o.payment_status !== "pagada"
                  return (
                    <article
                      key={o.id}
                      className={`rounded-[10px] border p-3.5 pb-4${esperandoCobro ? " ft-latido" : ""}`}
                      style={{ background: "#1B1917", borderColor: "#332F29", borderLeftWidth: 6, borderLeftColor: LEVEL_COLOR[lv] }}
                    >
                      <div className="mb-1 flex items-baseline gap-2.5">
                        <span className="text-[31px] font-black leading-none tracking-tight tabular-nums">#{o.folio}</span>
                        <span className="text-[19px] font-extrabold leading-none tabular-nums" style={{ color: AGE_TEXT_COLOR[lv] }}>
                          {ageLabel(o)}
                        </span>
                      </div>
                      <div className="mb-2.5 flex items-center gap-2.5">
                        <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#9C948A" }}>
                          {t.kitchen.queuePosition(queuePosition.get(o.id) ?? 0)}
                        </span>
                        {!readOnly && (printing.enabled || HAS_BACK[col]) && (
                          <span className="ml-auto flex flex-none items-center gap-2">
                            {printing.enabled && (
                              <button
                                onClick={() => printOrder({ ...o, total: toNumber(o.total) }, items.filter((i) => i.order_id === o.id), true)}
                                aria-label={t.kitchen.reprintButton}
                                className="grid h-10 w-10 place-items-center rounded-lg border text-base"
                                style={{ borderColor: "#332F29", color: "#9C948A" }}
                              >
                                ⎙
                              </button>
                            )}
                            {HAS_BACK[col] && (
                              <button
                                onClick={() => regress(o.id)}
                                aria-label={t.kitchen.back}
                                className="grid h-10 w-10 place-items-center rounded-lg border text-lg"
                                style={{ borderColor: "#332F29", color: "#9C948A" }}
                              >
                                ←
                              </button>
                            )}
                          </span>
                        )}
                      </div>
                      <div className="mb-2.5 text-[13.5px] font-semibold text-neutral-400">
                        {o.customer_name || (o.channel === "ventanilla" ? t.kitchen.counterFallbackName : "")}
                        <span className="ml-1.5 rounded px-1.5 py-0.5 text-[12px] tracking-wide text-neutral-100" style={{ background: "#232019" }}>
                          {o.channel === "ventanilla" ? t.kitchen.ventanilla : "QR"}
                        </span>
                      </div>
                      <div className="mb-2.5 flex flex-wrap items-center gap-1.5">
                        {o.payment_status !== "pagada" && col !== "listo" && (
                          <span
                            className="inline-flex items-center rounded px-2.5 py-1 text-[13px] font-black uppercase tracking-wide"
                            style={{ background: "#3A2A12", color: "#FFCB6B", border: "1px solid #6B4A12" }}
                          >
                            {t.kitchen.unpaidBadge}
                          </span>
                        )}
                        {/* El comensal avisó que ya está enfrente. En hora pico
                            es lo que separa a quien espera parado de quien pidió
                            desde su casa y llega en media hora. */}
                        {o.customer_arrived_at && (
                          <span
                            className="inline-flex items-center rounded px-2.5 py-1 text-[13px] font-black uppercase tracking-wide"
                            style={{ background: "#14291F", color: "#6FD3A6", border: "1px solid #2A5943" }}
                          >
                            {t.kitchen.arrivedBadge}
                          </span>
                        )}
                        {/* Cobrar sin sacar la orden de la fila. Solo donde
                            tiene sentido: aún no está entregada y no se ha
                            pagado. En "listo" ya existe el cobro al entregar. */}
                        {!readOnly && o.payment_status !== "pagada" && col !== "listo" && askCollectFor !== o.id && (
                          <button
                            onClick={() => setAskCollectFor(o.id)}
                            className="ml-auto rounded-lg px-3 py-1 text-[13px] font-extrabold"
                            style={{ background: "#232019", color: "#6FD3A6", border: "1px solid #2A5943" }}
                          >
                            {t.kitchen.collectNow}
                          </button>
                        )}
                      </div>
                      {askCollectFor === o.id && (
                        <div className="mb-2.5 space-y-1.5">
                          <div className="text-center text-[11px] font-bold uppercase tracking-wide text-neutral-400">
                            {t.kitchen.paymentMethodPrompt} ${o.total.toFixed(2)}
                          </div>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button onClick={() => markPaid(o.id, "efectivo")} className="rounded-lg py-2.5 text-sm font-extrabold" style={{ background: "#30A46C", color: "#04200F" }}>
                              {t.kitchen.paymentMethodCash}
                            </button>
                            <button onClick={() => markPaid(o.id, "tarjeta")} className="rounded-lg py-2.5 text-sm font-extrabold" style={{ background: "#30A46C", color: "#04200F" }}>
                              {t.kitchen.paymentMethodCard}
                            </button>
                          </div>
                          <button onClick={() => setAskCollectFor(null)} className="w-full rounded-lg py-2 text-xs font-bold" style={{ background: "#232019", color: "#9C948A" }}>
                            {t.menu.cancel}
                          </button>
                        </div>
                      )}
                      <ul className="flex flex-col gap-2.5">
                        {items
                          .filter((i) => i.order_id === o.id)
                          .map((i) => {
                            const customizations =
                              (i.customizations_snapshot as { groupName: string; optionName: string; kind: string }[] | null) ?? []
                            return (
                              <li key={i.id} className="grid grid-cols-[auto_1fr] items-start gap-2.5">
                                <span className="grid h-[34px] min-w-[34px] place-items-center rounded-md text-[19px] font-black tabular-nums" style={{ background: "#232019" }}>
                                  {i.quantity}
                                </span>
                                <span>
                                  <span className="text-[20px] font-extrabold leading-tight tracking-tight">{i.product_name_snapshot}</span>
                                  {customizations.length > 0 && (
                                    <span className="mt-1.5 flex flex-wrap gap-1.5">
                                      {customizations.map((c, idx) => (
                                        <span
                                          key={idx}
                                          className="rounded px-2 py-0.5 text-[13.5px] font-extrabold"
                                          style={c.kind === "add" ? { background: "#1F2E22", color: "#7EE2A8" } : { background: "#3A1E1F", color: "#FF9EA1" }}
                                        >
                                          {c.kind === "add" ? "+ " : "− "}
                                          {c.optionName}
                                        </span>
                                      ))}
                                    </span>
                                  )}
                                  {i.notes && (
                                    <span className="mt-1.5 block text-[14px] font-bold leading-tight" style={{ color: "#FFCB6B" }}>
                                      &quot;{i.notes}&quot;
                                    </span>
                                  )}
                                </span>
                              </li>
                            )
                          })}
                      </ul>
                      {o.notes && (
                        <div className="mt-2.5 rounded-r-md p-2.5 text-[14.5px] font-semibold leading-snug" style={{ background: "#232019", borderLeft: "3px solid #F5A524" }}>
                          {o.notes}
                        </div>
                      )}
                      {col === "listo" && (
                        <div
                          className="mt-3 flex items-center justify-between rounded-lg px-4 py-3.5 text-2xl font-black tracking-tight"
                          style={
                            o.payment_status === "pagada"
                              ? { background: "#16301F", color: "#8BE9B0", border: "1px solid #245C3C" }
                              : { background: "#F5A524", color: "#231602" }
                          }
                        >
                          <small className="text-sm font-extrabold uppercase tracking-wide opacity-80">
                            {o.payment_status === "pagada" ? t.kitchen.paidBadge : t.kitchen.collectBadge}
                          </small>
                          <span>${o.total.toFixed(2)}</span>
                        </div>
                      )}
                      {!readOnly && (col === "listo" ? (
                        askPayFor === o.id ? (
                          <div className="mt-2.5 space-y-1.5">
                            <div className="mb-0.5 text-center text-[11px] font-bold uppercase tracking-wide text-neutral-400">
                              {t.kitchen.paymentMethodPrompt} ${o.total.toFixed(2)}
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              <button onClick={() => deliver(o.id, true, "efectivo")} className="rounded-lg py-2.5 text-sm font-extrabold" style={{ background: "#30A46C", color: "#04200F" }}>
                                {t.kitchen.paymentMethodCash}
                              </button>
                              <button onClick={() => deliver(o.id, true, "tarjeta")} className="rounded-lg py-2.5 text-sm font-extrabold" style={{ background: "#30A46C", color: "#04200F" }}>
                                {t.kitchen.paymentMethodCard}
                              </button>
                            </div>
                            <button onClick={() => deliver(o.id, false)} className="w-full rounded-lg py-2.5 text-sm font-bold" style={{ background: "#232019", color: "#FFCB6B", border: "1px solid #6B4A12" }}>
                              {t.kitchen.deliverUnpaid}
                            </button>
                          </div>
                        ) : (
                          <CtaButton onClick={() => (o.payment_status === "pagada" ? deliver(o.id, true) : setAskPayFor(o.id))} kind={NEXT_CTA[col]} label={t.kitchen.deliver} />
                        )
                      ) : (
                        <CtaButton onClick={() => advance(o.id)} kind={NEXT_CTA[col]} label={col === "recibido" ? t.kitchen.start : t.kitchen.ready} />
                      ))}
                      {!readOnly && (askCancelFor === o.id ? (
                        <div className="mt-2 flex gap-1.5">
                          <button
                            onClick={() => cancelOrder(o.id)}
                            className="flex-1 rounded-lg py-2 text-xs font-extrabold"
                            style={{ background: "#5C1A1D", color: "#FFB3B5" }}
                          >
                            {t.kitchen.confirmCancelOrder}
                          </button>
                          <button
                            onClick={() => setAskCancelFor(null)}
                            className="flex-1 rounded-lg py-2 text-xs font-bold"
                            style={{ background: "#232019", color: "#9C948A" }}
                          >
                            {t.kitchen.keepOrder}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAskCancelFor(o.id)}
                          className="mt-2 w-full text-center text-[12px] font-bold text-neutral-500"
                        >
                          {t.kitchen.cancelOrder}
                        </button>
                      ))}
                    </article>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {showVentanilla && (
        <VentanillaForm
          categories={initial.categories}
          products={initial.products}
          unitProducts={unitProducts}
          optionGroups={initial.optionGroups}
          options={options}
          taxIncluded={taxIncluded}
          lang={lang}
          unitId={unitId}
          onClose={() => setShowVentanilla(false)}
          onCreated={() => {
            setShowVentanilla(false)
            refetch()
          }}
        />
      )}

      {showSoldOut && (
        <SoldOutScreen
          categories={initial.categories}
          products={initial.products}
          unitProducts={unitProducts}
          optionGroups={initial.optionGroups}
          options={options}
          lang={lang}
          onToggleProduct={toggleSoldOut}
          onToggleOption={toggleOptionSoldOut}
          onClose={() => setShowSoldOut(false)}
        />
      )}

      {showDaySummary && (
        <DaySummaryModal
          unitId={unitId}
          unitName={unitName}
          openUnpaidCount={openUnpaidCount}
          lang={lang}
          onClose={() => setShowDaySummary(false)}
        />
      )}

      {showLookup && <OrderLookupModal unitId={unitId} lang={lang} onClose={() => setShowLookup(false)} />}
    </div>
  )
}

function ToolButton({ onClick, label, on }: { onClick: () => void; label: string; on?: boolean }) {
  return (
    <button
      onClick={onClick}
      className="min-h-[46px] flex-1 rounded-lg border px-4 text-sm font-extrabold md:flex-none"
      style={on ? { background: "#232019", borderColor: "#30A46C", color: "#30A46C" } : { background: "#232019", borderColor: "#332F29", color: "#F6F3ED" }}
    >
      {label}
    </button>
  )
}

function CtaButton({ onClick, kind, label }: { onClick: () => void; kind: "start" | "ready" | "deliver"; label: string }) {
  const style =
    kind === "start"
      ? { background: "#5B8DEF", color: "#0A1020" }
      : kind === "ready"
        ? { background: "#30A46C", color: "#04200F" }
        : { background: "#F6F3ED", color: "#12100E" }
  return (
    <button onClick={onClick} className="mt-3 w-full rounded-lg py-4 text-[17px] font-black uppercase tracking-wide" style={style}>
      {label}
    </button>
  )
}
