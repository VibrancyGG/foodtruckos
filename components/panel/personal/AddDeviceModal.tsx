"use client"

import { useEffect, useState, useTransition } from "react"
import { createDevice } from "@/lib/personal/actions"
import { useLang } from "@/lib/i18n/LangProvider"

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
      setError(t.panel.menuPage.formError)
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
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-5">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6" role="dialog" aria-modal="true">
          <h3 className="mb-1.5 text-xl font-black">{p.connectDeviceTitle}</h3>
          <p className="mb-4 text-sm text-neutral-500">{p.connectDeviceHint}</p>
          <div className="mb-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
            <div className="select-all font-mono text-3xl font-black tracking-[0.2em] text-neutral-900">
              {reveal.code.slice(0, 3)}-{reveal.code.slice(3)}
            </div>
            <div className="mt-2 text-xs font-bold uppercase tracking-wide text-neutral-400">{p.pairingCodeLabel}</div>
            <div className={`mt-2 text-xs font-bold ${expired ? "text-red-600" : "text-amber-600"}`}>
              {expired ? p.codeExpired : p.codeExpiresIn(mmss)}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-bold text-white"
            >
              {p.close}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-5" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-sm rounded-2xl bg-white p-6" role="dialog" aria-modal="true">
        <h3 className="mb-1.5 text-xl font-black">{p.connectDeviceTitle}</h3>
        <p className="mb-4 text-sm text-neutral-500">{p.devicesHint}</p>

        <label className="mb-1.5 block text-xs font-bold text-neutral-500">{p.deviceNamePlaceholder}</label>
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          autoFocus
          className="mb-4 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />

        <label className="mb-1.5 block text-xs font-bold text-neutral-500">{p.whichTruckDeviceLabel}</label>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {units.map((u) => (
            <button
              key={u.id}
              type="button"
              aria-pressed={unitId === u.id}
              onClick={() => setUnitId(u.id)}
              className={`rounded-lg border-2 p-2.5 text-left text-xs font-bold ${unitId === u.id ? "border-neutral-900" : "border-neutral-200"}`}
            >
              {u.name}
            </button>
          ))}
        </div>
        <p className="mb-4 text-[11px] leading-relaxed text-neutral-400">{p.deviceUnitHint}</p>

        {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-bold text-neutral-500">
            {c.cancel}
          </button>
          <button
            onClick={submit}
            disabled={pending || !label.trim() || !unitId}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {pending ? c.saving : p.generateCode}
          </button>
        </div>
      </div>
    </div>
  )
}
