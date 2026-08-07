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
      <h1 className="mb-1 text-2xl font-black">Personal</h1>
      <p className="mb-6 text-sm text-neutral-500">
        PINs para cocina y ventanilla, y las tablets que los usan. Nada de esto pasa por
        correo ni contraseña — el dueño resuelve altas, bajas y dispositivos perdidos sin
        llamarnos.
      </p>
      <PersonalScreen initial={data} />
    </div>
  )
}
