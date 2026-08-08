"use client"

import { useState, useTransition } from "react"
import { createCategory } from "@/lib/menu/actions"
import { useLang } from "@/lib/i18n/LangProvider"

export function CategoryModal({ onClose }: { onClose: () => void }) {
  const { t } = useLang()
  const c = t.panel.common
  const m = t.panel.menuPage
  const [nameEs, setNameEs] = useState("")
  const [nameEn, setNameEn] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit() {
    setError(null)
    if (!nameEs.trim() || !nameEn.trim()) {
      setError(m.formError)
      return
    }
    startTransition(async () => {
      const result = await createCategory({ nameEs, nameEn })
      if (!result.ok) {
        setError(result.error)
        return
      }
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-5" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6" role="dialog" aria-modal="true">
        <h3 className="mb-1.5 text-xl font-black">{m.addCategory}</h3>
        <p className="mb-4 text-sm text-neutral-500">{m.addCategoryHint}</p>

        <label className="mb-1.5 block text-xs font-bold text-neutral-500">{c.nameEsPlaceholder}</label>
        <input value={nameEs} onChange={(e) => setNameEs(e.target.value)} className="mb-3 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
        <label className="mb-1.5 block text-xs font-bold text-neutral-500">{c.nameEnPlaceholder}</label>
        <input value={nameEn} onChange={(e) => setNameEn(e.target.value)} className="mb-4 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />

        {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-bold text-neutral-500">
            {c.cancel}
          </button>
          <button
            onClick={submit}
            disabled={pending}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {pending ? c.saving : m.createCategory}
          </button>
        </div>
      </div>
    </div>
  )
}
