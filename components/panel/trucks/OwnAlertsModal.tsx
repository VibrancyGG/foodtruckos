"use client"

import { useState, useTransition } from "react"
import { setUnitAlertThresholds } from "@/lib/units/actions"
import { useLang } from "@/lib/i18n/LangProvider"
import type { OwnerUnitsData } from "@/lib/units/getOwnerUnits"

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
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-5" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6" role="dialog" aria-modal="true">
        <h3 className="mb-1.5 text-xl font-black">{p.ownAlertsModalTitle(unit.name)}</h3>
        <p className="mb-4 text-sm text-neutral-500">{p.ownAlertsModalHint(businessAmber, businessRed)}</p>

        <label className="mb-1.5 block text-xs font-bold text-neutral-500">{p.onlyForLabel(unit.name)}</label>
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-700">{p.amberLabel}</span>
          <input
            type="number"
            min={1}
            max={60}
            value={amber}
            onChange={(e) => setAmber(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-16 rounded-lg border border-neutral-300 px-2 py-1.5 text-center text-sm font-bold"
          />
          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-black text-red-700">{p.redLabel}</span>
          <input
            type="number"
            min={2}
            max={90}
            value={red}
            onChange={(e) => setRed(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="w-16 rounded-lg border border-neutral-300 px-2 py-1.5 text-center text-sm font-bold"
          />
          <span className="text-xs text-neutral-500">{p.minSuffix}</span>
        </div>

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
            {pending ? c.saving : p.saveOwnAlerts}
          </button>
        </div>
      </div>
    </div>
  )
}
