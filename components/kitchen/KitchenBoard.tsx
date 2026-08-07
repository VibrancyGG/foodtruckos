"use client"

import { useEffect, useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import { toNumber } from "@/lib/supabase/numeric"
import { useLang } from "@/lib/i18n/LangProvider"
import { enqueueAction, drainQueue, pendingCount } from "@/lib/kitchen/offlineQueue"
import { VentanillaForm } from "./VentanillaForm"
import type { KitchenData } from "@/lib/kitchen/getKitchenData"

const COLUMNS = ["recibido", "preparando", "listo"] as const

export function KitchenBoard({
  unitId,
  businessId,
  unitName,
  taxIncluded,
  initial,
}: {
  unitId: string
  businessId: string
  unitName: string
  taxIncluded: boolean
  initial: KitchenData
}) {
  const { lang, t } = useLang()
  const [orders, setOrders] = useState(initial.orders)
  const [items, setItems] = useState(initial.items)
  const [unitProducts, setUnitProducts] = useState(initial.unitProducts)
  const [online, setOnline] = useState(true)
  const [pending, setPending] = useState(0)
  const [showVentanilla, setShowVentanilla] = useState(false)
  const [askPayFor, setAskPayFor] = useState<string | null>(null)

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
  }, [unitId])

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`cocina-${unitId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `unit_id=eq.${unitId}` }, () => refetch())
      .on("postgres_changes", { event: "*", schema: "public", table: "unit_products", filter: `unit_id=eq.${unitId}` }, () => refetch())
      .subscribe((status) => {
        setOnline(status === "SUBSCRIBED")
        if (status === "SUBSCRIBED") refetch() // re-sincroniza todo al conectar/reconectar, no confía solo en eventos
      })

    const poll = setInterval(refetch, 10000)
    const drain = setInterval(() => {
      drainQueue(unitId, () => setPending(pendingCount(unitId)))
      setPending(pendingCount(unitId))
    }, 4000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(poll)
      clearInterval(drain)
    }
  }, [unitId, refetch])

  function act(body: unknown) {
    enqueueAction(unitId, body)
    setPending(pendingCount(unitId))
    drainQueue(unitId, () => setPending(pendingCount(unitId)))
  }

  function advance(orderId: string) {
    const NEXT: Record<string, string> = { recibido: "preparando", preparando: "listo" }
    setOrders((os) => os.map((o) => (o.id === orderId ? { ...o, status: NEXT[o.status] ?? o.status } : o)))
    act({ action: "advance", orderId })
  }

  function deliver(orderId: string, paid: boolean) {
    setOrders((os) => os.filter((o) => o.id !== orderId))
    act({ action: "deliver", orderId, paid })
    setAskPayFor(null)
  }

  function toggleSoldOut(unitProductId: string, soldOut: boolean) {
    setUnitProducts((ups) => ups.map((up) => (up.id === unitProductId ? { ...up, sold_out: soldOut } : up)))
    act({ action: "soldOut", unitProductId, soldOut })
  }

  return (
    <div className="min-h-screen bg-neutral-900 p-4 text-white">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <div className="font-bold">{unitName}</div>
          <div
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{ background: online ? "#16301F" : "#3A1E1F", color: online ? "#8BE9B0" : "#FFB3B5" }}
          >
            {online ? t.kitchen.connLive : t.kitchen.connOff}
          </div>
          {pending > 0 && (
            <span className="ml-2 text-xs text-amber-300">{t.kitchen.queuedActions(pending)}</span>
          )}
        </div>
        <button
          onClick={() => setShowVentanilla(true)}
          className="rounded-lg bg-white px-3 py-2 text-sm font-bold text-neutral-900"
        >
          {t.kitchen.newVentanillaOrder}
        </button>
      </header>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {COLUMNS.map((col) => (
          <div key={col} className="rounded-xl bg-neutral-800 p-3">
            <h2 className="mb-2 text-sm font-bold uppercase text-neutral-400">
              {col === "recibido" ? t.kitchen.newColumn : col === "preparando" ? t.kitchen.prepColumn : t.kitchen.readyColumn}
            </h2>
            <div className="space-y-2">
              {orders
                .filter((o) => o.status === col)
                .map((o) => (
                  <div key={o.id} className="rounded-lg bg-neutral-700 p-3">
                    <div className="mb-1 flex items-center justify-between">
                      <span className="text-lg font-black">#{o.folio}</span>
                      <span className="text-xs uppercase text-neutral-400">
                        {o.channel === "ventanilla" ? t.kitchen.ventanilla : "QR"}
                      </span>
                    </div>
                    {o.customer_name && <div className="mb-1 text-sm text-neutral-300">{o.customer_name}</div>}
                    <div className="mb-2 space-y-0.5 text-sm">
                      {items
                        .filter((i) => i.order_id === o.id)
                        .map((i) => (
                          <div key={i.id}>
                            {i.quantity}× {i.product_name_snapshot}
                          </div>
                        ))}
                    </div>
                    {col === "listo" ? (
                      askPayFor === o.id ? (
                        <div className="space-y-1">
                          <button onClick={() => deliver(o.id, true)} className="w-full rounded bg-green-600 py-1 text-sm font-bold">
                            {t.kitchen.yesCharged} ${o.total.toFixed(2)}
                          </button>
                          <button onClick={() => deliver(o.id, false)} className="w-full rounded bg-neutral-600 py-1 text-sm">
                            {t.kitchen.deliverUnpaid}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => (o.payment_status === "pagada" ? deliver(o.id, true) : setAskPayFor(o.id))}
                          className="w-full rounded bg-green-600 py-1 text-sm font-bold"
                        >
                          {t.kitchen.deliver}
                        </button>
                      )
                    ) : (
                      <button onClick={() => advance(o.id)} className="w-full rounded bg-amber-500 py-1 text-sm font-bold text-neutral-900">
                        {col === "recibido" ? t.kitchen.start : t.kitchen.ready}
                      </button>
                    )}
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {showVentanilla && (
        <VentanillaForm
          products={initial.products}
          unitProducts={unitProducts}
          taxIncluded={taxIncluded}
          lang={lang}
          onClose={() => setShowVentanilla(false)}
          onCreated={() => {
            setShowVentanilla(false)
            refetch()
          }}
        />
      )}

      <div className="mt-6">
        <h3 className="mb-2 text-sm font-bold uppercase text-neutral-400">{t.kitchen.soldOutToggle}</h3>
        <div className="flex flex-wrap gap-2">
          {unitProducts.map((up) => {
            const product = initial.products.find((p) => p.id === up.product_id)
            if (!product) return null
            return (
              <button
                key={up.id}
                onClick={() => toggleSoldOut(up.id, !up.sold_out)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${up.sold_out ? "bg-red-900 text-red-200" : "bg-neutral-700 text-neutral-300"}`}
              >
                {lang === "es" ? product.name_es : product.name_en}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
