import { redirect } from "next/navigation"
import { getOwnerContext } from "@/lib/auth/dal"
import { getOwnerQrCodes } from "@/lib/qr/getOwnerQrCodes"
import { createClient } from "@/lib/supabase/server"
import { QrScreen } from "@/components/panel/QrScreen"

export default async function PanelQrPage() {
  const { businessId } = await getOwnerContext()
  if (!businessId) redirect("/panel/sin-acceso")

  const supabase = await createClient()
  const [codes, { data: business }] = await Promise.all([
    getOwnerQrCodes(businessId),
    supabase.from("businesses").select("name, brand_color").eq("id", businessId).single(),
  ])

  return (
    <div className="mx-auto max-w-3xl">
      <QrScreen codes={codes} businessName={business?.name ?? ""} brandColor={business?.brand_color || "#D62828"} />
    </div>
  )
}
