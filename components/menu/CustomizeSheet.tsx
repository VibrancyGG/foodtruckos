"use client"

import { useMemo, useState } from "react"
import { useLang } from "@/lib/i18n/LangProvider"
import type { ActiveMenuData } from "@/lib/menu/getMenuData"
import type { CartItemInput } from "@/lib/orders/actions"

const LINE = "#E4DCD0"
const INK = "#1A1512"
const INK_SOFT = "#6B615A"

type Product = ActiveMenuData["products"][number]
type OptionGroup = ActiveMenuData["optionGroups"][number]
type ProductOption = ActiveMenuData["options"][number]

export function CustomizeSheet({
  product,
  groups,
  options,
  onClose,
  onAdd,
}: {
  product: Product
  groups: OptionGroup[]
  options: ProductOption[]
  onClose: () => void
  onAdd: (line: Omit<CartItemInput, "quantity"> & { quantity: number }) => void
}) {
  const { lang, t } = useLang()
  const [quantity, setQuantity] = useState(1)
  const [selected, setSelected] = useState<Record<string, string[]>>(() =>
    Object.fromEntries(groups.map((g) => [g.id, []])),
  )
  const [notes, setNotes] = useState("")

  const optionsByGroup = useMemo(() => {
    const map = new Map<string, ProductOption[]>()
    for (const g of groups) map.set(g.id, options.filter((o) => o.group_id === g.id))
    return map
  }, [groups, options])

  function toggle(group: OptionGroup, optionId: string) {
    const opt = options.find((o) => o.id === optionId)
    if (opt?.sold_out) return
    setSelected((s) => {
      const current = s[group.id] ?? []
      if (group.max_select <= 1) {
        return { ...s, [group.id]: current.includes(optionId) ? [] : [optionId] }
      }
      if (current.includes(optionId)) {
        return { ...s, [group.id]: current.filter((id) => id !== optionId) }
      }
      if (current.length >= group.max_select) return s
      return { ...s, [group.id]: [...current, optionId] }
    })
  }

  const ready = groups.every((g) => (selected[g.id]?.length ?? 0) >= g.min_select)

  const unitPrice = useMemo(() => {
    let price = product.price
    for (const g of groups) {
      for (const optId of selected[g.id] ?? []) {
        const opt = options.find((o) => o.id === optId)
        if (opt) price += opt.price_delta
      }
    }
    return price
  }, [product.price, groups, options, selected])

  function confirm() {
    const customizations: CartItemInput["customizations"] = []
    for (const g of groups) {
      for (const optId of selected[g.id] ?? []) {
        const opt = options.find((o) => o.id === optId)
        if (!opt) continue
        customizations.push({
          groupName: lang === "es" ? g.group_name_es : g.group_name_en,
          optionName: lang === "es" ? opt.option_name_es : opt.option_name_en,
          priceDelta: opt.price_delta,
          kind: opt.kind as "add" | "remove",
        })
      }
    }
    onAdd({
      productId: product.id,
      productName: lang === "es" ? product.name_es : product.name_en,
      unitPrice: product.price, // base sin deltas — los deltas viajan en customizations, el total se suma una sola vez (aquí y en el servidor)
      quantity,
      customizations,
      notes: notes.trim() || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl"
        style={{ background: "#FFFDF9", color: INK }}
      >
        <div
          className="relative h-[150px] overflow-hidden"
          style={{ background: "var(--brand-primary)" }}
        >
          {product.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.photo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <>
              <div
                className="pointer-events-none absolute inset-0"
                style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(0,0,0,.12) 0 7px, transparent 7px 14px)" }}
              />
              <div
                className="absolute inset-0 grid place-items-center"
                style={{ fontFamily: "var(--font-display)", fontSize: 64, color: "var(--brand-on-primary)", opacity: 0.55 }}
              >
                {(lang === "es" ? product.name_es : product.name_en)[0]?.toUpperCase()}
              </div>
              <span
                className="absolute left-3.5 top-3.5 rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
                style={{ background: "rgba(0,0,0,.34)" }}
              >
                {t.menu.photoComing}
              </span>
            </>
          )}
        </div>
        <div className="px-5 pb-4 pt-4" style={{ background: "var(--brand-primary)", color: "var(--brand-on-primary)" }}>
          <h2 className="uppercase leading-tight" style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>
            {lang === "es" ? product.name_es : product.name_en}
          </h2>
          {(lang === "es" ? product.description_es : product.description_en) && (
            <p className="mt-1.5 text-sm opacity-90">
              {lang === "es" ? product.description_es : product.description_en}
            </p>
          )}
        </div>

        <div className="border-b px-5 py-4" style={{ borderColor: LINE }}>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: INK_SOFT }}>
            {t.menu.quantity}
          </h3>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="grid h-11 w-11 place-items-center rounded-lg border-2 text-xl font-bold"
              style={{ borderColor: INK }}
            >
              −
            </button>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 24 }}>{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="grid h-11 w-11 place-items-center rounded-lg border-2 text-xl font-bold"
              style={{ borderColor: INK }}
            >
              +
            </button>
          </div>
        </div>

        {groups.map((g) => (
          <div key={g.id} className="border-b px-5 py-4" style={{ borderColor: LINE }}>
            <h3 className="mb-2.5 text-xs font-bold uppercase tracking-wide" style={{ color: INK_SOFT }}>
              {lang === "es" ? g.group_name_es : g.group_name_en}
              {g.required && <em className="ml-1.5 not-italic" style={{ color: "var(--brand-primary)" }}>· obligatorio</em>}
            </h3>
            <div className="flex flex-wrap gap-2">
              {(optionsByGroup.get(g.id) ?? []).map((o) => {
                const isSel = (selected[g.id] ?? []).includes(o.id)
                return (
                  <button
                    key={o.id}
                    onClick={() => toggle(g, o.id)}
                    disabled={o.sold_out}
                    className="min-h-[44px] rounded-lg border-2 px-3.5 py-2.5 text-left text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                    style={
                      isSel
                        ? { borderColor: "var(--brand-primary)", background: "var(--brand-primary)", color: "var(--brand-on-primary)" }
                        : { borderColor: LINE, background: "#fff", color: INK }
                    }
                  >
                    {lang === "es" ? o.option_name_es : o.option_name_en}
                    {o.sold_out ? (
                      <span className="block text-xs font-medium opacity-80">{t.menu.soldOut}</span>
                    ) : (
                      o.kind === "add" &&
                      o.price_delta > 0 && <span className="block text-xs font-medium opacity-80">+${o.price_delta.toFixed(2)}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <div className="px-5 py-4">
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: INK_SOFT }}>
            {t.menu.notes}
          </h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.menu.notesPlaceholder}
            className="w-full rounded-lg border-2 p-2.5 text-sm"
            style={{ borderColor: LINE, minHeight: 58 }}
          />
        </div>

        <div className="sticky bottom-0 flex gap-2.5 border-t bg-inherit px-5 py-3.5" style={{ borderColor: LINE, background: "#FFFDF9" }}>
          <button onClick={onClose} className="flex-none rounded-lg border-2 px-4 text-sm font-semibold" style={{ borderColor: LINE, color: INK_SOFT }}>
            {t.menu.cancel}
          </button>
          <button
            onClick={confirm}
            disabled={!ready}
            className="flex flex-1 items-center justify-between rounded-lg px-4 py-3 uppercase tracking-wide disabled:opacity-50"
            style={{ fontFamily: "var(--font-display)", fontSize: 17, background: "var(--brand-primary)", color: "var(--brand-on-primary)" }}
          >
            <span>{t.menu.addToCart}</span>
            <span>${(unitPrice * quantity).toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
