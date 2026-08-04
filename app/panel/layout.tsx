import { redirect } from "next/navigation"
import { getOwnerContext } from "@/lib/auth/dal"
import { logoutAction } from "@/lib/auth/actions"

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, businessId, business } = await getOwnerContext()

  if (!user) redirect("/login")

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="flex items-center justify-between bg-neutral-900 px-4 py-3 text-white">
        <span className="text-sm font-bold">
          {businessId && business ? business.name : "FoodTruckOS"}
        </span>
        <form action={logoutAction}>
          <button className="text-xs underline">Cerrar sesión</button>
        </form>
      </header>
      <main className="p-4">{children}</main>
    </div>
  )
}
