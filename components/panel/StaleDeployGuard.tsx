"use client"

import { useEffect, useState } from "react"
import { useLang } from "@/lib/i18n/LangProvider"

// Cuando hacemos push, Next.js genera una versión nueva de cada Server
// Action. Si el dueño ya tenía una pantalla del panel abierta desde antes
// del despliegue, cualquier botón que dispare una de esas ~30 acciones
// (Guardar, Pausar servicio, Crear PIN, etc.) truena con este mensaje
// exacto de Next.js — no un bug nuestro, solo código viejo hablándole a un
// servidor nuevo. Un solo guardia global aquí protege todas las acciones
// actuales y futuras, sin envolver cada una a mano.
const STALE_ACTION_SIGNS = ["Failed to find Server Action", "the server action is not found"]

function looksStale(message: string) {
  return STALE_ACTION_SIGNS.some((sign) => message.includes(sign))
}

export function StaleDeployGuard() {
  const { t } = useLang()
  const [reloading, setReloading] = useState(false)

  useEffect(() => {
    function handle(reason: unknown) {
      const message = reason instanceof Error ? reason.message : String(reason)
      if (!looksStale(message)) return
      setReloading(true)
      window.location.reload()
    }
    function onRejection(e: PromiseRejectionEvent) {
      handle(e.reason)
    }
    function onError(e: ErrorEvent) {
      handle(e.error ?? e.message)
    }
    window.addEventListener("unhandledrejection", onRejection)
    window.addEventListener("error", onError)
    return () => {
      window.removeEventListener("unhandledrejection", onRejection)
      window.removeEventListener("error", onError)
    }
  }, [])

  if (!reloading) return null

  return (
    <div className="fixed inset-x-0 top-0 z-[200] bg-panel-brand px-4 py-2 text-center text-sm font-bold text-white shadow-md">
      {t.panel.common.staleReloadToast}
    </div>
  )
}
