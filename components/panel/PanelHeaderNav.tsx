"use client"

import { useEffect, useRef } from "react"
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
  logoUrl,
  showNav,
  logoutAction,
  impersonating,
  stopImpersonationAction,
}: {
  businessName: string
  logoUrl?: string | null
  showNav: boolean
  logoutAction: () => Promise<void>
  impersonating?: boolean
  stopImpersonationAction?: () => Promise<void>
}) {
  const { lang, setLang, t } = useLang()
  const pathname = usePathname()
  const activeRef = useRef<HTMLAnchorElement>(null)

  // En móvil la barra de pestañas es más ancha que la pantalla (se desliza
  // horizontal, mismo patrón que los chips de categoría en cocina) — sin
  // esto, entrar directo a una pestaña de la derecha (QR, Cuenta) la deja
  // fuera de vista y no queda claro en cuál estás parado.
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center" })
  }, [pathname])

  return (
    <header className="bg-neutral-900 text-white print:hidden">
      {impersonating && stopImpersonationAction && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-500 px-4 py-1.5 text-xs font-bold text-amber-950">
          <span>{t.panel.nav.impersonatingBanner(businessName)}</span>
          <form action={stopImpersonationAction}>
            <button className="underline">{t.panel.nav.exitImpersonation}</button>
          </form>
        </div>
      )}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-bold">
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-6 w-6 flex-none rounded-full object-contain" />
          )}
          {businessName}
        </span>
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
        <div className="relative">
          <nav className="flex gap-1 overflow-x-auto px-4">
            {TABS.map((tab) => {
              const active = pathname?.startsWith(tab.href)
              return (
                <Link
                  key={tab.href}
                  ref={active ? activeRef : undefined}
                  href={tab.href}
                  className={`whitespace-nowrap rounded-t-lg px-3 py-2 text-sm font-semibold hover:bg-neutral-800 hover:text-white ${
                    active ? "bg-neutral-800 text-white" : "text-neutral-300"
                  }`}
                >
                  {t.panel.nav[tab.key]}
                </Link>
              )
            })}
          </nav>
          <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-neutral-900 to-transparent sm:hidden" />
        </div>
      )}
    </header>
  )
}
