"use client"

import { useState, useTransition } from "react"
import { createStaff, type StaffRole } from "@/lib/personal/actions"
import { useLang } from "@/lib/i18n/LangProvider"

type Unit = { id: string; name: string }

export function AddStaffModal({ units, onClose }: { units: Unit[]; onClose: () => void }) {
  const { t } = useLang()
  const c = t.panel.common
  const p = t.panel.personalPage

  const [name, setName] = useState("")
  const [role, setRole] = useState<StaffRole>("cocina")
  const [unitId, setUnitId] = useState<string | null>(units[0]?.id ?? null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [reveal, setReveal] = useState<{ pin: string; name: string; truck: string } | null>(null)

  const roles: { id: StaffRole; label: string; hint: string }[] = [
    { id: "cocina", label: p.roleCocina, hint: p.roleCocinaHint },
    { id: "cajero", label: p.roleCajero, hint: p.roleCajeroHint },
    { id: "encargado", label: p.roleEncargado, hint: p.roleEncargadoHint },
  ]

  function selectRole(next: StaffRole) {
    setRole(next)
    // Encargado siempre ve todos los trucks — no es una opción, es lo que
    // define al rol. Cocina y ventanilla siempre son de un solo truck; si
    // venían de "encargado" (unitId null), se les asigna el primero para
    // que nunca quede un cajero "de todos los trucks" por accidente.
    if (next === "encargado") {
      setUnitId(null)
    } else if (unitId === null) {
      setUnitId(units[0]?.id ?? null)
    }
  }

  function submit() {
    setError(null)
    if (!name.trim()) {
      setError(p.nameMissingError)
      return
    }
    startTransition(async () => {
      const result = await createStaff({ name, role, unitId })
      if (!result.ok) {
        setError(result.error)
        return
      }
      const truckLabel = unitId ? (units.find((u) => u.id === unitId)?.name ?? "") : p.allTrucks
      setReveal({ pin: result.pin, name: name.trim(), truck: truckLabel })
    })
  }

  if (reveal) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-5">
        <div className="w-full max-w-sm rounded-2xl bg-white p-6" role="dialog" aria-modal="true">
          <h3 className="mb-1.5 text-xl font-black">{p.pinRevealTitle}</h3>
          <p className="mb-4 text-sm text-neutral-500">{p.pinRevealHint(reveal.name)}</p>
          <div className="mb-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
            <div className="select-all font-mono text-4xl font-black tracking-[0.3em] text-neutral-900">
              {reveal.pin}
            </div>
            <div className="mt-2 text-xs font-bold uppercase tracking-wide text-neutral-400">
              {p.pinRevealLabel(reveal.name, reveal.truck)}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-bold text-white"
            >
              {p.understood}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-5" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6" role="dialog" aria-modal="true">
        <h3 className="mb-1.5 text-xl font-black">{p.addPerson}</h3>
        <p className="mb-4 text-sm text-neutral-500">{p.addStaffHint}</p>

        <label className="mb-1.5 block text-xs font-bold text-neutral-500">{p.whoLabel}</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={p.namePlaceholder}
          autoFocus
          className="mb-4 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
        />

        <label className="mb-1.5 block text-xs font-bold text-neutral-500">{p.whatWillDoLabel}</label>
        <div className="mb-4 grid grid-cols-2 gap-2">
          {roles.map((r) => (
            <button
              key={r.id}
              type="button"
              aria-pressed={role === r.id}
              onClick={() => selectRole(r.id)}
              className={`rounded-lg border-2 p-2.5 text-left ${role === r.id ? "border-neutral-900" : "border-neutral-200"}`}
            >
              <div className="text-xs font-bold">{r.label}</div>
              <div className="text-[11px] text-neutral-500">{r.hint}</div>
            </button>
          ))}
        </div>

        {role === "encargado" ? (
          <div className="mb-4 rounded-lg bg-neutral-50 p-3 text-xs leading-relaxed text-neutral-600">{p.encargadoAllTrucksHint}</div>
        ) : (
          units.length > 1 && (
            <>
              <label className="mb-1.5 block text-xs font-bold text-neutral-500">{p.whichTruckLabel}</label>
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
            </>
          )
        )}

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
            {pending ? c.saving : p.createPin}
          </button>
        </div>
      </div>
    </div>
  )
}
