import { NextRequest, NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/service"
import { parseOpaqueToken } from "@/lib/staff/crypto"
import { STAFF_SESSION_COOKIE, isSameOriginRequest } from "@/lib/staff/http"

// Cierra la sesión de la PERSONA, no del dispositivo — la tablet sigue
// emparejada al truck (foodtruckos-accesos: el emparejamiento es cosa de
// meses, el turno de cada quien es cosa de horas). El siguiente que entre
// solo teclea su PIN, sin pasar por el código de emparejamiento de nuevo.
export async function POST(req: NextRequest) {
  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ error: "origin_not_allowed" }, { status: 403 })
  }

  const sessionToken = req.cookies.get(STAFF_SESSION_COOKIE)?.value
  const parsed = parseOpaqueToken(sessionToken)
  if (parsed) {
    const supabase = createServiceClient()
    await supabase.from("device_sessions").update({ revoked_at: new Date().toISOString() }).eq("id", parsed.id)
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.delete(STAFF_SESSION_COOKIE)
  return res
}
