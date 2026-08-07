import { createClient } from "@/lib/supabase/server"

export async function getOwnerStaff(businessId: string) {
  const supabase = await createClient()

  const [{ data: staff }, { data: devices }, { data: units }] = await Promise.all([
    supabase
      .from("staff")
      .select("id, unit_id, name, role, active, created_at")
      .eq("business_id", businessId)
      .order("created_at"),
    supabase
      .from("devices")
      .select("id, unit_id, label, paired_at, revoked_at, last_seen_at, created_at")
      .eq("business_id", businessId)
      .order("created_at"),
    supabase.from("units").select("id, name").eq("business_id", businessId).neq("status", "archived"),
  ])

  return {
    staff: (staff ?? []).filter((s) => s.active),
    removedStaff: (staff ?? []).filter((s) => !s.active),
    devices: (devices ?? []).filter((d) => !d.revoked_at),
    revokedDevices: (devices ?? []).filter((d) => d.revoked_at),
    units: units ?? [],
  }
}

export type OwnerStaffData = Awaited<ReturnType<typeof getOwnerStaff>>
