"use client"

import { useState, useTransition } from "react"
import type { OwnerUnitsData } from "@/lib/units/getOwnerUnits"
import {
  updateUnit,
  updateUnitHours,
  pauseUnit,
  reopenUnit,
  archiveUnit,
  reactivateUnit,
  uploadUnitPhoto,
} from "@/lib/units/actions"
import { DAYS, parseWeeklyHours, type WeeklyHours, type DayHours } from "@/lib/units/hours"
import { useLang } from "@/lib/i18n/LangProvider"

export function TruckRow({ unit }: { unit: OwnerUnitsData["active"][number] }) {
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

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(unit.name)
  const [location, setLocation] = useState(unit.location ?? "")
  const [alertMinutes, setAlertMinutes] = useState(String(unit.kitchen_alert_minutes))
  const [photoUrl, setPhotoUrl] = useState(unit.photo_url)
  const [showPause, setShowPause] = useState(false)
  const [pauseReason, setPauseReason] = useState(PAUSE_REASONS[0])
  const [pauseDuration, setPauseDuration] = useState(PAUSE_DURATIONS[0])
  const [confirmArchive, setConfirmArchive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [hours, setHours] = useState<WeeklyHours>(() => parseWeeklyHours(unit.hours))
  const [hoursSaved, setHoursSaved] = useState(false)

  const isPaused = unit.status === "paused"

  function save() {
    setError(null)
    startTransition(async () => {
      const result = await updateUnit({
        unitId: unit.id,
        name,
        location,
        kitchenAlertMinutes: parseInt(alertMinutes, 10) || 20,
      })
      if (!result.ok) {
        setError(result.error)
        return
      }
      setEditing(false)
    })
  }

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

  function setDayHours(key: (typeof DAYS)[number]["key"], value: DayHours) {
    setHours((h) => ({ ...h, [key]: value }))
    setHoursSaved(false)
  }

  function saveHours() {
    startTransition(async () => {
      const result = await updateUnitHours(unit.id, hours)
      if (result.ok) {
        setHoursSaved(true)
        setTimeout(() => setHoursSaved(false), 2000)
      }
    })
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
              {c.noPhoto}
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
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={p.locationPlaceholder}
                className="w-full rounded-lg border border-neutral-300 px-2 py-1 text-xs"
              />
              <label className="flex items-center gap-2 text-xs text-neutral-500">
                {p.alertLabel}
                <input
                  value={alertMinutes}
                  onChange={(e) => setAlertMinutes(e.target.value)}
                  inputMode="numeric"
                  className="w-14 rounded border border-neutral-300 px-1.5 py-0.5"
                />
                {p.minSuffix}
              </label>
              <div className="flex gap-2 pt-1">
                <button
                  onClick={save}
                  disabled={pending}
                  className="rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-bold text-white"
                >
                  {c.save}
                </button>
                <button onClick={() => setEditing(false)} className="text-xs text-neutral-500">
                  {c.cancel}
                </button>
              </div>

              <div className="mt-2 border-t border-neutral-100 pt-2">
                <div className="mb-1 text-xs font-bold text-neutral-600">
                  {p.publishedHours}
                  <span className="ml-1 font-normal text-neutral-400">{p.publishedHoursHint}</span>
                </div>
                <div className="space-y-1">
                  {DAYS.map((d) => {
                    const dh = hours[d.key] ?? null
                    const closed = dh === null
                    return (
                      <div key={d.key} className="flex items-center gap-2 text-xs">
                        <span className="w-8 text-neutral-500">{lang === "es" ? d.label : d.labelEn}</span>
                        <label className="flex items-center gap-1 text-neutral-500">
                          <input
                            type="checkbox"
                            checked={!closed}
                            onChange={(e) =>
                              setDayHours(d.key, e.target.checked ? { open: "11:00", close: "20:00" } : null)
                            }
                          />
                          {p.openLabel}
                        </label>
                        {!closed && (
                          <>
                            <input
                              type="time"
                              value={dh.open}
                              onChange={(e) => setDayHours(d.key, { ...dh, open: e.target.value })}
                              className="rounded border border-neutral-300 px-1 py-0.5"
                            />
                            <span className="text-neutral-400">{p.toLabel}</span>
                            <input
                              type="time"
                              value={dh.close}
                              onChange={(e) => setDayHours(d.key, { ...dh, close: e.target.value })}
                              className="rounded border border-neutral-300 px-1 py-0.5"
                            />
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
                <button
                  onClick={saveHours}
                  disabled={pending}
                  className="mt-2 rounded-lg border border-neutral-300 px-2.5 py-1 text-xs font-bold"
                >
                  {hoursSaved ? p.hoursSaved : p.saveHours}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="font-bold">{unit.name}</div>
              {unit.location && <div className="text-xs text-neutral-500">{unit.location}</div>}
              <div className="mt-0.5 flex items-center gap-2 text-xs">
                <span
                  className={`rounded-full px-2 py-0.5 font-semibold ${
                    isPaused ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                  }`}
                >
                  {isPaused ? p.pausedBadge : p.openBadge}
                </span>
                {isPaused && (
                  <span className="text-neutral-500">
                    {unit.paused_until
                      ? p.reopens(new Date(unit.paused_until).toLocaleString(locale, { weekday: "short", hour: "numeric", minute: "2-digit" }))
                      : p.untilManualReopen}
                    {unit.pause_reason ? ` · ${p.pauseReasonLabel(unit.pause_reason)}` : ""}
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {!editing && (
          <button onClick={() => setEditing(true)} className="text-xs font-bold text-neutral-600">
            {c.edit}
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
            {p.reopenNow}
          </button>
        ) : (
          <button
            onClick={openPauseModal}
            disabled={pending}
            className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-bold"
          >
            {p.pause}
          </button>
        )}

        <div className="ml-auto">
          {confirmArchive ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500">{p.confirmArchiveText}</span>
              <button onClick={doArchive} className="font-bold text-red-600">
                {p.yesArchive}
              </button>
              <button onClick={() => setConfirmArchive(false)} className="text-neutral-500">
                {c.cancel}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmArchive(true)}
              className="text-xs font-semibold text-neutral-400 hover:text-red-600"
            >
              {p.archiveTruck}
            </button>
          )}
        </div>
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
