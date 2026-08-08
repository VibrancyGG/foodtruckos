"use client"

import { useState, useTransition } from "react"
import type { OwnerUnitsData } from "@/lib/units/getOwnerUnits"
import { updateTax } from "@/lib/units/actions"
import { useLang } from "@/lib/i18n/LangProvider"
import { TruckRow, ArchivedTruckRow } from "./TruckRow"

export function TrucksScreen({ initial, taxIncluded }: { initial: OwnerUnitsData; taxIncluded: boolean }) {
  const { t } = useLang()
  const p = t.panel.trucksPage
  const [showArchived, setShowArchived] = useState(false)
  const [tax, setTax] = useState(taxIncluded)
  const [pending, startTransition] = useTransition()

  function setTaxIncluded(v: boolean) {
    setTax(v)
    startTransition(async () => {
      await updateTax(v)
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

      <div className="rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
        {p.newTruckNote}{" "}
        <a
          href="mailto:jetgosolutions@gmail.com?subject=Nuevo%20truck"
          className="font-bold text-neutral-700 underline"
        >
          {p.contactUs}
        </a>
        .
      </div>

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
