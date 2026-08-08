import { cookies } from "next/headers"
import { verifyDeviceToken, verifyStaffSession } from "@/lib/staff/session"
import { DEVICE_COOKIE, STAFF_SESSION_COOKIE } from "@/lib/staff/http"
import { getKitchenData } from "@/lib/kitchen/getKitchenData"
import { createServiceClient } from "@/lib/supabase/service"
import { LangProvider } from "@/lib/i18n/LangProvider"
import { KitchenBoard } from "@/components/kitchen/KitchenBoard"
import { PairDeviceForm } from "@/components/kitchen/PairDeviceForm"
import { EnterPinForm } from "@/components/kitchen/EnterPinForm"

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
  const [{ data: unit }, { data: staff }] = await Promise.all([
    supabase.from("units").select("name, kitchen_alert_minutes").eq("id", session.unitId).single(),
    supabase.from("staff").select("name").eq("id", session.staffId).single(),
  ])

  const initial = await getKitchenData(session.unitId, session.businessId)

  return (
    <LangProvider defaultLang="es">
      <KitchenBoard
        unitId={session.unitId}
        businessId={session.businessId}
        unitName={unit?.name ?? ""}
        staffName={staff?.name ?? ""}
        alertMinutes={unit?.kitchen_alert_minutes ?? 20}
        taxIncluded={initial.taxIncluded}
        initial={initial}
      />
    </LangProvider>
  )
}
