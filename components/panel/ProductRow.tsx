"use client"

import { useState, useTransition } from "react"
import type { OwnerMenuData } from "@/lib/menu/getOwnerMenu"
import { setSoldOutForUnits, toggleSoldOut } from "@/lib/menu/actions"
import { useLang } from "@/lib/i18n/LangProvider"
import { ProductModal } from "./menu/ProductModal"

export function ProductRow({
  product,
  units,
  categories,
  unitProducts,
  optionGroups,
  options,
  filter,
}: {
  product: OwnerMenuData["products"][number]
  units: OwnerMenuData["units"]
  categories: OwnerMenuData["categories"]
  unitProducts: OwnerMenuData["unitProducts"]
  optionGroups: OwnerMenuData["optionGroups"]
  options: OwnerMenuData["options"]
  filter: string
}) {
  const { lang, t } = useLang()
  const m = t.panel.menuPage
  const [editing, setEditing] = useState(false)
  const [pending, startTransition] = useTransition()

  const myUnitProducts = unitProducts.filter((up) => up.product_id === product.id)
  const isOfferedOn = (unitId: string) => {
    const up = myUnitProducts.find((x) => x.unit_id === unitId)
    return up ? up.is_offered !== false : true
  }
  const offeredUnits = units.filter((u) => isOfferedOn(u.id))
  const exclusiveUnitId = offeredUnits.length === 1 && offeredUnits.length < units.length ? offeredUnits[0].id : null

  const scopedUnits = filter === "todos" ? offeredUnits : offeredUnits.filter((u) => u.id === filter)
  const soldOut = scopedUnits.length > 0 && scopedUnits.every((u) => myUnitProducts.find((x) => x.unit_id === u.id)?.sold_out)

  function onToggleSoldOut() {
    const nextValue = !soldOut
    startTransition(async () => {
      if (filter === "todos") {
        await setSoldOutForUnits({ productId: product.id, soldOut: nextValue, unitIds: offeredUnits.map((u) => u.id) })
      } else {
        await toggleSoldOut({ productId: product.id, unitId: filter, soldOut: nextValue })
      }
    })
  }

  function openEdit() {
    setEditing(true)
  }
  function closeEdit() {
    setEditing(false)
  }

  const exclusiveUnitName = exclusiveUnitId ? units.find((u) => u.id === exclusiveUnitId)?.name : null

  // Qué platillos dejan elegir algo al ordenar, sin entrar a editarlos. Un
  // grupo vacío no cuenta: el dueño lo creó pero no le puso opciones, así que
  // el comensal no vería nada — es el mismo criterio que usa el menú del
  // comensal para pintar su distintivo.
  const gruposConOpciones = optionGroups.filter(
    (g) => g.product_id === product.id && options.some((o) => o.group_id === g.id),
  ).length

  return (
    <div className={`grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 border-t border-panel-line px-4 py-3 transition-opacity first:border-t-0 ${soldOut ? "opacity-55" : ""}`}>
      <div className="h-11 w-11 flex-none overflow-hidden rounded-lg bg-panel-bg">
        {product.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.photo_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-center text-[9px] leading-tight text-panel-ink/35">{m.noPhotoShort}</div>
        )}
      </div>

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate font-semibold text-panel-ink">{lang === "es" ? product.name_es : product.name_en}</span>
          {exclusiveUnitName && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">{m.exclusivityOnly(exclusiveUnitName)}</span>
          )}
          {gruposConOpciones > 0 && (
            <span
              title={m.hasOptionsTitle(gruposConOpciones)}
              className="inline-flex items-center gap-1 rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-bold text-violet-700"
            >
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-violet-500" />
              {m.hasOptions}
            </span>
          )}
          {soldOut && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700">{m.soldOut}</span>}
        </div>
        <div className="truncate text-xs text-panel-ink-soft">{lang === "es" ? product.description_es : product.description_en}</div>
      </div>

      <div className="font-[family-name:var(--font-panel-display)] text-sm font-bold tabular-nums text-panel-ink">${product.price.toFixed(2)}</div>

      <div className="flex items-center gap-2">
        <button
          role="switch"
          aria-checked={soldOut}
          aria-label={m.soldOut}
          disabled={pending}
          onClick={onToggleSoldOut}
          className={`inline-flex h-[26px] w-[44px] flex-none shrink-0 items-center rounded-full p-0.5 transition-colors ${soldOut ? "justify-start bg-panel-line" : "justify-end bg-emerald-600"}`}
        >
          <span className="h-5 w-5 flex-none rounded-full bg-white shadow" />
        </button>
        <button
          onClick={openEdit}
          className="rounded-lg border border-panel-line px-2.5 py-1 text-xs font-bold text-panel-ink transition-colors hover:border-panel-brand hover:text-panel-brand"
        >
          {t.panel.common.edit}
        </button>
      </div>

      {editing && (
        <ProductModal
          mode="edit"
          product={product}
          units={units}
          categories={categories}
          currentExclusiveUnitId={exclusiveUnitId}
          optionGroups={optionGroups.filter((g) => g.product_id === product.id)}
          options={options}
          onClose={closeEdit}
        />
      )}
    </div>
  )
}
