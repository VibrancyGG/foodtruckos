"use client"

import { useState, useTransition } from "react"
import type { OwnerMenuData } from "@/lib/menu/getOwnerMenu"
import { updateProduct, retireProduct, toggleSoldOut, uploadProductPhoto } from "@/lib/menu/actions"
import { useLang } from "@/lib/i18n/LangProvider"
import { OptionGroupsEditor } from "./OptionGroupsEditor"

export function ProductRow({
  product,
  units,
  unitProducts,
  optionGroups,
  options,
}: {
  product: OwnerMenuData["products"][number]
  units: OwnerMenuData["units"]
  unitProducts: OwnerMenuData["unitProducts"]
  optionGroups: OwnerMenuData["optionGroups"]
  options: OwnerMenuData["options"]
}) {
  const { lang, t } = useLang()
  const c = t.panel.common
  const m = t.panel.menuPage
  const [editing, setEditing] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [nameEs, setNameEs] = useState(product.name_es)
  const [nameEn, setNameEn] = useState(product.name_en)
  const [price, setPrice] = useState(String(product.price))
  const [photoUrl, setPhotoUrl] = useState(product.photo_url)
  const [error, setError] = useState<string | null>(null)
  const [confirmRetire, setConfirmRetire] = useState(false)
  const [removed, setRemoved] = useState(false)
  const [pending, startTransition] = useTransition()

  const myUnitProducts = unitProducts.filter((up) => up.product_id === product.id)

  function save() {
    setError(null)
    startTransition(async () => {
      const result = await updateProduct({
        productId: product.id,
        nameEs,
        nameEn,
        price: parseFloat(price),
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setEditing(false)
    })
  }

  function retire() {
    startTransition(async () => {
      const result = await retireProduct(product.id)
      if (result.ok) setRemoved(true)
    })
  }

  function onSoldOutChange(unitProductId: string, soldOut: boolean) {
    startTransition(async () => {
      await toggleSoldOut({ unitProductId, soldOut })
    })
  }

  function onPhotoPick(file: File) {
    setPhotoUrl(URL.createObjectURL(file))
    const formData = new FormData()
    formData.set("file", file)
    startTransition(async () => {
      const result = await uploadProductPhoto(product.id, formData)
      if (result.ok) setPhotoUrl(result.publicUrl)
    })
  }

  if (removed) return null

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3">
      <div className="flex items-center gap-3">
        <label className="h-12 w-12 flex-none cursor-pointer overflow-hidden rounded-lg bg-neutral-100">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
              {c.noPhoto}
            </div>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onPhotoPick(file)
            }}
          />
        </label>

        {editing ? (
          <div className="flex-1 space-y-1.5">
            <input
              value={nameEs}
              onChange={(e) => setNameEs(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-2 py-1 text-sm"
              placeholder={c.nameEsPlaceholder}
            />
            <input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-2 py-1 text-sm"
              placeholder={c.nameEnPlaceholder}
            />
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputMode="decimal"
              className="w-24 rounded-lg border border-neutral-300 px-2 py-1 text-sm"
            />
          </div>
        ) : (
          <div className="flex-1">
            <div className="font-semibold">{lang === "es" ? product.name_es : product.name_en}</div>
            <div className="text-sm text-neutral-500">${product.price.toFixed(2)}</div>
          </div>
        )}

        <div className="flex flex-none flex-col items-end gap-1">
          {editing ? (
            <div className="flex gap-2">
              <button
                onClick={save}
                disabled={pending}
                className="rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-bold text-white disabled:opacity-60"
              >
                {c.save}
              </button>
              <button onClick={() => setEditing(false)} className="text-xs text-neutral-500">
                {c.cancel}
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="text-xs font-bold text-neutral-600">
              {c.edit}
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-neutral-100 pt-3">
        {units.map((u) => {
          const up = myUnitProducts.find((x) => x.unit_id === u.id)
          if (!up) return null
          return (
            <label key={u.id} className="flex items-center gap-1.5 text-xs text-neutral-600">
              <input
                type="checkbox"
                checked={up.sold_out}
                onChange={(e) => onSoldOutChange(up.id, e.target.checked)}
              />
              {m.soldOut}
              {units.length > 1 ? ` · ${u.name}` : ""}
            </label>
          )
        })}

        <div className="ml-auto">
          {confirmRetire ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500">{m.confirmRemove}</span>
              <button onClick={retire} className="font-bold text-red-600">
                {c.yesRemove}
              </button>
              <button onClick={() => setConfirmRetire(false)} className="text-neutral-500">
                {c.cancel}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmRetire(true)}
              className="text-xs font-semibold text-neutral-400 hover:text-red-600"
            >
              {m.removeFromMenu}
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 border-t border-neutral-100 pt-2">
        <button onClick={() => setShowOptions((s) => !s)} className="text-xs font-bold text-neutral-500">
          {showOptions ? m.hideOptions : m.showOptions} ({optionGroups.length})
        </button>
        {showOptions && (
          <OptionGroupsEditor productId={product.id} groups={optionGroups} options={options} />
        )}
      </div>
    </div>
  )
}
