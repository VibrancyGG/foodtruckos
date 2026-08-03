import { createClient } from "@/lib/supabase/server"
import { toNumber } from "@/lib/supabase/numeric"

// Todo lo que se lee aquí ya es público por diseño (mismas políticas que usa
// el comensal) — el token de cocina solo protege las ESCRITURAS, que pasan
// por app/api/kitchen/route.ts con la llave de servicio.
export async function getKitchenData(unitId: string, businessId: string) {
  const supabase = await createClient()

  const [{ data: orders }, { data: products }, { data: unitProducts }, { data: business }] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .eq("unit_id", unitId)
      .not("status", "in", "(entregado,cancelado)")
      .order("created_at"),
    supabase.from("products").select("*").eq("business_id", businessId).eq("status", "active"),
    supabase.from("unit_products").select("*").eq("unit_id", unitId),
    supabase.from("businesses").select("tax_included").eq("id", businessId).single(),
  ])

  const orderIds = (orders ?? []).map((o) => o.id)
  const { data: items } = orderIds.length
    ? await supabase.from("order_items").select("*").in("order_id", orderIds)
    : { data: [] }

  return {
    orders: (orders ?? []).map((o) => ({
      ...o,
      subtotal: toNumber(o.subtotal),
      tax_amount: toNumber(o.tax_amount),
      total: toNumber(o.total),
    })),
    items: (items ?? []).map((i) => ({ ...i, unit_price_snapshot: toNumber(i.unit_price_snapshot), line_total: toNumber(i.line_total) })),
    products: (products ?? []).map((p) => ({ ...p, price: toNumber(p.price) })),
    unitProducts: unitProducts ?? [],
    taxIncluded: business?.tax_included ?? false,
  }
}

export type KitchenData = Awaited<ReturnType<typeof getKitchenData>>
