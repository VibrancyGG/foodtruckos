import Link from "next/link"
import { redirect } from "next/navigation"
import { getOwnerContext } from "@/lib/auth/dal"
import { logoutAction } from "@/lib/auth/actions"

const TABS = [
  { href: "/panel/marca", label: "Marca" },
  { href: "/panel/menu", label: "Menú" },
  { href: "/panel/trucks", label: "Trucks" },
  { href: "/panel/personal", label: "Personal" },
  { href: "/panel/qr", label: "Códigos QR" },
  { href: "/panel/cuenta", label: "Cuenta" },
]

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const { user, businessId, business } = await getOwnerContext()

  if (!user) redirect("/login")

  return (
    <div className="min-h-screen bg-neutral-100">
      <header className="bg-neutral-900 text-white">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm font-bold">
            {businessId && business ? business.name : "FoodTruckOS"}
          </span>
          <form action={logoutAction}>
            <button className="text-xs underline">Cerrar sesión</button>
          </form>
        </div>
        {businessId && (
          <nav className="flex gap-1 px-4">
            {TABS.map((t) => (
              <Link
                key={t.href}
                href={t.href}
                className="rounded-t-lg px-3 py-2 text-sm font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white"
              >
                {t.label}
              </Link>
            ))}
          </nav>
        )}
      </header>
      <main className="p-4">{children}</main>
    </div>
  )
}
