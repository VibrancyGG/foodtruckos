"use client"

import { useState, useTransition } from "react"
import { createCategory, updateCategory, deleteCategory } from "@/lib/menu/actions"
import { useLang } from "@/lib/i18n/LangProvider"
import { dictionary } from "@/lib/i18n/dictionary"
import { TranslateFieldActions } from "../TranslateFieldActions"
import { Modal } from "../ui/Modal"
import { Button } from "../ui/Button"
import { inputClass, labelClass } from "../ui/tokens"

type Props =
  | { mode: "add"; onClose: () => void }
  | { mode: "edit"; category: { id: string; name_es: string; name_en: string }; onClose: () => void }

export function CategoryModal(props: Props) {
  const { t } = useLang()
  const c = t.panel.common
  const m = t.panel.menuPage
  const { onClose } = props
  const [nameEs, setNameEs] = useState(props.mode === "edit" ? props.category.name_es : "")
  const [nameEn, setNameEn] = useState(props.mode === "edit" ? props.category.name_en : "")
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [pending, startTransition] = useTransition()

  function submit() {
    setError(null)
    if (!nameEs.trim() || !nameEn.trim()) {
      setError(m.categoryFormError)
      return
    }
    startTransition(async () => {
      const result =
        props.mode === "edit"
          ? await updateCategory({ categoryId: props.category.id, nameEs, nameEn })
          : await createCategory({ nameEs, nameEn })
      if (!result.ok) {
        setError(result.error)
        return
      }
      onClose()
    })
  }

  function remove() {
    if (props.mode !== "edit") return
    setError(null)
    startTransition(async () => {
      const result = await deleteCategory(props.category.id)
      if (!result.ok) {
        setError(result.error)
        setConfirmDelete(false)
        return
      }
      onClose()
    })
  }

  return (
    <Modal size="sm">
      <h3 className="mb-1.5 font-[family-name:var(--font-panel-display)] text-xl font-bold">
        {props.mode === "edit" ? m.editCategory : m.addCategory}
      </h3>
      <p className="mb-4 text-sm text-panel-ink-soft">{m.addCategoryHint}</p>

      {/* Solo al crear: quien está editando ya sabe qué es una categoría. Los
          ejemplos se tocan y llenan los DOS idiomas de una vez — el dueño que
          abre esto por primera vez rara vez tiene un nombre pensado; tiene un
          menú en la cabeza y no sabe por dónde empezar a partirlo. */}
      {props.mode === "add" && (
        <div className="mb-4">
          <p className="mb-2 text-xs font-semibold text-panel-ink-soft">{m.categoryExamplesLabel}</p>
          <div className="flex flex-wrap gap-1.5">
            {m.categoryExamples.split(", ").map((ejemplo, i) => (
              <button
                key={ejemplo}
                type="button"
                onClick={() => {
                  setNameEs(dictionary.es.panel.menuPage.categoryExamples.split(", ")[i] ?? ejemplo)
                  setNameEn(dictionary.en.panel.menuPage.categoryExamples.split(", ")[i] ?? ejemplo)
                }}
                className="rounded-full border border-panel-line px-2.5 py-1 text-xs font-semibold text-panel-ink-soft transition-colors hover:border-panel-brand hover:text-panel-brand"
              >
                {ejemplo}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mb-1.5 flex items-center justify-between">
        <label className={labelClass}>{c.nameEsPlaceholder}</label>
        <TranslateFieldActions sourceValue={nameEn} setTarget={setNameEs} direction="en-es" />
      </div>
      <input value={nameEs} onChange={(e) => setNameEs(e.target.value)} className={`${inputClass} mb-3`} />
      <div className="mb-1.5 flex items-center justify-between">
        <label className={labelClass}>{c.nameEnPlaceholder}</label>
        <TranslateFieldActions sourceValue={nameEs} setTarget={setNameEn} direction="es-en" allowCopy />
      </div>
      <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} className={`${inputClass} mb-4`} />

      {error && <p className="mb-3 text-xs text-rose-600">{error}</p>}

      <div className="flex items-center justify-between gap-2">
        <div>
          {props.mode === "edit" &&
            (confirmDelete ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-panel-ink-soft">{m.confirmRemoveCategory}</span>
                <button onClick={remove} disabled={pending} className="font-bold text-rose-600">
                  {c.yesRemove}
                </button>
                <button onClick={() => setConfirmDelete(false)} className="text-panel-ink-soft">
                  {c.cancel}
                </button>
              </div>
            ) : (
              <Button variant="danger" onClick={() => setConfirmDelete(true)} className="text-xs">
                {m.deleteCategory}
              </Button>
            ))}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose} className="px-3 py-2">
            {c.cancel}
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? c.saving : props.mode === "edit" ? c.save : m.createCategory}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
