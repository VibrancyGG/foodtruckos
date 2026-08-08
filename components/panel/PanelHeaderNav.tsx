"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useLang } from "@/lib/i18n/LangProvider"

const TABS = [
  { href: "/panel/resumen", key: "resumen" as const },
  { href: "/panel/menu", key: "menu" as const },
  { href: "/panel/trucks", key: "trucks" as const },
  { href: "/panel/marca", key: "marca" as const },
  { href: "/panel/personal", key: "personal" as const },
  { href: "/panel/qr", key: "qr" as const },
  { href: "/panel/cuenta", key: "cuenta" as const },
]

export function PanelHeaderNav({
  businessName,
  showNav,
  logoutAction,
}: {
  businessName: string
  showNav: boolean
  logoutAction: () => Promise<void>
}) {
  const { lang, setLang, t } = useLang()
  const pathname = usePathname()

  return (
    <header className="bg-neutral-900 text-white">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-bold">{businessName}</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            className="rounded-full border border-neutral-600 px-2.5 py-1 text-xs font-semibold"
          >
            {lang === "es" ? "EN" : "ES"}
          </button>
          <form action={logoutAction}>
            <button className="text-xs underline">{t.panel.nav.logout}</button>
          </form>
        </div>
      </div>
      {showNav && (
        <nav className="flex gap-1 overflow-x-auto px-4">
          {TABS.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className={`whitespace-nowrap rounded-t-lg px-3 py-2 text-sm font-semibold hover:bg-neutral-800 hover:text-white ${
                pathname?.startsWith(tab.href) ? "bg-neutral-800 text-white" : "text-neutral-300"
              }`}
            >
              {t.panel.nav[tab.key]}
            </Link>
          ))}
        </nav>
      )}
    </header>
  )
}
