"use server"

import bcrypt from "bcrypt"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getOwnerContext } from "@/lib/auth/dal"
import { generatePairingCode, hashSecret, pepperedPin } from "@/lib/staff/crypto"
import { PAIRING_CODE_TTL_MS } from "@/lib/staff/pairing"

type Result = { ok: true } | { ok: false; error: string }

export type StaffRole = "cocina" | "cajero" | "encargado"

// El dueño resuelve altas y bajas él mismo, sin que ningún problema de acceso
// escale al soporte (foodtruckos-accesos): un PIN eliminado deja de servir de
// inmediato, no en el próximo inicio de sesión (verifyStaffSession revisa
// staff.active en cada acción de cocina, no solo al refrescar).
//
// El PIN se genera aquí, nunca lo escribe el dueño: así nunca queda en texto
// plano fuera del hash, y se muestra una sola vez al crear a la persona — no
// hay forma de "volver a verlo" después porque no lo guardamos en claro. Si
// se pierde, la solución es la misma que ya documenta el plan de accesos:
// el dueño quita a la persona y la vuelve a dar de alta.

async function generateUniquePin(supabase: Awaited<ReturnType<typeof createClient>>, businessId: string) {
  const { data: existing } = await supabase
    .from("staff")
    .select("pin_hash")
    .eq("business_id", businessId)
    .eq("active", true)
  const hashes = existing ?? []

  for (let attempt = 0; attempt < 30; attempt++) {
    const pin = String(Math.floor(1000 + Math.random() * 9000))
    const peppered = pepperedPin(pin)
    let taken = false
    for (const s of hashes) {
      if (await bcrypt.compare(peppered, s.pin_hash)) {
        taken = true
        break
      }
    }
    if (!taken) return pin
  }
  return null
}

type CreateStaffResult = { ok: true; pin: string } | { ok: false; error: string }

export async function createStaff(input: {
  name: string
  role: StaffRole
  unitId: string | null
}): Promise<CreateStaffResult> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }
  if (!input.name.trim()) return { ok: false, error: "Falta el nombre" }

  const supabase = await createClient()

  const pin = await generateUniquePin(supabase, businessId)
  if (!pin) return { ok: false, error: "No se pudo generar un PIN, intenta de nuevo" }

  const pinHash = await bcrypt.hash(pepperedPin(pin), 10)
  const { data: newStaff, error } = await supabase
    .from("staff")
    .insert({
      business_id: businessId,
      unit_id: input.unitId,
      name: input.name.trim(),
      role: input.role,
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
  return { ok: true, pin }
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

type CreateDeviceResult =
  | { ok: true; pairingCode: string; expiresAt: string }
  | { ok: false; error: string }

export async function createDevice(input: { label: string; unitId: string }): Promise<CreateDeviceResult> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }
  if (!input.label.trim()) return { ok: false, error: "Falta un nombre para el dispositivo" }
  if (!input.unitId) return { ok: false, error: "Falta el truck" }

  const supabase = await createClient()
  const pairingCode = generatePairingCode()
  const expiresAt = new Date(Date.now() + PAIRING_CODE_TTL_MS).toISOString()

  const { data: newDevice, error } = await supabase
    .from("devices")
    .insert({
      business_id: businessId,
      unit_id: input.unitId,
      label: input.label.trim(),
      pairing_code_hash: hashSecret(pairingCode),
      pairing_code_expires_at: expiresAt,
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
  return { ok: true, pairingCode, expiresAt }
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
