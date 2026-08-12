"use client"

import { useTransition } from "react"
import { archiveUnit } from "@/lib/units/actions"
import { useLang } from "@/lib/i18n/LangProvider"
import type { OwnerUnitsData } from "@/lib/units/getOwnerUnits"
import { Modal } from "../ui/Modal"
import { Button } from "../ui/Button"

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
    <Modal size="md">
      <h3 className="mb-1.5 font-[family-name:var(--font-panel-display)] text-xl font-bold">{p.archiveModalTitle(unit.name)}</h3>
      <p className="mb-3 text-sm leading-relaxed text-panel-ink-soft">{p.archiveModalBody}</p>
      <p className="mb-4 text-sm leading-relaxed text-panel-ink-soft">{p.archiveModalBilling}</p>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} className="px-3 py-2">
          {c.cancel}
        </Button>
        <Button variant="dangerSolid" onClick={submit} disabled={pending}>
          {pending ? c.saving : p.yesArchive}
        </Button>
      </div>
    </Modal>
  )
}
