"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

// Re-ejecuta el Server Component de la página (misma consulta real, sin
// duplicar la agregación en el cliente) cada cierto tiempo mientras la
// pestaña está visible — para que Resumen no se sienta "congelado" sin
// tener que mantener una suscripción de Realtime abierta solo para esto.
export function AutoRefresh({ intervalMs = 60000 }: { intervalMs?: number }) {
  const router = useRouter()

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh()
    }, intervalMs)
    return () => clearInterval(id)
  }, [router, intervalMs])

  return null
}
