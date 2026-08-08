import { redirect } from "next/navigation"
import { getOwnerContext } from "@/lib/auth/dal"
import { getOwnerStaff } from "@/lib/personal/getOwnerStaff"
import { PersonalScreen } from "@/components/panel/PersonalScreen"

export default async function PanelPersonalPage() {
  const { businessId } = await getOwnerContext()
  if (!businessId) redirect("/panel/sin-acceso")

  const data = await getOwnerStaff(businessId)

  return (
    <div className="mx-auto max-w-2xl">
      <PersonalScreen initial={data} />
    </div>
  )
}
