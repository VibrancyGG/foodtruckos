import bcrypt from "bcrypt"
import { createServiceClient } from "@/lib/supabase/service"
import { generateOpaqueToken, parseOpaqueToken, secretMatches, pepperedPin, hashSecret } from "@/lib/staff/crypto"

const SESSION_TTL_MS = 12 * 60 * 60 * 1000 // 12h — una tablet no debería tener que re-entrar a media jornada
const LOCKOUT_STEPS_SECONDS = [30, 60, 120, 300, 900] // 30s, 1m, 2m, 5m, tope 15m

type Device = {
  id: string
  business_id: string
  unit_id: string
  device_secret_hash: string | null
  revoked_at: string | null
  failed_pin_attempts: number
  pin_locked_until: string | null
}

async function loadDevice(deviceId: string): Promise<Device | null> {
  const supabase = createServiceClient()
  const { data } = await supabase
    .from("devices")
    .select("id, business_id, unit_id, device_secret_hash, revoked_at, failed_pin_attempts, pin_locked_until")
    .eq("id", deviceId)
    .maybeSingle()
  return data
}

// Verifica solo la cookie de dispositivo — la usan las pantallas de "pedir
// PIN" para saber contra qué negocio/unidad validar, y para saber si ya hay
// que pedir el código de emparejamiento de nuevo.
export async function verifyDeviceToken(deviceToken: string | undefined | null) {
  const parsed = parseOpaqueToken(deviceToken)
  if (!parsed) return null
  const device = await loadDevice(parsed.id)
  if (!device || device.revoked_at || !device.device_secret_hash) return null
  if (!secretMatches(parsed.secret, device.device_secret_hash)) return null
  return device
}

type PinResult =
  | { ok: true; sessionToken: string; staffId: string }
  | { ok: false; error: "invalid_device" | "locked" | "invalid_pin" }

export async function startStaffSession(deviceToken: string, pin: string): Promise<PinResult> {
  const device = await verifyDeviceToken(deviceToken)
  if (!device) return { ok: false, error: "invalid_device" }

  if (device.pin_locked_until && new Date(device.pin_locked_until) > new Date()) {
    return { ok: false, error: "locked" }
  }

  const supabase = createServiceClient()
  const { data: staffList } = await supabase
    .from("staff")
    .select("id, pin_hash")
    .eq("business_id", device.business_id)
    .eq("active", true)

  const peppered = pepperedPin(pin)
  let matchedStaffId: string | null = null
  for (const staff of staffList ?? []) {
    if (await bcrypt.compare(peppered, staff.pin_hash)) {
      matchedStaffId = staff.id
      break
    }
  }

  if (!matchedStaffId) {
    const attempts = device.failed_pin_attempts + 1
    const step = LOCKOUT_STEPS_SECONDS[Math.min(attempts - 1, LOCKOUT_STEPS_SECONDS.length - 1)]
    await supabase
      .from("devices")
      .update({
        failed_pin_attempts: attempts,
        pin_locked_until: new Date(Date.now() + step * 1000).toISOString(),
      })
      .eq("id", device.id)
    return { ok: false, error: "invalid_pin" }
  }

  await supabase
    .from("devices")
    .update({ failed_pin_attempts: 0, pin_locked_until: null, last_seen_at: new Date().toISOString() })
    .eq("id", device.id)

  const session = generateOpaqueToken()
  const { data: sessionRow, error } = await supabase
    .from("device_sessions")
    .insert({
      device_id: device.id,
      staff_id: matchedStaffId,
      session_secret_hash: hashSecret(session.secret),
      expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    })
    .select("id")
    .single()

  if (error || !sessionRow) return { ok: false, error: "invalid_device" }

  return { ok: true, sessionToken: `${sessionRow.id}.${session.secret}`, staffId: matchedStaffId }
}

type VerifiedStaffSession = {
  businessId: string
  unitId: string
  staffId: string
  deviceId: string
  sessionId: string
}

// Se llama en CADA acción de cocina, no solo al refrescar la cookie — es lo
// que hace que desactivar personal o revocar un dispositivo corte el acceso
// casi al instante en vez de esperar a que expire la sesión.
export async function verifyStaffSession(
  deviceToken: string | undefined | null,
  sessionToken: string | undefined | null,
): Promise<VerifiedStaffSession | null> {
  const device = await verifyDeviceToken(deviceToken)
  if (!device) return null

  const parsedSession = parseOpaqueToken(sessionToken)
  if (!parsedSession) return null

  const supabase = createServiceClient()
  const { data: session } = await supabase
    .from("device_sessions")
    .select("id, device_id, staff_id, session_secret_hash, expires_at, revoked_at")
    .eq("id", parsedSession.id)
    .maybeSingle()

  if (!session || session.revoked_at || session.device_id !== device.id) return null
  if (new Date(session.expires_at) <= new Date()) return null
  if (!secretMatches(parsedSession.secret, session.session_secret_hash)) return null

  const { data: staff } = await supabase
    .from("staff")
    .select("id, active, business_id, unit_id")
    .eq("id", session.staff_id)
    .maybeSingle()

  if (!staff || !staff.active) return null

  await supabase.from("device_sessions").update({ last_seen_at: new Date().toISOString() }).eq("id", session.id)

  return {
    businessId: device.business_id,
    unitId: device.unit_id,
    staffId: staff.id,
    deviceId: device.id,
    sessionId: session.id,
  }
}

// Extiende expires_at en la base, no solo el max-age de la cookie — sin esto
// una sesión "refrescada" del lado del cliente seguiría venciendo del lado
// del servidor a las 12h originales.
export async function extendStaffSession(sessionId: string) {
  const supabase = createServiceClient()
  await supabase
    .from("device_sessions")
    .update({ expires_at: new Date(Date.now() + SESSION_TTL_MS).toISOString() })
    .eq("id", sessionId)
}
