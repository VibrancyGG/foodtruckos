import { useEffect, useRef } from "react"

type WakeLockSentinel = { released: boolean; release: () => Promise<void> }

// La pantalla de cocina se queda pegada a la pared, con las manos ocupadas —
// que la tablet se apague a media orden es peor que no tener wake lock. Sin
// soporte (Safari viejo, etc.) simplemente no hace nada; nunca bloquea el uso.
export function useWakeLock() {
  const sentinelRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    let cancelled = false

    async function acquire() {
      const wakeLock = (navigator as unknown as { wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinel> } })
        .wakeLock
      if (!wakeLock) return
      try {
        const sentinel = await wakeLock.request("screen")
        if (cancelled) {
          sentinel.release().catch(() => {})
          return
        }
        sentinelRef.current = sentinel
      } catch {
        // Puede fallar si la pestaña no está visible o el permiso se niega —
        // se reintenta en el próximo cambio de visibilidad.
      }
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible" && !sentinelRef.current) {
        acquire()
      }
    }

    acquire()
    document.addEventListener("visibilitychange", onVisibilityChange)

    return () => {
      cancelled = true
      document.removeEventListener("visibilitychange", onVisibilityChange)
      sentinelRef.current?.release().catch(() => {})
      sentinelRef.current = null
    }
  }, [])
}
