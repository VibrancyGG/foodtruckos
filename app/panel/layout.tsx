import { redirect } from "next/navigation"
import { getOwnerContext } from "@/lib/auth/dal"
import { logoutAction } from "@/lib/auth/actions"
import { stopImpersonation } from "@/lib/admin/impersonate"
import { LangProvider } from "@/lib/i18n/LangProvider"
import { PanelHeaderNav } from "@/components/panel/PanelHeaderNav"
import { SuspendedNotice } from "@/components/panel/SuspendedNotice"

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, businessId, business, impersonating, suspended } = await getOwnerContext()

  if (!user) redirect("/login")

  return (
    <LangProvider defaultLang="es">
      <div className="min-h-screen bg-neutral-100">
        <PanelHeaderNav
          businessName={businessId && business ? business.name : "FoodTruckOS"}
          showNav={!!businessId && !suspended}
          logoutAction={logoutAction}
          impersonating={impersonating}
          stopImpersonationAction={impersonating ? stopImpersonation : undefined}
        />
        <main className="p-4">{suspended ? <SuspendedNotice /> : children}</main>
      </div>
    </LangProvider>
  )
}
