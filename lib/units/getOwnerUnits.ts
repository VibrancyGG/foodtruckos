import { createClient } from "@/lib/supabase/server"

export async function getOwnerUnits(businessId: string) {
  const supabase = await createClient()
  const { data: units } = await supabase
    .from("units")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at")

  return {
    active: (units ?? []).filter((u) => u.status !== "archived"),
    archived: (units ?? []).filter((u) => u.status === "archived"),
  }
}

export type OwnerUnitsData = Awaited<ReturnType<typeof getOwnerUnits>>
