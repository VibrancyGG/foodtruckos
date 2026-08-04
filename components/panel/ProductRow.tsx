"use client"

import { useState, useTransition } from "react"
import type { OwnerMenuData } from "@/lib/menu/getOwnerMenu"
import { updateProduct, retireProduct, toggleSoldOut, uploadProductPhoto } from "@/lib/menu/actions"

export function ProductRow({
  product,
  units,
  unitProducts,
}: {
  product: OwnerMenuData["products"][number]
  units: OwnerMenuData["units"]
  unitProducts: OwnerMenuData["unitProducts"]
}) {
  const [editing, setEditing] = useState(false)
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
              foto
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
              placeholder="Nombre en español"
            />
            <input
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 px-2 py-1 text-sm"
              placeholder="Name in English"
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
            <div className="font-semibold">{product.name_es}</div>
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
                Guardar
              </button>
              <button onClick={() => setEditing(false)} className="text-xs text-neutral-500">
                Cancelar
              </button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="text-xs font-bold text-neutral-600">
              Editar
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
              Se acabó{units.length > 1 ? ` · ${u.name}` : ""}
            </label>
          )
        })}

        <div className="ml-auto">
          {confirmRetire ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500">¿Seguro? Si solo se acabó hoy, usa el interruptor.</span>
              <button onClick={retire} className="font-bold text-red-600">
                Sí, quitar
              </button>
              <button onClick={() => setConfirmRetire(false)} className="text-neutral-500">
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmRetire(true)}
              className="text-xs font-semibold text-neutral-400 hover:text-red-600"
            >
              Quitar del menú
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
