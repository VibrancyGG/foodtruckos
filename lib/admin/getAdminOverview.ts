import { createClient } from "@/lib/supabase/server"
import { monthlyTotal } from "@/lib/billing/pricing"
import { slugify } from "@/lib/utils/slugify"

function monthsBetween(a: Date, b: Date) {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
}

export async function getAdminOverview() {
  const supabase = await createClient()

  const [{ data: businesses }, { data: units }, { data: orderPoints }] = await Promise.all([
    supabase
      .from("businesses")
      .select("id, name, slug, subscription_status, billing_mode, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("units").select("id, business_id, name, status, created_at, archived_at"),
    supabase.from("order_points").select("unit_id, qr_slug, active").eq("active", true),
  ])

  const unitList = units ?? []
  const opList = orderPoints ?? []

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

  // "Abrir": el primer truck activo con un QR activo — el enlace real al
  // menú que ve el comensal, no un panel administrativo aparte.
  const openLinks = new Map<string, string>()
  for (const b of rows) {
    const businessUnits = unitList.filter((u) => u.business_id === b.id && u.status !== "archived")
    for (const u of businessUnits) {
      const op = opList.find((o) => o.unit_id === u.id)
      if (op) {
        openLinks.set(b.id, `/${b.slug}/${slugify(u.name)}/${op.qr_slug}`)
        break
      }
    }
  }

  const { data: activity } = await supabase
    .from("audit_log")
    .select("id, business_id, actor_type, action, entity_type, after, created_at")
    .order("created_at", { ascending: false })
    .limit(20)

  const businessNameById = new Map(rows.map((r) => [r.id, r.name]))

  return {
    businesses: rows.map((r) => ({ ...r, openUrl: openLinks.get(r.id) ?? null })),
    mrr,
    trucksBilled,
    avgTenureMonths,
    perClientAvg,
    cartera,
    mrrHistory,
    activity: (activity ?? []).map((a) => ({
      ...a,
      businessName: a.business_id ? (businessNameById.get(a.business_id) ?? "—") : "Plataforma",
    })),
  }
}

export type AdminOverview = Awaited<ReturnType<typeof getAdminOverview>>
