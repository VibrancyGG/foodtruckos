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
import { TranslateFieldActions } from "../TranslateFieldActions"
import { Modal } from "../ui/Modal"
import { Button } from "../ui/Button"
import { inputClass, labelClass, cardSelectClass } from "../ui/tokens"

type Unit = { id: string; name: string }
type Category = { id: string; name_es: string; name_en: string }

type EditProps = {
  mode: "edit"
  product: OwnerMenuData["products"][number]
  units: Unit[]
  categories: Category[]
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

// Cada bloque tiene su propio acento de color — no es decoración, es para que
// el dueño ubique de un vistazo "dónde estoy" en un formulario largo, en vez
// de escanear texto gris parejo de arriba a abajo.
function Section({
  accent,
  title,
  hint,
  children,
}: {
  accent: "blue" | "green" | "amber" | "purple" | "neutral"
  title: string
  hint?: string
  children: React.ReactNode
}) {
  const ACCENTS: Record<typeof accent, { border: string; bg: string; dot: string }> = {
    blue: { border: "#BFDBFE", bg: "#EFF6FF", dot: "#2563EB" },
    green: { border: "#BBF7D0", bg: "#F0FDF4", dot: "#16A34A" },
    amber: { border: "#FDE68A", bg: "#FFFBEB", dot: "#D97706" },
    purple: { border: "#E9D5FF", bg: "#FAF5FF", dot: "#9333EA" },
    neutral: { border: "#E5E5E5", bg: "#FAFAFA", dot: "#737373" },
  }
  const a = ACCENTS[accent]
  return (
    <section className="mb-3 rounded-xl border p-3.5" style={{ borderColor: a.border, background: a.bg }}>
      <div className="mb-2 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 flex-none rounded-full" style={{ background: a.dot }} />
        <h4 className="text-xs font-black uppercase tracking-wide text-neutral-700">{title}</h4>
      </div>
      {hint && <p className="mb-2.5 text-[11px] leading-relaxed text-neutral-500">{hint}</p>}
      {children}
    </section>
  )
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
  const [categoryId, setCategoryId] = useState(
    props.mode === "edit" ? (props.product.category_id ?? "") : props.defaultCategoryId,
  )
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
  }, [descEs, descEn])

  function onPhotoPick(file: File) {
    setPhotoFile(file)
    setPhotoUrl(URL.createObjectURL(file))
  }

  function submit() {
    setError(null)
    const priceNum = parseFloat(price)
    if (!nameEs.trim() || !nameEn.trim() || !(priceNum > 0)) {
      setError(m.productFormError)
      return
    }
    if (!categoryId) {
      setError(m.categoryRequiredError)
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
          categoryId,
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
    <Modal size="md" scroll>
      <h3 className="mb-1.5 font-[family-name:var(--font-panel-display)] text-xl font-bold">
        {props.mode === "edit" ? (lang === "es" ? props.product.name_es : props.product.name_en) : m.addProduct}
      </h3>
      <p className="mb-4 text-sm text-panel-ink-soft">{props.mode === "edit" ? m.editModalHint : m.addModalHint}</p>

        <Section accent="neutral" title={m.photoLabel}>
          <div className="flex items-center gap-3">
            <div className="h-16 w-16 flex-none overflow-hidden rounded-xl border border-dashed border-neutral-300 bg-white">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photoUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-center text-[10px] text-neutral-400">{c.noPhoto}</div>
              )}
            </div>
            <div>
              <label className="cursor-pointer rounded-lg border border-panel-line bg-panel-surface px-3 py-1.5 text-xs font-bold transition-colors hover:border-panel-brand hover:text-panel-brand">
                {c.chooseImage}
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
          {props.mode === "add" && <p className="mt-2.5 text-[11px] leading-relaxed text-amber-800">{m.noPhotoYetHint}</p>}
        </Section>

        <Section accent="blue" title={m.nameAndDescriptionTitle}>
          <div className="mb-1.5 flex items-center justify-between">
            <label className={labelClass}>{c.nameEsPlaceholder}</label>
            <TranslateFieldActions sourceValue={nameEn} setTarget={setNameEs} direction="en-es" />
          </div>
          <input value={nameEs} onChange={(e) => setNameEs(e.target.value)} className={`${inputClass} mb-3`} />
          <div className="mb-1.5 flex items-center justify-between">
            <label className={labelClass}>{c.nameEnPlaceholder}</label>
            <TranslateFieldActions sourceValue={nameEs} setTarget={setNameEn} direction="es-en" allowCopy />
          </div>
          <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} className={`${inputClass} mb-3`} />

          <div className="mb-1.5 flex items-center justify-between">
            <label className={labelClass}>{m.descriptionEsPlaceholder}</label>
            <TranslateFieldActions sourceValue={descEn} setTarget={setDescEs} direction="en-es" />
          </div>
          <textarea
            ref={descEsRef}
            value={descEs}
            onChange={(e) => {
              setDescEs(e.target.value)
              e.target.style.height = "auto"
              e.target.style.height = `${e.target.scrollHeight}px`
            }}
            rows={2}
            className={`${inputClass} mb-3 resize-none overflow-hidden`}
          />
          <div className="mb-1.5 flex items-center justify-between">
            <label className={labelClass}>{m.descriptionEnPlaceholder}</label>
            <TranslateFieldActions sourceValue={descEs} setTarget={setDescEn} direction="es-en" allowCopy />
          </div>
          <textarea
            ref={descEnRef}
            value={descEn}
            onChange={(e) => {
              setDescEn(e.target.value)
              e.target.style.height = "auto"
              e.target.style.height = `${e.target.scrollHeight}px`
            }}
            rows={2}
            className={`${inputClass} resize-none overflow-hidden`}
          />
        </Section>

        <Section accent="green" title={m.pricePlaceholder}>
          <input value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" className={`${inputClass} mb-3 w-28`} />

          <label className={labelClass}>{m.whichCategoryLabel}</label>
          <div className="grid grid-cols-2 gap-2">
            {props.categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                aria-pressed={categoryId === cat.id}
                onClick={() => setCategoryId(cat.id)}
                className={`${cardSelectClass(categoryId === cat.id)} text-xs font-bold`}
              >
                {lang === "es" ? cat.name_es : cat.name_en}
              </button>
            ))}
          </div>
        </Section>

        {units.length > 1 && (
          <Section accent="amber" title={m.whoSellsIt}>
            <div className="grid grid-cols-2 gap-2">
              {exclusivityOptions.map((opt) => (
                <button
                  key={opt.id ?? "all"}
                  type="button"
                  aria-pressed={exclusiveUnitId === opt.id}
                  onClick={() => setExclusiveUnitId(opt.id)}
                  className={cardSelectClass(exclusiveUnitId === opt.id)}
                >
                  <div className="text-xs font-bold">{opt.label}</div>
                  <div className="text-[11px] text-panel-ink-soft">{opt.hint}</div>
                </button>
              ))}
            </div>
          </Section>
        )}

        {props.mode === "edit" && (
          <Section accent="purple" title={m.showOptions} hint={m.personalizationHint}>
            <button onClick={() => setShowOptions((s) => !s)} className="text-xs font-bold text-neutral-700 underline">
              {showOptions ? m.hideOptions : m.showOptions} ({props.optionGroups.length})
            </button>
            {showOptions && (
              <OptionGroupsEditor productId={props.product.id} groups={props.optionGroups} options={props.options} />
            )}
          </Section>
        )}

      {error && <p className="mb-3 text-xs text-rose-600">{error}</p>}

      <div className="flex items-center justify-between gap-2">
        <div>
          {props.mode === "edit" &&
            (confirmRetire ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-panel-ink-soft">{m.confirmRemove}</span>
                <button onClick={retire} className="font-bold text-rose-600">
                  {c.yesRemove}
                </button>
                <button onClick={() => setConfirmRetire(false)} className="text-panel-ink-soft">
                  {c.cancel}
                </button>
              </div>
            ) : (
              <Button variant="danger" onClick={() => setConfirmRetire(true)} className="text-xs">
                {m.removeFromMenu}
              </Button>
            ))}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose} className="px-3 py-2">
            {c.cancel}
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? c.saving : props.mode === "edit" ? c.save : m.addProductSubmit}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
