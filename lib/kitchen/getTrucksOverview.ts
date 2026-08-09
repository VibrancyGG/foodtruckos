import { createServiceClient } from "@/lib/supabase/service"
import { toNumber } from "@/lib/supabase/numeric"

const OPEN_STATUSES = ["recibido", "preparando", "listo"]

// Vista exclusiva del Encargado (y del dueño en su panel): cómo van TODOS
// los trucks del negocio ahora mismo, no solo el suyo. Nunca se le muestra
// al personal de cocina/ventanilla — esos siguen viendo solo su tablero.
// Todo sale de datos reales del momento; "en línea" no se calcula porque no
// hay una señal confiable de conexión por truck todavía (foodtruckos-datos
// Regla: nunca inventar un número).
//
// Llave de servicio, no el cliente público: la política pública de `units`
// solo deja ver trucks con status='active' — un truck en pausa (el caso que
// justo esta pantalla existe para mostrar) desaparecería de la lista en vez
// de aparecer con su etiqueta "En pausa". El personal nunca pasa por RLS de
// todos modos (lib/staff/session.ts ya verificó la sesión a mano).
export async function getTrucksOverview(businessId: string) {
  const supabase = createServiceClient()
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const [{ data: units }, { data: business }, { data: orders }] = await Promise.all([
    supabase
      .from("units")
      .select("id, name, location, status, paused_until, alert_amber_minutes, alert_red_minutes")
      .eq("business_id", businessId)
      .neq("status", "archived")
      .order("created_at"),
    supabase
      .from("businesses")
      .select("default_alert_amber_minutes, default_alert_red_minutes")
      .eq("id", businessId)
      .single(),
    supabase
      .from("orders")
      .select("id, unit_id, folio, status, payment_status, total, created_at, customer_name")
      .eq("business_id", businessId)
      .gte("created_at", startOfDay.toISOString())
      .order("created_at"),
  ])

  const orderList = (orders ?? []).map((o) => ({ ...o, total: toNumber(o.total) }))
  const openOrders = orderList.filter((o) => OPEN_STATUSES.includes(o.status))
  const openOrderIds = openOrders.map((o) => o.id)

  const { data: items } = openOrderIds.length
    ? await supabase.from("order_items").select("order_id, product_name_snapshot, quantity").in("order_id", openOrderIds)
    : { data: [] }

  const itemsByOrder = new Map<string, string>()
  for (const it of items ?? []) {
    const prev = itemsByOrder.get(it.order_id)
    const piece = `${it.quantity} ${it.product_name_snapshot}`
    itemsByOrder.set(it.order_id, prev ? `${prev}, ${piece}` : piece)
  }

  const now = Date.now()
  const ageMinutes = (createdAt: string) => Math.floor((now - new Date(createdAt).getTime()) / 60000)

  const trucks = (units ?? []).map((u) => {
    const amber = u.alert_amber_minutes ?? business?.default_alert_amber_minutes ?? 8
    const red = u.alert_red_minutes ?? business?.default_alert_red_minutes ?? 15

    const unitOpen = openOrders.filter((o) => o.unit_id === u.id)
    const nuevas = unitOpen.filter((o) => o.status === "recibido").length
    const preparando = unitOpen.filter((o) => o.status === "preparando").length
    const listas = unitOpen.filter((o) => o.status === "listo").length
    const oldestMinutes = unitOpen.length ? Math.max(...unitOpen.map((o) => ageMinutes(o.created_at))) : 0
    const porCobrar = unitOpen.filter((o) => o.payment_status !== "pagada").length

    const salesToday = orderList
      .filter((o) => o.unit_id === u.id && o.status === "entregado" && o.payment_status === "pagada")
      .reduce((s, o) => s + o.total, 0)

    const paused = !!u.paused_until && new Date(u.paused_until) > new Date()

    return {
      id: u.id,
      name: u.name,
      location: u.location,
      paused,
      nuevas,
      preparando,
      listas,
      oldestMinutes,
      porCobrar,
      salesToday,
      amberMinutes: amber,
      redMinutes: red,
      level: unitOpen.length === 0 ? null : oldestMinutes >= red ? "red" : oldestMinutes >= amber ? "amber" : null,
    }
  })

  const unitNameById = new Map(trucks.map((t) => [t.id, t.name]))
  const attention = openOrders
    .map((o) => {
      const truck = trucks.find((t) => t.id === o.unit_id)
      if (!truck) return null
      const minutes = ageMinutes(o.created_at)
      const level = minutes >= truck.redMinutes ? "red" : minutes >= truck.amberMinutes ? "amber" : null
      if (!level) return null
      return {
        orderId: o.id,
        folio: o.folio,
        unitName: unitNameById.get(o.unit_id) ?? "—",
        customerName: o.customer_name,
        summary: itemsByOrder.get(o.id) ?? "",
        minutes,
        level,
      }
    })
    .filter((a): a is NonNullable<typeof a> => a !== null)
    .sort((a, b) => b.minutes - a.minutes)

  const salesTodayTotal = trucks.reduce((s, t) => s + t.salesToday, 0)

  return { trucks, attention, salesTodayTotal }
}

export type TrucksOverview = Awaited<ReturnType<typeof getTrucksOverview>>
