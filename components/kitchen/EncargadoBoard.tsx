"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { KitchenBoard } from "./KitchenBoard"
import { TrucksOverviewBoard } from "./TrucksOverviewBoard"
import type { TrucksOverview } from "@/lib/kitchen/getTrucksOverview"
import type { KitchenData } from "@/lib/kitchen/getKitchenData"

// Único rol que ve las dos pantallas: el Encargado entra a la vista de todos
// los trucks y desde ahí puede meterse al tablero de cualquiera — cocina y
// ventanilla nunca ven esto, siempre caen directo a su propio tablero.
export function EncargadoBoard({
  overview,
  ownUnitId,
  businessId,
  ownUnitName,
  staffName,
  amberMinutes,
  redMinutes,
  taxIncluded,
  initial,
  logoUrl,
}: {
  overview: TrucksOverview
  ownUnitId: string
  businessId: string
  ownUnitName: string
  staffName: string
  amberMinutes: number
  redMinutes: number
  taxIncluded: boolean
  initial: KitchenData
  logoUrl?: string | null
}) {
  const router = useRouter()
  const [viewingUnitId, setViewingUnitId] = useState<string | null>(null)

  if (viewingUnitId === ownUnitId) {
    return (
      <KitchenBoard
        unitId={ownUnitId}
        businessId={businessId}
        unitName={ownUnitName}
        staffName={staffName}
        amberMinutes={amberMinutes}
        redMinutes={redMinutes}
        taxIncluded={taxIncluded}
        initial={initial}
        onBack={() => setViewingUnitId(null)}
        logoUrl={logoUrl}
      />
    )
  }

  return (
    <TrucksOverviewBoard
      overview={overview}
      staffName={staffName}
      ownUnitId={ownUnitId}
      allowViewAll
      onViewTruck={(unitId) => (unitId === ownUnitId ? setViewingUnitId(unitId) : router.push(`/cocina/truck/${unitId}`))}
      logoUrl={logoUrl}
    />
  )
}
