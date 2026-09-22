"use client"

import { useState, useTransition } from "react"
import { sendTestNotice } from "@/lib/admin/actions"
import { useLang } from "@/lib/i18n/LangProvider"

// Manda un aviso de prueba desde producción y enseña lo que respondió Resend.
// Los avisos reales van en segundo plano y nunca reportan nada; esto es la
// única forma de saber, sin registros del servidor, si están saliendo.
export function TestNoticeButton() {
  const { t } = useLang()
  const a = t.admin
  const [pending, startTransition] = useTransition()
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string } | null>(null)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setResultado(null)
            const r = await sendTestNotice()
            setResultado(r.ok ? { ok: true, texto: a.testNoticeSent(r.destino) } : { ok: false, texto: r.error })
          })
        }
        className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs font-bold text-neutral-300 hover:border-neutral-500 disabled:opacity-50"
      >
        {pending ? a.testNoticeSending : a.testNoticeButton}
      </button>
      {resultado && (
        <span className={`text-xs font-semibold ${resultado.ok ? "text-emerald-400" : "text-amber-400"}`}>
          {resultado.texto}
        </span>
      )}
    </div>
  )
}
