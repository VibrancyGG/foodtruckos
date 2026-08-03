import { createClient } from "@/lib/supabase/server"
import { toNumber } from "@/lib/supabase/numeric"

export async function getOrderWithItems(orderId: string) {
  const supabase = await createClient()

  const { data: order } = await supabase
    .from("orders")
    .select("*, units(name), businesses(name, brand_color)")
    .eq("id", orderId)
    .maybeSingle()

  if (!order) return null

  const { data: items } = await supabase
    .from("order_items")
    .select("*")
    .eq("order_id", orderId)

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
  }
}

export type OrderWithItems = NonNullable<Awaited<ReturnType<typeof getOrderWithItems>>>
