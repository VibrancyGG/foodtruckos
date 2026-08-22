import { NextRequest, NextResponse } from "next/server"
import { verifyStaffSession, extendStaffSession } from "@/lib/staff/session"
import {
  DEVICE_COOKIE,
  STAFF_SESSION_COOKIE,
  STAFF_SESSION_COOKIE_MAX_AGE,
  cookieOptions,
  isSameOriginRequest,
} from "@/lib/staff/http"

// Reemite la cookie de sesión con una nueva fecha de expiración mientras la
// sesión siga siendo válida. No reemite si ya fue revocada — eso obliga a
// pasar por /cocina/entrar de nuevo.
export async function POST(req: NextRequest) {
  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 })
  }

  const deviceToken = req.cookies.get(DEVICE_COOKIE)?.value
  const sessionToken = req.cookies.get(STAFF_SESSION_COOKIE)?.value
  const session = await verifyStaffSession(deviceToken, sessionToken)
  if (!session) return NextResponse.json({ error: "Sesión no válida" }, { status: 401 })
  const vence = await extendStaffSession(session.sessionId)
  // Pasó el techo de 16 h desde el PIN: no se renueva. Se responde 401 para que
  // la pantalla se bloquee ya, en vez de dejar que la persona siga tocando
  // botones hasta que la siguiente acción falle.
  if (!vence) return NextResponse.json({ error: "Sesión vencida" }, { status: 401 })

  // La cookie se corta al mismo momento que la sesión en la base. Antes se
  // reemitía siempre con 12 h, así que cerca del techo la cookie sobrevivía a
  // la sesión — no era un agujero (manda la base), pero sí un 401 sorpresa.
  const segundos = Math.max(1, Math.floor((vence.getTime() - Date.now()) / 1000))
  const res = NextResponse.json({ ok: true })
  res.cookies.set(STAFF_SESSION_COOKIE, sessionToken!, cookieOptions(Math.min(segundos, STAFF_SESSION_COOKIE_MAX_AGE)))
  return res
}
