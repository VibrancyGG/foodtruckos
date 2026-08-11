import { redirect, notFound } from "next/navigation"
import { cookies } from "next/headers"
import { verifyStaffSession } from "@/lib/staff/session"
import { DEVICE_COOKIE, STAFF_SESSION_COOKIE } from "@/lib/staff/http"
import { getKitchenData } from "@/lib/kitchen/getKitchenData"
import { createServiceClient } from "@/lib/supabase/service"
import { LangProvider } from "@/lib/i18n/LangProvider"
import { KitchenBoard } from "@/components/kitchen/KitchenBoard"

// Solo el Encargado entra aquí — cocina y ventanilla nunca ven otro truck
// que no sea el de su dispositivo (foodtruckos-accesos). El servidor vuelve
// a comprobar el rol y que el truck sea del mismo negocio antes de mostrar
// nada; nunca confía en el unitId de la URL por sí solo.
export default async function CocinaTruckPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params
  const jar = await cookies()
  const session = await verifyStaffSession(jar.get(DEVICE_COOKIE)?.value, jar.get(STAFF_SESSION_COOKIE)?.value)
  if (!session) redirect("/cocina")
  if (session.role !== "encargado") redirect("/cocina")

  const supabase = createServiceClient()
  const [{ data: unit }, { data: staff }, { data: business }] = await Promise.all([
    supabase
      .from("units")
      .select("name, alert_amber_minutes, alert_red_minutes")
      .eq("id", unitId)
      .eq("business_id", session.businessId)
      .maybeSingle(),
    supabase.from("staff").select("name").eq("id", session.staffId).single(),
    supabase
      .from("businesses")
      .select("default_alert_amber_minutes, default_alert_red_minutes, logo_url")
      .eq("id", session.businessId)
      .single(),
  ])
  if (!unit) notFound()

  const initial = await getKitchenData(unitId, session.businessId)
  const amberMinutes = unit.alert_amber_minutes ?? business?.default_alert_amber_minutes ?? 8
  const redMinutes = unit.alert_red_minutes ?? business?.default_alert_red_minutes ?? 15

  return (
    <LangProvider defaultLang="es">
      <KitchenBoard
        unitId={unitId}
        businessId={session.businessId}
        unitName={unit.name}
        staffName={staff?.name ?? ""}
        amberMinutes={amberMinutes}
        redMinutes={redMinutes}
        taxIncluded={initial.taxIncluded}
        initial={initial}
        logoUrl={business?.logo_url}
        backHref="/cocina"
      />
    </LangProvider>
  )
}
