"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import type { OwnerUnitsData } from "@/lib/units/getOwnerUnits"
import { pauseUnit, reopenUnit, reactivateUnit, setUnitAlertThresholds } from "@/lib/units/actions"
import { parseWeeklyHours, summarizeHours } from "@/lib/units/hours"
import { useLang } from "@/lib/i18n/LangProvider"
import { EditTruckModal } from "./trucks/EditTruckModal"
import { HoursModal } from "./trucks/HoursModal"
import { OwnAlertsModal } from "./trucks/OwnAlertsModal"
import { ArchiveTruckModal } from "./trucks/ArchiveTruckModal"

export function TruckRow({
  unit,
  businessAmber,
  businessRed,
}: {
  unit: OwnerUnitsData["active"][number]
  businessAmber: number
  businessRed: number
}) {
  const { lang, t } = useLang()
  const p = t.panel.trucksPage
  const c = t.panel.common
  const locale = lang === "es" ? "es-MX" : "en-US"
  const PAUSE_REASONS = [p.pauseReason1, p.pauseReason2, p.pauseReason3, p.pauseReason4]
  const PAUSE_DURATIONS: { label: string; minutes: number | null }[] = [
    { label: p.pauseDur30, minutes: 30 },
    { label: p.pauseDur1h, minutes: 60 },
    { label: p.pauseDur2h, minutes: 120 },
    { label: p.pauseDurRestOfDay, minutes: null },
  ]

  const [showPause, setShowPause] = useState(false)
  const [pauseReason, setPauseReason] = useState(PAUSE_REASONS[0])
  const [pauseDuration, setPauseDuration] = useState(PAUSE_DURATIONS[0])
  const [showEdit, setShowEdit] = useState(false)
  const [showHours, setShowHours] = useState(false)
  const [showOwnAlerts, setShowOwnAlerts] = useState(false)
  const [showArchive, setShowArchive] = useState(false)
  const [archived, setArchived] = useState(false)
  const [pending, startTransition] = useTransition()

  const isPaused = unit.status === "paused"
  const hasOwnAlerts = unit.alert_amber_minutes !== null && unit.alert_red_minutes !== null
  const amber = unit.alert_amber_minutes ?? businessAmber
  const red = unit.alert_red_minutes ?? businessRed
  const summary = summarizeHours(parseWeeklyHours(unit.hours), lang)

  if (archived) return null

  function openPauseModal() {
    setPauseReason(PAUSE_REASONS[0])
    setPauseDuration(PAUSE_DURATIONS[0])
    setShowPause(true)
  }

  function pausedUntilTime() {
    if (pauseDuration.minutes === null) return null
    // eslint-disable-next-line react-hooks/purity -- se calcula al confirmar, no durante el render
    return new Date(Date.now() + pauseDuration.minutes * 60 * 1000)
  }

  function doPause() {
    const until = pausedUntilTime()
    startTransition(async () => {
      await pauseUnit({ unitId: unit.id, pausedUntil: until ? until.toISOString() : null, reason: pauseReason })
    })
    setShowPause(false)
  }

  function doReopen() {
    startTransition(async () => {
      await reopenUnit(unit.id)
    })
  }

  function removeOwnAlerts() {
    startTransition(async () => {
      await setUnitAlertThresholds(unit.id, null)
    })
  }

  return (
    <div className={`rounded-2xl border bg-white p-4 ${isPaused ? "border-amber-300 bg-amber-50/40" : "border-neutral-200"}`}>
      <div className="flex items-start gap-3">
        <div className="h-16 w-16 flex-none overflow-hidden rounded-xl bg-neutral-100">
          {unit.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={unit.photo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">{c.noPhoto}</div>
          )}
        </div>

        <div className="flex-1">
          <div className="font-bold">
            {unit.name}
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                isPaused ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
              }`}
            >
              {isPaused ? p.pausedBadge : p.openBadge}
            </span>
          </div>
          {unit.location && <div className="text-xs text-neutral-500">{unit.location}</div>}
        </div>
      </div>

      {isPaused && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <div className="mb-0.5 font-bold">
            {unit.paused_until
              ? p.reopens(new Date(unit.paused_until).toLocaleString(locale, { weekday: "short", hour: "numeric", minute: "2-digit" }))
              : p.untilManualReopen}
          </div>
          {unit.pause_reason && <div>{p.pauseReasonLabel(unit.pause_reason)}</div>}
        </div>
      )}

      <div className="mt-3 border-t border-neutral-100 text-sm">
        <div className="flex flex-col gap-0.5 border-b border-neutral-100 py-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <span className="font-medium text-neutral-500">{p.horarioLabel}</span>
          <span className="font-semibold sm:text-right">
            {summary.hours ? summary.hours : (summary.days ?? p.closedAllWeek)}
            {summary.hours && summary.days && <span className="ml-1 font-normal text-neutral-400">· {summary.days}</span>}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <span className="font-medium text-neutral-500">{p.kitchenAlertsLabel}</span>
          <span className="font-semibold sm:text-right">
            {amber} / {red} {p.minSuffix}{" "}
            <span className="font-normal text-neutral-400">· {hasOwnAlerts ? p.ownAlertsTag : p.businessAlertsTag}</span>
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3">
        {isPaused ? (
          <button
            onClick={doReopen}
            disabled={pending}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-bold text-white"
          >
            {p.reopenNow}
          </button>
        ) : (
          <button
            onClick={openPauseModal}
            disabled={pending}
            className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800"
          >
            {p.pause}
          </button>
        )}
        <button onClick={() => setShowEdit(true)} className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-bold">
          {p.editNamePhoto}
        </button>
        <button onClick={() => setShowHours(true)} className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-bold">
          {p.changeHours}
        </button>
        {hasOwnAlerts ? (
          <button onClick={removeOwnAlerts} disabled={pending} className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-bold">
            {p.removeOwnAlerts}
          </button>
        ) : (
          <button onClick={() => setShowOwnAlerts(true)} className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-bold">
            {p.setOwnAlerts}
          </button>
        )}
        <Link href="/panel/qr" className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-bold underline-offset-2 hover:underline">
          {p.viewQr}
        </Link>
        <button
          onClick={() => setShowArchive(true)}
          className="ml-auto text-xs font-semibold text-neutral-400 hover:text-red-600"
        >
          {p.archiveTruck}
        </button>
      </div>

      {showPause && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-5"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowPause(false)
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6" role="dialog" aria-modal="true">
            <h3 className="mb-1.5 text-xl font-black">{p.pauseModalTitle(unit.name)}</h3>
            <p className="mb-4 text-sm text-neutral-500">{p.pauseModalExplain}</p>

            <div className="mb-4 rounded-xl bg-neutral-900 p-4 text-white">
              <div className="mb-2 text-[11px] font-black uppercase tracking-wide text-neutral-400">{p.pausePreviewLabel}</div>
              <div className="text-lg font-bold">
                {pauseDuration.minutes === null
                  ? p.pausePreviewClosedToday
                  : p.pausePreviewReturnsAt(
                      (pausedUntilTime() as Date).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" }),
                    )}
              </div>
            </div>

            <label className="mb-1.5 block text-xs font-bold text-neutral-500">{p.pauseWhyLabel}</label>
            <div className="mb-4 grid grid-cols-2 gap-2">
              {PAUSE_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  aria-pressed={pauseReason === reason}
                  onClick={() => setPauseReason(reason)}
                  className={`rounded-lg border-2 p-2.5 text-left text-xs font-bold ${pauseReason === reason ? "border-neutral-900" : "border-neutral-200"}`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <label className="mb-1.5 block text-xs font-bold text-neutral-500">{p.pauseUntilLabel}</label>
            <div className="mb-5 grid grid-cols-2 gap-2">
              {PAUSE_DURATIONS.map((dur) => (
                <button
                  key={dur.label}
                  type="button"
                  aria-pressed={pauseDuration.label === dur.label}
                  onClick={() => setPauseDuration(dur)}
                  className={`rounded-lg border-2 p-2.5 text-left text-xs font-bold ${pauseDuration.label === dur.label ? "border-neutral-900" : "border-neutral-200"}`}
                >
                  {dur.label}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowPause(false)} className="rounded-lg px-3 py-2 text-sm font-bold text-neutral-500">
                {c.cancel}
              </button>
              <button
                onClick={doPause}
                disabled={pending}
                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {p.pauseConfirm}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEdit && <EditTruckModal unit={unit} onClose={() => setShowEdit(false)} />}
      {showHours && <HoursModal unit={unit} onClose={() => setShowHours(false)} />}
      {showOwnAlerts && (
        <OwnAlertsModal
          unit={unit}
          businessAmber={businessAmber}
          businessRed={businessRed}
          onClose={() => setShowOwnAlerts(false)}
        />
      )}
      {showArchive && (
        <ArchiveTruckModal unit={unit} onClose={() => setShowArchive(false)} onDone={() => setArchived(true)} />
      )}
    </div>
  )
}

export function ArchivedTruckRow({ unit }: { unit: OwnerUnitsData["archived"][number] }) {
  const { lang, t } = useLang()
  const p = t.panel.trucksPage
  const locale = lang === "es" ? "es-MX" : "en-US"
  const [pending, startTransition] = useTransition()
  const [gone, setGone] = useState(false)

  if (gone) return null

  return (
    <div className="flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <div>
        <div className="text-sm font-semibold text-neutral-600">{unit.name}</div>
        <div className="text-xs text-neutral-400">
          {p.archivedOn(unit.archived_at ? new Date(unit.archived_at).toLocaleDateString(locale) : "")}
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
        {p.reactivate}
      </button>
    </div>
  )
}
