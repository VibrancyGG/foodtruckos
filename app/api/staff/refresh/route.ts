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
  await extendStaffSession(session.sessionId)

  const res = NextResponse.json({ ok: true })
  res.cookies.set(STAFF_SESSION_COOKIE, sessionToken!, cookieOptions(STAFF_SESSION_COOKIE_MAX_AGE))
  return res
}
