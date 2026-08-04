"use client"

import { useState, useTransition } from "react"
import type { OwnerUnitsData } from "@/lib/units/getOwnerUnits"
import {
  updateUnit,
  pauseUnit,
  reopenUnit,
  archiveUnit,
  reactivateUnit,
  uploadUnitPhoto,
} from "@/lib/units/actions"

const PAUSE_OPTIONS = [
  { label: "1 hora", hours: 1 },
  { label: "3 horas", hours: 3 },
  { label: "Hasta que reabra a mano", hours: null },
]

export function TruckRow({ unit }: { unit: OwnerUnitsData["active"][number] }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(unit.name)
  const [alertMinutes, setAlertMinutes] = useState(String(unit.kitchen_alert_minutes))
  const [photoUrl, setPhotoUrl] = useState(unit.photo_url)
  const [showPause, setShowPause] = useState(false)
  const [confirmArchive, setConfirmArchive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const isPaused = unit.status === "paused"

  function save() {
    setError(null)
    startTransition(async () => {
      const result = await updateUnit({
        unitId: unit.id,
        name,
        kitchenAlertMinutes: parseInt(alertMinutes, 10) || 20,
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setEditing(false)
    })
  }

  function doPause(hours: number | null) {
    const pausedUntil = hours ? new Date(Date.now() + hours * 60 * 60 * 1000).toISOString() : null
    startTransition(async () => {
      await pauseUnit({ unitId: unit.id, pausedUntil })
    })
    setShowPause(false)
  }

  function doReopen() {
    startTransition(async () => {
      await reopenUnit(unit.id)
    })
  }

  function doArchive() {
    startTransition(async () => {
      await archiveUnit(unit.id)
    })
  }

  function onPhotoPick(file: File) {
    setPhotoUrl(URL.createObjectURL(file))
    const formData = new FormData()
    formData.set("file", file)
    startTransition(async () => {
      const result = await uploadUnitPhoto(unit.id, formData)
      if (result.ok) setPhotoUrl(result.publicUrl)
    })
  }

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start gap-3">
        <label className="h-16 w-16 flex-none cursor-pointer overflow-hidden rounded-xl bg-neutral-100">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
              foto
            </div>
          )}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) onPhotoPick(file)
            }}
          />
        </label>

        <div className="flex-1">
          {editing ? (
            <div className="space-y-1.5">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 px-2 py-1 text-sm font-bold"
              />
              <label className="flex items-center gap-2 text-xs text-neutral-500">
                Avisar en cocina si no hay actividad por
                <input
                  value={alertMinutes}
                  onChange={(e) => setAlertMinutes(e.target.value)}
                  inputMode="numeric"
                  className="w-14 rounded border border-neutral-300 px-1.5 py-0.5"
                />
                min
              </label>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={save}
                  disabled={pending}
                  className="rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-bold text-white"
                >
                  Guardar
                </button>
                <button onClick={() => setEditing(false)} className="text-xs text-neutral-500">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="font-bold">{unit.name}</div>
              <div className="mt-0.5 flex items-center gap-2 text-xs">
                <span
                  className={`rounded-full px-2 py-0.5 font-semibold ${
                    isPaused ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                  }`}
                >
                  {isPaused ? "Pausado" : "Abierto"}
                </span>
                {isPaused && (
                  <span className="text-neutral-500">
                    {unit.paused_until
                      ? `Reabre ${new Date(unit.paused_until).toLocaleString("es-MX", { weekday: "short", hour: "numeric", minute: "2-digit" })}`
                      : "Hasta que reabras a mano"}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {!editing && (
          <button onClick={() => setEditing(true)} className="text-xs font-bold text-neutral-600">
            Editar
          </button>
        )}
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
        {isPaused ? (
          <button
            onClick={doReopen}
            disabled={pending}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white"
          >
            Reabrir ahora
          </button>
        ) : (
          <div className="relative">
            <button
              onClick={() => setShowPause((s) => !s)}
              disabled={pending}
              className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-bold"
            >
              Pausar
            </button>
            {showPause && (
              <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-lg border border-neutral-200 bg-white p-1 shadow-lg">
                {PAUSE_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => doPause(opt.hours)}
                    className="block w-full rounded-md px-2 py-1.5 text-left text-xs hover:bg-neutral-100"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="ml-auto">
          {confirmArchive ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500">Se archiva, no se borra. ¿Seguro?</span>
              <button onClick={doArchive} className="font-bold text-red-600">
                Sí, archivar
              </button>
              <button onClick={() => setConfirmArchive(false)} className="text-neutral-500">
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmArchive(true)}
              className="text-xs font-semibold text-neutral-400 hover:text-red-600"
            >
              Archivar truck
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function ArchivedTruckRow({ unit }: { unit: OwnerUnitsData["archived"][number] }) {
  const [pending, startTransition] = useTransition()
  const [gone, setGone] = useState(false)

  if (gone) return null

  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <div>
        <div className="text-sm font-semibold text-neutral-600">{unit.name}</div>
        <div className="text-xs text-neutral-400">
          Archivado {unit.archived_at ? new Date(unit.archived_at).toLocaleDateString("es-MX") : ""}
        </div>
      </div>
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const result = await reactivateUnit(unit.id)
            if (result.ok) setGone(true)
          })
        }
        className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-bold"
      >
        Reactivar
      </button>
    </div>
  )
}
