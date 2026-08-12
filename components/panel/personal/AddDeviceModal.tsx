"use client"

import { useEffect, useState, useTransition } from "react"
import { createDevice } from "@/lib/personal/actions"
import { useLang } from "@/lib/i18n/LangProvider"
import { Modal } from "../ui/Modal"
import { Button } from "../ui/Button"
import { inputClass, labelClass, cardSelectClass } from "../ui/tokens"

type Unit = { id: string; name: string }

export function AddDeviceModal({ units, onClose }: { units: Unit[]; onClose: () => void }) {
  const { t } = useLang()
  const c = t.panel.common
  const p = t.panel.personalPage

  const [label, setLabel] = useState("")
  const [unitId, setUnitId] = useState(units[0]?.id ?? "")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [reveal, setReveal] = useState<{ code: string; expiresAt: number } | null>(null)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!reveal) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [reveal])

  function submit() {
    setError(null)
    if (!label.trim() || !unitId) {
      setError(p.deviceNameMissingError)
      return
    }
    startTransition(async () => {
      const result = await createDevice({ label, unitId })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setReveal({ code: result.pairingCode, expiresAt: new Date(result.expiresAt).getTime() })
    })
  }

  if (reveal) {
    const remainingMs = reveal.expiresAt - now
    const expired = remainingMs <= 0
    const mm = Math.max(0, Math.floor(remainingMs / 60000))
    const ss = Math.max(0, Math.floor((remainingMs % 60000) / 1000))
    const mmss = `${mm}:${String(ss).padStart(2, "0")}`

    return (
      <Modal size="sm">
        <h3 className="mb-1.5 font-[family-name:var(--font-panel-display)] text-xl font-bold">{p.connectDeviceTitle}</h3>
        <p className="mb-4 text-sm text-panel-ink-soft">{p.connectDeviceHint}</p>
        <div className="mb-4 rounded-xl border border-dashed border-panel-line bg-panel-bg p-6 text-center">
          <div className="select-all font-[family-name:var(--font-panel-display)] text-3xl font-bold tracking-[0.2em] text-panel-ink">
            {reveal.code.slice(0, 3)}-{reveal.code.slice(3)}
          </div>
          <div className="mt-2 text-xs font-bold uppercase tracking-wide text-panel-ink/40">{p.pairingCodeLabel}</div>
          <div className={`mt-2 text-xs font-bold ${expired ? "text-rose-600" : "text-amber-600"}`}>
            {expired ? p.codeExpired : p.codeExpiresIn(mmss)}
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>{p.close}</Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal size="sm">
      <h3 className="mb-1.5 font-[family-name:var(--font-panel-display)] text-xl font-bold">{p.connectDeviceTitle}</h3>
      <p className="mb-4 text-sm text-panel-ink-soft">{p.devicesHint}</p>

      <label className={labelClass}>{p.deviceNamePlaceholder}</label>
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        autoFocus
        className={`${inputClass} mb-4`}
      />

      <label className={labelClass}>{p.whichTruckDeviceLabel}</label>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {units.map((u) => (
          <button
            key={u.id}
            type="button"
            aria-pressed={unitId === u.id}
            onClick={() => setUnitId(u.id)}
            className={`${cardSelectClass(unitId === u.id)} text-xs font-bold text-panel-ink`}
          >
            {u.name}
          </button>
        ))}
      </div>
      <p className="mb-4 text-[11px] leading-relaxed text-panel-ink/40">{p.deviceUnitHint}</p>

      {error && <p className="mb-3 text-xs text-rose-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} className="px-3 py-2">
          {c.cancel}
        </Button>
        <Button onClick={submit} disabled={pending || !label.trim() || !unitId}>
          {pending ? c.saving : p.generateCode}
        </Button>
      </div>
    </Modal>
  )
}
