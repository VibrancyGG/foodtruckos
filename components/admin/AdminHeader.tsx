"use client"

import { useLang } from "@/lib/i18n/LangProvider"

export function AdminHeader({ logoutAction }: { logoutAction: () => Promise<void> }) {
  const { lang, setLang, t } = useLang()
  return (
    <header className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
      <span className="text-sm font-bold">{t.admin.headerTitle}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setLang(lang === "es" ? "en" : "es")}
          className="rounded-full border border-neutral-700 px-2.5 py-1 text-xs font-semibold text-neutral-300"
        >
          {lang === "es" ? "EN" : "ES"}
        </button>
        <form action={logoutAction}>
          <button className="text-xs text-neutral-400 underline">{t.admin.logout}</button>
        </form>
      </div>
    </header>
  )
}
