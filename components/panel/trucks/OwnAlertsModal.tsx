"use client"

import { useState, useTransition } from "react"
import { setUnitAlertThresholds } from "@/lib/units/actions"
import { useLang } from "@/lib/i18n/LangProvider"
import type { OwnerUnitsData } from "@/lib/units/getOwnerUnits"
import { Modal } from "../ui/Modal"
import { Button } from "../ui/Button"

export function OwnAlertsModal({
  unit,
  businessAmber,
  businessRed,
  onClose,
}: {
  unit: OwnerUnitsData["active"][number]
  businessAmber: number
  businessRed: number
  onClose: () => void
}) {
  const { t } = useLang()
  const p = t.panel.trucksPage
  const c = t.panel.common
  const [amber, setAmber] = useState(unit.alert_amber_minutes ?? businessAmber)
  const [red, setRed] = useState(unit.alert_red_minutes ?? businessRed)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit() {
    setError(null)
    startTransition(async () => {
      const result = await setUnitAlertThresholds(unit.id, { amberMinutes: amber, redMinutes: red })
      if (!result.ok) {
        setError(result.error)
        return
      }
      onClose()
    })
  }

  return (
    <Modal size="sm">
      <h3 className="mb-1.5 font-[family-name:var(--font-panel-display)] text-xl font-bold">{p.ownAlertsModalTitle(unit.name)}</h3>
      <p className="mb-4 text-sm text-panel-ink-soft">{p.ownAlertsModalHint(businessAmber, businessRed)}</p>

      <label className="mb-1.5 block text-xs font-bold text-panel-ink-soft">{p.onlyForLabel(unit.name)}</label>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-700">{p.amberLabel}</span>
        <input
          type="number"
          min={1}
          max={60}
          value={amber}
          onChange={(e) => setAmber(Math.max(1, parseInt(e.target.value, 10) || 1))}
          className="w-16 rounded-lg border border-panel-line px-2 py-1.5 text-center text-sm font-bold outline-none focus:border-panel-brand focus:ring-4 focus:ring-panel-brand/10"
        />
        <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-black text-rose-700">{p.redLabel}</span>
        <input
          type="number"
          min={2}
          max={90}
          value={red}
          onChange={(e) => setRed(Math.max(1, parseInt(e.target.value, 10) || 1))}
          className="w-16 rounded-lg border border-panel-line px-2 py-1.5 text-center text-sm font-bold outline-none focus:border-panel-brand focus:ring-4 focus:ring-panel-brand/10"
        />
        <span className="text-xs text-panel-ink-soft">{p.minSuffix}</span>
      </div>

      {error && <p className="mb-3 text-xs text-rose-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} className="px-3 py-2">
          {c.cancel}
        </Button>
        <Button onClick={submit} disabled={pending}>
          {pending ? c.saving : p.saveOwnAlerts}
        </Button>
      </div>
    </Modal>
  )
}
