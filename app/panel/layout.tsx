import { redirect } from "next/navigation"
import { getOwnerContext } from "@/lib/auth/dal"
import { logoutAction } from "@/lib/auth/actions"
import { stopImpersonation } from "@/lib/admin/impersonate"
import { getUnacknowledgedApprovedTruckRequest } from "@/lib/trucks/requests"
import { createClient } from "@/lib/supabase/server"
import { LangProvider } from "@/lib/i18n/LangProvider"
import { PanelHeaderNav } from "@/components/panel/PanelHeaderNav"
import { SuspendedNotice } from "@/components/panel/SuspendedNotice"
import { TruckApprovalBanner } from "@/components/panel/TruckApprovalBanner"
import { OnboardingProvider } from "@/components/panel/onboarding/OnboardingProvider"
import { OnboardingTour } from "@/components/panel/onboarding/OnboardingTour"

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, businessId, business, impersonating, suspended } = await getOwnerContext()

  if (!user) redirect("/login")

  const approvedRequest =
    businessId && !suspended ? await getUnacknowledgedApprovedTruckRequest(businessId) : null

  // El tour nunca arranca solo para un admin viendo el panel de otro negocio
  // (botón "Abrir" en Admin interno) — solo tiene sentido para el dueño real
  // en su primera visita.
  let shouldAutoStart = false
  if (businessId && !suspended && !impersonating) {
    const supabase = await createClient()
    const { data } = await supabase
      .from("businesses")
      .select("onboarding_completed_at")
      .eq("id", businessId)
      .maybeSingle()
    shouldAutoStart = !data?.onboarding_completed_at
  }

  return (
    <LangProvider defaultLang="es">
      <OnboardingProvider shouldAutoStart={shouldAutoStart}>
        <div className="min-h-screen bg-neutral-100">
          <PanelHeaderNav
            businessName={businessId && business ? business.name : "FoodTruckOS"}
            logoUrl={businessId && business ? business.logo_url : null}
            showNav={!!businessId && !suspended}
            logoutAction={logoutAction}
            impersonating={impersonating}
            stopImpersonationAction={impersonating ? stopImpersonation : undefined}
          />
          {approvedRequest && approvedRequest.unitName && (
            <TruckApprovalBanner requestId={approvedRequest.id} unitName={approvedRequest.unitName} />
          )}
          <main className="p-4">{suspended ? <SuspendedNotice /> : children}</main>
        </div>
        {!impersonating && <OnboardingTour />}
      </OnboardingProvider>
    </LangProvider>
  )
}
