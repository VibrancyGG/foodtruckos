"use client"

import { useState, useTransition } from "react"
import type { OwnerStaffData } from "@/lib/personal/getOwnerStaff"
import { removeStaff, revokeDevice, resetStaffPin, setDevicePrinting, setDeviceTicketCopies } from "@/lib/personal/actions"
import { useLang } from "@/lib/i18n/LangProvider"
import { AddStaffModal } from "./personal/AddStaffModal"
import { AddDeviceModal } from "./personal/AddDeviceModal"
import { Modal } from "./ui/Modal"
import { Button } from "./ui/Button"

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
      <div data-tour="onboarding-personal-title" className="panel-animate-in">
        <h1 className="mb-1 font-[family-name:var(--font-panel-display)] text-2xl font-bold text-panel-ink">{p.title}</h1>
        <p className="mb-2 text-sm text-panel-ink-soft">{p.subtitle}</p>
      </div>
      <div className="panel-animate-in rounded-[20px] border border-emerald-200 bg-emerald-50 p-4" style={{ animationDelay: "40ms" }}>
        <div className="mb-1 text-sm font-black text-emerald-900">{p.selfServiceTitle}</div>
        <p className="text-sm leading-relaxed text-emerald-800">{p.selfServiceBody}</p>
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
    <section className="panel-animate-in" style={{ animationDelay: "80ms" }}>
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-panel-display)] text-lg font-bold text-panel-ink">{p.staffTitle}</h2>
        <button
          data-tour="onboarding-add-person"
          onClick={() => setShowAdd(true)}
          className="rounded-xl bg-panel-brand px-3.5 py-2 text-xs font-bold text-white shadow-[0_1px_2px_rgba(226,67,31,0.25)] transition-all duration-150 hover:bg-panel-brand-deep active:scale-[0.98]"
        >
          {p.addPerson}
        </button>
      </div>
      <p className="mb-3 text-sm text-panel-ink-soft">{p.staffHint}</p>

      <div className="overflow-hidden rounded-[20px] border border-panel-line bg-panel-surface shadow-[0_1px_2px_rgba(23,20,15,0.04)]">
        {staff.length === 0 && <p className="p-4 text-sm text-panel-ink-soft">{p.noStaffYet}</p>}
        {staff.map((s) => (
          <StaffRow key={s.id} staff={s} unitLabel={unitName(units, s.unit_id, p.allTrucks, p.truckArchivedSuffix)} />
        ))}
      </div>

      {removedStaff.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowRemoved((v) => !v)}
            className="text-xs font-bold text-panel-ink-soft underline decoration-panel-line hover:text-panel-ink"
          >
            {showRemoved ? p.hideRemoved(removedStaff.length) : p.showRemoved(removedStaff.length)}
          </button>
          {showRemoved && (
            <div className="mt-2 space-y-1">
              {removedStaff.map((s) => (
                <div key={s.id} className="rounded-lg bg-panel-bg px-3 py-2 text-xs text-panel-ink-soft">
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
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-panel-line p-3 first:border-t-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-bold text-panel-ink">
          {staff.name}
          <span className="rounded-full bg-panel-bg px-2 py-0.5 text-[11px] font-bold text-panel-ink-soft">
            {roleLabel(staff.role, p)}
          </span>
        </div>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-panel-ink-soft">
          <span>{unitLabel}</span>
          <span>·</span>
          <span className="text-panel-ink/40">{lastUsedText}</span>
          {stale && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-700">
              {p.stillHereBadge}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="font-[family-name:var(--font-panel-display)] text-lg font-bold tracking-[0.2em] text-panel-ink/25">{p.pinMaskedLabel}</span>

        {confirming === "reset" ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-panel-ink-soft">{p.confirmResetPin}</span>
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
              className="font-bold text-panel-brand"
            >
              {p.yesReset}
            </button>
            <button onClick={() => setConfirming(null)} className="text-panel-ink-soft">
              {c.cancel}
            </button>
          </div>
        ) : confirming === "remove" ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-panel-ink-soft">{p.confirmRemoveAccess}</span>
            <button
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await removeStaff(staff.id)
                  if (result.ok) setGone(true)
                })
              }
              className="font-bold text-rose-600"
            >
              {c.yesRemove}
            </button>
            <button onClick={() => setConfirming(null)} className="text-panel-ink-soft">
              {c.cancel}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 text-xs font-semibold">
            <button onClick={() => setConfirming("reset")} className="text-panel-ink-soft hover:text-panel-brand">
              {p.resetPin}
            </button>
            <button onClick={() => setConfirming("remove")} className="text-panel-ink/35 hover:text-rose-600">
              {c.remove}
            </button>
          </div>
        )}
      </div>

      {error && <p className="w-full text-xs text-rose-600">{error}</p>}

      {reveal && (
        <Modal size="sm">
          <h3 className="mb-1.5 font-[family-name:var(--font-panel-display)] text-xl font-bold">{p.pinResetTitle}</h3>
          <p className="mb-4 text-sm text-panel-ink-soft">{p.pinResetHint(staff.name)}</p>
          <div className="mb-4 rounded-xl border border-dashed border-panel-line bg-panel-bg p-6 text-center">
            <div className="select-all font-[family-name:var(--font-panel-display)] text-4xl font-bold tracking-[0.3em] text-panel-ink">{reveal}</div>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setReveal(null)}>{p.understood}</Button>
          </div>
        </Modal>
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
    <section className="panel-animate-in" style={{ animationDelay: "120ms" }}>
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-[family-name:var(--font-panel-display)] text-lg font-bold text-panel-ink">{p.devicesTitle}</h2>
        {assignableUnits.length > 0 && (
          <button
            data-tour="onboarding-add-device"
            onClick={() => setShowAdd(true)}
            className="rounded-xl bg-panel-brand px-3.5 py-2 text-xs font-bold text-white shadow-[0_1px_2px_rgba(226,67,31,0.25)] transition-all duration-150 hover:bg-panel-brand-deep active:scale-[0.98]"
          >
            {p.pairTablet}
          </button>
        )}
      </div>
      <p className="mb-3 text-sm text-panel-ink-soft">{p.devicesHint}</p>

      <div className="overflow-hidden rounded-[20px] border border-panel-line bg-panel-surface shadow-[0_1px_2px_rgba(23,20,15,0.04)]">
        {devices.length === 0 && <p className="p-4 text-sm text-panel-ink-soft">{p.noDevicesYet}</p>}
        {devices.map((d) => (
          <DeviceRow key={d.id} device={d} unitLabel={unitName(units, d.unit_id, p.allTrucks, p.truckArchivedSuffix)} />
        ))}
      </div>

      {revokedDevices.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setShowRevoked((v) => !v)}
            className="text-xs font-bold text-panel-ink-soft underline decoration-panel-line hover:text-panel-ink"
          >
            {showRevoked ? p.hideRevoked(revokedDevices.length) : p.showRevoked(revokedDevices.length)}
          </button>
          {showRevoked && (
            <div className="mt-2 space-y-1">
              {revokedDevices.map((d) => (
                <div key={d.id} className="rounded-lg bg-panel-bg px-3 py-2 text-xs text-panel-ink-soft">
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
  const printerOkLabel = device.printer_last_ok_at
    ? new Date(device.printer_last_ok_at).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
        day: "numeric",
        month: "short",
      })
    : ""
  const lastSeenText = !device.last_seen_at
    ? p.neverConnected
    : (() => {
        const n = daysAgo(device.last_seen_at)
        return n === 0 ? p.lastSeenToday : n === 1 ? p.lastSeenYesterday : p.lastSeenDaysAgo(n)
      })()

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-panel-line p-3 first:border-t-0">
      <div className="min-w-0">
        <div className="flex items-center gap-2 text-sm font-bold text-panel-ink">
          {device.label}
          <span className="rounded-full bg-panel-bg px-2 py-0.5 text-[11px] font-bold text-panel-ink-soft">
            {unitLabel}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
              paired ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {paired ? p.pairedBadge : p.waitingCodeBadge}
          </span>
        </div>
        <div className="mt-0.5 text-xs text-panel-ink-soft">
          {p.connectedSince(sinceLabel)} · <span className="text-panel-ink/40">{lastSeenText}</span>
        </div>
        {device.prints_tickets && (
          <div className="mt-1 text-xs font-semibold text-panel-ink-soft">
            {device.printer_label || p.printerUnnamed} ·{" "}
            <span className="text-panel-ink/40">
              {device.printer_last_ok_at ? p.printerLastOk(printerOkLabel) : p.printerNeverPrinted}
            </span>
          </div>
        )}
      </div>
      {confirming ? (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-panel-ink-soft">{p.confirmRevoke}</span>
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await revokeDevice(device.id)
                if (result.ok) setGone(true)
              })
            }
            className="font-bold text-rose-600"
          >
            {p.yesRevoke}
          </button>
          <button onClick={() => setConfirming(false)} className="text-panel-ink-soft">
            {t.panel.common.cancel}
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await setDevicePrinting(device.id, !device.prints_tickets)
              })
            }
            className={
              device.prints_tickets
                ? "rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700"
                : "rounded-full bg-panel-bg px-2.5 py-1 text-xs font-semibold text-panel-ink-soft"
            }
          >
            {device.prints_tickets ? p.printingOn : p.printingOff}
          </button>
          {device.prints_tickets && (
            <button
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await setDeviceTicketCopies(device.id, device.ticket_copies === 1 ? 2 : 1)
                })
              }
              className="rounded-full bg-panel-bg px-2.5 py-1 text-xs font-semibold text-panel-ink-soft"
            >
              {p.ticketCopies(device.ticket_copies)}
            </button>
          )}
          <button onClick={() => setConfirming(true)} className="text-xs font-semibold text-panel-ink/35 hover:text-rose-600">
            {p.revoke}
          </button>
        </div>
      )}
    </div>
  )
}
