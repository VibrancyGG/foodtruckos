"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toNumber } from "@/lib/supabase/numeric"
import { dictionary, type Lang } from "@/lib/i18n/dictionary"

type Result = {
  folio: number
  status: string
  payment_status: string
  payment_method: string | null
  total: number
  customer_name: string | null
  created_at: string
  items: { product_name_snapshot: string; quantity: number }[]
} | null

const STATUS_LABEL_KEY: Record<string, keyof (typeof dictionary)["es"]["kitchen"]> = {
  recibido: "lookupStatusRecibido",
  preparando: "lookupStatusPreparando",
  listo: "lookupStatusListo",
  entregado: "lookupStatusEntregado",
  cancelado: "lookupStatusCancelado",
}

// Para cuando el cliente se acerca al truck a preguntar por un pedido que ya
// salió del tablero (entregado o cancelado) — cocina no tiene forma de
// consultarlo una vez que desaparece de las columnas activas. Acotado a 7
// días para no tener que escanear todo el histórico del truck desde una
// tablet.
export function OrderLookupModal({ unitId, lang, onClose }: { unitId: string; lang: Lang; onClose: () => void }) {
  const t = dictionary[lang].kitchen
  const [folio, setFolio] = useState("")
  const [searching, setSearching] = useState(false)
  const [result, setResult] = useState<Result>(null)
  const [notFound, setNotFound] = useState(false)

  async function search() {
    const n = parseInt(folio, 10)
    if (!n) return
    setSearching(true)
    setResult(null)
    setNotFound(false)

    const supabase = createClient()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: order } = await supabase
      .from("orders")
      .select("id, folio, status, payment_status, payment_method, total, customer_name, created_at")
      .eq("unit_id", unitId)
      .eq("folio", n)
      .gte("created_at", sevenDaysAgo)
      .maybeSingle()

    if (!order) {
      setNotFound(true)
      setSearching(false)
      return
    }

    const { data: items } = await supabase
      .from("order_items")
      .select("product_name_snapshot, quantity")
      .eq("order_id", order.id)

    setResult({
      folio: order.folio ?? n,
      status: order.status,
      payment_status: order.payment_status,
      payment_method: order.payment_method,
      total: toNumber(order.total),
      customer_name: order.customer_name,
      created_at: order.created_at,
      items: items ?? [],
    })
    setSearching(false)
  }

  const paymentLabel = result?.payment_method === "tarjeta" ? t.paymentMethodCard : t.paymentMethodCash

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/80 p-5" onClick={onClose}>
      <div
        className="w-full max-w-[440px] rounded-2xl border p-6"
        style={{ background: "#1B1917", borderColor: "#332F29" }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-1 text-[22px] font-black tracking-tight text-neutral-50">{t.lookupTitle}</h3>
        <p className="mb-4 text-[13px] font-semibold text-neutral-400">{t.lookupSubtitle}</p>

        <div className="mb-4 flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            value={folio}
            onChange={(e) => setFolio(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder={t.lookupPlaceholder}
            autoFocus
            className="min-w-0 flex-1 rounded-lg border px-3.5 py-3 text-lg font-bold text-neutral-50"
            style={{ background: "#232019", borderColor: "#332F29" }}
          />
          <button
            onClick={search}
            disabled={searching || !folio}
            className="rounded-lg px-5 py-3 text-sm font-extrabold disabled:opacity-40"
            style={{ background: "#5B8DEF", color: "#0A1020" }}
          >
            {searching ? t.lookupSearching : t.lookupSearch}
          </button>
        </div>

        {notFound && <p className="mb-4 text-sm font-semibold" style={{ color: "#FF9EA1" }}>{t.lookupNotFound}</p>}

        {result && (
          <div className="rounded-xl border p-4" style={{ borderColor: "#332F29", background: "#232019" }}>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-2xl font-black tabular-nums text-neutral-50">#{result.folio}</span>
              <span className="rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-wide" style={{ background: "#332F29", color: "#F6F3ED" }}>
                {t[STATUS_LABEL_KEY[result.status] ?? "lookupStatusRecibido"] as string}
              </span>
            </div>
            {result.customer_name && <p className="mb-2 text-sm font-semibold text-neutral-300">{result.customer_name}</p>}
            <ul className="mb-3 space-y-1">
              {result.items.map((i, idx) => (
                <li key={idx} className="text-sm font-semibold text-neutral-200">
                  {i.quantity}× {i.product_name_snapshot}
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t pt-2.5 text-sm font-bold" style={{ borderColor: "#332F29" }}>
              <span style={{ color: result.payment_status === "pagada" ? "#8BE9B0" : "#FFCB6B" }}>
                {result.payment_status === "pagada" ? t.lookupPaidWith(paymentLabel) : t.lookupUnpaid}
              </span>
              <span className="text-neutral-50">${result.total.toFixed(2)}</span>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-lg py-3.5 text-base font-extrabold"
          style={{ background: "#232019", color: "#F6F3ED" }}
        >
          {t.backToOrders}
        </button>
      </div>
    </div>
  )
}
