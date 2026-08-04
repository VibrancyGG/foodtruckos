import QRCode from "qrcode"
import { createClient } from "@/lib/supabase/server"
import { slugify } from "@/lib/utils/slugify"

// Siempre apunta al dominio real, nunca a localhost — lo que se imprime tiene
// que funcionar sin importar desde dónde el dueño esté viendo este panel.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://foodtruckos.vercel.app"

export async function getOwnerQrCodes(businessId: string) {
  const supabase = await createClient()

  const { data: business } = await supabase
    .from("businesses")
    .select("slug")
    .eq("id", businessId)
    .single()

  const { data: units } = await supabase
    .from("units")
    .select("id, name")
    .eq("business_id", businessId)
    .neq("status", "archived")

  const { data: orderPoints } = await supabase
    .from("order_points")
    .select("id, unit_id, label, qr_slug, active")
    .eq("business_id", businessId)
    .eq("active", true)

  if (!business || !units || !orderPoints) return []

  const codes = await Promise.all(
    orderPoints.map(async (op) => {
      const unit = units.find((u) => u.id === op.unit_id)
      if (!unit) return null
      const url = `${SITE_URL}/${business.slug}/${slugify(unit.name)}/${op.qr_slug}`
      const qrDataUrl = await QRCode.toDataURL(url, { margin: 1, width: 480 })
      return { unitName: unit.name, label: op.label, url, qrDataUrl }
    }),
  )

  return codes.filter((c): c is NonNullable<typeof c> => c !== null)
}
