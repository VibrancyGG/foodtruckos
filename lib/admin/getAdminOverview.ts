import { createClient } from "@/lib/supabase/server"
import { monthlyTotal } from "@/lib/billing/pricing"

export async function getAdminOverview() {
  const supabase = await createClient()

  const { data: businesses } = await supabase
    .from("businesses")
    .select("id, name, slug, subscription_status, billing_mode, created_at")
    .order("created_at", { ascending: false })

  const { data: units } = await supabase.from("units").select("business_id, status")

  const rows = (businesses ?? []).map((b) => {
    const activeTrucks = (units ?? []).filter(
      (u) => u.business_id === b.id && u.status !== "archived",
    ).length
    return { ...b, activeTrucks, total: monthlyTotal(activeTrucks) }
  })

  const mrr = rows
    .filter((r) => r.subscription_status === "active" || r.subscription_status === "trial")
    .reduce((s, r) => s + r.total, 0)

  const { data: activity } = await supabase
    .from("audit_log")
    .select("id, business_id, actor_type, action, entity_type, after, created_at")
    .order("created_at", { ascending: false })
    .limit(20)

  const businessNameById = new Map(rows.map((r) => [r.id, r.name]))

  return {
    businesses: rows,
    mrr,
    activity: (activity ?? []).map((a) => ({
      ...a,
      businessName: a.business_id ? (businessNameById.get(a.business_id) ?? "—") : "Plataforma",
    })),
  }
}

export type AdminOverview = Awaited<ReturnType<typeof getAdminOverview>>
