"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import type { OwnerUnitsData } from "@/lib/units/getOwnerUnits"
import { pauseUnit, reopenUnit, reactivateUnit, setUnitAlertThresholds } from "@/lib/units/actions"
import { parseWeeklyHours, summarizeHours, isOpenNow, formatClock } from "@/lib/units/hours"
import { useLang } from "@/lib/i18n/LangProvider"
import { EditTruckModal } from "./trucks/EditTruckModal"
import { HoursModal } from "./trucks/HoursModal"
import { OwnAlertsModal } from "./trucks/OwnAlertsModal"
import { ArchiveTruckModal } from "./trucks/ArchiveTruckModal"
import { Modal } from "./ui/Modal"
import { Button } from "./ui/Button"
import { labelClass, cardSelectClass } from "./ui/tokens"

export function TruckRow({
  unit,
  businessAmber,
  businessRed,
  timezone,
}: {
  unit: OwnerUnitsData["active"][number]
  businessAmber: number
  businessRed: number
  timezone: string
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
  const weeklyHours = parseWeeklyHours(unit.hours)
  const summary = summarizeHours(weeklyHours, lang)
  const openStatus = isOpenNow(weeklyHours, timezone)
  const showingClosed = isPaused || !openStatus.open

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
    <div
      className={`rounded-[20px] border bg-panel-surface p-4 shadow-[0_1px_2px_rgba(23,20,15,0.04)] transition-shadow hover:shadow-[0_8px_24px_-8px_rgba(23,20,15,0.10)] ${isPaused ? "border-amber-300 bg-amber-50/40" : "border-panel-line"}`}
    >
      <div className="flex items-start gap-3">
        <div className="h-16 w-16 flex-none overflow-hidden rounded-xl bg-panel-bg">
          {unit.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={unit.photo_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[10px] text-panel-ink/35">{c.noPhoto}</div>
          )}
        </div>

        <div className="flex-1">
          <div className="font-bold text-panel-ink">
            {unit.name}
            <span
              className={`ml-2 rounded-full px-2 py-0.5 text-xs font-semibold ${
                isPaused
                  ? "bg-amber-100 text-amber-700"
                  : showingClosed
                    ? "bg-panel-bg text-panel-ink-soft"
                    : "bg-emerald-100 text-emerald-700"
              }`}
            >
              {isPaused
                ? p.pausedBadge
                : showingClosed
                  ? openStatus.opensAt
                    ? p.opensAtBadge(formatClock(openStatus.opensAt))
                    : p.closedByHoursBadge
                  : p.openBadge}
            </span>
          </div>
          {unit.location && <div className="text-xs text-panel-ink-soft">{unit.location}</div>}
        </div>
      </div>

      {isPaused && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <div className="mb-0.5 font-bold">
            {unit.paused_until
              ? p.reopens(
                  new Date(unit.paused_until).toLocaleString(locale, {
                    timeZone: timezone,
                    weekday: "short",
                    hour: "numeric",
                    minute: "2-digit",
                  }),
                )
              : p.untilManualReopen}
          </div>
          {unit.pause_reason && <div>{p.pauseReasonLabel(unit.pause_reason)}</div>}
        </div>
      )}

      <div className="mt-3 border-t border-panel-line text-sm">
        <div className="flex flex-col gap-0.5 border-b border-panel-line py-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <span className="font-medium text-panel-ink-soft">{p.horarioLabel}</span>
          <span className="font-semibold text-panel-ink sm:text-right">
            {summary.hours ? summary.hours : (summary.days ?? p.closedAllWeek)}
            {summary.hours && summary.days && <span className="ml-1 font-normal text-panel-ink/40">· {summary.days}</span>}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
          <span className="font-medium text-panel-ink-soft">{p.kitchenAlertsLabel}</span>
          <span className="font-semibold text-panel-ink sm:text-right">
            {amber} / {red} {p.minSuffix}{" "}
            <span className="font-normal text-panel-ink/40">· {hasOwnAlerts ? p.ownAlertsTag : p.businessAlertsTag}</span>
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-panel-line pt-3">
        {isPaused ? (
          <button
            onClick={doReopen}
            disabled={pending}
            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
          >
            {p.reopenNow}
          </button>
        ) : (
          <button
            onClick={openPauseModal}
            disabled={pending}
            className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-800 transition-colors hover:bg-amber-100"
          >
            {p.pause}
          </button>
        )}
        <button
          onClick={() => setShowEdit(true)}
          className="rounded-lg border border-panel-line px-3 py-1.5 text-xs font-bold text-panel-ink transition-colors hover:border-panel-brand hover:text-panel-brand"
        >
          {p.editNamePhoto}
        </button>
        <button
          onClick={() => setShowHours(true)}
          className="rounded-lg border border-panel-line px-3 py-1.5 text-xs font-bold text-panel-ink transition-colors hover:border-panel-brand hover:text-panel-brand"
        >
          {p.changeHours}
        </button>
        {hasOwnAlerts ? (
          <button
            onClick={removeOwnAlerts}
            disabled={pending}
            className="rounded-lg border border-panel-line px-3 py-1.5 text-xs font-bold text-panel-ink transition-colors hover:border-panel-brand hover:text-panel-brand"
          >
            {p.removeOwnAlerts}
          </button>
        ) : (
          <button
            onClick={() => setShowOwnAlerts(true)}
            className="rounded-lg border border-panel-line px-3 py-1.5 text-xs font-bold text-panel-ink transition-colors hover:border-panel-brand hover:text-panel-brand"
          >
            {p.setOwnAlerts}
          </button>
        )}
        <Link
          href="/panel/qr"
          className="rounded-lg border border-panel-line px-3 py-1.5 text-xs font-bold text-panel-ink underline-offset-2 transition-colors hover:border-panel-brand hover:text-panel-brand hover:underline"
        >
          {p.viewQr}
        </Link>
        <button
          onClick={() => setShowArchive(true)}
          className="ml-auto text-xs font-semibold text-panel-ink/35 hover:text-rose-600"
        >
          {p.archiveTruck}
        </button>
      </div>

      {showPause && (
        <Modal size="md">
          <h3 className="mb-1.5 font-[family-name:var(--font-panel-display)] text-xl font-bold">{p.pauseModalTitle(unit.name)}</h3>
          <p className="mb-4 text-sm text-panel-ink-soft">{p.pauseModalExplain}</p>

          <div className="mb-4 rounded-xl bg-panel-dark p-4 text-white">
            <div className="mb-2 text-[11px] font-black uppercase tracking-wide text-white/45">{p.pausePreviewLabel}</div>
            <div className="text-lg font-bold">
              {pauseDuration.minutes === null
                ? p.pausePreviewClosedToday
                : p.pausePreviewReturnsAt(
                    (pausedUntilTime() as Date).toLocaleTimeString(locale, { timeZone: timezone, hour: "numeric", minute: "2-digit" }),
                  )}
            </div>
          </div>

          <label className={labelClass}>{p.pauseWhyLabel}</label>
          <div className="mb-4 grid grid-cols-2 gap-2">
            {PAUSE_REASONS.map((reason) => (
              <button
                key={reason}
                type="button"
                aria-pressed={pauseReason === reason}
                onClick={() => setPauseReason(reason)}
                className={`${cardSelectClass(pauseReason === reason)} text-xs font-bold text-panel-ink`}
              >
                {reason}
              </button>
            ))}
          </div>

          <label className={labelClass}>{p.pauseUntilLabel}</label>
          <div className="mb-5 grid grid-cols-2 gap-2">
            {PAUSE_DURATIONS.map((dur) => (
              <button
                key={dur.label}
                type="button"
                aria-pressed={pauseDuration.label === dur.label}
                onClick={() => setPauseDuration(dur)}
                className={`${cardSelectClass(pauseDuration.label === dur.label)} text-xs font-bold text-panel-ink`}
              >
                {dur.label}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowPause(false)} className="px-3 py-2">
              {c.cancel}
            </Button>
            <Button
              onClick={doPause}
              disabled={pending}
              className="bg-amber-600 shadow-[0_1px_2px_rgba(217,119,6,0.25)] hover:bg-amber-700"
            >
              {p.pauseConfirm}
            </Button>
          </div>
        </Modal>
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
    <div className="flex items-center justify-between rounded-xl border border-panel-line bg-panel-bg p-3">
      <div>
        <div className="text-sm font-semibold text-panel-ink-soft">{unit.name}</div>
        <div className="text-xs text-panel-ink/40">
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
        className="rounded-lg border border-panel-line px-3 py-1.5 text-xs font-bold text-panel-ink transition-colors hover:border-panel-brand hover:text-panel-brand"
      >
        {p.reactivate}
      </button>
    </div>
  )
}
