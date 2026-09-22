"use client"

import { useState, useTransition } from "react"
import { useLang } from "@/lib/i18n/LangProvider"
import { deleteAccount } from "@/lib/admin/actions"
import type { AdminOverview } from "@/lib/admin/getAdminOverview"

// Una cuenta sin negocio: nunca dejó solicitud, o se la rechazamos. Se le
// puede escribir o eliminarla. Eliminar pregunta antes y manda el correo como
// confirmación: la base lo compara con el de la cuenta antes de borrar.
export function OrphanAccountRow({ account }: { account: AdminOverview["orphanAccounts"][number] }) {
  const { lang, t } = useLang()
  const a = t.admin
  const locale = lang === "es" ? "es-MX" : "en-US"
  const [pending, startTransition] = useTransition()
  const [confirmando, setConfirmando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [gone, setGone] = useState(false)

  if (gone) return null

  return (
    <div className="border-b border-neutral-800 py-3 last:border-0">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-0 flex-1 basis-full sm:basis-auto">
          <div className="font-semibold">{account.full_name || account.email}</div>
          <div className="text-xs text-neutral-500">
            {account.email} · {account.provider === "google" ? a.orphanViaGoogle : a.orphanViaEmail} ·{" "}
            {a.orphanSignedUpOn(new Date(account.created_at).toLocaleDateString(locale))}
            {!account.email_confirmed_at && <span className="text-amber-400"> · {a.orphanUnconfirmed}</span>}
            {account.rejected_requests > 0 && <span className="text-red-400"> · {a.orphanRejected}</span>}
          </div>
        </div>
        <a
          href={`mailto:${account.email}`}
          className="rounded-lg border border-neutral-700 px-2.5 py-1 text-xs font-bold text-neutral-300 hover:border-neutral-500"
        >
          {a.orphanWrite}
        </a>
        {!confirmando && (
          <button
            onClick={() => {
              setError(null)
              setConfirmando(true)
            }}
            className="rounded-lg border border-neutral-800 px-2.5 py-1 text-xs font-bold text-neutral-500 hover:border-red-800 hover:text-red-400"
          >
            {a.orphanDelete}
          </button>
        )}
      </div>
      {confirmando && (
        <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-red-900/60 bg-red-950/30 px-3 py-2">
          <span className="flex-1 text-xs text-red-200">{a.orphanDeleteConfirm(account.email)}</span>
          <button
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const r = await deleteAccount(account.id, account.email)
                if (r.ok) setGone(true)
                else setError(r.error)
              })
            }
            className="rounded-lg border border-red-800 px-2.5 py-1 text-xs font-bold text-red-300 disabled:opacity-50"
          >
            {pending ? a.orphanDeleting : a.orphanDeleteYes}
          </button>
          <button disabled={pending} onClick={() => setConfirmando(false)} className="px-1 text-xs text-neutral-400">
            {a.cancel}
          </button>
        </div>
      )}
      {error && <p className="mt-1.5 text-xs font-semibold text-amber-400">{error}</p>}
    </div>
  )
}
