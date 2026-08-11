import { redirect, notFound } from "next/navigation"
import { getOwnerContext } from "@/lib/auth/dal"
import { createClient } from "@/lib/supabase/server"
import { getKitchenData } from "@/lib/kitchen/getKitchenData"
import { KitchenBoard } from "@/components/kitchen/KitchenBoard"

export default async function PanelCocinaUnitPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params
  const { businessId, business } = await getOwnerContext()
  if (!businessId) redirect("/panel/sin-acceso")

  const supabase = await createClient()
  const [{ data: unit }, { data: businessAlerts }] = await Promise.all([
    supabase
      .from("units")
      .select("name, alert_amber_minutes, alert_red_minutes")
      .eq("id", unitId)
      .eq("business_id", businessId)
      .maybeSingle(),
    supabase.from("businesses").select("default_alert_amber_minutes, default_alert_red_minutes").eq("id", businessId).single(),
  ])
  if (!unit) notFound()

  const initial = await getKitchenData(unitId, businessId)
  const amberMinutes = unit.alert_amber_minutes ?? businessAlerts?.default_alert_amber_minutes ?? 8
  const redMinutes = unit.alert_red_minutes ?? businessAlerts?.default_alert_red_minutes ?? 15

  return (
    <KitchenBoard
      unitId={unitId}
      businessId={businessId}
      unitName={unit.name}
      staffName={business?.name ?? ""}
      amberMinutes={amberMinutes}
      redMinutes={redMinutes}
      taxIncluded={initial.taxIncluded}
      initial={initial}
      readOnly
      logoUrl={business?.logo_url}
    />
  )
}
