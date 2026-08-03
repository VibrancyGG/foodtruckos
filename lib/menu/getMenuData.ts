import { createClient } from "@/lib/supabase/server"
import { toNumber } from "@/lib/supabase/numeric"

// Resuelve SIEMPRE por qr_slug (la clave real y única del punto de pedido).
// businessSlug/unitSlug en la URL son cosméticos, no autoritativos — si no
// coinciden con lo que el qr_slug resuelve, quien llama a esta función debe
// redirigir a la ruta canónica en vez de confiar en ellos.
export async function getMenuData(qrSlug: string) {
  const supabase = await createClient()

  // OJO: nunca "units(*)" aquí — units.kitchen_access_token es un secreto de
  // cocina y esto se sirve a un comensal sin cuenta. Se listan las columnas
  // explícitamente para que agregar una columna sensible a units no la filtre
  // por accidente a esta página pública.
  const { data: orderPoint } = await supabase
    .from("order_points")
    .select(
      "id, label, active, unit_id, business_id, units(id, name, photo_url, hours, status), businesses(*)",
    )
    .eq("qr_slug", qrSlug)
    .eq("active", true)
    .maybeSingle()

  if (!orderPoint || !orderPoint.units || !orderPoint.businesses) {
    return null
  }

  const unit = orderPoint.units
  const business = orderPoint.businesses

  if (unit.status !== "active") return null

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
