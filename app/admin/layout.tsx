import { redirect } from "next/navigation"
import { getAdminContext } from "@/lib/auth/getAdminContext"
import { logoutAction } from "@/lib/auth/actions"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin } = await getAdminContext()

  if (!user) redirect("/login")
  if (!isAdmin) redirect("/panel")

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
        <span className="text-sm font-bold">FoodTruckOS · Admin interno</span>
        <form action={logoutAction}>
          <button className="text-xs text-neutral-400 underline">Cerrar sesión</button>
        </form>
      </header>
      <main className="p-4">{children}</main>
    </div>
  )
}
