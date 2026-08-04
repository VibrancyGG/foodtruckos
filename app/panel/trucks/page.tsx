import { redirect } from "next/navigation"
import { getOwnerContext } from "@/lib/auth/dal"
import { getOwnerUnits } from "@/lib/units/getOwnerUnits"
import { TrucksScreen } from "@/components/panel/TrucksScreen"

export default async function PanelTrucksPage() {
  const { businessId } = await getOwnerContext()
  if (!businessId) redirect("/panel/sin-acceso")

  const units = await getOwnerUnits(businessId)

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-1 text-2xl font-black">Trucks</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Pausar cierra el pedido por QR temporalmente y reabre solo. Archivar da de baja sin
        borrar nada.
      </p>
      <TrucksScreen initial={units} />
    </div>
  )
}
