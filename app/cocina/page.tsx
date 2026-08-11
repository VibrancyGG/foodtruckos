import { cookies } from "next/headers"
import { verifyDeviceToken, verifyStaffSession } from "@/lib/staff/session"
import { DEVICE_COOKIE, STAFF_SESSION_COOKIE } from "@/lib/staff/http"
import { getKitchenData } from "@/lib/kitchen/getKitchenData"
import { getTrucksOverview } from "@/lib/kitchen/getTrucksOverview"
import { createServiceClient } from "@/lib/supabase/service"
import { LangProvider } from "@/lib/i18n/LangProvider"
import { KitchenBoard } from "@/components/kitchen/KitchenBoard"
import { EncargadoBoard } from "@/components/kitchen/EncargadoBoard"
import { PairDeviceForm } from "@/components/kitchen/PairDeviceForm"
import { EnterPinForm } from "@/components/kitchen/EnterPinForm"
import { AutoRefresh } from "@/components/panel/AutoRefresh"

export default async function CocinaPage() {
  const jar = await cookies()
  const deviceToken = jar.get(DEVICE_COOKIE)?.value
  const sessionToken = jar.get(STAFF_SESSION_COOKIE)?.value

  const session = await verifyStaffSession(deviceToken, sessionToken)
  if (!session) {
    const device = await verifyDeviceToken(deviceToken)
    return <LangProvider defaultLang="es">{device ? <EnterPinForm /> : <PairDeviceForm />}</LangProvider>
  }

  const supabase = createServiceClient()
  const [{ data: unit }, { data: staff }, { data: business }] = await Promise.all([
    supabase.from("units").select("name, alert_amber_minutes, alert_red_minutes").eq("id", session.unitId).single(),
    supabase.from("staff").select("name").eq("id", session.staffId).single(),
    supabase
      .from("businesses")
      .select("default_alert_amber_minutes, default_alert_red_minutes, logo_url")
      .eq("id", session.businessId)
      .single(),
  ])

  const initial = await getKitchenData(session.unitId, session.businessId)
  const amberMinutes = unit?.alert_amber_minutes ?? business?.default_alert_amber_minutes ?? 8
  const redMinutes = unit?.alert_red_minutes ?? business?.default_alert_red_minutes ?? 15

  // Único rol con una pantalla extra: el Encargado ve primero cómo van
  // TODOS los trucks del negocio, no solo el suyo (foodtruckos-accesos).
  // Cocina y ventanilla nunca pasan por aquí, van directo a su tablero.
  if (session.role === "encargado") {
    const overview = await getTrucksOverview(session.businessId)
    return (
      <LangProvider defaultLang="es">
        <AutoRefresh intervalMs={15000} />
        <EncargadoBoard
          overview={overview}
          ownUnitId={session.unitId}
          businessId={session.businessId}
          ownUnitName={unit?.name ?? ""}
          staffName={staff?.name ?? ""}
          amberMinutes={amberMinutes}
          redMinutes={redMinutes}
          taxIncluded={initial.taxIncluded}
          initial={initial}
          logoUrl={business?.logo_url}
        />
      </LangProvider>
    )
  }

  return (
    <LangProvider defaultLang="es">
      <KitchenBoard
        unitId={session.unitId}
        businessId={session.businessId}
        unitName={unit?.name ?? ""}
        staffName={staff?.name ?? ""}
        amberMinutes={amberMinutes}
        redMinutes={redMinutes}
        taxIncluded={initial.taxIncluded}
        initial={initial}
        logoUrl={business?.logo_url}
      />
    </LangProvider>
  )
}
