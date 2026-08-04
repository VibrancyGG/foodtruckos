import { createClient } from "@/lib/supabase/server"
import { monthlyTotal, pricePerTruck } from "./pricing"

export async function getOwnerBilling(businessId: string) {
  const supabase = await createClient()

  const { data: business } = await supabase
    .from("businesses")
    .select("name, subscription_status, billing_mode, created_at")
    .eq("id", businessId)
    .single()

  const { count: activeTrucks } = await supabase
    .from("units")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .neq("status", "archived")

  const trucks = activeTrucks ?? 0

  return {
    business,
    activeTrucks: trucks,
    pricePerTruck: pricePerTruck(trucks),
    total: monthlyTotal(trucks),
  }
}

export type OwnerBillingData = Awaited<ReturnType<typeof getOwnerBilling>>
