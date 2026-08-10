"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useLang } from "@/lib/i18n/LangProvider"
import { createOrder, type CartItemInput } from "@/lib/orders/actions"
import type { ActiveMenuData } from "@/lib/menu/getMenuData"
import { displayFont } from "@/lib/fonts"
import { CustomizeSheet } from "./CustomizeSheet"

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
  const [sendError, setSendError] = useState(false)
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

  const groupsByProduct = useMemo(() => {
    const map = new Map<string, typeof data.optionGroups>()
    for (const g of data.optionGroups) {
      if (!map.has(g.product_id)) map.set(g.product_id, [])
      map.get(g.product_id)!.push(g)
    }
    return map
  }, [data.optionGroups])

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
    try {
      window.localStorage.removeItem(storageKey)
    } catch {
      // no pasa nada si no se pudo limpiar — el pedido ya se confirmó
    }
    router.push(`/orden/${result.orderId}`)
  }

  const blackHeader = data.business.header_style === "black"

  return (
    <div className={`${displayFont.variable} mx-auto max-w-lg pb-40`} style={{ background: PANEL, color: INK }}>
      <header
        className="relative overflow-hidden px-4 pb-5 pt-4"
        style={blackHeader ? { background: "#0A0A0A", color: "#fff" } : { background: "var(--brand-primary)", color: "var(--brand-on-primary)" }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.14]"
          style={{ backgroundImage: "repeating-linear-gradient(135deg, currentColor 0 2px, transparent 2px 14px)" }}
        />
        <div className="relative flex items-center gap-3">
          {data.business.logo_url ? (
            // Montado directo sobre el header, sin placa — el logo adopta el
            // fondo del encabezado (color de marca o negro). Si el PNG es
            // transparente se funde; si trae su propio lienzo, ese lienzo se
            // ve, y es justo lo que se espera al subir un logo así.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={data.business.logo_url} alt="" className="h-16 w-16 flex-none object-contain" />
          ) : (
            <div
              className="grid h-14 w-14 flex-none place-items-center rounded-full"
              style={blackHeader ? { background: "rgba(255,255,255,0.1)" } : { background: "var(--brand-on-primary)", color: "var(--brand-primary)" }}
            >
              <span style={{ fontFamily: "var(--font-display)", fontSize: 18 }}>{monogram(data.business.name)}</span>
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
        <div
          className={`relative mt-3.5 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${blackHeader ? "bg-white/15" : "bg-black/20"}`}
        >
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "#4ADE80", boxShadow: "0 0 0 3px rgba(74,222,128,.28)" }}
          />
          {lang === "es" ? "Abierto" : "Open"}
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
        className="sticky top-0 z-10 flex gap-2 overflow-x-auto border-b px-4 py-2.5"
        style={{ background: PANEL, borderColor: LINE, scrollbarWidth: "none" }}
      >
        {data.categories.map((cat) => (
          <a
            key={cat.id}
            href={`#cat-${cat.id}`}
            className="flex-none rounded-full border px-3.5 py-1.5 text-xs font-semibold"
            style={{ borderColor: LINE, color: INK_SOFT }}
          >
            {lang === "es" ? cat.name_es : cat.name_en}
          </a>
        ))}
      </nav>

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
                        className="block w-full rounded-xl border-2 border-dashed p-3.5 text-left disabled:opacity-60"
                        style={{ borderColor: "var(--brand-primary)" }}
                      >
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
                          {!soldOut && customizable && <CustomizableTag lang={lang} />}
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
                      {!soldOut && customizable && <CustomizableTag lang={lang} />}
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
        <div className="fixed inset-x-0 bottom-0 p-3" style={{ background: INK }}>
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
            {sendError && (
              <div className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{t.menu.sendError}</div>
            )}
            <button
              onClick={handleCheckout}
              disabled={sending}
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
  )
}

function SoldOutTag({ label }: { label: string }) {
  return (
    <span className="mt-1.5 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white" style={{ background: INK }}>
      {label}
    </span>
  )
}

function CustomizableTag({ lang }: { lang: "es" | "en" }) {
  return (
    <span
      className="mt-1.5 inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide"
      style={{ background: LINE, color: INK_SOFT }}
    >
      {lang === "es" ? "Personalizable" : "Customizable"}
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
