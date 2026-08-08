import { redirect } from "next/navigation"
import { getOwnerContext } from "@/lib/auth/dal"
import { getOwnerUnits } from "@/lib/units/getOwnerUnits"
import { createClient } from "@/lib/supabase/server"
import { TrucksScreen } from "@/components/panel/TrucksScreen"

export default async function PanelTrucksPage() {
  const { businessId } = await getOwnerContext()
  if (!businessId) redirect("/panel/sin-acceso")

  const supabase = await createClient()
  const [units, { data: business }] = await Promise.all([
    getOwnerUnits(businessId),
    supabase.from("businesses").select("tax_included").eq("id", businessId).single(),
  ])

  return (
    <div className="mx-auto max-w-2xl">
      <TrucksScreen initial={units} taxIncluded={business?.tax_included ?? false} />
    </div>
  )
}
