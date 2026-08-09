import { redirect } from "next/navigation"
import { getOwnerContext } from "@/lib/auth/dal"
import { createClient } from "@/lib/supabase/server"
import { MarcaForm } from "@/components/panel/MarcaForm"

export default async function PanelPage() {
  const { businessId } = await getOwnerContext()

  if (!businessId) redirect("/panel/sin-acceso")

  const supabase = await createClient()
  const [{ data: business }, { data: units }, { data: products }] = await Promise.all([
    supabase
      .from("businesses")
      .select("name, slug, logo_url, cover_photo_url, brand_color, menu_style, brand_motif")
      .eq("id", businessId)
      .single(),
    supabase
      .from("units")
      .select("id, name, brand_color")
      .eq("business_id", businessId)
      .neq("status", "archived")
      .order("created_at"),
    supabase
      .from("products")
      .select("id, name_es, name_en, description_es, description_en, price, photo_url")
      .eq("business_id", businessId)
      .eq("status", "active")
      .order("created_at")
      .limit(3),
  ])

  if (!business) redirect("/panel/sin-acceso")

  return (
    <div className="mx-auto max-w-4xl">
      <MarcaForm
        businessName={business.name}
        initialLogoUrl={business.logo_url}
        initialCoverUrl={business.cover_photo_url}
        initialColor={business.brand_color || "#D62828"}
        initialStyle={business.menu_style}
        initialMotif={business.brand_motif}
        units={units ?? []}
        previewProducts={products ?? []}
      />
    </div>
  )
}
