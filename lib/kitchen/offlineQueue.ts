"use client"

// Ninguna acción de cocina se pierde por mala conexión (foodtruckos-tiemporeal):
// se guarda en localStorage ANTES de mandarla, y se reintenta sola hasta que
// el servidor la confirma. La UI ya se actualizó de forma optimista antes de
// que esto termine — esta cola solo garantiza que el servidor se entera tarde
// o temprano, no que el usuario espere.

type QueuedAction = { id: string; body: unknown; attempts: number }

function storageKey(unitToken: string) {
  return `ft_cocina_cola_${unitToken}`
}

function readQueue(unitToken: string): QueuedAction[] {
  try {
    return JSON.parse(localStorage.getItem(storageKey(unitToken)) || "[]")
  } catch {
    return []
  }
}

function writeQueue(unitToken: string, queue: QueuedAction[]) {
  try {
    localStorage.setItem(storageKey(unitToken), JSON.stringify(queue))
  } catch {
    // si localStorage falla, la acción ya se intentó mandar igual; se pierde
    // solo la garantía de reintento, no la acción en curso.
  }
}

export function enqueueAction(unitToken: string, body: unknown) {
  const queue = readQueue(unitToken)
  queue.push({ id: crypto.randomUUID(), body, attempts: 0 })
  writeQueue(unitToken, queue)
}

export function pendingCount(unitToken: string) {
  return readQueue(unitToken).length
}

// La pantalla se refresca sola (poll cada 10s, tiempo real, reconexión) y esa
// foto de la base puede llegar mientras una acción todavía está en camino en
// esta cola — sin esto, el refresco pisaba el avance optimista y lo regresaba
// a su estado anterior, empujando al personal a tocar "Empezar" otra vez y
// generando un segundo avance real (Nueva se veía regresar y de pronto
// saltaba directo a Lista). Se usa para que el refresco respete lo que el
// personal ya tocó hasta que el servidor lo confirme de verdad.
export function pendingOrderActions(unitToken: string): Map<string, string> {
  const map = new Map<string, string>()
  for (const item of readQueue(unitToken)) {
    const body = item.body as { orderId?: string; action?: string }
    if (typeof body?.orderId === "string" && typeof body?.action === "string") {
      map.set(body.orderId, body.action)
    }
  }
  return map
}

let draining = false

export async function drainQueue(unitToken: string, onChange?: () => void, onAuthError?: () => void) {
  if (draining) return
  draining = true
  try {
    let queue = readQueue(unitToken)
    while (queue.length > 0) {
      const [next, ...rest] = queue
      try {
        const res = await fetch("/api/kitchen", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next.body),
        })
        if (!res.ok && res.status >= 500) throw new Error("server error")
        if (res.status === 401) {
          // La sesión de personal murió (PIN dado de baja, dispositivo
          // revocado, expiró) — esto no es que la acción esté mal, es que
          // nadie va a poder escribir nada hasta volver a entrar. Se deja la
          // acción en la cola (se reintenta sola en cuanto haya sesión de
          // nuevo) y se avisa, en vez de descartarla en silencio.
          onAuthError?.()
          break
        }
        // Otros 4xx (pedido ya avanzado por otra pestaña, etc.) sí se
        // descartan: reintentar no lo va a arreglar y bloquearía la cola.
        queue = rest
        writeQueue(unitToken, queue)
        onChange?.()
      } catch {
        next.attempts++
        writeQueue(unitToken, [next, ...rest])
        break // se detiene aquí; el intervalo de fuera vuelve a intentar
      }
    }
  } finally {
    draining = false
  }
}
