import { notFound } from "next/navigation"
import { resolveUnitByToken } from "@/lib/kitchen/resolveUnit"
import { getKitchenData } from "@/lib/kitchen/getKitchenData"
import { LangProvider } from "@/lib/i18n/LangProvider"
import { KitchenBoard } from "@/components/kitchen/KitchenBoard"

export default async function KitchenPage({
  params,
}: {
  params: Promise<{ unitToken: string }>
}) {
  const { unitToken } = await params
  const unit = await resolveUnitByToken(unitToken)

  if (!unit) notFound()

  const initial = await getKitchenData(unit.id, unit.business_id)

  return (
    <LangProvider defaultLang="es">
      <KitchenBoard
        unitToken={unitToken}
        unitId={unit.id}
        businessId={unit.business_id}
        unitName={unit.name}
        taxIncluded={initial.taxIncluded}
        initial={initial}
      />
    </LangProvider>
  )
}
