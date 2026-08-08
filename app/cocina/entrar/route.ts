import { NextRequest, NextResponse } from "next/server"
import { startStaffSession } from "@/lib/staff/session"
import {
  DEVICE_COOKIE,
  STAFF_SESSION_COOKIE,
  STAFF_SESSION_COOKIE_MAX_AGE,
  cookieOptions,
  isSameOriginRequest,
} from "@/lib/staff/http"

export async function POST(req: NextRequest) {
  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ error: "origin_not_allowed" }, { status: 403 })
  }

  const deviceToken = req.cookies.get(DEVICE_COOKIE)?.value
  if (!deviceToken) return NextResponse.json({ error: "invalid_device" }, { status: 401 })

  const body = (await req.json()) as { pin?: string }
  const pin = (body.pin ?? "").trim()
  if (!pin) return NextResponse.json({ error: "missing_pin" }, { status: 400 })

  const result = await startStaffSession(deviceToken, pin)
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 401 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(STAFF_SESSION_COOKIE, result.sessionToken, cookieOptions(STAFF_SESSION_COOKIE_MAX_AGE))
  return res
}
