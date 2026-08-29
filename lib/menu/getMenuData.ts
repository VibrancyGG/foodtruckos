import { createPublicClient } from "@/lib/supabase/public"
import { toNumber } from "@/lib/supabase/numeric"
import { isOpenNow, parseWeeklyHours } from "@/lib/units/hours"
import { accessBlocked } from "@/lib/billing/trial"

// Resuelve por la clave real y única del punto de pedido. Hay dos, y las dos
// son permanentes:
//
//   short_code  la corta, /q/k7m2xp — la que llevan los QR nuevos
//   qr_slug     la larga, /negocio/truck/negocio-truck-1 — la de los QR viejos
//
// La vieja no se retira nunca: hay pósters impresos y pegados en trucks que
// resuelven por ella. Las dos entregan exactamente el mismo menú.
//
// En la ruta larga, businessSlug/unitSlug son cosméticos, no autoritativos —
// si no coinciden con lo que la clave resuelve, quien llama a esta función
// debe redirigir a la ruta canónica en vez de confiar en ellos.
export async function getMenuData(clave: string, por: "qr_slug" | "short_code" = "qr_slug") {
  // Sin cookies, igual que al crear el pedido: el menú del comensal se ve
  // idéntico traiga o no una sesión encima ese celular.
  const supabase = createPublicClient()

  // OJO: nunca "units(*)" aquí — esto se sirve a un comensal sin cuenta. Se
  // listan las columnas explícitamente para que agregar una columna sensible
  // a units no la filtre por accidente a esta página pública.
  const { data: orderPoint } = await supabase
    .from("order_points")
    .select(
      "id, label, active, unit_id, business_id, units(id, name, photo_url, hours, status, paused_until), businesses(*)",
    )
    .eq(por, clave)
    .eq("active", true)
    .maybeSingle()

  if (!orderPoint || !orderPoint.units || !orderPoint.businesses) {
    return null
  }

  const unit = orderPoint.units
  const business = orderPoint.businesses

  // Archivado: el QR deja de funcionar de verdad (foodtruckos-datos Regla 3).
  if (unit.status === "archived") return null

  // Suscripción no vigente — suspendida por falta de pago, o prueba gratis
  // vencida: el QR deja de servir el menú por completo, igual que un truck
  // archivado. No es un mensaje de "pausado".
  //
  // La prueba vencida cuenta aquí igual que la suspensión. Si no, el dueño y
  // la cocina quedarían bloqueados mientras el QR sigue tomando pedidos que
  // nadie puede ver ni preparar.
  if (accessBlocked(business.subscription_status, business.trial_ends_at)) {
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
    openStatus: isOpenNow(parseWeeklyHours(unit.hours), business.timezone),
    categories: categories ?? [],
    products: (products ?? []).map((p) => ({ ...p, price: toNumber(p.price) })),
    unitProducts: unitProducts ?? [],
    optionGroups: optionGroups ?? [],
    options: (options ?? []).map((o) => ({ ...o, price_delta: toNumber(o.price_delta) })),
  }
}

export type MenuData = NonNullable<Awaited<ReturnType<typeof getMenuData>>>
export type ActiveMenuData = Extract<MenuData, { paused: false; suspended: false }>
