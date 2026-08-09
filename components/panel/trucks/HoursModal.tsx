"use client"

import { useState, useTransition } from "react"
import { updateUnitHours } from "@/lib/units/actions"
import { DAYS, parseWeeklyHours, summarizeHours, type WeeklyHours, type DayHours } from "@/lib/units/hours"
import { useLang } from "@/lib/i18n/LangProvider"
import type { OwnerUnitsData } from "@/lib/units/getOwnerUnits"

export function HoursModal({ unit, onClose }: { unit: OwnerUnitsData["active"][number]; onClose: () => void }) {
  const { lang, t } = useLang()
  const p = t.panel.trucksPage
  const c = t.panel.common
  const [hours, setHours] = useState<WeeklyHours>(() => parseWeeklyHours(unit.hours))
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function setDay(key: (typeof DAYS)[number]["key"], value: DayHours) {
    setError(null)
    setHours((h) => ({ ...h, [key]: value }))
  }

  function applyToAll() {
    const base = DAYS.map((d) => hours[d.key]).find((v) => v)
    if (!base) {
      setError(p.applyToAllNeedsOne)
      return
    }
    setError(null)
    setHours((h) => {
      const next: WeeklyHours = { ...h }
      for (const d of DAYS) {
        if (next[d.key]) next[d.key] = { ...base }
      }
      return next
    })
  }

  function submit() {
    const bad = DAYS.some((d) => {
      const dh = hours[d.key]
      return dh && dh.open >= dh.close
    })
    if (bad) {
      setError(p.invalidHoursRange)
      return
    }
    startTransition(async () => {
      const result = await updateUnitHours(unit.id, hours)
      if (result.ok) onClose()
    })
  }

  const summary = summarizeHours(hours, lang)

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-5" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6" role="dialog" aria-modal="true">
        <h3 className="mb-1.5 text-xl font-black">{p.hoursModalTitle(unit.name)}</h3>
        <p className="mb-4 text-sm text-neutral-500">{p.hoursModalHint}</p>

        <div className="mb-3 overflow-hidden rounded-xl border border-neutral-200">
          {DAYS.map((d) => {
            const dh = hours[d.key] ?? null
            const closed = dh === null
            return (
              <div
                key={d.key}
                className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-neutral-100 px-3 py-2.5 last:border-b-0 ${closed ? "bg-neutral-50" : ""}`}
              >
                <button
                  type="button"
                  role="switch"
                  aria-checked={!closed}
                  onClick={() => setDay(d.key, closed ? { open: "11:00", close: "20:00" } : null)}
                  className={`inline-flex h-6 w-11 flex-none shrink-0 items-center rounded-full p-0.5 transition-colors ${closed ? "justify-start bg-neutral-300" : "justify-end bg-green-600"}`}
                >
                  <span className="h-5 w-5 flex-none rounded-full bg-white" />
                </button>
                <span className={`w-9 text-sm font-bold ${closed ? "text-neutral-400" : ""}`}>
                  {lang === "es" ? d.label : d.labelEn}
                </span>
                {closed ? (
                  <span className="text-xs font-semibold text-neutral-400">{p.closedDay}</span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs">
                    <input
                      type="time"
                      value={dh.open}
                      onChange={(e) => setDay(d.key, { ...dh, open: e.target.value })}
                      className="rounded-lg border border-neutral-300 px-1.5 py-1 text-xs font-bold"
                    />
                    <span className="text-neutral-400">–</span>
                    <input
                      type="time"
                      value={dh.close}
                      onChange={(e) => setDay(d.key, { ...dh, close: e.target.value })}
                      className="rounded-lg border border-neutral-300 px-1.5 py-1 text-xs font-bold"
                    />
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <button onClick={applyToAll} className="mb-3 text-xs font-bold text-neutral-600 underline">
          {p.applyToAllDays}
        </button>

        <div className="mb-4 rounded-lg bg-neutral-50 p-2.5 text-xs text-neutral-600">
          {p.wouldBeLabel}{" "}
          <b className="text-neutral-900">
            {summary.hours ? `${summary.hours}${summary.days ? ` · ${summary.days}` : ""}` : summary.days ?? p.closedAllWeek}
          </b>
        </div>

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
            {pending ? c.saving : p.saveSchedule}
          </button>
        </div>
      </div>
    </div>
  )
}
