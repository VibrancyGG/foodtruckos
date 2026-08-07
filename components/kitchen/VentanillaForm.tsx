"use client"

import { useState } from "react"
import { dictionary, type Lang } from "@/lib/i18n/dictionary"
import type { KitchenData } from "@/lib/kitchen/getKitchenData"

type Line = { productId: string; productName: string; quantity: number; unitPrice: number }

export function VentanillaForm({
  products,
  unitProducts,
  taxIncluded,
  lang,
  onClose,
  onCreated,
}: {
  products: KitchenData["products"]
  unitProducts: KitchenData["unitProducts"]
  taxIncluded: boolean
  lang: Lang
  onClose: () => void
  onCreated: () => void
}) {
  const t = dictionary[lang]
  const [lines, setLines] = useState<Line[]>([])
  const [paidNow, setPaidNow] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)

  function add(product: KitchenData["products"][number]) {
    setLines((ls) => {
      const existing = ls.find((l) => l.productId === product.id)
      if (existing) return ls.map((l) => (l.productId === product.id ? { ...l, quantity: l.quantity + 1 } : l))
      const name = lang === "es" ? product.name_es : product.name_en
      return [...ls, { productId: product.id, productName: name, quantity: 1, unitPrice: product.price }]
    })
  }

  const total = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0)

  async function submit() {
    setSending(true)
    setError(false)
    try {
      const res = await fetch("/api/kitchen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ventanilla", taxIncluded, paidNow, items: lines }),
      })
      if (!res.ok) throw new Error()
      onCreated()
    } catch {
      setError(true)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end justify-center bg-black/60 md:items-center">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-4 text-neutral-900 md:rounded-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold">{t.kitchen.newVentanillaOrder}</h2>
          <button onClick={onClose} className="text-neutral-500">✕</button>
        </div>

        <div className="mb-3 space-y-1">
          {products.map((p) => {
            const up = unitProducts.find((u) => u.product_id === p.id)
            if (up?.sold_out) return null
            return (
              <button
                key={p.id}
                onClick={() => add(p)}
                className="flex w-full items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-left text-sm"
              >
                <span>{lang === "es" ? p.name_es : p.name_en}</span>
                <span className="font-semibold">${p.price.toFixed(2)}</span>
              </button>
            )
          })}
        </div>

        {lines.length > 0 && (
          <div className="mb-3 space-y-1 rounded-lg bg-neutral-50 p-2 text-sm">
            {lines.map((l) => (
              <div key={l.productId} className="flex justify-between">
                <span>{l.quantity}× {l.productName}</span>
                <span>${(l.unitPrice * l.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        <label className="mb-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={paidNow} onChange={(e) => setPaidNow(e.target.checked)} />
          {lang === "es" ? "Ya cobrado" : "Already charged"}
        </label>

        {error && <div className="mb-2 rounded bg-red-50 p-2 text-sm text-red-700">{t.menu.sendError}</div>}

        <button
          onClick={submit}
          disabled={sending || lines.length === 0}
          className="w-full rounded-xl bg-neutral-900 py-3 font-bold text-white disabled:opacity-50"
        >
          {sending ? t.menu.sending : `${t.kitchen.newVentanillaOrder} · $${total.toFixed(2)}`}
        </button>
      </div>
    </div>
  )
}
