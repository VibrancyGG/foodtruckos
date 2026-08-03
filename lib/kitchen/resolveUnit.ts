import { createServiceClient } from "@/lib/supabase/service"

// units.kitchen_access_token es el único parche de acceso a cocina mientras no
// exista PIN/dispositivo (foodtruckos-accesos). Se resuelve SIEMPRE del lado
// del servidor con la llave de servicio — anon no tiene ni puede tener permiso
// de leer esa columna, así que no hay otra forma de validarlo.
// TODO(auth-phase): eliminar por completo cuando exista PIN + dispositivo emparejado.
export async function resolveUnitByToken(token: string) {
  const supabase = createServiceClient()

  const { data: unit } = await supabase
    .from("units")
    .select("id, business_id, name, kitchen_alert_minutes, status")
    .eq("kitchen_access_token", token)
    .maybeSingle()

  if (!unit || unit.status !== "active") return null
  return unit
}
