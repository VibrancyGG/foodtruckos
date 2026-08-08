"use client"

import { useTransition } from "react"
import { archiveUnit } from "@/lib/units/actions"
import { useLang } from "@/lib/i18n/LangProvider"
import type { OwnerUnitsData } from "@/lib/units/getOwnerUnits"

export function ArchiveTruckModal({
  unit,
  onClose,
  onDone,
}: {
  unit: OwnerUnitsData["active"][number]
  onClose: () => void
  onDone: () => void
}) {
  const { t } = useLang()
  const p = t.panel.trucksPage
  const c = t.panel.common
  const [pending, startTransition] = useTransition()

  function submit() {
    startTransition(async () => {
      const result = await archiveUnit(unit.id)
      if (result.ok) onDone()
    })
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-5" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md rounded-2xl bg-white p-6" role="dialog" aria-modal="true">
        <h3 className="mb-1.5 text-xl font-black">{p.archiveModalTitle(unit.name)}</h3>
        <p className="mb-3 text-sm leading-relaxed text-neutral-600">{p.archiveModalBody}</p>
        <p className="mb-4 text-sm leading-relaxed text-neutral-600">{p.archiveModalBilling}</p>

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-bold text-neutral-500">
            {c.cancel}
          </button>
          <button
            onClick={submit}
            disabled={pending}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {pending ? c.saving : p.yesArchive}
          </button>
        </div>
      </div>
    </div>
  )
}
