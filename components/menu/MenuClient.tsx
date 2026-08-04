"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useLang } from "@/lib/i18n/LangProvider"
import { createOrder, type CartItemInput } from "@/lib/orders/actions"
import type { ActiveMenuData } from "@/lib/menu/getMenuData"

type CartLine = CartItemInput & { key: string }

export function MenuClient({ data }: { data: ActiveMenuData }) {
  const { lang, setLang, t } = useLang()
  const router = useRouter()
  const [cart, setCart] = useState<CartLine[]>([])
  const [customerName, setCustomerName] = useState("")
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState(false)

  const offeredByUnit = useMemo(() => {
    const map = new Map(data.unitProducts.map((up) => [up.product_id, up]))
    return map
  }, [data.unitProducts])

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
    setSendError(false)
    const result = await createOrder({
      businessId: data.business.id,
      unitId: data.unit.id,
      orderPointId: data.orderPoint.id,
      taxIncluded: data.business.tax_included,
      customerName: customerName || undefined,
      items: cart,
    })
    setSending(false)
    if ("error" in result) {
      setSendError(true)
      return
    }
    router.push(`/orden/${result.orderId}`)
  }

  return (
    <div className="mx-auto max-w-lg pb-40">
      <header
        className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 text-[var(--brand-on-primary)]"
        style={{ background: "var(--brand-primary)" }}
      >
        <div className="flex items-center gap-2">
          {data.business.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.business.logo_url}
              alt=""
              className="h-9 w-9 rounded-full object-cover"
            />
          )}
          <div>
            <div className="font-bold">{data.business.name}</div>
            <div className="text-xs opacity-90">{data.unit.name}</div>
          </div>
        </div>
        <button
          className="rounded-full border border-current px-3 py-1 text-xs font-semibold"
          onClick={() => setLang(lang === "es" ? "en" : "es")}
        >
          {lang === "es" ? "EN" : "ES"}
        </button>
      </header>

      <div className="space-y-6 p-4">
        {[...productsByCategory.entries()].map(([catId, products]) => {
          const category = data.categories.find((c) => c.id === catId)
          return (
            <section key={catId ?? "sin-categoria"}>
              {category && (
                <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-neutral-500">
                  {lang === "es" ? category.name_es : category.name_en}
                </h2>
              )}
              <div className="space-y-2">
                {products.map((p) => {
                  const up = offeredByUnit.get(p.id)
                  const soldOut = up?.sold_out === true
                  return (
                    <div
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 p-3"
                    >
                      <div>
                        <div className="font-semibold">{lang === "es" ? p.name_es : p.name_en}</div>
                        <div className="text-sm text-neutral-500">${p.price.toFixed(2)}</div>
                      </div>
                      <button
                        disabled={soldOut}
                        onClick={() => addToCart(p)}
                        className="rounded-full px-4 py-2 text-sm font-bold text-[var(--brand-on-primary)] disabled:opacity-40"
                        style={{ background: soldOut ? "#9C948A" : "var(--brand-primary)" }}
                      >
                        {soldOut ? t.menu.soldOut : t.menu.addToCart}
                      </button>
                    </div>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 border-t border-neutral-200 bg-white p-4 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
          <div className="mx-auto max-w-lg space-y-3">
            <div className="max-h-40 space-y-2 overflow-y-auto">
              {cart.map((l) => (
                <div key={l.key} className="flex items-center justify-between text-sm">
                  <span>{l.productName}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => changeQty(l.key, -1)} className="h-6 w-6 rounded-full border">
                      −
                    </button>
                    <span>{l.quantity}</span>
                    <button onClick={() => changeQty(l.key, 1)} className="h-6 w-6 rounded-full border">
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
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
            {sendError && (
              <div className="rounded-lg bg-red-50 p-2 text-sm text-red-700">
                {t.menu.sendError}
              </div>
            )}
            <button
              onClick={handleCheckout}
              disabled={sending}
              className="w-full rounded-xl py-3 font-bold text-[var(--brand-on-primary)] disabled:opacity-60"
              style={{ background: "var(--brand-primary)" }}
            >
              {sending
                ? t.menu.sending
                : `${sendError ? t.menu.retry + " · " : ""}${t.menu.checkout} · $${cartSubtotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
