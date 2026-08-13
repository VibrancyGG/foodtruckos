"use client"

import { useMemo, useState } from "react"
import { dictionary, type Lang } from "@/lib/i18n/dictionary"
import type { KitchenData } from "@/lib/kitchen/getKitchenData"
import { NoteInput } from "./NoteInput"

type Customization = { groupName: string; optionName: string; priceDelta: number; kind: "add" | "remove" }
type Line = {
  key: string
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  customizations: Customization[]
  notes: string
}

const NOTA_ORDEN = [
  { label: "Para llevar", labelEn: "To go", group: "d" },
  { label: "Para comer aquí", labelEn: "For here", group: "d" },
  { label: "Todo junto", labelEn: "All together" },
  { label: "Cubiertos extra", labelEn: "Extra cutlery" },
]

const EDGE = "#332F29"
const SURFACE = "#1B1917"
const SURFACE2 = "#232019"
const TEXT = "#F6F3ED"
const DIM = "#9C948A"
const TAX_RATE = 0.08625

export function VentanillaForm({
  categories,
  products,
  unitProducts,
  optionGroups,
  options,
  taxIncluded,
  lang,
  onClose,
  onCreated,
  unitId,
}: {
  categories: KitchenData["categories"]
  products: KitchenData["products"]
  unitProducts: KitchenData["unitProducts"]
  optionGroups: KitchenData["optionGroups"]
  options: KitchenData["options"]
  taxIncluded: boolean
  lang: Lang
  onClose: () => void
  onCreated: () => void
  unitId?: string
}) {
  const t = dictionary[lang].kitchen
  const [cat, setCat] = useState<string | null>(categories[0]?.id ?? null)
  const [lines, setLines] = useState<Line[]>([])
  const [editing, setEditing] = useState<KitchenData["products"][number] | null>(null)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [paidNow, setPaidNow] = useState<boolean | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<"efectivo" | "tarjeta" | null>(null)
  const [orderChips, setOrderChips] = useState<Set<string>>(new Set())
  const [orderText, setOrderText] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(false)

  // Un grupo sin opciones todavía no cuenta como personalización real — ver
  // el mismo criterio en components/menu/MenuClient.tsx.
  const groupsByProduct = useMemo(() => {
    const groupsWithOptions = new Set(options.map((o) => o.group_id))
    const map = new Map<string, typeof optionGroups>()
    for (const g of optionGroups) {
      if (!groupsWithOptions.has(g.id)) continue
      if (!map.has(g.product_id)) map.set(g.product_id, [])
      map.get(g.product_id)!.push(g)
    }
    return map
  }, [optionGroups, options])

  const catProducts = products.filter((p) => p.category_id === cat)

  function qtyInCart(productId: string) {
    return lines.filter((l) => l.productId === productId).reduce((s, l) => s + l.quantity, 0)
  }

  function tapProduct(p: KitchenData["products"][number]) {
    if ((groupsByProduct.get(p.id)?.length ?? 0) > 0) {
      setEditingKey(null)
      setEditing(p)
      return
    }
    setLines((ls) => {
      const existing = ls.find((l) => l.productId === p.id && l.customizations.length === 0 && !l.notes)
      if (existing) return ls.map((l) => (l.key === existing.key ? { ...l, quantity: l.quantity + 1 } : l))
      const name = lang === "es" ? p.name_es : p.name_en
      return [...ls, { key: `${p.id}-${Date.now()}`, productId: p.id, productName: name, quantity: 1, unitPrice: p.price, customizations: [], notes: "" }]
    })
  }

  function editLine(key: string) {
    const line = lines.find((l) => l.key === key)
    if (!line) return
    const product = products.find((p) => p.id === line.productId)
    if (!product) return
    setEditingKey(key)
    setEditing(product)
  }

  function lineTotal(l: Line) {
    return l.quantity * (l.unitPrice + l.customizations.reduce((s, c) => s + c.priceDelta, 0))
  }

  const subtotal = lines.reduce((s, l) => s + lineTotal(l), 0)
  const total = taxIncluded ? subtotal : subtotal * (1 + TAX_RATE)

  function orderNotesText() {
    const label = (c: (typeof NOTA_ORDEN)[number]) => (lang === "es" ? c.label : c.labelEn)
    const chips = NOTA_ORDEN.filter((c) => orderChips.has(c.label)).map(label)
    return [...chips, orderText.trim()].filter(Boolean).join(" · ")
  }

  async function send() {
    setSending(true)
    setError(false)
    try {
      const res = await fetch("/api/kitchen", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ventanilla",
          unitId,
          taxIncluded,
          paidNow,
          paymentMethod: paidNow ? (paymentMethod ?? undefined) : undefined,
          orderNotes: orderNotesText() || undefined,
          items: lines.map((l) => ({
            productId: l.productId,
            productName: l.productName,
            quantity: l.quantity,
            unitPrice: l.unitPrice,
            customizations: l.customizations,
            notes: l.notes || undefined,
          })),
        }),
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
    <div className="fixed inset-0 z-40 flex flex-col" style={{ background: "#100F0D" }}>
      <div className="flex flex-none flex-wrap items-center gap-3.5 border-b px-4.5 py-3.5" style={{ background: SURFACE, borderColor: EDGE }}>
        <h2 className="text-[19px] font-black tracking-tight" style={{ color: TEXT }}>{t.newVentanillaOrder}</h2>
        <button onClick={onClose} className="ml-auto rounded-lg border px-4.5 py-2.5 text-sm font-extrabold" style={{ background: SURFACE2, color: TEXT, borderColor: EDGE }}>
          {dictionary[lang].menu.cancel}
        </button>
        <p className="order-9 w-full text-[13px] font-semibold" style={{ color: DIM }}>{t.ventanillaSubtitle}</p>
      </div>

      <div className="flex flex-none gap-2 overflow-x-auto border-b px-4.5 py-2.5" style={{ background: SURFACE, borderColor: EDGE, scrollbarWidth: "none" }}>
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className="flex-none whitespace-nowrap rounded-full border px-4 py-2.5 text-[13.5px] font-extrabold"
            style={cat === c.id ? { background: TEXT, color: "#100F0D", borderColor: TEXT } : { background: SURFACE2, color: DIM, borderColor: EDGE }}
          >
            {lang === "es" ? c.name_es : c.name_en}
          </button>
        ))}
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[1fr_360px]">
        <div className="min-h-0 overflow-auto px-4.5 py-3.5">
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {catProducts.map((p) => {
              const up = unitProducts.find((u) => u.product_id === p.id)
              const soldOut = up?.sold_out === true
              const name = lang === "es" ? p.name_es : p.name_en
              const inCart = qtyInCart(p.id)
              return (
                <button
                  key={p.id}
                  onClick={() => !soldOut && tapProduct(p)}
                  disabled={soldOut}
                  className="flex min-h-[104px] flex-col justify-between rounded-[11px] border p-0 text-left disabled:opacity-40"
                  style={{ background: SURFACE, borderColor: EDGE, color: TEXT }}
                >
                  <div className="relative h-16 w-full overflow-hidden rounded-t-[10px]" style={{ background: "var(--brand-primary, #5B8DEF)" }}>
                    {p.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.photo_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center text-2xl font-black text-white/70">{name[0]}</div>
                    )}
                  </div>
                  <div className="p-2.5">
                    <b className="text-[14px] font-extrabold leading-tight" style={soldOut ? { textDecoration: "line-through" } : undefined}>
                      {name}
                      {inCart > 0 && (
                        <span className="ml-1.5 inline-block rounded-full px-2 py-0.5 text-[12px] font-black" style={{ background: "#5B8DEF", color: "#0A1020" }}>
                          {inCart}
                        </span>
                      )}
                    </b>
                    <div className="mt-1.5 text-[13px] font-extrabold" style={{ color: DIM }}>
                      {soldOut ? t.soldOutShort : `$${p.price.toFixed(2)}`}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex min-h-0 flex-col border-t md:border-l md:border-t-0" style={{ background: SURFACE, borderColor: EDGE }}>
          <div className="min-h-0 flex-1 overflow-auto px-3.5 py-3">
            {lines.length === 0 ? (
              <p className="py-8 text-center text-sm font-semibold" style={{ color: "#5E574F" }}>{t.emptyTicket}</p>
            ) : (
              lines.map((l) => (
                <div key={l.key} className="grid grid-cols-[auto_1fr_auto] items-start gap-2.5 border-b py-2.5" style={{ borderColor: EDGE }}>
                  <div className="grid h-[30px] min-w-[30px] place-items-center rounded-md text-[15px] font-black" style={{ background: SURFACE2 }}>
                    {l.quantity}
                  </div>
                  <div>
                    <div className="text-[15px] font-bold leading-tight">{l.productName}</div>
                    {l.customizations.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {l.customizations.map((c, i) => (
                          <span key={i} className="rounded px-1.5 py-0.5 text-[11.5px] font-extrabold" style={c.kind === "add" ? { background: "#1F2E22", color: "#7EE2A8" } : { background: "#3A1E1F", color: "#FF9EA1" }}>
                            {c.kind === "add" ? "+ " : "− "}
                            {c.optionName}
                          </span>
                        ))}
                      </div>
                    )}
                    {l.notes && <div className="mt-1 text-[12.5px] font-bold" style={{ color: "#FFCB6B" }}>&quot;{l.notes}&quot;</div>}
                    <div className="mt-1.5 flex gap-1.5">
                      <button
                        onClick={() => setLines((ls) => ls.map((x) => (x.key === l.key ? { ...x, quantity: x.quantity - 1 } : x)).filter((x) => x.quantity > 0))}
                        className="rounded border px-2 py-1 text-xs font-bold"
                        style={{ borderColor: EDGE, color: DIM }}
                      >
                        −
                      </button>
                      <button
                        onClick={() => setLines((ls) => ls.map((x) => (x.key === l.key ? { ...x, quantity: x.quantity + 1 } : x)))}
                        className="rounded border px-2 py-1 text-xs font-bold"
                        style={{ borderColor: EDGE, color: DIM }}
                      >
                        +
                      </button>
                      {(groupsByProduct.get(l.productId)?.length ?? 0) > 0 && (
                        <button onClick={() => editLine(l.key)} className="rounded border px-2 py-1 text-xs font-bold" style={{ borderColor: EDGE, color: DIM }}>
                          {l.customizations.length || l.notes ? t.changesLabel : t.addNoteLabel}
                        </button>
                      )}
                      <button onClick={() => setLines((ls) => ls.filter((x) => x.key !== l.key))} className="rounded border px-2 py-1 text-xs font-bold" style={{ borderColor: EDGE, color: DIM }}>
                        {t.removeLine}
                      </button>
                    </div>
                  </div>
                  <div className="whitespace-nowrap text-[15px] font-extrabold tabular-nums">${lineTotal(l).toFixed(2)}</div>
                </div>
              ))
            )}
          </div>

          <div className="border-t px-3.5 py-3" style={{ borderColor: EDGE }}>
            <NoteInput
              chips={NOTA_ORDEN.map((c) => ({ label: lang === "es" ? c.label : c.labelEn, group: c.group }))}
              selected={orderChips}
              onToggleChip={(chip) =>
                setOrderChips((s) => {
                  const next = new Set(s)
                  if (next.has(chip.label)) next.delete(chip.label)
                  else {
                    if (chip.group) NOTA_ORDEN.forEach((c) => next.delete(lang === "es" ? c.label : c.labelEn))
                    next.add(chip.label)
                  }
                  return next
                })
              }
              text={orderText}
              onText={setOrderText}
              placeholder={t.notesPlaceholderOrder}
              lang={lang}
            />
          </div>

          <div className="flex-none border-t px-3.5 py-3.5" style={{ borderColor: EDGE }}>
            <div className="mb-2.5 flex items-baseline justify-between text-[22px] font-black">
              <span>
                {dictionary[lang].menu.total}
                {!taxIncluded && <small className="mt-0.5 block text-[12.5px] font-bold" style={{ color: DIM }}>{t.totalWithTax(total)}</small>}
              </span>
              <span className="tabular-nums">${subtotal.toFixed(2)}</span>
            </div>
            <div className="mb-2.5 grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaidNow(true)}
                aria-pressed={paidNow === true}
                className="rounded-lg border-2 py-3 text-[13.5px] font-extrabold"
                style={paidNow === true ? { borderColor: "#30A46C", background: "#16301F", color: "#8BE9B0" } : { borderColor: EDGE, background: SURFACE2, color: TEXT }}
              >
                {t.alreadyPaid}
              </button>
              <button
                onClick={() => {
                  setPaidNow(false)
                  setPaymentMethod(null)
                }}
                aria-pressed={paidNow === false}
                className="rounded-lg border-2 py-3 text-[13.5px] font-extrabold"
                style={paidNow === false ? { borderColor: "#30A46C", background: "#16301F", color: "#8BE9B0" } : { borderColor: EDGE, background: SURFACE2, color: TEXT }}
              >
                {t.payAtPickup}
              </button>
            </div>
            {paidNow === true && (
              <div className="mb-2.5 grid grid-cols-2 gap-2">
                <button
                  onClick={() => setPaymentMethod("efectivo")}
                  aria-pressed={paymentMethod === "efectivo"}
                  className="rounded-lg border-2 py-2.5 text-[13px] font-extrabold"
                  style={paymentMethod === "efectivo" ? { borderColor: "#5B8DEF", background: "#182338", color: "#8FB2FF" } : { borderColor: EDGE, background: SURFACE2, color: TEXT }}
                >
                  {t.paymentMethodCash}
                </button>
                <button
                  onClick={() => setPaymentMethod("tarjeta")}
                  aria-pressed={paymentMethod === "tarjeta"}
                  className="rounded-lg border-2 py-2.5 text-[13px] font-extrabold"
                  style={paymentMethod === "tarjeta" ? { borderColor: "#5B8DEF", background: "#182338", color: "#8FB2FF" } : { borderColor: EDGE, background: SURFACE2, color: TEXT }}
                >
                  {t.paymentMethodCard}
                </button>
              </div>
            )}
            {error && <div className="mb-2 rounded bg-red-950 p-2 text-sm text-red-300">{dictionary[lang].menu.sendError}</div>}
            <button
              onClick={send}
              disabled={sending || lines.length === 0 || paidNow === null || (paidNow === true && !paymentMethod)}
              className="w-full rounded-lg py-4 text-[17px] font-black disabled:opacity-50"
              style={{ background: "#5B8DEF", color: "#0A1020" }}
            >
              {sending ? dictionary[lang].menu.sending : t.sendToKitchen}
            </button>
          </div>
        </div>
      </div>

      {editing && (
        <LineCustomizeDialog
          product={editing}
          groups={groupsByProduct.get(editing.id) ?? []}
          options={options}
          lang={lang}
          initial={editingKey ? lines.find((l) => l.key === editingKey) : undefined}
          onClose={() => {
            setEditing(null)
            setEditingKey(null)
          }}
          onSave={(customizations, notes) => {
            if (editingKey) {
              setLines((ls) => ls.map((l) => (l.key === editingKey ? { ...l, customizations, notes } : l)))
            } else {
              const name = lang === "es" ? editing.name_es : editing.name_en
              setLines((ls) => [
                ...ls,
                { key: `${editing.id}-${Date.now()}`, productId: editing.id, productName: name, quantity: 1, unitPrice: editing.price, customizations, notes },
              ])
            }
            setEditing(null)
            setEditingKey(null)
          }}
        />
      )}
    </div>
  )
}

function LineCustomizeDialog({
  product,
  groups,
  options,
  lang,
  initial,
  onClose,
  onSave,
}: {
  product: KitchenData["products"][number]
  groups: KitchenData["optionGroups"]
  options: KitchenData["options"]
  lang: Lang
  initial?: Line
  onClose: () => void
  onSave: (customizations: Customization[], notes: string) => void
}) {
  const t = dictionary[lang].kitchen
  const [selected, setSelected] = useState<Record<string, string[]>>(() => {
    const map: Record<string, string[]> = Object.fromEntries(groups.map((g) => [g.id, []]))
    if (initial) {
      for (const c of initial.customizations) {
        const opt = options.find((o) => (lang === "es" ? o.option_name_es : o.option_name_en) === c.optionName && o.group_id in map)
        if (opt) map[opt.group_id] = [...map[opt.group_id], opt.id]
      }
    }
    return map
  })
  const [notes, setNotes] = useState(initial?.notes ?? "")

  const optionsByGroup = useMemo(() => {
    const map = new Map<string, KitchenData["options"]>()
    for (const g of groups) map.set(g.id, options.filter((o) => o.group_id === g.id))
    return map
  }, [groups, options])

  function toggle(group: KitchenData["optionGroups"][number], optionId: string) {
    setSelected((s) => {
      const current = s[group.id] ?? []
      if (group.max_select <= 1) return { ...s, [group.id]: current.includes(optionId) ? [] : [optionId] }
      if (current.includes(optionId)) return { ...s, [group.id]: current.filter((id) => id !== optionId) }
      if (current.length >= group.max_select) return s
      return { ...s, [group.id]: [...current, optionId] }
    })
  }

  const ready = groups.every((g) => (selected[g.id]?.length ?? 0) >= g.min_select)

  function save() {
    const customizations: Customization[] = []
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
    onSave(customizations, notes.trim())
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-5" onClick={onClose}>
      <div className="max-h-[86vh] w-full max-w-[460px] overflow-y-auto rounded-2xl border p-6" style={{ background: SURFACE, borderColor: EDGE }} onClick={(e) => e.stopPropagation()}>
        <div className="text-[15px] font-bold" style={{ color: DIM }}>{lang === "es" ? product.name_es : product.name_en}</div>
        <h3 className="mb-4 mt-1 text-[22px] font-black tracking-tight" style={{ color: TEXT }}>{t.anyChange}</h3>

        {groups.map((g) => (
          <div key={g.id} className="mb-4">
            <div className="mb-2.5 text-xs font-extrabold uppercase tracking-wide" style={{ color: DIM }}>
              {lang === "es" ? g.group_name_es : g.group_name_en}
              {g.required && <em className="ml-1.5 not-italic" style={{ color: "#F5A524" }}>· {g.min_select > 0 ? "obligatorio" : ""}</em>}
            </div>
            <div className="flex flex-wrap gap-2">
              {(optionsByGroup.get(g.id) ?? []).map((o) => {
                const isSel = (selected[g.id] ?? []).includes(o.id)
                const disabled = o.sold_out && !isSel
                return (
                  <button
                    key={o.id}
                    onClick={() => !disabled && toggle(g, o.id)}
                    disabled={disabled}
                    className="rounded-lg border-2 px-3.5 py-2.5 text-left text-sm font-bold disabled:opacity-40"
                    style={
                      isSel
                        ? o.kind === "remove"
                          ? { borderColor: "#E5484D", background: "#3A1E1F", color: "#FF9EA1" }
                          : { borderColor: "#5B8DEF", background: "#16253F", color: "#BBD4FF" }
                        : { borderColor: EDGE, background: SURFACE2, color: TEXT }
                    }
                  >
                    {lang === "es" ? o.option_name_es : o.option_name_en}
                    {o.sold_out ? ` · ${t.soldOutShort}` : o.kind === "add" && o.price_delta > 0 ? ` +$${o.price_delta.toFixed(2)}` : ""}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <div className="mb-5">
          <div className="mb-2.5 text-xs font-extrabold uppercase tracking-wide" style={{ color: DIM }}>{t.notesLabel}</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={t.notesPlaceholderLine}
            rows={2}
            className="w-full rounded-lg border px-3 py-2.5 text-sm"
            style={{ background: SURFACE2, borderColor: EDGE, color: TEXT }}
          />
        </div>

        <button
          onClick={save}
          disabled={!ready}
          className="w-full rounded-lg py-3.5 text-base font-black disabled:opacity-50"
          style={{ background: "#30A46C", color: "#04200F" }}
        >
          {t.doneLabel}
        </button>
      </div>
    </div>
  )
}
