"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { toNumber } from "@/lib/supabase/numeric"
import { useLang } from "@/lib/i18n/LangProvider"
import { enqueueAction, drainQueue, pendingCount } from "@/lib/kitchen/offlineQueue"
import { useWakeLock } from "@/lib/kitchen/useWakeLock"
import { VentanillaForm } from "./VentanillaForm"
import { DaySummaryModal } from "./DaySummaryModal"
import { SoldOutScreen } from "./SoldOutScreen"
import type { KitchenData } from "@/lib/kitchen/getKitchenData"

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

export function KitchenBoard({
  unitId,
  businessId,
  unitName,
  staffName,
  amberMinutes,
  redMinutes,
  taxIncluded,
  initial,
  onBack,
}: {
  unitId: string
  businessId: string
  unitName: string
  staffName: string
  amberMinutes: number
  redMinutes: number
  taxIncluded: boolean
  initial: KitchenData
  onBack?: () => void
}) {
  const { lang, setLang, t } = useLang()
  const [orders, setOrders] = useState(initial.orders)
  const [items, setItems] = useState(initial.items)
  const [unitProducts, setUnitProducts] = useState(initial.unitProducts)
  const [options, setOptions] = useState(initial.options)
  const [online, setOnline] = useState(true)
  const [pending, setPending] = useState(0)
  const [showVentanilla, setShowVentanilla] = useState(false)
  const [showSoldOut, setShowSoldOut] = useState(false)
  const [showDaySummary, setShowDaySummary] = useState(false)
  const [askPayFor, setAskPayFor] = useState<string | null>(null)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const [soundOn, setSoundOn] = useState(true)
  const [activeTab, setActiveTab] = useState<Column>("recibido")

  useWakeLock()
  const [todayCount, setTodayCount] = useState(0)
  const knownOrderIds = useRef<Set<string>>(new Set(initial.orders.map((o) => o.id)))

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

    const isNew = (id: string) => !knownOrderIds.current.has(id)
    const arrivedNew = (freshOrders ?? []).some((o) => o.status === "recibido" && isNew(o.id))
    knownOrderIds.current = new Set((freshOrders ?? []).map((o) => o.id))
    if (arrivedNew && soundOn) beep()

    setOrders(
      (freshOrders ?? []).map((o) => ({
        ...o,
        subtotal: toNumber(o.subtotal),
        tax_amount: toNumber(o.tax_amount),
        total: toNumber(o.total),
      })),
    )
    setItems((freshItems ?? []).map((i) => ({ ...i, unit_price_snapshot: toNumber(i.unit_price_snapshot), line_total: toNumber(i.line_total) })))
    setUnitProducts(freshUnitProducts ?? [])
    setOptions((freshOptions ?? []).map((o) => ({ ...o, price_delta: toNumber(o.price_delta) })))
  }, [unitId, businessId, soundOn])

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
    }, 4000)
    const clock = setInterval(() => setNow(Date.now()), 15000)
    const countPoll = setInterval(fetchTodayCount, 60000)
    const countKick = setTimeout(fetchTodayCount, 0)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(poll)
      clearInterval(drain)
      clearInterval(clock)
      clearInterval(countPoll)
      clearTimeout(countKick)
    }
  }, [unitId, businessId, refetch, fetchTodayCount])

  function act(body: unknown) {
    enqueueAction(unitId, body)
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

  function deliver(orderId: string, paid: boolean) {
    setOrders((os) => os.filter((o) => o.id !== orderId))
    act({ action: "deliver", orderId, paid })
    setAskPayFor(null)
    setTodayCount((n) => n + 1)
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
        <div className="ml-auto flex w-full flex-wrap gap-2 md:w-auto">
          <ToolButton onClick={() => setShowDaySummary(true)} label={t.kitchen.salesButton} />
          <ToolButton onClick={() => setSoundOn((s) => !s)} label={soundOn ? t.kitchen.soundOn : t.kitchen.soundOff} on={soundOn} />
          <ToolButton onClick={() => setShowSoldOut(true)} label={t.kitchen.soldOutToggle} />
          <ToolButton onClick={() => setShowVentanilla(true)} label={t.kitchen.newVentanillaOrder} />
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
          const list = orders.filter((o) => o.status === col).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
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
                  return (
                    <article
                      key={o.id}
                      className="rounded-[10px] border p-3.5 pb-4"
                      style={{ background: "#1B1917", borderColor: "#332F29", borderLeftWidth: 6, borderLeftColor: LEVEL_COLOR[lv] }}
                    >
                      <div className="mb-2.5 flex items-center gap-2.5">
                        <span className="text-[31px] font-black leading-none tracking-tight tabular-nums">#{o.folio}</span>
                        <span className="text-[19px] font-extrabold leading-none tabular-nums" style={{ color: AGE_TEXT_COLOR[lv] }}>
                          {ageLabel(o)}
                        </span>
                        {HAS_BACK[col] && (
                          <button
                            onClick={() => regress(o.id)}
                            aria-label={t.kitchen.back}
                            className="ml-auto grid h-10 w-10 flex-none place-items-center rounded-lg border text-lg"
                            style={{ borderColor: "#332F29", color: "#9C948A" }}
                          >
                            ←
                          </button>
                        )}
                      </div>
                      <div className="mb-2.5 text-[13.5px] font-semibold text-neutral-400">
                        {o.customer_name || (o.channel === "ventanilla" ? t.kitchen.counterFallbackName : "")}
                        <span className="ml-1.5 rounded px-1.5 py-0.5 text-[12px] tracking-wide text-neutral-100" style={{ background: "#232019" }}>
                          {o.channel === "ventanilla" ? t.kitchen.ventanilla : "QR"}
                        </span>
                      </div>
                      {o.payment_status !== "pagada" && col !== "listo" && (
                        <div
                          className="mb-2.5 inline-flex items-center gap-1.5 rounded px-2.5 py-1 text-[13px] font-black uppercase tracking-wide"
                          style={{ background: "#3A2A12", color: "#FFCB6B", border: "1px solid #6B4A12" }}
                        >
                          {t.kitchen.unpaidBadge}
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
                      {col === "listo" ? (
                        askPayFor === o.id ? (
                          <div className="mt-2.5 space-y-1.5">
                            <button onClick={() => deliver(o.id, true)} className="w-full rounded-lg py-2.5 text-sm font-extrabold" style={{ background: "#30A46C", color: "#04200F" }}>
                              {t.kitchen.yesCharged} ${o.total.toFixed(2)}
                            </button>
                            <button onClick={() => deliver(o.id, false)} className="w-full rounded-lg py-2.5 text-sm font-bold" style={{ background: "#232019", color: "#FFCB6B", border: "1px solid #6B4A12" }}>
                              {t.kitchen.deliverUnpaid}
                            </button>
                          </div>
                        ) : (
                          <CtaButton onClick={() => (o.payment_status === "pagada" ? deliver(o.id, true) : setAskPayFor(o.id))} kind={NEXT_CTA[col]} label={t.kitchen.deliver} />
                        )
                      ) : (
                        <CtaButton onClick={() => advance(o.id)} kind={NEXT_CTA[col]} label={col === "recibido" ? t.kitchen.start : t.kitchen.ready} />
                      )}
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
