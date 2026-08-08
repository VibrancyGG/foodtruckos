import { redirect } from "next/navigation"
import { getOwnerContext } from "@/lib/auth/dal"
import { getOwnerUnits } from "@/lib/units/getOwnerUnits"
import { getPendingTruckRequest } from "@/lib/trucks/requests"
import { TrucksScreen } from "@/components/panel/TrucksScreen"

export default async function PanelTrucksPage() {
  const { businessId } = await getOwnerContext()
  if (!businessId) redirect("/panel/sin-acceso")

  const [data, pendingRequest] = await Promise.all([getOwnerUnits(businessId), getPendingTruckRequest(businessId)])

  return (
    <div className="mx-auto max-w-2xl">
      <TrucksScreen initial={data} pendingRequestSince={pendingRequest?.created_at ?? null} />
    </div>
  )
}
