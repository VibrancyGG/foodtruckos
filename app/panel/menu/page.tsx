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
      <h1 className="mb-1 text-2xl font-black">Menú</h1>
      <p className="mb-6 text-sm text-neutral-500">
        El interruptor de agotado es para &ldquo;se me acabó hoy&rdquo;. Quitar del menú es
        permanente.
      </p>
      <MenuScreen initial={menu} />
    </div>
  )
}
