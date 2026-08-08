"use client"

import { useState, useTransition } from "react"
import type { OwnerUnitsData } from "@/lib/units/getOwnerUnits"
import { updateTax } from "@/lib/units/actions"
import { requestNewTruck } from "@/lib/trucks/requests"
import { pricePerTruck } from "@/lib/billing/pricing"
import { useLang } from "@/lib/i18n/LangProvider"
import { TruckRow, ArchivedTruckRow } from "./TruckRow"

export function TrucksScreen({
  initial,
  taxIncluded,
  pendingRequestSince,
}: {
  initial: OwnerUnitsData
  taxIncluded: boolean
  pendingRequestSince: string | null
}) {
  const { lang, t } = useLang()
  const p = t.panel.trucksPage
  const locale = lang === "es" ? "es-MX" : "en-US"
  const [showArchived, setShowArchived] = useState(false)
  const [tax, setTax] = useState(taxIncluded)
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

  const nextTruckCount = initial.active.length + 1
  const nextPrice = pricePerTruck(nextTruckCount)

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
      <div>
        <h1 className="mb-1 text-2xl font-black">{p.title}</h1>
        <p className="mb-2 text-sm text-neutral-500">{p.subtitle}</p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-4">
        <h2 className="text-sm font-bold">{p.sharedSettingsTitle}</h2>
        <p className="mb-3 text-xs text-neutral-500">{p.sharedSettingsHint}</p>
        <div className="text-xs font-bold text-neutral-600">{p.taxTitle}</div>
        <p className="mb-2 text-xs text-neutral-400">{p.taxHint}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          <button
            onClick={() => setTaxIncluded(false)}
            disabled={pending}
            className={`rounded-xl border-2 p-3 text-left ${!tax ? "border-neutral-900" : "border-neutral-200"}`}
          >
            <div className="text-sm font-bold">{p.taxAdd}</div>
            <div className="text-xs text-neutral-500">{p.taxAddHint}</div>
          </button>
          <button
            onClick={() => setTaxIncluded(true)}
            disabled={pending}
            className={`rounded-xl border-2 p-3 text-left ${tax ? "border-neutral-900" : "border-neutral-200"}`}
          >
            <div className="text-sm font-bold">{p.taxIncluded}</div>
            <div className="text-xs text-neutral-500">{p.taxIncludedHint}</div>
          </button>
        </div>
      </div>

      {initial.active.map((u) => (
        <TruckRow key={u.id} unit={u} />
      ))}

      <div className="rounded-2xl border border-dashed border-neutral-300 p-4">
        {requestedAt ? (
          <p className="text-sm text-neutral-500">
            {p.requestPending(new Date(requestedAt).toLocaleDateString(locale))}
          </p>
        ) : (
          <>
            <p className="mb-2 text-sm text-neutral-500">{p.newTruckNote}</p>
            <button
              onClick={() => setShowRequest(true)}
              className="rounded-lg bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white"
            >
              {p.requestTruckButton}
            </button>
          </>
        )}
      </div>

      {showRequest && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-5"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowRequest(false)
          }}
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6" role="dialog" aria-modal="true">
            <h3 className="mb-1.5 text-xl font-black">{p.requestTruckTitle}</h3>
            <p className="mb-4 text-sm text-neutral-500">{p.requestTruckBody}</p>

            <div className="mb-4 rounded-xl bg-neutral-900 p-4 text-white">
              <div className="mb-1 text-[11px] font-black uppercase tracking-wide text-neutral-400">
                {p.requestTruckPriceLabel}
              </div>
              <div className="text-lg font-bold">{p.requestTruckPricePreview(nextTruckCount, nextPrice)}</div>
              <div className="mt-1 text-xs text-neutral-400">{p.requestTruckBillingNote}</div>
            </div>

            <label className="mb-1.5 block text-xs font-bold text-neutral-500">{p.requestTruckNoteLabel}</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={p.requestTruckNotePlaceholder}
              className="mb-4 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
              rows={2}
            />
            {requestError && <p className="mb-3 text-xs text-red-600">{requestError}</p>}

            <div className="flex justify-end gap-2">
              <button onClick={() => setShowRequest(false)} className="rounded-lg px-3 py-2 text-sm font-bold text-neutral-500">
                {p.requestTruckCancel}
              </button>
              <button
                onClick={submitRequest}
                disabled={requesting}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
              >
                {requesting ? t.panel.common.saving : p.requestTruckSubmit}
              </button>
            </div>
          </div>
        </div>
      )}

      {initial.archived.length > 0 && (
        <div>
          <button
            onClick={() => setShowArchived((s) => !s)}
            className="text-xs font-bold text-neutral-500 underline"
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
