import { createClient } from "@/lib/supabase/server"
import { monthlyTotal } from "@/lib/billing/pricing"

function monthsBetween(a: Date, b: Date) {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
}

export async function getAdminOverview() {
  const supabase = await createClient()

  const [{ data: businesses }, { data: units }, { data: requests }] = await Promise.all([
    supabase
      .from("businesses")
      .select("id, name, slug, subscription_status, billing_mode, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("units").select("id, business_id, name, status, created_at, archived_at, archive_warned_at"),
    supabase
      .from("truck_requests")
      .select("id, business_id, note, created_at")
      .eq("status", "pending")
      .order("created_at"),
  ])

  const unitList = units ?? []

  const rows = (businesses ?? []).map((b) => {
    const activeTrucks = unitList.filter((u) => u.business_id === b.id && u.status !== "archived").length
    return { ...b, activeTrucks, total: monthlyTotal(activeTrucks) }
  })

  const billable = rows.filter((r) => r.subscription_status === "active" || r.subscription_status === "trial")
  const mrr = billable.reduce((s, r) => s + r.total, 0)
  const trucksBilled = billable.reduce((s, r) => s + r.activeTrucks, 0)
  const now = new Date()
  const avgTenureMonths = billable.length
    ? billable.reduce((s, r) => s + monthsBetween(new Date(r.created_at), now), 0) / billable.length
    : 0
  const perClientAvg = billable.length ? mrr / billable.length : 0

  // Cartera: distribución real por estado de suscripción, todos los negocios.
  const cartera = ["trial", "active", "suspended", "cancelled"].map((status) => ({
    status,
    count: rows.filter((r) => r.subscription_status === status).length,
  }))

  // Tendencia de MRR de los últimos 6 meses — reconstruida de verdad a partir
  // de units.created_at/archived_at (cuántos trucks de cada negocio ya
  // facturable existían a fin de cada mes), nunca inventada. No refleja
  // negocios que ya se suspendieron o cancelaron después: describe cómo
  // creció la flota de los clientes que hoy siguen facturando.
  const mrrHistory = Array.from({ length: 6 }, (_, i) => {
    const monthsAgo = 5 - i
    const monthEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - monthsAgo + 1, 0, 23, 59, 59))
    const total = billable.reduce((sum, b) => {
      const trucksAtMonthEnd = unitList.filter(
        (u) =>
          u.business_id === b.id &&
          new Date(u.created_at) <= monthEnd &&
          (!u.archived_at || new Date(u.archived_at) > monthEnd),
      ).length
      return sum + monthlyTotal(trucksAtMonthEnd)
    }, 0)
    return { monthsAgo, total: monthsAgo === 0 ? mrr : total }
  })

  // Retención de archivados: se conservan 2 años (foodtruckos-negocio /
  // brief sección 10); se avisa antes de eliminar, nunca se borra en
  // silencio. El aviso empieza 2 meses antes del corte para dar tiempo real
  // de reaccionar, no el mismo día que se cumple el plazo.
  const RETENTION_CUTOFF_MONTHS = 24
  const RETENTION_WARN_MONTHS = 22
  const businessNameByIdForUnits = new Map(rows.map((r) => [r.id, r.name]))
  const archivedExpiring = unitList
    .filter((u) => u.status === "archived" && u.archived_at)
    .map((u) => {
      const monthsArchived = monthsBetween(new Date(u.archived_at as string), now)
      return {
        id: u.id,
        name: u.name,
        businessName: businessNameByIdForUnits.get(u.business_id) ?? "—",
        archivedAt: u.archived_at as string,
        monthsArchived,
        overdue: monthsArchived >= RETENTION_CUTOFF_MONTHS,
        warned: !!u.archive_warned_at,
      }
    })
    .filter((u) => u.monthsArchived >= RETENTION_WARN_MONTHS)
    .sort((a, b) => b.monthsArchived - a.monthsArchived)

  const businessNameByIdForRequests = new Map(rows.map((r) => [r.id, r.name]))
  const pendingRequests = (requests ?? []).map((r) => ({
    ...r,
    businessName: businessNameByIdForRequests.get(r.business_id) ?? "—",
    currentTrucks: unitList.filter((u) => u.business_id === r.business_id && u.status !== "archived").length,
  }))

  const { data: activity } = await supabase
    .from("audit_log")
    .select("id, business_id, actor_type, action, entity_type, after, created_at")
    .order("created_at", { ascending: false })
    .limit(20)

  const businessNameById = new Map(rows.map((r) => [r.id, r.name]))

  return {
    businesses: rows,
    mrr,
    trucksBilled,
    avgTenureMonths,
    perClientAvg,
    cartera,
    mrrHistory,
    pendingRequests,
    archivedExpiring,
    activity: (activity ?? []).map((a) => ({
      ...a,
      businessName: a.business_id ? (businessNameById.get(a.business_id) ?? "—") : "Plataforma",
    })),
  }
}

export type AdminOverview = Awaited<ReturnType<typeof getAdminOverview>>
