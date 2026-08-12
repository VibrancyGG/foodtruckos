"use client"

import { useState, useTransition } from "react"
import type { OwnerStaffData } from "@/lib/personal/getOwnerStaff"
import { removeStaff, revokeDevice, resetStaffPin } from "@/lib/personal/actions"
import { useLang } from "@/lib/i18n/LangProvider"
import { AddStaffModal } from "./personal/AddStaffModal"
import { AddDeviceModal } from "./personal/AddDeviceModal"

function unitName(units: OwnerStaffData["units"], unitId: string | null, allTrucks: string, archivedSuffix: string) {
  if (!unitId) return allTrucks
  const unit = units.find((u) => u.id === unitId)
  if (!unit) return "—"
  return unit.status === "archived" ? `${unit.name}${archivedSuffix}` : unit.name
}

function daysAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime()
  return Math.max(0, Math.floor(ms / (24 * 60 * 60 * 1000)))
}

export function PersonalScreen({ initial }: { initial: OwnerStaffData }) {
  const { t } = useLang()
  const p = t.panel.personalPage
  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-1 text-2xl font-black">{p.title}</h1>
        <p className="mb-2 text-sm text-neutral-500">{p.subtitle}</p>
      </div>
      <div className="rounded-2xl border border-green-200 bg-green-50 p-4">
        <div className="mb-1 text-sm font-black text-green-900">{p.selfServiceTitle}</div>
        <p className="text-sm leading-relaxed text-green-800">{p.selfServiceBody}</p>
      </div>
      <StaffSection units={initial.units} assignableUnits={initial.assignableUnits} staff={initial.staff} removedStaff={initial.removedStaff} />
      <DeviceSection units={initial.units} assignableUnits={initial.assignableUnits} devices={initial.devices} revokedDevices={initial.revokedDevices} />
    </div>
  )
}

function StaffSection({
  units,
  assignableUnits,
  staff,
  removedStaff,
}: {
  units: OwnerStaffData["units"]
  assignableUnits: OwnerStaffData["assignableUnits"]
  staff: OwnerStaffData["staff"]
  removedStaff: OwnerStaffData["removedStaff"]
}) {
  const { t } = useLang()
  const p = t.panel.personalPage
  const [showAdd, setShowAdd] = useState(false)
  const [showRemoved, setShowRemoved] = useState(false)

  return (
    <section>
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-lg font-bold">{p.staffTitle}</h2>
        <button
          data-tour="onboarding-add-person"
          onClick={() => setShowAdd(true)}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white"
        >
          {p.addPerson}
        </button>
      </div>
      <p className="mb-3 text-sm text-neutral-500">{p.staffHint}</p>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {staff.length === 0 && <p className="p-4 text-sm text-neutral-400">{p.noStaffYet}</p>}
        {staff.map((s) => (
          <StaffRow key={s.id} staff={s} unitLabel={unitName(units, s.unit_id, p.allTrucks, p.truckArchivedSuffix)} />
        ))}
      </div>

      {removedStaff.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowRemoved((v) => !v)}
            className="text-xs font-bold text-neutral-500 underline"
          >
            {showRemoved ? p.hideRemoved(removedStaff.length) : p.showRemoved(removedStaff.length)}
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

      {showAdd && <AddStaffModal units={assignableUnits} onClose={() => setShowAdd(false)} />}
    </section>
  )
}

function roleLabel(role: string, p: ReturnType<typeof useLang>["t"]["panel"]["personalPage"]) {
  if (role === "cajero") return p.roleCajero
  if (role === "encargado") return p.roleEncargado
  return p.roleCocina
}

function StaffRow({
  staff,
  unitLabel,
}: {
  staff: OwnerStaffData["staff"][number]
  unitLabel: string
}) {
  const { t } = useLang()
  const p = t.panel.personalPage
  const c = t.panel.common
  const [confirming, setConfirming] = useState<"remove" | "reset" | null>(null)
  const [gone, setGone] = useState(false)
  const [pending, startTransition] = useTransition()
  const [reveal, setReveal] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (gone) return null

  const lastUsedText = !staff.lastUsedAt
    ? p.neverUsedPin
    : (() => {
        const n = daysAgo(staff.lastUsedAt)
        return n === 0 ? p.usedToday : n === 1 ? p.usedYesterday : p.usedDaysAgo(n)
      })()
  const stale = !!staff.lastUsedAt && daysAgo(staff.lastUsedAt) >= 21

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 p-3 first:border-t-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-bold">
          {staff.name}
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-neutral-500">
            {roleLabel(staff.role, p)}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-neutral-500">
          <span>{unitLabel}</span>
          <span>·</span>
          <span className="text-neutral-400">{lastUsedText}</span>
          {stale && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
              {p.stillHereBadge}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-mono text-lg font-black tracking-[0.2em] text-neutral-300">{p.pinMaskedLabel}</span>

        {confirming === "reset" ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500">{p.confirmResetPin}</span>
            <button
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  setError(null)
                  const result = await resetStaffPin(staff.id)
                  if (!result.ok) {
                    setError(result.error)
                    setConfirming(null)
                    return
                  }
                  setReveal(result.pin)
                  setConfirming(null)
                })
              }
              className="font-bold text-neutral-900"
            >
              {p.yesReset}
            </button>
            <button onClick={() => setConfirming(null)} className="text-neutral-500">
              {c.cancel}
            </button>
          </div>
        ) : confirming === "remove" ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-neutral-500">{p.confirmRemoveAccess}</span>
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
              {c.yesRemove}
            </button>
            <button onClick={() => setConfirming(null)} className="text-neutral-500">
              {c.cancel}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-xs font-semibold">
            <button onClick={() => setConfirming("reset")} className="text-neutral-500 hover:text-neutral-900">
              {p.resetPin}
            </button>
            <button onClick={() => setConfirming("remove")} className="text-neutral-400 hover:text-red-600">
              {c.remove}
            </button>
          </div>
        )}
      </div>

      {error && <p className="w-full text-xs text-red-600">{error}</p>}

      {reveal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-5">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6" role="dialog" aria-modal="true">
            <h3 className="mb-1.5 text-xl font-black">{p.pinResetTitle}</h3>
            <p className="mb-4 text-sm text-neutral-500">{p.pinResetHint(staff.name)}</p>
            <div className="mb-4 rounded-xl border border-dashed border-neutral-300 bg-neutral-50 p-6 text-center">
              <div className="select-all font-mono text-4xl font-black tracking-[0.3em] text-neutral-900">{reveal}</div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setReveal(null)}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-bold text-white"
              >
                {p.understood}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DeviceSection({
  units,
  assignableUnits,
  devices,
  revokedDevices,
}: {
  units: OwnerStaffData["units"]
  assignableUnits: OwnerStaffData["assignableUnits"]
  devices: OwnerStaffData["devices"]
  revokedDevices: OwnerStaffData["revokedDevices"]
}) {
  const { t } = useLang()
  const p = t.panel.personalPage
  const [showAdd, setShowAdd] = useState(false)
  const [showRevoked, setShowRevoked] = useState(false)

  return (
    <section>
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-lg font-bold">{p.devicesTitle}</h2>
        {assignableUnits.length > 0 && (
          <button
            data-tour="onboarding-add-device"
            onClick={() => setShowAdd(true)}
            className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white"
          >
            {p.pairTablet}
          </button>
        )}
      </div>
      <p className="mb-3 text-sm text-neutral-500">{p.devicesHint}</p>

      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
        {devices.length === 0 && <p className="p-4 text-sm text-neutral-400">{p.noDevicesYet}</p>}
        {devices.map((d) => (
          <DeviceRow key={d.id} device={d} unitLabel={unitName(units, d.unit_id, p.allTrucks, p.truckArchivedSuffix)} />
        ))}
      </div>

      {revokedDevices.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowRevoked((v) => !v)}
            className="text-xs font-bold text-neutral-500 underline"
          >
            {showRevoked ? p.hideRevoked(revokedDevices.length) : p.showRevoked(revokedDevices.length)}
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

      {showAdd && <AddDeviceModal units={assignableUnits} onClose={() => setShowAdd(false)} />}
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
  const { lang, t } = useLang()
  const p = t.panel.personalPage
  const [confirming, setConfirming] = useState(false)
  const [gone, setGone] = useState(false)
  const [pending, startTransition] = useTransition()

  if (gone) return null

  const paired = !!device.paired_at
  const sinceDate = device.paired_at ?? device.created_at
  const sinceLabel = new Date(sinceDate).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
  const lastSeenText = !device.last_seen_at
    ? p.neverConnected
    : (() => {
        const n = daysAgo(device.last_seen_at)
        return n === 0 ? p.lastSeenToday : n === 1 ? p.lastSeenYesterday : p.lastSeenDaysAgo(n)
      })()

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-neutral-100 p-3 first:border-t-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-bold">
          {device.label}
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-bold text-neutral-500">
            {unitLabel}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              paired ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {paired ? p.pairedBadge : p.waitingCodeBadge}
          </span>
        </div>
        <div className="mt-0.5 text-xs text-neutral-500">
          {p.connectedSince(sinceLabel)} · <span className="text-neutral-400">{lastSeenText}</span>
        </div>
      </div>
      {confirming ? (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-500">{p.confirmRevoke}</span>
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
            {p.yesRevoke}
          </button>
          <button onClick={() => setConfirming(false)} className="text-neutral-500">
            {t.panel.common.cancel}
          </button>
        </div>
      ) : (
        <button onClick={() => setConfirming(true)} className="text-xs font-semibold text-neutral-400 hover:text-red-600">
          {p.revoke}
        </button>
      )}
    </div>
  )
}
