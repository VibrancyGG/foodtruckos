import { createClient } from "@/lib/supabase/server"
import { toNumber } from "@/lib/supabase/numeric"

export async function getOwnerMenu(businessId: string) {
  const supabase = await createClient()

  const [{ data: categories }, { data: products }, { data: units }, { data: unitProducts }, { data: optionGroups }, { data: options }] =
    await Promise.all([
      supabase
        .from("menu_categories")
        .select("*")
        .eq("business_id", businessId)
        .order("sort_order"),
      supabase
        .from("products")
        .select("*")
        .eq("business_id", businessId)
        .eq("status", "active")
        .order("created_at"),
      supabase.from("units").select("id, name").eq("business_id", businessId).neq("status", "archived"),
      supabase.from("unit_products").select("*").eq("business_id", businessId),
      supabase
        .from("product_option_groups")
        .select("*")
        .eq("business_id", businessId)
        .order("sort_order"),
      supabase
        .from("product_options")
        .select("*")
        .eq("business_id", businessId)
        .order("sort_order"),
    ])

  return {
    categories: categories ?? [],
    products: (products ?? []).map((p) => ({ ...p, price: toNumber(p.price) })),
    units: units ?? [],
    unitProducts: unitProducts ?? [],
    optionGroups: optionGroups ?? [],
    options: (options ?? []).map((o) => ({ ...o, price_delta: toNumber(o.price_delta) })),
  }
}

export type OwnerMenuData = Awaited<ReturnType<typeof getOwnerMenu>>
