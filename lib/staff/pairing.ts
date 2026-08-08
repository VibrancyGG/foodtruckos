import { createServiceClient } from "@/lib/supabase/service"
import { generateOpaqueToken, hashSecret, normalizePairingCode } from "@/lib/staff/crypto"

export const PAIRING_CODE_TTL_MS = 15 * 60 * 1000

type PairResult =
  | { ok: true; deviceToken: string; businessId: string; unitId: string }
  | { ok: false; error: "invalid_code" }

// Un UPDATE atómico con WHERE paired_at IS NULL: dos tablets no pueden
// ganarle la carrera al mismo código de emparejamiento, y el código deja de
// servir en cuanto una lo usa (paired_at deja de ser null) o vence.
export async function pairDevice(pairingCode: string): Promise<PairResult> {
  const supabase = createServiceClient()
  const codeHash = hashSecret(normalizePairingCode(pairingCode))
  const device = generateOpaqueToken()

  const { data, error } = await supabase
    .from("devices")
    .update({
      device_secret_hash: hashSecret(device.secret),
      paired_at: new Date().toISOString(),
      pairing_code_hash: null,
      pairing_code_expires_at: null,
    })
    .eq("pairing_code_hash", codeHash)
    .is("paired_at", null)
    .is("revoked_at", null)
    .gt("pairing_code_expires_at", new Date().toISOString())
    .select("id, business_id, unit_id")
    .maybeSingle()

  if (error || !data) return { ok: false, error: "invalid_code" }

  return {
    ok: true,
    deviceToken: `${data.id}.${device.secret}`,
    businessId: data.business_id,
    unitId: data.unit_id,
  }
}
