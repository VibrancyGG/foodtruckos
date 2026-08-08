import { redirect } from "next/navigation"
import { getOwnerContext } from "@/lib/auth/dal"
import { createClient } from "@/lib/supabase/server"
import { MarcaForm } from "@/components/panel/MarcaForm"

export default async function PanelPage() {
  const { businessId } = await getOwnerContext()

  if (!businessId) redirect("/panel/sin-acceso")

  const supabase = await createClient()
  const { data: business } = await supabase
    .from("businesses")
    .select("name, slug, logo_url, cover_photo_url, brand_color, menu_style")
    .eq("id", businessId)
    .single()

  if (!business) redirect("/panel/sin-acceso")

  return (
    <div className="mx-auto max-w-4xl">
      <MarcaForm
        businessName={business.name}
        initialLogoUrl={business.logo_url}
        initialCoverUrl={business.cover_photo_url}
        initialColor={business.brand_color || "#D62828"}
        initialStyle={business.menu_style}
      />
    </div>
  )
}
