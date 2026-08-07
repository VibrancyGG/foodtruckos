"use client"

import { useState, useTransition } from "react"
import type { OwnerStaffData } from "@/lib/personal/getOwnerStaff"
import { createStaff, removeStaff, createDevice, revokeDevice } from "@/lib/personal/actions"

function unitName(units: OwnerStaffData["units"], unitId: string | null) {
  if (!unitId) return "Todos los trucks"
  return units.find((u) => u.id === unitId)?.name ?? "—"
}

export function PersonalScreen({ initial }: { initial: OwnerStaffData }) {
  return (
    <div className="space-y-8">
      <StaffSection units={initial.units} staff={initial.staff} removedStaff={initial.removedStaff} />
      <DeviceSection units={initial.units} devices={initial.devices} revokedDevices={initial.revokedDevices} />
    </div>
  )
}

function StaffSection({
  units,
  staff,
  removedStaff,
}: {
  units: OwnerStaffData["units"]
  staff: OwnerStaffData["staff"]
  removedStaff: OwnerStaffData["removedStaff"]
}) {
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState("")
  const [pin, setPin] = useState("")
  const [unitId, setUnitId] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [showRemoved, setShowRemoved] = useState(false)

  function submit() {
    setError(null)
    startTransition(async () => {
      const result = await createStaff({ name, pin, unitId: unitId || null })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setName("")
      setPin("")
      setUnitId("")
      setShowForm(false)
    })
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-bold">Personal</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white"
          >
            + Agregar persona
          </button>
        )}
      </div>
      <p className="mb-3 text-sm text-neutral-500">
        Cada persona entra a cocina con su PIN de 4 dígitos. Quitarla corta su acceso al instante.
      </p>

      {showForm && (
        <div className="mb-3 space-y-2 rounded-2xl border border-neutral-200 bg-white p-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <input
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            placeholder="PIN de 4 dígitos"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <select
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="">Todos los trucks</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={submit}
              disabled={pending || !name.trim() || pin.length !== 4}
              className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
            >
              Crear
            </button>
            <button onClick={() => setShowForm(false)} className="text-xs text-neutral-500">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {staff.length === 0 && !showForm && (
          <p className="text-sm text-neutral-400">Todavía no hay personal.</p>
        )}
        {staff.map((s) => (
          <StaffRow key={s.id} staff={s} unitLabel={unitName(units, s.unit_id)} />
        ))}
      </div>

      {removedStaff.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowRemoved((v) => !v)}
            className="text-xs font-bold text-neutral-500 underline"
          >
            {showRemoved ? "Ocultar" : "Ver"} personal dado de baja ({removedStaff.length})
          </button>
          {showRemoved && (
            <div className="mt-2 space-y-1">
              {removedStaff.map((s) => (
                <div key={s.id} className="rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
                  {s.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function StaffRow({
  staff,
  unitLabel,
}: {
  staff: OwnerStaffData["staff"][number]
  unitLabel: string
}) {
  const [confirming, setConfirming] = useState(false)
  const [gone, setGone] = useState(false)
  const [pending, startTransition] = useTransition()

  if (gone) return null

  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3">
      <div>
        <div className="text-sm font-bold">{staff.name}</div>
        <div className="text-xs text-neutral-500">{unitLabel}</div>
      </div>
      {confirming ? (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-500">¿Quitar acceso?</span>
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await removeStaff(staff.id)
                if (result.ok) setGone(true)
              })
            }
            className="font-bold text-red-600"
          >
            Sí, quitar
          </button>
          <button onClick={() => setConfirming(false)} className="text-neutral-500">
            Cancelar
          </button>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} className="text-xs font-semibold text-neutral-400 hover:text-red-600">
          Quitar
        </button>
      )}
    </div>
  )
}

function DeviceSection({
  units,
  devices,
  revokedDevices,
}: {
  units: OwnerStaffData["units"]
  devices: OwnerStaffData["devices"]
  revokedDevices: OwnerStaffData["revokedDevices"]
}) {
  const [showForm, setShowForm] = useState(false)
  const [label, setLabel] = useState("")
  const [unitId, setUnitId] = useState(units[0]?.id ?? "")
  const [error, setError] = useState<string | null>(null)
  const [newCode, setNewCode] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [showRevoked, setShowRevoked] = useState(false)

  function submit() {
    setError(null)
    startTransition(async () => {
      const result = await createDevice({ label, unitId })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setNewCode(result.pairingCode)
      setLabel("")
      setShowForm(false)
    })
  }

  return (
    <section>
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-bold">Dispositivos</h2>
        {!showForm && units.length > 0 && (
          <button
            onClick={() => setShowForm(true)}
            className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white"
          >
            + Emparejar tablet
          </button>
        )}
      </div>
      <p className="mb-3 text-sm text-neutral-500">
        Cada tablet o celular de cocina se conecta una sola vez con un código. Revocarlo la
        desconecta al instante.
      </p>

      {newCode && (
        <div className="mb-3 rounded-2xl border border-green-200 bg-green-50 p-4">
          <p className="mb-1 text-xs font-bold text-green-800">
            Código de emparejamiento — captúralo ahora, no se vuelve a mostrar
          </p>
          <p className="mb-2 select-all font-mono text-2xl font-black tracking-widest text-green-900">
            {newCode}
          </p>
          <p className="mb-2 text-xs text-green-800">
            En la tablet, abre /cocina y escribe este código.
          </p>
          <button onClick={() => setNewCode(null)} className="text-xs font-bold text-green-800 underline">
            Listo
          </button>
        </div>
      )}

      {showForm && (
        <div className="mb-3 space-y-2 rounded-2xl border border-neutral-200 bg-white p-4">
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Nombre del dispositivo (ej. Tablet cocina)"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
          <select
            value={unitId}
            onChange={(e) => setUnitId(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          >
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={submit}
              disabled={pending || !label.trim() || !unitId}
              className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white disabled:opacity-50"
            >
              Generar código
            </button>
            <button onClick={() => setShowForm(false)} className="text-xs text-neutral-500">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {devices.length === 0 && !showForm && (
          <p className="text-sm text-neutral-400">Todavía no hay dispositivos.</p>
        )}
        {devices.map((d) => (
          <DeviceRow key={d.id} device={d} unitLabel={unitName(units, d.unit_id)} />
        ))}
      </div>

      {revokedDevices.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowRevoked((v) => !v)}
            className="text-xs font-bold text-neutral-500 underline"
          >
            {showRevoked ? "Ocultar" : "Ver"} revocados ({revokedDevices.length})
          </button>
          {showRevoked && (
            <div className="mt-2 space-y-1">
              {revokedDevices.map((d) => (
                <div key={d.id} className="rounded-lg bg-neutral-50 px-3 py-2 text-xs text-neutral-500">
                  {d.label}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function DeviceRow({
  device,
  unitLabel,
}: {
  device: OwnerStaffData["devices"][number]
  unitLabel: string
}) {
  const [confirming, setConfirming] = useState(false)
  const [gone, setGone] = useState(false)
  const [pending, startTransition] = useTransition()

  if (gone) return null

  const paired = !!device.paired_at

  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-white p-3">
      <div>
        <div className="text-sm font-bold">{device.label}</div>
        <div className="mt-0.5 flex items-center gap-2 text-xs">
          <span className="text-neutral-500">{unitLabel}</span>
          <span
            className={`rounded-full px-2 py-0.5 font-semibold ${
              paired ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {paired ? "Emparejado" : "Esperando código"}
          </span>
        </div>
      </div>
      {confirming ? (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-500">¿Revocar?</span>
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await revokeDevice(device.id)
                if (result.ok) setGone(true)
              })
            }
            className="font-bold text-red-600"
          >
            Sí, revocar
          </button>
          <button onClick={() => setConfirming(false)} className="text-neutral-500">
            Cancelar
          </button>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} className="text-xs font-semibold text-neutral-400 hover:text-red-600">
          Revocar
        </button>
      )}
    </div>
  )
}
