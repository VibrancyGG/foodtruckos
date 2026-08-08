"use client"

import { useState } from "react"
import type { OwnerUnitsData } from "@/lib/units/getOwnerUnits"
import { useLang } from "@/lib/i18n/LangProvider"
import { TruckRow, ArchivedTruckRow } from "./TruckRow"

export function TrucksScreen({ initial }: { initial: OwnerUnitsData }) {
  const { t } = useLang()
  const p = t.panel.trucksPage
  const [showArchived, setShowArchived] = useState(false)

  return (
    <div className="space-y-3">
      <div>
        <h1 className="mb-1 text-2xl font-black">{p.title}</h1>
        <p className="mb-2 text-sm text-neutral-500">{p.subtitle}</p>
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
