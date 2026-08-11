"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import {
  createProduct,
  updateProduct,
  retireProduct,
  setProductExclusivity,
  uploadProductPhoto,
} from "@/lib/menu/actions"
import { useLang } from "@/lib/i18n/LangProvider"
import type { OwnerMenuData } from "@/lib/menu/getOwnerMenu"
import { OptionGroupsEditor } from "../OptionGroupsEditor"

type Unit = { id: string; name: string }
type Category = { id: string; name_es: string; name_en: string }

type EditProps = {
  mode: "edit"
  product: OwnerMenuData["products"][number]
  units: Unit[]
  currentExclusiveUnitId: string | null
  optionGroups: OwnerMenuData["optionGroups"]
  options: OwnerMenuData["options"]
  onClose: () => void
}

type AddProps = {
  mode: "add"
  categories: Category[]
  units: Unit[]
  defaultCategoryId: string
  defaultExclusiveUnitId: string | null
  onClose: () => void
}

export function ProductModal(props: EditProps | AddProps) {
  const { lang, t } = useLang()
  const c = t.panel.common
  const m = t.panel.menuPage
  const { units, onClose } = props

  const [nameEs, setNameEs] = useState(props.mode === "edit" ? props.product.name_es : "")
  const [nameEn, setNameEn] = useState(props.mode === "edit" ? props.product.name_en : "")
  const [descEs, setDescEs] = useState(props.mode === "edit" ? props.product.description_es ?? "" : "")
  const [descEn, setDescEn] = useState(props.mode === "edit" ? props.product.description_en ?? "" : "")
  const [price, setPrice] = useState(props.mode === "edit" ? String(props.product.price) : "")
  const [photoUrl, setPhotoUrl] = useState<string | null>(props.mode === "edit" ? props.product.photo_url : null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [categoryId, setCategoryId] = useState(props.mode === "add" ? props.defaultCategoryId : "")
  const [exclusiveUnitId, setExclusiveUnitId] = useState<string | null>(
    props.mode === "edit" ? props.currentExclusiveUnitId : props.defaultExclusiveUnitId,
  )
  const [confirmRetire, setConfirmRetire] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const descEsRef = useRef<HTMLTextAreaElement>(null)
  const descEnRef = useRef<HTMLTextAreaElement>(null)

  // Se ajusta al abrir el modal también, no solo al escribir — sin esto una
  // descripción larga ya guardada aparece recortada hasta el primer tecleo.
  useEffect(() => {
    for (const ref of [descEsRef, descEnRef]) {
      const el = ref.current
      if (!el) continue
      el.style.height = "auto"
      el.style.height = `${el.scrollHeight}px`
    }
  }, [])

  function onPhotoPick(file: File) {
    setPhotoFile(file)
    setPhotoUrl(URL.createObjectURL(file))
  }

  function submit() {
    setError(null)
    const priceNum = parseFloat(price)
    if (!nameEs.trim() || !nameEn.trim() || !(priceNum > 0)) {
      setError(m.formError)
      return
    }

    startTransition(async () => {
      if (props.mode === "edit") {
        const result = await updateProduct({
          productId: props.product.id,
          nameEs,
          nameEn,
          descriptionEs: descEs,
          descriptionEn: descEn,
          price: priceNum,
        })
        if (!result.ok) {
          setError(result.error)
          return
        }
        if (exclusiveUnitId !== props.currentExclusiveUnitId) {
          await setProductExclusivity({
            productId: props.product.id,
            businessUnitIds: units.map((u) => u.id),
            exclusiveUnitId,
          })
        }
        if (photoFile) {
          const formData = new FormData()
          formData.set("file", photoFile)
          await uploadProductPhoto(props.product.id, formData)
        }
        onClose()
      } else {
        if (!categoryId) {
          setError(m.formError)
          return
        }
        const result = await createProduct({
          categoryId,
          nameEs,
          nameEn,
          descriptionEs: descEs,
          descriptionEn: descEn,
          price: priceNum,
          exclusiveUnitId,
        })
        if (!result.ok) {
          setError(result.error)
          return
        }
        if (photoFile) {
          const formData = new FormData()
          formData.set("file", photoFile)
          await uploadProductPhoto(result.productId, formData)
        }
        onClose()
      }
    })
  }

  function retire() {
    if (props.mode !== "edit") return
    startTransition(async () => {
      const result = await retireProduct(props.product.id)
      if (result.ok) onClose()
    })
  }

  const exclusivityOptions: { id: string | null; label: string; hint: string }[] = [
    { id: null, label: m.exclusivityAll, hint: m.exclusivityAllHint },
    ...units.map((u) => ({ id: u.id, label: m.exclusivityOnly(u.name), hint: m.exclusivityOnlyHint })),
  ]

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-5" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6" role="dialog" aria-modal="true">
        <h3 className="mb-1.5 text-xl font-black">{props.mode === "edit" ? (lang === "es" ? props.product.name_es : props.product.name_en) : m.addProduct}</h3>
        <p className="mb-4 text-sm text-neutral-500">{props.mode === "edit" ? m.editModalHint : m.addModalHint}</p>

        <label className="mb-1.5 block text-xs font-bold text-neutral-500">{m.photoLabel}</label>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-16 w-16 flex-none overflow-hidden rounded-xl border border-dashed border-neutral-300 bg-neutral-50">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-center text-[10px] text-neutral-400">{c.noPhoto}</div>
            )}
          </div>
          <div>
            <label className="cursor-pointer rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-bold">
              {photoUrl ? c.chooseImage : c.chooseImage}
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
            <p className="mt-1.5 text-[11px] leading-snug text-neutral-400">{m.photoHint}</p>
          </div>
        </div>

        <label className="mb-1.5 block text-xs font-bold text-neutral-500">{c.nameEsPlaceholder}</label>
        <input value={nameEs} onChange={(e) => setNameEs(e.target.value)} className="mb-3 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
        <label className="mb-1.5 block text-xs font-bold text-neutral-500">{c.nameEnPlaceholder}</label>
        <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="mb-3 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />

        <label className="mb-1.5 block text-xs font-bold text-neutral-500">{m.descriptionEsPlaceholder}</label>
        <textarea
          ref={descEsRef}
          value={descEs}
          onChange={(e) => {
            setDescEs(e.target.value)
            e.target.style.height = "auto"
            e.target.style.height = `${e.target.scrollHeight}px`
          }}
          rows={2}
          className="mb-3 w-full resize-none overflow-hidden rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />
        <label className="mb-1.5 block text-xs font-bold text-neutral-500">{m.descriptionEnPlaceholder}</label>
        <textarea
          ref={descEnRef}
          value={descEn}
          onChange={(e) => {
            setDescEn(e.target.value)
            e.target.style.height = "auto"
            e.target.style.height = `${e.target.scrollHeight}px`
          }}
          rows={2}
          className="mb-3 w-full resize-none overflow-hidden rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />

        <label className="mb-1.5 block text-xs font-bold text-neutral-500">{m.pricePlaceholder}</label>
        <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" className="mb-4 w-28 rounded-lg border border-neutral-300 px-3 py-2 text-sm" />

        {props.mode === "add" && (
          <>
            <label className="mb-1.5 block text-xs font-bold text-neutral-500">{m.whichCategoryLabel}</label>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {props.categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  aria-pressed={categoryId === cat.id}
                  onClick={() => setCategoryId(cat.id)}
                  className={`rounded-lg border-2 p-2.5 text-left text-xs font-bold ${categoryId === cat.id ? "border-neutral-900" : "border-neutral-200"}`}
                >
                  {lang === "es" ? cat.name_es : cat.name_en}
                </button>
              ))}
            </div>
          </>
        )}

        {units.length > 1 && (
          <>
            <label className="mb-1.5 block text-xs font-bold text-neutral-500">{m.whoSellsIt}</label>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {exclusivityOptions.map((opt) => (
                <button
                  key={opt.id ?? "all"}
                  type="button"
                  aria-pressed={exclusiveUnitId === opt.id}
                  onClick={() => setExclusiveUnitId(opt.id)}
                  className={`rounded-lg border-2 p-2.5 text-left ${exclusiveUnitId === opt.id ? "border-neutral-900" : "border-neutral-200"}`}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className="text-[11px] text-neutral-500">{opt.hint}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {props.mode === "add" && (
          <div className="mb-4 rounded-lg bg-amber-50 p-3 text-xs leading-relaxed text-amber-900">{m.noPhotoYetHint}</div>
        )}

        {props.mode === "edit" && (
          <div className="mb-4 border-t border-neutral-100 pt-3">
            <button onClick={() => setShowOptions((s) => !s)} className="text-xs font-bold text-neutral-500">
              {showOptions ? m.hideOptions : m.showOptions} ({props.optionGroups.length})
            </button>
            {showOptions && (
              <OptionGroupsEditor productId={props.product.id} groups={props.optionGroups} options={props.options} />
            )}
          </div>
        )}

        {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

        <div className="flex items-center justify-between gap-2">
          <div>
            {props.mode === "edit" &&
              (confirmRetire ? (
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
                <button onClick={() => setConfirmRetire(true)} className="text-xs font-bold text-red-600">
                  {m.removeFromMenu}
                </button>
              ))}
          </div>
          <div className="flex gap-2">
            <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-bold text-neutral-500">
              {c.cancel}
            </button>
            <button
              onClick={submit}
              disabled={pending}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
            >
              {pending ? c.saving : props.mode === "edit" ? c.save : m.addProductSubmit}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
