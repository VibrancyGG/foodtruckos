"use client"

import { useState } from "react"
import type { OwnerUnitsData } from "@/lib/units/getOwnerUnits"
import { TruckRow, ArchivedTruckRow } from "./TruckRow"

export function TrucksScreen({ initial }: { initial: OwnerUnitsData }) {
  const [showArchived, setShowArchived] = useState(false)

  return (
    <div className="space-y-3">
      {initial.active.map((u) => (
        <TruckRow key={u.id} unit={u} />
      ))}

      <div className="rounded-2xl border border-dashed border-neutral-300 p-4 text-sm text-neutral-500">
        Alta de un truck nuevo: en esta fase la hacemos nosotros a mano, para confirmar
        ubicación y horarios contigo.{" "}
        <a
          href="mailto:jetgosolutions@gmail.com?subject=Nuevo%20truck"
          className="font-bold text-neutral-700 underline"
        >
          Escríbenos
        </a>
        .
      </div>

      {initial.archived.length > 0 && (
        <div>
          <button
            onClick={() => setShowArchived((s) => !s)}
            className="text-xs font-bold text-neutral-500 underline"
          >
            {showArchived ? "Ocultar" : "Ver"} archivados ({initial.archived.length})
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
