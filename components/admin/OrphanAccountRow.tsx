"use client"

import { useLang } from "@/lib/i18n/LangProvider"
import type { AdminOverview } from "@/lib/admin/getAdminOverview"

// Una cuenta que entró pero nunca dejó solicitud. Solo se muestra y se ofrece
// escribirle: no hay nada que aprobar, y borrarla es decisión aparte.
export function OrphanAccountRow({ account }: { account: AdminOverview["orphanAccounts"][number] }) {
  const { lang, t } = useLang()
  const a = t.admin
  const locale = lang === "es" ? "es-MX" : "en-US"

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-neutral-800 py-3 last:border-0">
      <div className="min-w-0 flex-1 basis-full sm:basis-auto">
        <div className="font-semibold">{account.full_name || account.email}</div>
        <div className="text-xs text-neutral-500">
          {account.email} · {account.provider === "google" ? a.orphanViaGoogle : a.orphanViaEmail} ·{" "}
          {a.orphanSignedUpOn(new Date(account.created_at).toLocaleDateString(locale))}
          {!account.email_confirmed_at && <span className="text-amber-400"> · {a.orphanUnconfirmed}</span>}
        </div>
      </div>
      <a
        href={`mailto:${account.email}`}
        className="rounded-lg border border-neutral-700 px-2.5 py-1 text-xs font-bold text-neutral-300 hover:border-neutral-500"
      >
        {a.orphanWrite}
      </a>
    </div>
  )
}
