import { NextRequest } from "next/server"

export const DEVICE_COOKIE = "ft_device"
export const STAFF_SESSION_COOKIE = "ft_staff_session"

export const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 180 // 180 días
export const STAFF_SESSION_COOKIE_MAX_AGE = 60 * 60 * 12 // 12h, igual que SESSION_TTL_MS en session.ts

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "strict" as const,
    path: "/",
    maxAge,
  }
}

// No hay token en encabezado (todo va por cookie ambiente), así que el
// Origin es la única defensa CSRF real para estos Route Handlers de mutación.
export function isSameOriginRequest(req: NextRequest) {
  const origin = req.headers.get("origin")
  if (!origin) return true // peticiones same-origin de navegador a veces omiten Origin; el sameSite=strict ya cubre el resto
  try {
    return new URL(origin).host === req.headers.get("host")
  } catch {
    return false
  }
}
