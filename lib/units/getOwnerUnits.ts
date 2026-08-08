import { createClient } from "@/lib/supabase/server"

const MAX_REASONABLE_PREP_MINUTES = 60

export async function getOwnerUnits(businessId: string) {
  const supabase = await createClient()
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: units }, { data: business }, { data: events }] = await Promise.all([
    supabase.from("units").select("*").eq("business_id", businessId).order("created_at"),
    supabase
      .from("businesses")
      .select("tax_included, default_alert_amber_minutes, default_alert_red_minutes")
      .eq("id", businessId)
      .single(),
    supabase
      .from("order_status_events")
      .select("created_at, orders!inner(created_at, business_id)")
      .eq("to_status", "listo")
      .eq("orders.business_id", businessId)
      .gte("created_at", since)
      .limit(500),
  ])

  // "Tu promedio real de los últimos 30 días" nunca se inventa
  // (foodtruckos-negocio): se calcula de pedidos reales que llegaron a
  // "listo", descartando atípicos (>60 min, casi siempre un pedido de
  // prueba olvidado) y sin mostrar nada si no hay al menos 3 muestras.
  const minutes = (events ?? [])
    .map((e) => {
      const order = Array.isArray(e.orders) ? e.orders[0] : e.orders
      if (!order) return null
      const m = (new Date(e.created_at).getTime() - new Date(order.created_at).getTime()) / 60000
      return m > 0 && m <= MAX_REASONABLE_PREP_MINUTES ? m : null
    })
    .filter((m): m is number => m !== null)
  const avgPrepMinutes = minutes.length >= 3 ? Math.round(minutes.reduce((s, m) => s + m, 0) / minutes.length) : null

  return {
    active: (units ?? []).filter((u) => u.status !== "archived"),
    archived: (units ?? []).filter((u) => u.status === "archived"),
    taxIncluded: business?.tax_included ?? false,
    defaultAlertAmberMinutes: business?.default_alert_amber_minutes ?? 8,
    defaultAlertRedMinutes: business?.default_alert_red_minutes ?? 15,
    avgPrepMinutes,
  }
}

export type OwnerUnitsData = Awaited<ReturnType<typeof getOwnerUnits>>
