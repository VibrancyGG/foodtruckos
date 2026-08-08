import { redirect } from "next/navigation"
import { getOwnerContext } from "@/lib/auth/dal"
import { getOwnerSummary } from "@/lib/reportes/getOwnerSummary"
import { ResumenScreen } from "@/components/panel/ResumenScreen"

export default async function PanelResumenPage() {
  const { businessId } = await getOwnerContext()
  if (!businessId) redirect("/panel/sin-acceso")

  const data = await getOwnerSummary(businessId)

  return (
    <div className="mx-auto max-w-4xl">
      <ResumenScreen data={data} />
    </div>
  )
}
