"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getOwnerContext } from "@/lib/auth/dal"
import type { WeeklyHours } from "@/lib/units/hours"

type Result = { ok: true } | { ok: false; error: string }

export async function updateUnit(input: {
  unitId: string
  name: string
  location: string
}): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }
  if (!input.name.trim()) return { ok: false, error: "Falta el nombre" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("units")
    .update({ name: input.name, location: input.location.trim() || null })
    .eq("id", input.unitId)
    .eq("business_id", businessId)

  if (error) return { ok: false, error: "No se pudo guardar" }
  revalidatePath("/panel/trucks")
  return { ok: true }
}

// Umbrales de aviso en cocina (ámbar/rojo), compartidos por default y con
// posibilidad de anularlos por truck (setUnitAlertThresholds). Viven en el
// negocio, no en cada unidad, para que "para los tres" sea de verdad un solo
// ajuste — igual que el impuesto.
export async function updateSharedAlertThresholds(amberMinutes: number, redMinutes: number): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }
  if (!(amberMinutes >= 1) || !(redMinutes > amberMinutes)) {
    return { ok: false, error: "El rojo debe ser mayor que el ámbar" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("businesses")
    .update({ default_alert_amber_minutes: amberMinutes, default_alert_red_minutes: redMinutes })
    .eq("id", businessId)

  if (error) return { ok: false, error: "No se pudo guardar" }
  revalidatePath("/panel/trucks")
  return { ok: true }
}

// null/null = "usa los del negocio" (hereda el default en cada lectura,
// nunca se copia un valor fijo que luego quede desincronizado si el dueño
// cambia el default compartido).
export async function setUnitAlertThresholds(
  unitId: string,
  thresholds: { amberMinutes: number; redMinutes: number } | null,
): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }
  if (thresholds && !(thresholds.amberMinutes >= 1 && thresholds.redMinutes > thresholds.amberMinutes)) {
    return { ok: false, error: "El rojo debe ser mayor que el ámbar" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("units")
    .update({
      alert_amber_minutes: thresholds?.amberMinutes ?? null,
      alert_red_minutes: thresholds?.redMinutes ?? null,
    })
    .eq("id", unitId)
    .eq("business_id", businessId)

  if (error) return { ok: false, error: "No se pudo guardar" }
  revalidatePath("/panel/trucks")
  return { ok: true }
}

// Impuesto parametrizable por negocio (regla de producto ya tomada): el dueño
// elige si sus precios de menú ya incluyen el impuesto o si se agrega al
// total — afecta menú, ticket y reportes por igual, así que vive a nivel de
// negocio, no por truck.
export async function updateTax(taxIncluded: boolean): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { error } = await supabase.from("businesses").update({ tax_included: taxIncluded }).eq("id", businessId)

  if (error) return { ok: false, error: "No se pudo guardar" }
  revalidatePath("/panel/trucks")
  return { ok: true }
}

// El horario publicado es lo que "actividad de venta" (panel Resumen) usa
// como referencia para saber si un truck abrió tarde o cerró antes — nunca
// se inventa, si no está capturado simplemente no hay esa comparación.
export async function updateUnitHours(unitId: string, hours: WeeklyHours): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("units")
    .update({ hours })
    .eq("id", unitId)
    .eq("business_id", businessId)

  if (error) return { ok: false, error: "No se pudo guardar el horario" }
  revalidatePath("/panel/trucks")
  revalidatePath("/panel/resumen")
  return { ok: true }
}

// Pausa temporal, con reapertura automática (decisión de producto ya tomada).
// pausedUntil=null pausa indefinido, hasta que el dueño reabra a mano.
export async function pauseUnit(input: {
  unitId: string
  pausedUntil: string | null
  reason: string | null
}): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("units")
    .update({ status: "paused", paused_until: input.pausedUntil, pause_reason: input.reason })
    .eq("id", input.unitId)
    .eq("business_id", businessId)

  if (error) return { ok: false, error: "No se pudo pausar" }
  await supabase.rpc("log_owner_action", {
    p_business_id: businessId,
    p_action: "unit_paused",
    p_entity_type: "unit",
    p_entity_id: input.unitId,
    p_after: { paused_until: input.pausedUntil },
  })
  revalidatePath("/panel/trucks")
  return { ok: true }
}

export async function reopenUnit(unitId: string): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("units")
    .update({ status: "active", paused_until: null, pause_reason: null })
    .eq("id", unitId)
    .eq("business_id", businessId)

  if (error) return { ok: false, error: "No se pudo reabrir" }
  await supabase.rpc("log_owner_action", {
    p_business_id: businessId,
    p_action: "unit_reopened",
    p_entity_type: "unit",
    p_entity_id: unitId,
  })
  revalidatePath("/panel/trucks")
  return { ok: true }
}

// Archivar nunca borra (foodtruckos-datos Regla 3): el truck deja de
// facturarse y su QR deja de funcionar, pero sus ventas siguen consultables
// y se conserva 2 años. Reactivar toma minutos, no un alta nueva.
export async function archiveUnit(unitId: string): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("units")
    .update({ status: "archived", archived_at: new Date().toISOString() })
    .eq("id", unitId)
    .eq("business_id", businessId)

  if (error) return { ok: false, error: "No se pudo archivar" }
  await supabase.rpc("log_owner_action", {
    p_business_id: businessId,
    p_action: "unit_archived",
    p_entity_type: "unit",
    p_entity_id: unitId,
  })
  revalidatePath("/panel/trucks")
  return { ok: true }
}

export async function reactivateUnit(unitId: string): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("units")
    .update({ status: "active", archived_at: null })
    .eq("id", unitId)
    .eq("business_id", businessId)

  if (error) return { ok: false, error: "No se pudo reactivar" }
  await supabase.rpc("log_owner_action", {
    p_business_id: businessId,
    p_action: "unit_reactivated",
    p_entity_type: "unit",
    p_entity_id: unitId,
  })
  revalidatePath("/panel/trucks")
  return { ok: true }
}

type UploadResult = { ok: false; error: string } | { ok: true; publicUrl: string }

export async function uploadUnitPhoto(unitId: string, formData: FormData): Promise<UploadResult> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const file = formData.get("file") as File | null
  if (!file || file.size === 0) return { ok: false, error: "Elige una imagen" }

  const supabase = await createClient()
  const ext = file.name.split(".").pop() || "webp"
  const path = `${businessId}/units/${unitId}-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("business-media")
    .upload(path, file, { contentType: file.type })
  if (uploadError) return { ok: false, error: "No se pudo subir la imagen" }

  const {
    data: { publicUrl },
  } = supabase.storage.from("business-media").getPublicUrl(path)

  const { error: updateError } = await supabase
    .from("units")
    .update({ photo_url: publicUrl })
    .eq("id", unitId)
    .eq("business_id", businessId)

  if (updateError) return { ok: false, error: "La imagen se subió pero no se pudo guardar" }

  revalidatePath("/panel/trucks")
  return { ok: true, publicUrl }
}

export async function removeUnitPhoto(unitId: string): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("units")
    .update({ photo_url: null })
    .eq("id", unitId)
    .eq("business_id", businessId)

  if (error) return { ok: false, error: "No se pudo quitar la foto" }
  revalidatePath("/panel/trucks")
  return { ok: true }
}
