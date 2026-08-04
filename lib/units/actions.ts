"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getOwnerContext } from "@/lib/auth/dal"

type Result = { ok: true } | { ok: false; error: string }

export async function updateUnit(input: {
  unitId: string
  name: string
  kitchenAlertMinutes: number
}): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }
  if (!input.name.trim()) return { ok: false, error: "Falta el nombre" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("units")
    .update({ name: input.name, kitchen_alert_minutes: input.kitchenAlertMinutes })
    .eq("id", input.unitId)
    .eq("business_id", businessId)

  if (error) return { ok: false, error: "No se pudo guardar" }
  revalidatePath("/panel/trucks")
  return { ok: true }
}

// Pausa temporal, con reapertura automática (decisión de producto ya tomada).
// pausedUntil=null pausa indefinido, hasta que el dueño reabra a mano.
export async function pauseUnit(input: {
  unitId: string
  pausedUntil: string | null
}): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("units")
    .update({ status: "paused", paused_until: input.pausedUntil })
    .eq("id", input.unitId)
    .eq("business_id", businessId)

  if (error) return { ok: false, error: "No se pudo pausar" }
  revalidatePath("/panel/trucks")
  return { ok: true }
}

export async function reopenUnit(unitId: string): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("units")
    .update({ status: "active", paused_until: null })
    .eq("id", unitId)
    .eq("business_id", businessId)

  if (error) return { ok: false, error: "No se pudo reabrir" }
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
