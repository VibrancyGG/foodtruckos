"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { dictionary, type Lang } from "@/lib/i18n/dictionary"

// "Cómo va el día" se calcula de datos reales de HOY (order_status_events con
// to_status='entregado'), nunca de un contador aparte que se pueda desviar de
// lo que de verdad pasó — mismo principio que el promedio de tiempo de
// preparación en seguimiento.html.
type Summary = {
  ordenes: number
  cobrado: number
  ticketProm: number
  sinCobrar: number
  top: [string, number][]
}

export function DaySummaryModal({
  unitId,
  unitName,
  openUnpaidCount,
  lang,
  onClose,
}: {
  unitId: string
  unitName: string
  openUnpaidCount: number
  lang: Lang
  onClose: () => void
}) {
  const t = dictionary[lang].kitchen
  const [summary, setSummary] = useState<Summary | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const supabase = createClient()
      const startOfDay = new Date()
      startOfDay.setHours(0, 0, 0, 0)

      const { data: events } = await supabase
        .from("order_status_events")
        .select("order_id, orders!inner(id, unit_id, total, payment_status)")
        .eq("to_status", "entregado")
        .eq("orders.unit_id", unitId)
        .gte("created_at", startOfDay.toISOString())

      const rows = (events ?? []) as unknown as {
        order_id: string
        orders: { id: string; unit_id: string; total: number | string; payment_status: string }
      }[]
      const orderIds = rows.map((r) => r.order_id)

      const { data: items } = orderIds.length
        ? await supabase.from("order_items").select("order_id, product_name_snapshot, quantity").in("order_id", orderIds)
        : { data: [] }

      if (cancelled) return

      let cobrado = 0
      let cobradasCount = 0
      let sinCobrar = 0
      for (const r of rows) {
        const total = typeof r.orders.total === "string" ? parseFloat(r.orders.total) : r.orders.total
        if (r.orders.payment_status === "pagada") {
          cobrado += total
          cobradasCount++
        } else {
          sinCobrar++
        }
      }
      const tally = new Map<string, number>()
      for (const i of items ?? []) {
        tally.set(i.product_name_snapshot, (tally.get(i.product_name_snapshot) ?? 0) + i.quantity)
      }
      const top = [...tally.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)

      setSummary({
        ordenes: rows.length,
        cobrado,
        ticketProm: cobradasCount ? cobrado / cobradasCount : 0,
        sinCobrar,
        top,
      })
    }
    load()
    return () => {
      cancelled = true
    }
  }, [unitId])

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/80 p-5" onClick={onClose}>
      <div
        className="w-full max-w-[520px] rounded-2xl border p-6"
        style={{ background: "#1B1917", borderColor: "#332F29" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-baseline gap-2.5">
          <h3 className="text-[22px] font-black tracking-tight text-neutral-50">{t.daySummaryTitle}</h3>
          <span className="ml-auto text-[13px] font-semibold text-neutral-400">{t.daySummarySubtitle(unitName)}</span>
        </div>

        {!summary ? (
          <div className="py-10 text-center text-sm font-semibold text-neutral-500">…</div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[11px] border" style={{ background: "#332F29", borderColor: "#332F29" }}>
              <div className="p-4" style={{ background: "#232019" }}>
                <b className="block text-[29px] font-black leading-none tracking-tight text-neutral-50">{summary.ordenes}</b>
                <span className="mt-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-neutral-400">{t.deliveredOrders}</span>
              </div>
              <div className="p-4" style={{ background: "#232019" }}>
                <b className="block text-[29px] font-black leading-none tracking-tight text-neutral-50">${summary.cobrado.toFixed(2)}</b>
                <span className="mt-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-neutral-400">{t.collectedToday}</span>
              </div>
              <div className="p-4" style={{ background: "#232019" }}>
                <b className="block text-[29px] font-black leading-none tracking-tight text-neutral-50">${summary.ticketProm.toFixed(2)}</b>
                <span className="mt-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-neutral-400">{t.avgTicket}</span>
              </div>
              <div className="p-4" style={{ background: "#232019" }}>
                <b className="block text-[29px] font-black leading-none tracking-tight" style={{ color: openUnpaidCount ? "#F5A524" : "#F6F3ED" }}>
                  {openUnpaidCount}
                </b>
                <span className="mt-1.5 block text-[11.5px] font-bold uppercase tracking-wide text-neutral-400">{t.openUnpaid}</span>
              </div>
            </div>

            <div className="mt-4.5">
              <h4 className="mb-2.5 text-[11.5px] font-black uppercase tracking-wide text-neutral-400">{t.topSellers}</h4>
              {summary.top.length === 0 ? (
                <p className="py-3 text-sm text-neutral-500">—</p>
              ) : (
                summary.top.map(([name, qty]) => (
                  <div key={name} className="flex items-baseline justify-between gap-3 border-b py-2.5 text-[15px] font-bold text-neutral-100 last:border-0" style={{ borderColor: "#332F29" }}>
                    <span>{name}</span>
                    <em className="font-bold not-italic tabular-nums text-neutral-400">{qty}</em>
                  </div>
                ))
              )}
            </div>

            {summary.sinCobrar > 0 && <p className="mt-3.5 text-xs leading-relaxed text-neutral-500">{t.undeliveredNote(summary.sinCobrar)}</p>}
          </>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-lg py-3.5 text-base font-extrabold"
          style={{ background: "#232019", color: "#F6F3ED" }}
        >
          {t.backToOrders}
        </button>
        <p className="mt-3.5 text-xs leading-relaxed text-neutral-500">{t.daySummaryDisclaimer}</p>
      </div>
    </div>
  )
}
