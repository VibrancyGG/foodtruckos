import { redirect } from "next/navigation"
import { getOwnerContext } from "@/lib/auth/dal"
import { getOwnerMenu } from "@/lib/menu/getOwnerMenu"
import { MenuScreen } from "@/components/panel/MenuScreen"

export default async function PanelMenuPage() {
  const { businessId } = await getOwnerContext()
  if (!businessId) redirect("/panel/sin-acceso")

  const menu = await getOwnerMenu(businessId)

  return (
    <div className="mx-auto max-w-3xl">
      <MenuScreen initial={menu} />
    </div>
  )
}
