import { redirect } from "next/navigation"
import { getOwnerContext } from "@/lib/auth/dal"
import { getOwnerBilling } from "@/lib/billing/getOwnerBilling"
import { CuentaScreen } from "@/components/panel/CuentaScreen"

export default async function PanelCuentaPage() {
  const { businessId } = await getOwnerContext()
  if (!businessId) redirect("/panel/sin-acceso")

  const billing = await getOwnerBilling(businessId)

  return (
    <div className="mx-auto max-w-2xl">
      <CuentaScreen billing={billing} />
    </div>
  )
}
