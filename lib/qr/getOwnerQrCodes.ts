import QRCode from "qrcode"
import { createClient } from "@/lib/supabase/server"
// Siempre el dominio real, nunca localhost: lo que se imprime tiene que
// funcionar sin importar desde dónde el dueño esté viendo este panel.
import { SITE_URL } from "@/lib/utils/siteUrl"

export async function getOwnerQrCodes(businessId: string) {
  const supabase = await createClient()

  const { data: business } = await supabase
    .from("businesses")
    .select("slug")
    .eq("id", businessId)
    .single()

  const { data: units } = await supabase
    .from("units")
    .select("id, name, location")
    .eq("business_id", businessId)
    .neq("status", "archived")

  const { data: orderPoints } = await supabase
    .from("order_points")
    .select("id, unit_id, label, qr_slug, short_code, active")
    .eq("business_id", businessId)
    .eq("active", true)

  if (!business || !units || !orderPoints) return []

  const codes = await Promise.all(
    orderPoints.map(async (op) => {
      const unit = units.find((u) => u.id === op.unit_id)
      if (!unit) return null
      // La URL corta. La larga (/negocio/truck/qr_slug) sigue funcionando para
      // los pósters ya impresos, pero lo que se imprima de aquí en adelante va
      // por aquí: mientras menos texto lleva un QR, menos cuadros necesita y
      // más grandes quedan — que es lo que decide si escanea al primer intento
      // de noche, con la lámina sucia. Con el nombre de negocio más largo que
      // hay hoy, esto pasa de 168 caracteres a 28.
      const url = `${SITE_URL}/q/${op.short_code}`
      const qrDataUrl = await QRCode.toDataURL(url, { margin: 1, width: 480 })
      return { unitName: unit.name, label: op.label, location: unit.location, url, qrDataUrl }
    }),
  )

  return codes.filter((c): c is NonNullable<typeof c> => c !== null)
}
