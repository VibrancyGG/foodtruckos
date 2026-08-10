import { createClient } from "@/lib/supabase/server"
import { toNumber } from "@/lib/supabase/numeric"

// "Normalmente tardan unos X min" nunca se inventa: se calcula de los
// últimos pedidos reales de este truck que llegaron a "listo", y si no hay
// al menos 3 para promediar, sencillamente no se muestra esa comparación.
async function getAvgPrepMinutes(
  supabase: Awaited<ReturnType<typeof createClient>>,
  unitId: string,
) {
  const { data: events } = await supabase
    .from("order_status_events")
    .select("created_at, orders!inner(created_at, unit_id)")
    .eq("to_status", "listo")
    .eq("orders.unit_id", unitId)
    .order("created_at", { ascending: false })
    .limit(20)

  // Un solo pedido que se quedó horas sin que nadie lo tocara (se le olvidó a
  // cocina, o en pruebas) no debe arruinar "normalmente tardan unos X" para
  // todos los que vienen después — se descarta como atípico, no se promedia.
  const MAX_REASONABLE_MINUTES = 60

  const durations = (events ?? [])
    .map((e) => {
      const rel = e.orders as unknown as { created_at: string } | { created_at: string }[] | null
      const created = Array.isArray(rel) ? rel[0] : rel
      if (!created) return null
      const mins = (new Date(e.created_at).getTime() - new Date(created.created_at).getTime()) / 60000
      return mins > 0 && mins <= MAX_REASONABLE_MINUTES ? mins : null
    })
    .filter((m): m is number => m !== null)

  if (durations.length < 3) return null
  return Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
}

export async function getOrderWithItems(orderId: string) {
  const supabase = await createClient()

  const { data: order } = await supabase
    .from("orders")
    .select("*, units(name), businesses(name, brand_color, logo_url, header_style)")
    .eq("id", orderId)
    .maybeSingle()

  if (!order) return null

  const [{ data: items }, avgPrepMinutes] = await Promise.all([
    supabase.from("order_items").select("*").eq("order_id", orderId),
    getAvgPrepMinutes(supabase, order.unit_id),
  ])

  return {
    order: {
      ...order,
      subtotal: toNumber(order.subtotal),
      tax_amount: toNumber(order.tax_amount),
      total: toNumber(order.total),
    },
    items: (items ?? []).map((i) => ({
      ...i,
      unit_price_snapshot: toNumber(i.unit_price_snapshot),
      line_total: toNumber(i.line_total),
    })),
    avgPrepMinutes,
  }
}

export type OrderWithItems = NonNullable<Awaited<ReturnType<typeof getOrderWithItems>>>
