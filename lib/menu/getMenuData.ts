import { createClient } from "@/lib/supabase/server"
import { toNumber } from "@/lib/supabase/numeric"

// Resuelve SIEMPRE por qr_slug (la clave real y única del punto de pedido).
// businessSlug/unitSlug en la URL son cosméticos, no autoritativos — si no
// coinciden con lo que el qr_slug resuelve, quien llama a esta función debe
// redirigir a la ruta canónica en vez de confiar en ellos.
export async function getMenuData(qrSlug: string) {
  const supabase = await createClient()

  // OJO: nunca "units(*)" aquí — esto se sirve a un comensal sin cuenta. Se
  // listan las columnas explícitamente para que agregar una columna sensible
  // a units no la filtre por accidente a esta página pública.
  const { data: orderPoint } = await supabase
    .from("order_points")
    .select(
      "id, label, active, unit_id, business_id, units(id, name, photo_url, hours, status, paused_until), businesses(*)",
    )
    .eq("qr_slug", qrSlug)
    .eq("active", true)
    .maybeSingle()

  if (!orderPoint || !orderPoint.units || !orderPoint.businesses) {
    return null
  }

  const unit = orderPoint.units
  const business = orderPoint.businesses

  // Archivado: el QR deja de funcionar de verdad (foodtruckos-datos Regla 3).
  if (unit.status === "archived") return null

  // Negocio suspendido por falta de pago: el QR deja de servir el menú por
  // completo, igual que un truck archivado — no es un mensaje de "pausado",
  // es que la suscripción no está vigente.
  if (business.subscription_status === "suspended") {
    return { suspended: true as const, paused: false as const, business, unit: { name: unit.name } }
  }

  // Pausado: se reabre solo en cuanto pasa paused_until, sin ningún trabajo
  // de fondo — se compara al momento de leer, no con un job programado.
  if (unit.status === "paused") {
    const stillPaused = !unit.paused_until || new Date(unit.paused_until) > new Date()
    if (stillPaused) {
      return {
        suspended: false as const,
        paused: true as const,
        business,
        unit: { name: unit.name },
        pausedUntil: unit.paused_until,
      }
    }
  }

  const [{ data: categories }, { data: products }, { data: unitProducts }, { data: optionGroups }, { data: options }] =
    await Promise.all([
      supabase
        .from("menu_categories")
        .select("*")
        .eq("business_id", business.id)
        .order("sort_order"),
      supabase
        .from("products")
        .select("*")
        .eq("business_id", business.id)
        .eq("status", "active"),
      supabase
        .from("unit_products")
        .select("*")
        .eq("unit_id", unit.id),
      supabase
        .from("product_option_groups")
        .select("*")
        .eq("business_id", business.id)
        .order("sort_order"),
      supabase
        .from("product_options")
        .select("*")
        .eq("business_id", business.id)
        .order("sort_order"),
    ])

  return {
    suspended: false as const,
    paused: false as const,
    orderPoint: { id: orderPoint.id, label: orderPoint.label },
    unit,
    business,
    categories: categories ?? [],
    products: (products ?? []).map((p) => ({ ...p, price: toNumber(p.price) })),
    unitProducts: unitProducts ?? [],
    optionGroups: optionGroups ?? [],
    options: (options ?? []).map((o) => ({ ...o, price_delta: toNumber(o.price_delta) })),
  }
}

export type MenuData = NonNullable<Awaited<ReturnType<typeof getMenuData>>>
export type ActiveMenuData = Extract<MenuData, { paused: false; suspended: false }>
