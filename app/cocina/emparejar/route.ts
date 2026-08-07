import { NextRequest, NextResponse } from "next/server"
import { pairDevice } from "@/lib/staff/pairing"
import { DEVICE_COOKIE, DEVICE_COOKIE_MAX_AGE, cookieOptions, isSameOriginRequest } from "@/lib/staff/http"

export async function POST(req: NextRequest) {
  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 })
  }

  const body = (await req.json()) as { code?: string }
  const code = (body.code ?? "").trim()
  if (!code) return NextResponse.json({ error: "Falta el código" }, { status: 400 })

  const result = await pairDevice(code)
  if (!result.ok) {
    return NextResponse.json({ error: "Código inválido o ya usado" }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(DEVICE_COOKIE, result.deviceToken, cookieOptions(DEVICE_COOKIE_MAX_AGE))
  return res
}
