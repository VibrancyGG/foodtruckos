"use server"

import bcrypt from "bcrypt"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getOwnerContext } from "@/lib/auth/dal"
import { generatePairingCode, hashSecret, pepperedPin } from "@/lib/staff/crypto"

type Result = { ok: true } | { ok: false; error: string }

// El dueño resuelve altas y bajas él mismo, sin que ningún problema de acceso
// escale al soporte (foodtruckos-accesos): un PIN eliminado deja de servir de
// inmediato, no en el próximo inicio de sesión (verifyStaffSession revisa
// staff.active en cada acción de cocina, no solo al refrescar).

export async function createStaff(input: {
  name: string
  pin: string
  unitId: string | null
}): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }
  if (!input.name.trim()) return { ok: false, error: "Falta el nombre" }
  if (!/^\d{4}$/.test(input.pin)) return { ok: false, error: "El PIN debe ser de 4 dígitos" }

  const supabase = await createClient()

  const peppered = pepperedPin(input.pin)
  const { data: existing } = await supabase
    .from("staff")
    .select("pin_hash")
    .eq("business_id", businessId)
    .eq("active", true)
  for (const s of existing ?? []) {
    if (await bcrypt.compare(peppered, s.pin_hash)) {
      return { ok: false, error: "Ese PIN ya lo usa otra persona activa, elige otro" }
    }
  }

  const pinHash = await bcrypt.hash(peppered, 10)
  const { data: newStaff, error } = await supabase
    .from("staff")
    .insert({
      business_id: businessId,
      unit_id: input.unitId,
      name: input.name.trim(),
      pin_hash: pinHash,
    })
    .select("id")
    .single()
  if (error || !newStaff) return { ok: false, error: "No se pudo crear" }

  await supabase.rpc("log_owner_action", {
    p_business_id: businessId,
    p_action: "staff_created",
    p_entity_type: "staff",
    p_entity_id: newStaff.id,
  })
  revalidatePath("/panel/personal")
  return { ok: true }
}

export async function removeStaff(staffId: string): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("staff")
    .update({ active: false, removed_at: new Date().toISOString() })
    .eq("id", staffId)
    .eq("business_id", businessId)
  if (error) return { ok: false, error: "No se pudo quitar" }

  await supabase.rpc("log_owner_action", {
    p_business_id: businessId,
    p_action: "staff_removed",
    p_entity_type: "staff",
    p_entity_id: staffId,
  })
  revalidatePath("/panel/personal")
  return { ok: true }
}

type CreateDeviceResult = { ok: true; pairingCode: string } | { ok: false; error: string }

export async function createDevice(input: { label: string; unitId: string }): Promise<CreateDeviceResult> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }
  if (!input.label.trim()) return { ok: false, error: "Falta un nombre para el dispositivo" }
  if (!input.unitId) return { ok: false, error: "Falta el truck" }

  const supabase = await createClient()
  const pairingCode = generatePairingCode()

  const { data: newDevice, error } = await supabase
    .from("devices")
    .insert({
      business_id: businessId,
      unit_id: input.unitId,
      label: input.label.trim(),
      pairing_code_hash: hashSecret(pairingCode),
    })
    .select("id")
    .single()
  if (error || !newDevice) return { ok: false, error: "No se pudo crear" }

  await supabase.rpc("log_owner_action", {
    p_business_id: businessId,
    p_action: "device_created",
    p_entity_type: "device",
    p_entity_id: newDevice.id,
  })
  revalidatePath("/panel/personal")
  return { ok: true, pairingCode }
}

export async function revokeDevice(deviceId: string): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("devices")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", deviceId)
    .eq("business_id", businessId)
  if (error) return { ok: false, error: "No se pudo revocar" }

  await supabase.rpc("log_owner_action", {
    p_business_id: businessId,
    p_action: "device_revoked",
    p_entity_type: "device",
    p_entity_id: deviceId,
  })
  revalidatePath("/panel/personal")
  return { ok: true }
}
