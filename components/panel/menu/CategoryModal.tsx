"use client"

import { useState, useTransition } from "react"
import { createCategory, updateCategory, deleteCategory } from "@/lib/menu/actions"
import { useLang } from "@/lib/i18n/LangProvider"
import { TranslateFieldActions } from "../TranslateFieldActions"

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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-5">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6" role="dialog" aria-modal="true">
        <h3 className="mb-1.5 text-xl font-black">{props.mode === "edit" ? m.editCategory : m.addCategory}</h3>
        <p className="mb-4 text-sm text-neutral-500">{m.addCategoryHint}</p>

        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-xs font-bold text-neutral-500">{c.nameEsPlaceholder}</label>
          <TranslateFieldActions sourceValue={nameEn} setTarget={setNameEs} direction="en-es" />
        </div>
        <input value={nameEs} onChange={(e) => setNameEs(e.target.value)} className="mb-3 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-xs font-bold text-neutral-500">{c.nameEnPlaceholder}</label>
          <TranslateFieldActions sourceValue={nameEs} setTarget={setNameEn} direction="es-en" allowCopy />
        </div>
        <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="mb-4 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />

        {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

        <div className="flex items-center justify-between gap-2">
          <div>
            {props.mode === "edit" &&
              (confirmDelete ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-neutral-500">{m.confirmRemoveCategory}</span>
                  <button onClick={remove} disabled={pending} className="font-bold text-red-600">
                    {c.yesRemove}
                  </button>
                  <button onClick={() => setConfirmDelete(false)} className="text-neutral-500">
                    {c.cancel}
                  </button>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className="text-xs font-bold text-red-600">
                  {m.deleteCategory}
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
              {pending ? c.saving : props.mode === "edit" ? c.save : m.createCategory}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
