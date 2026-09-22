"use client"

import { useEffect, useRef } from "react"
import { useLang } from "@/lib/i18n/LangProvider"
import { confirmEmailToken } from "@/lib/auth/confirmEmail"

export function ConfirmEmail({ tokenHash, type }: { tokenHash: string; type: string }) {
  const { t } = useLang()
  // Un solo canje por página aunque React monte el efecto dos veces.
  const iniciado = useRef(false)

  useEffect(() => {
    if (iniciado.current) return
    iniciado.current = true
    if (!tokenHash) {
      window.location.replace("/login?error=auth")
      return
    }
    confirmEmailToken(tokenHash, type).then((r) => {
      // Recarga completa para que el destino lea las cookies de sesión nuevas.
      window.location.replace(r.ok ? r.destination : "/login?error=auth")
    })
  }, [tokenHash, type])

  return (
    <div className="py-10 text-center">
      <div className="mx-auto mb-4 h-6 w-6 animate-spin rounded-full border-2 border-neutral-700 border-t-[#FF5A36]" />
      <p className="text-sm text-neutral-400">{t.auth.confirmingEmail}</p>
    </div>
  )
}
