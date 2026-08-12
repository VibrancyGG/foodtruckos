"use client"

import { useState, useTransition } from "react"
import { createStaff, type StaffRole } from "@/lib/personal/actions"
import { useLang } from "@/lib/i18n/LangProvider"
import { Modal } from "../ui/Modal"
import { Button } from "../ui/Button"
import { inputClass, labelClass, cardSelectClass } from "../ui/tokens"

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
      <Modal size="sm">
        <h3 className="mb-1.5 font-[family-name:var(--font-panel-display)] text-xl font-bold">{p.pinRevealTitle}</h3>
        <p className="mb-4 text-sm text-panel-ink-soft">{p.pinRevealHint(reveal.name)}</p>
        <div className="mb-4 rounded-xl border border-dashed border-panel-line bg-panel-bg p-6 text-center">
          <div className="select-all font-[family-name:var(--font-panel-display)] text-4xl font-bold tracking-[0.3em] text-panel-ink">
            {reveal.pin}
          </div>
          <div className="mt-2 text-xs font-bold uppercase tracking-wide text-panel-ink/40">
            {p.pinRevealLabel(reveal.name, reveal.truck)}
          </div>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>{p.understood}</Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal size="md" scroll>
      <h3 className="mb-1.5 font-[family-name:var(--font-panel-display)] text-xl font-bold">{p.addPerson}</h3>
      <p className="mb-4 text-sm text-panel-ink-soft">{p.addStaffHint}</p>

      <label className={labelClass}>{p.whoLabel}</label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={p.namePlaceholder}
        autoFocus
        className={`${inputClass} mb-4`}
      />

      <label className={labelClass}>{p.whatWillDoLabel}</label>
      <div className="mb-4 grid grid-cols-2 gap-2">
        {roles.map((r) => (
          <button
            key={r.id}
            type="button"
            aria-pressed={role === r.id}
            onClick={() => selectRole(r.id)}
            className={cardSelectClass(role === r.id)}
          >
            <div className="text-xs font-bold text-panel-ink">{r.label}</div>
            <div className="text-[11px] text-panel-ink-soft">{r.hint}</div>
          </button>
        ))}
      </div>

      {role === "encargado" ? (
        <div className="mb-4 rounded-lg bg-panel-bg p-3 text-xs leading-relaxed text-panel-ink-soft">{p.encargadoAllTrucksHint}</div>
      ) : (
        units.length > 1 && (
          <>
            <label className={labelClass}>{p.whichTruckLabel}</label>
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
          </>
        )
      )}

      {error && <p className="mb-3 text-xs text-rose-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} className="px-3 py-2">
          {c.cancel}
        </Button>
        <Button onClick={submit} disabled={pending}>
          {pending ? c.saving : p.createPin}
        </Button>
      </div>
    </Modal>
  )
}
