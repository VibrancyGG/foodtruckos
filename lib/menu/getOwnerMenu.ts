import { createClient } from "@/lib/supabase/server"
import { toNumber } from "@/lib/supabase/numeric"

export async function getOwnerMenu(businessId: string) {
  const supabase = await createClient()

  const [{ data: categories }, { data: products }, { data: units }, { data: unitProducts }] =
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
      supabase.from("units").select("id, name").eq("business_id", businessId),
      supabase.from("unit_products").select("*").eq("business_id", businessId),
    ])

  return {
    categories: categories ?? [],
    products: (products ?? []).map((p) => ({ ...p, price: toNumber(p.price) })),
    units: units ?? [],
    unitProducts: unitProducts ?? [],
  }
}

export type OwnerMenuData = Awaited<ReturnType<typeof getOwnerMenu>>
