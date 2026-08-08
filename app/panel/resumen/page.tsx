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
      <h1 className="mb-1 text-2xl font-black">Cómo va tu negocio</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Todas las comparaciones son contra datos reales — si un periodo todavía no tiene ventas, lo decimos en
        vez de inventar un número.
      </p>
      <ResumenScreen data={data} currentYear={new Date().getUTCFullYear()} />
    </div>
  )
}
