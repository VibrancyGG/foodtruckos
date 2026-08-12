"use client"

import { useState, useTransition } from "react"
import type { OwnerUnitsData } from "@/lib/units/getOwnerUnits"
import { updateTax, updateSharedAlertThresholds } from "@/lib/units/actions"
import { requestNewTruck } from "@/lib/trucks/requests"
import { pricePerTruck, monthlyTotal } from "@/lib/billing/pricing"
import { useLang } from "@/lib/i18n/LangProvider"
import { TruckRow, ArchivedTruckRow } from "./TruckRow"
import { Modal } from "./ui/Modal"
import { Button } from "./ui/Button"
import { labelClass } from "./ui/tokens"

export function TrucksScreen({
  initial,
  pendingRequestSince,
}: {
  initial: OwnerUnitsData
  pendingRequestSince: string | null
}) {
  const { lang, t } = useLang()
  const p = t.panel.trucksPage
  const locale = lang === "es" ? "es-MX" : "en-US"
  const [showArchived, setShowArchived] = useState(false)
  const [tax, setTax] = useState(initial.taxIncluded)
  const [amber, setAmber] = useState(initial.defaultAlertAmberMinutes)
  const [red, setRed] = useState(initial.defaultAlertRedMinutes)
  const [pending, startTransition] = useTransition()
  const [showRequest, setShowRequest] = useState(false)
  const [note, setNote] = useState("")
  const [requestedAt, setRequestedAt] = useState(pendingRequestSince)
  const [requestError, setRequestError] = useState<string | null>(null)
  const [requesting, startRequesting] = useTransition()

  function setTaxIncluded(v: boolean) {
    setTax(v)
    startTransition(async () => {
      await updateTax(v)
    })
  }

  function saveThresholds(nextAmber: number, nextRed: number) {
    setAmber(nextAmber)
    setRed(nextRed)
    startTransition(async () => {
      await updateSharedAlertThresholds(nextAmber, nextRed)
    })
  }

  const nextTruckCount = initial.active.length + 1
  const nextPrice = pricePerTruck(nextTruckCount)
  const nextTotal = monthlyTotal(nextTruckCount)

  function submitRequest() {
    setRequestError(null)
    startRequesting(async () => {
      const result = await requestNewTruck(note)
      if (!result.ok) {
        setRequestError(result.error)
        return
      }
      setRequestedAt(new Date().toISOString())
      setShowRequest(false)
      setNote("")
    })
  }

  return (
    <div className="space-y-3">
      <div data-tour="onboarding-trucks-title" className="panel-animate-in">
        <h1 className="mb-1 font-[family-name:var(--font-panel-display)] text-2xl font-bold text-panel-ink">{p.title}</h1>
        <p className="mb-2 text-sm text-panel-ink-soft">{p.subtitle}</p>
      </div>

      <div
        data-tour="onboarding-trucks-settings"
        className="panel-animate-in rounded-[20px] border border-panel-line bg-panel-surface p-4 shadow-[0_1px_2px_rgba(23,20,15,0.04)]"
        style={{ animationDelay: "40ms" }}
      >
        <h2 className="text-sm font-bold text-panel-ink">{p.sharedSettingsTitle(initial.active.length)}</h2>
        <p className="mb-3 text-xs text-panel-ink-soft">{p.sharedSettingsHint}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <div className="mb-1.5 text-xs font-bold text-panel-ink-soft">{p.alertThresholdsLabel}</div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-700">{p.amberLabel}</span>
              <input
                type="number"
                min={1}
                max={60}
                value={amber}
                onChange={(e) => {
                  const v = Math.max(1, parseInt(e.target.value, 10) || 1)
                  saveThresholds(v, Math.max(red, v + 1))
                }}
                disabled={pending}
                className="w-16 rounded-lg border border-panel-line px-2 py-1.5 text-center text-sm font-bold outline-none focus:border-panel-brand focus:ring-4 focus:ring-panel-brand/10"
              />
              <span className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-black text-rose-700">{p.redLabel}</span>
              <input
                type="number"
                min={2}
                max={90}
                value={red}
                onChange={(e) => {
                  const v = Math.max(amber + 1, parseInt(e.target.value, 10) || amber + 1)
                  saveThresholds(amber, v)
                }}
                disabled={pending}
                className="w-16 rounded-lg border border-panel-line px-2 py-1.5 text-center text-sm font-bold outline-none focus:border-panel-brand focus:ring-4 focus:ring-panel-brand/10"
              />
              <span className="text-xs text-panel-ink-soft">{p.minSuffix}</span>
            </div>
            <div className="mt-2.5 rounded-lg bg-panel-bg p-2.5 text-xs leading-relaxed text-panel-ink-soft">
              {initial.avgPrepMinutes !== null
                ? p.alertTipWithData(initial.avgPrepMinutes, amber, red)
                : p.alertTipNoData(amber, red)}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-panel-ink-soft">{p.taxTitle}</div>
            <p className="mb-2 text-xs text-panel-ink/40">{p.taxHint}</p>
            <div className="grid gap-2">
              <button
                onClick={() => setTaxIncluded(false)}
                disabled={pending}
                className={`rounded-xl border-2 p-3 text-left transition-colors ${!tax ? "border-panel-brand bg-panel-brand-soft/50" : "border-panel-line hover:border-panel-ink/15"}`}
              >
                <div className="text-sm font-bold text-panel-ink">{p.taxAdd}</div>
                <div className="text-xs text-panel-ink-soft">{p.taxAddHint}</div>
              </button>
              <button
                onClick={() => setTaxIncluded(true)}
                disabled={pending}
                className={`rounded-xl border-2 p-3 text-left transition-colors ${tax ? "border-panel-brand bg-panel-brand-soft/50" : "border-panel-line hover:border-panel-ink/15"}`}
              >
                <div className="text-sm font-bold text-panel-ink">{p.taxIncluded}</div>
                <div className="text-xs text-panel-ink-soft">{p.taxIncludedHint}</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {initial.active.map((u, i) => (
        <div key={u.id} className="panel-animate-in" style={{ animationDelay: `${80 + i * 30}ms` }}>
          <TruckRow unit={u} businessAmber={amber} businessRed={red} timezone={initial.timezone} />
        </div>
      ))}

      <div className="panel-animate-in rounded-[20px] border border-dashed border-panel-line p-4">
        {requestedAt ? (
          <p className="text-sm text-panel-ink-soft">
            {p.requestPending(new Date(requestedAt).toLocaleDateString(locale))}
          </p>
        ) : (
          <>
            <p className="mb-2 text-sm text-panel-ink-soft">{p.newTruckNote}</p>
            <Button onClick={() => setShowRequest(true)} className="px-3 py-1.5 text-xs">
              {p.requestTruckButton}
            </Button>
          </>
        )}
      </div>

      {showRequest && (
        <Modal size="md">
          <h3 className="mb-1.5 font-[family-name:var(--font-panel-display)] text-xl font-bold">{p.requestTruckTitle}</h3>
          <p className="mb-4 text-sm text-panel-ink-soft">{p.requestTruckBody}</p>

          <div className="mb-4 rounded-xl bg-panel-dark p-4 text-white">
            <div className="mb-1 text-[11px] font-black uppercase tracking-wide text-white/45">
              {p.requestTruckPriceLabel}
            </div>
            <div className="text-lg font-bold">{p.requestTruckPricePreview(nextTruckCount, nextPrice)}</div>
            <div className="text-sm text-white/70">{p.requestTruckTotalPreview(nextTotal)}</div>
            <div className="mt-2 border-t border-white/15 pt-2 text-xs text-white/45">{p.requestTruckBillingNote}</div>
          </div>

          <label className={labelClass}>{p.requestTruckNoteLabel}</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={p.requestTruckNotePlaceholder}
            className="mb-4 w-full rounded-xl border border-panel-line bg-panel-bg/60 px-3.5 py-2.5 text-sm text-panel-ink outline-none transition-colors focus:border-panel-brand focus:bg-panel-surface focus:ring-4 focus:ring-panel-brand/10"
            rows={2}
          />
          {requestError && <p className="mb-3 text-xs text-rose-600">{requestError}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setShowRequest(false)} className="px-3 py-2">
              {p.requestTruckCancel}
            </Button>
            <Button onClick={submitRequest} disabled={requesting}>
              {requesting ? t.panel.common.saving : p.requestTruckSubmit}
            </Button>
          </div>
        </Modal>
      )}

      {initial.archived.length > 0 && (
        <div>
          <button
            onClick={() => setShowArchived((s) => !s)}
            className="text-xs font-bold text-panel-ink-soft underline decoration-panel-line hover:text-panel-ink"
          >
            {showArchived ? p.hideArchived : p.showArchived} ({initial.archived.length})
          </button>
          {showArchived && (
            <div className="mt-2 space-y-2">
              {initial.archived.map((u) => (
                <ArchivedTruckRow key={u.id} unit={u} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
