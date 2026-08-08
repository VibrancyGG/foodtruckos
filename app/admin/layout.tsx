import { redirect } from "next/navigation"
import { getAdminContext } from "@/lib/auth/getAdminContext"
import { logoutAction } from "@/lib/auth/actions"
import { LangProvider } from "@/lib/i18n/LangProvider"
import { AdminHeader } from "@/components/admin/AdminHeader"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = await getAdminContext()

  if (!user) redirect("/login")
  if (!isAdmin) redirect("/panel")

  return (
    <LangProvider defaultLang="es">
      <div className="min-h-screen bg-neutral-950 text-white">
        <AdminHeader logoutAction={logoutAction} />
        <main className="p-4">{children}</main>
      </div>
    </LangProvider>
  )
}
