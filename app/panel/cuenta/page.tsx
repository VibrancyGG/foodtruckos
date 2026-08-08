import { redirect } from "next/navigation"
import { getOwnerContext } from "@/lib/auth/dal"
import { getOwnerBilling } from "@/lib/billing/getOwnerBilling"
import { CuentaScreen } from "@/components/panel/CuentaScreen"

export default async function PanelCuentaPage() {
  const { businessId, user } = await getOwnerContext()
  if (!businessId) redirect("/panel/sin-acceso")

  const billing = await getOwnerBilling(businessId)
  const signInMethod = user?.app_metadata?.provider === "google" ? "google" : "password"

  return (
    <div className="mx-auto max-w-2xl">
      <CuentaScreen billing={billing} ownerEmail={user?.email ?? ""} signInMethod={signInMethod} />
    </div>
  )
}
