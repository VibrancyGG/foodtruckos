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
    <header className="relative bg-panel-dark text-white shadow-[0_1px_0_rgba(255,255,255,0.06)] print:hidden">
      {impersonating && stopImpersonationAction && (
        <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-500 px-4 py-1.5 text-xs font-bold text-amber-950">
          <span>{t.panel.nav.impersonatingBanner(businessName)}</span>
          <form action={stopImpersonationAction}>
            <button className="underline">{t.panel.nav.exitImpersonation}</button>
          </form>
        </div>
      )}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
        <span className="flex min-w-0 items-center gap-2.5 text-sm font-bold">
          {logoUrl ? (
            // Montado directo sobre el header, sin placa — igual que en cocina
            // y el menú del comensal, para que el logo del cliente se vea tal
            // cual lo subió, sin recorte ni fondo que lo distorsione.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-8 w-8 flex-none object-contain" />
          ) : (
            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-xl bg-panel-brand">
              <span className="font-[family-name:var(--font-panel-display)] text-sm font-bold text-white">
                {businessName.charAt(0).toUpperCase()}
              </span>
            </span>
          )}
          <span className="truncate font-[family-name:var(--font-panel-display)] text-[15px] tracking-tight">{businessName}</span>
        </span>
        <div className="flex flex-none items-center gap-2">
          <button
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            className="rounded-full border border-white/15 px-2.5 py-1 text-xs font-semibold text-white/80 transition-colors hover:border-white/30 hover:text-white"
          >
            {lang === "es" ? "EN" : "ES"}
          </button>
          <form action={logoutAction}>
            <button className="text-xs font-medium text-white/60 underline decoration-white/25 underline-offset-2 transition-colors hover:text-white/90">
              {t.panel.nav.logout}
            </button>
          </form>
        </div>
      </div>
      {showNav && (
        <div className="relative mx-auto max-w-6xl px-2 sm:px-4">
          <nav className="flex gap-1 overflow-x-auto px-2">
            {TABS.map((tab) => {
              const active = pathname?.startsWith(tab.href)
              return (
                <Link
                  key={tab.href}
                  ref={active ? activeRef : undefined}
                  href={tab.href}
                  className={`relative whitespace-nowrap px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active ? "text-white" : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {t.panel.nav[tab.key]}
                  {active && (
                    <span className="absolute inset-x-2 bottom-0 h-[2.5px] rounded-full bg-panel-brand transition-all duration-300" />
                  )}
                </Link>
              )
            })}
          </nav>
          <div className="pointer-events-none absolute right-0 top-0 h-full w-6 bg-gradient-to-l from-panel-dark to-transparent sm:hidden" />
        </div>
      )}
    </header>
  )
}
