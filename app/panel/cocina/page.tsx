import { redirect } from "next/navigation"
import { getOwnerContext } from "@/lib/auth/dal"
import { getTrucksOverview } from "@/lib/kitchen/getTrucksOverview"
import { OwnerKitchenOverview } from "@/components/panel/OwnerKitchenOverview"
import { AutoRefresh } from "@/components/panel/AutoRefresh"

export default async function PanelCocinaPage() {
  const { businessId, business } = await getOwnerContext()
  if (!businessId) redirect("/panel/sin-acceso")

  const overview = await getTrucksOverview(businessId)

  return (
    <>
      <AutoRefresh intervalMs={15000} />
      <OwnerKitchenOverview overview={overview} businessName={business?.name ?? ""} logoUrl={business?.logo_url} />
    </>
  )
}
