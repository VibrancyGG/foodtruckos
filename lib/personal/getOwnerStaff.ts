import { createClient } from "@/lib/supabase/server"

export async function getOwnerStaff(businessId: string) {
  const supabase = await createClient()

  const [{ data: staff }, { data: devices }, { data: units }, { data: lastUsed }] = await Promise.all([
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
    // Todos los trucks, incluidos los dados de baja: el personal/dispositivo
    // de un truck archivado debe seguir mostrando su nombre real (no "—")
    // aunque ya no se le pueda asignar nada nuevo — ver assignableUnits.
    supabase.from("units").select("id, name, status").eq("business_id", businessId),
    // Se calcula de device_sessions reales (nunca se inventa la actividad de
    // turno) — ver staff_last_used, una función de base de datos porque
    // device_sessions no tiene RLS propia (solo la toca el cliente de
    // servicio de cocina).
    supabase.rpc("staff_last_used", { p_business_id: businessId }),
  ])

  const lastUsedByStaff = new Map((lastUsed ?? []).map((row) => [row.staff_id, row.last_used]))

  return {
    staff: (staff ?? [])
      .filter((s) => s.active)
      .map((s) => ({ ...s, lastUsedAt: lastUsedByStaff.get(s.id) ?? null })),
    removedStaff: (staff ?? []).filter((s) => !s.active),
    devices: (devices ?? []).filter((d) => !d.revoked_at),
    revokedDevices: (devices ?? []).filter((d) => d.revoked_at),
    units: units ?? [],
    assignableUnits: (units ?? []).filter((u) => u.status !== "archived"),
  }
}

export type OwnerStaffData = Awaited<ReturnType<typeof getOwnerStaff>>
