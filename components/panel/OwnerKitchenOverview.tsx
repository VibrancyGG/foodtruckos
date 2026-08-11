"use client"

import { useRouter } from "next/navigation"
import { TrucksOverviewBoard } from "@/components/kitchen/TrucksOverviewBoard"
import type { TrucksOverview } from "@/lib/kitchen/getTrucksOverview"

// Mismo tablero que usa el Encargado — el dueño entra desde su panel (no
// desde un dispositivo emparejado) y ve solo, nunca opera desde aquí: cada
// tarjeta lleva a la vista de solo lectura de ese truck.
export function OwnerKitchenOverview({
  overview,
  businessName,
  logoUrl,
}: {
  overview: TrucksOverview
  businessName: string
  logoUrl?: string | null
}) {
  const router = useRouter()
  return (
    <TrucksOverviewBoard
      overview={overview}
      staffName={businessName}
      ownUnitId=""
      allowViewAll
      logoUrl={logoUrl}
      onViewTruck={(unitId) => router.push(`/panel/cocina/${unitId}`)}
    />
  )
}
