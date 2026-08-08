"use client"

import { useState } from "react"
import { dictionary, type Lang } from "@/lib/i18n/dictionary"
import type { KitchenData } from "@/lib/kitchen/getKitchenData"

// Apagar un platillo lo quita del menú del comensal y de ventanilla al
// instante (mismo dato, una sola fuente de verdad). Los extras/opciones
// (Queso, Guacamole, Sin cebolla…) también se pueden agotar por separado —
// esto no estaba en el prototipo original, se agrega porque un ingrediente
// puede acabarse sin que el platillo completo se acabe.
export function SoldOutScreen({
  categories,
  products,
  unitProducts,
  optionGroups,
  options,
  lang,
  onToggleProduct,
  onToggleOption,
  onClose,
}: {
  categories: KitchenData["categories"]
  products: KitchenData["products"]
  unitProducts: KitchenData["unitProducts"]
  optionGroups: KitchenData["optionGroups"]
  options: KitchenData["options"]
  lang: Lang
  onToggleProduct: (unitProductId: string, soldOut: boolean) => void
  onToggleOption: (optionId: string, soldOut: boolean) => void
  onClose: () => void
}) {
  const t = dictionary[lang].kitchen
  const [tab, setTab] = useState<string>(categories[0]?.id ?? "extras")

  const soldOutProducts = products.filter((p) => unitProducts.find((up) => up.product_id === p.id)?.sold_out)
  const soldOutOptions = options.filter((o) => o.sold_out)
  const totalSoldOut = soldOutProducts.length + soldOutOptions.length

  const catProducts = tab !== "extras" ? products.filter((p) => p.category_id === tab) : []

  return (
    <div className="fixed inset-0 z-40 flex flex-col" style={{ background: "#100F0D" }}>
      <div className="flex flex-none flex-wrap items-center gap-3.5 border-b px-4.5 py-3.5" style={{ background: "#1B1917", borderColor: "#332F29" }}>
        <h2 className="text-[19px] font-black tracking-tight text-neutral-50">{t.soldOutTitle}</h2>
        <button
          onClick={onClose}
          className="ml-auto rounded-lg border px-4.5 py-2.5 text-sm font-extrabold"
          style={{ background: "#232019", color: "#F6F3ED", borderColor: "#332F29" }}
        >
          {t.backToOrders}
        </button>
        <p className="order-9 w-full text-[13px] font-semibold text-neutral-400">
          {totalSoldOut ? t.soldOutHintSome(totalSoldOut) : t.soldOutHintAll}
        </p>
      </div>

      <div className="flex flex-none gap-2 overflow-x-auto border-b px-4.5 py-2.5" style={{ background: "#1B1917", borderColor: "#332F29", scrollbarWidth: "none" }}>
        {categories.map((c) => {
          const hasOff = products.some((p) => p.category_id === c.id && unitProducts.find((up) => up.product_id === p.id)?.sold_out)
          return (
            <button
              key={c.id}
              onClick={() => setTab(c.id)}
              className="flex-none whitespace-nowrap rounded-full border px-4 py-2.5 text-[13.5px] font-extrabold"
              style={tab === c.id ? { background: "#F6F3ED", color: "#100F0D", borderColor: "#F6F3ED" } : { background: "#232019", color: "#9C948A", borderColor: "#332F29" }}
            >
              {lang === "es" ? c.name_es : c.name_en}
              {hasOff ? " ·" : ""}
            </button>
          )
        })}
        <button
          onClick={() => setTab("extras")}
          className="flex-none whitespace-nowrap rounded-full border px-4 py-2.5 text-[13.5px] font-extrabold"
          style={tab === "extras" ? { background: "#F6F3ED", color: "#100F0D", borderColor: "#F6F3ED" } : { background: "#232019", color: "#9C948A", borderColor: "#332F29" }}
        >
          {t.extrasTitle}
          {soldOutOptions.length ? " ·" : ""}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-4.5 py-3.5">
        {tab !== "extras" &&
          catProducts.map((p) => {
            const up = unitProducts.find((u) => u.product_id === p.id)
            const soldOut = up?.sold_out === true
            const name = lang === "es" ? p.name_es : p.name_en
            return (
              <div key={p.id} className="flex items-center gap-3.5 border-b py-3.5" style={{ borderColor: "#332F29" }}>
                <div className="min-w-0 flex-1">
                  <b className="block text-[17px] font-extrabold" style={soldOut ? { color: "#9C948A", textDecoration: "line-through" } : { color: "#F6F3ED" }}>
                    {name}
                  </b>
                  <span className="text-[13px] text-neutral-400">{soldOut ? t.notOnMenu : t.selling}</span>
                </div>
                <ToggleSwitch checked={!soldOut} onChange={(v) => up && onToggleProduct(up.id, !v)} label={name} />
              </div>
            )
          })}

        {tab === "extras" &&
          (options.length === 0 ? (
            <p className="py-8 text-center text-sm font-semibold text-neutral-500">—</p>
          ) : (
            optionGroups.map((g) => {
              const groupOptions = options.filter((o) => o.group_id === g.id)
              if (groupOptions.length === 0) return null
              const product = products.find((p) => p.id === g.product_id)
              return (
                <div key={g.id} className="mb-3">
                  <div className="mb-1 text-[11.5px] font-bold uppercase tracking-wide text-neutral-500">
                    {product ? (lang === "es" ? product.name_es : product.name_en) : ""} · {lang === "es" ? g.group_name_es : g.group_name_en}
                  </div>
                  {groupOptions.map((o) => {
                    const name = lang === "es" ? o.option_name_es : o.option_name_en
                    return (
                      <div key={o.id} className="flex items-center gap-3.5 border-b py-3" style={{ borderColor: "#332F29" }}>
                        <div className="min-w-0 flex-1">
                          <b className="block text-[16px] font-extrabold" style={o.sold_out ? { color: "#9C948A", textDecoration: "line-through" } : { color: "#F6F3ED" }}>
                            {name}
                          </b>
                          <span className="text-[13px] text-neutral-400">{o.sold_out ? t.notOnMenu : t.selling}</span>
                        </div>
                        <ToggleSwitch checked={!o.sold_out} onChange={(v) => onToggleOption(o.id, !v)} label={name} />
                      </div>
                    )
                  })}
                </div>
              )
            })
          ))}
      </div>
    </div>
  )
}

function ToggleSwitch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative h-[34px] w-[58px] flex-none rounded-full"
      style={{ background: checked ? "#30A46C" : "#4A443C" }}
    >
      <i
        className="absolute top-1 h-[26px] w-[26px] rounded-full bg-white transition-transform"
        style={{ transform: checked ? "translateX(28px)" : "translateX(4px)" }}
      />
    </button>
  )
}
