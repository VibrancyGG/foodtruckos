"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getOwnerContext } from "@/lib/auth/dal"

// El business_id SIEMPRE sale de la sesión (getOwnerContext), nunca de lo que
// mande el formulario — RLS igual lo bloquearía, pero no hay razón para
// confiar en un id que viene del cliente cuando ya sabemos quién es.
type UploadResult = { ok: false; error: string } | { ok: true; publicUrl: string }

export async function uploadLogo(formData: FormData): Promise<UploadResult> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const file = formData.get("file") as File | null
  if (!file || file.size === 0) return { ok: false, error: "Elige una imagen" }

  const supabase = await createClient()
  const ext = file.name.split(".").pop() || "webp"
  const path = `${businessId}/branding/logo-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("business-media")
    .upload(path, file, { contentType: file.type })

  if (uploadError) return { ok: false, error: "No se pudo subir la imagen" }

  const {
    data: { publicUrl },
  } = supabase.storage.from("business-media").getPublicUrl(path)

  const { error: updateError } = await supabase
    .from("businesses")
    .update({ logo_url: publicUrl })
    .eq("id", businessId)

  if (updateError) return { ok: false, error: "La imagen se subió pero no se pudo guardar" }

  revalidatePath("/panel")
  return { ok: true, publicUrl }
}

export async function saveBrandSettings(input: {
  brandColor: string
  menuStyle: "vibrante" | "tradicional"
  brandMotif: string
  headerStyle: "color" | "black"
}): Promise<{ ok: boolean; error?: string }> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("businesses")
    .update({
      brand_color: input.brandColor,
      menu_style: input.menuStyle,
      brand_motif: input.brandMotif,
      header_style: input.headerStyle,
    })
    .eq("id", businessId)

  if (error) return { ok: false, error: "No se pudo guardar" }

  revalidatePath("/panel")
  revalidatePath("/[businessSlug]/[unitSlug]/[qrSlug]", "page")
  return { ok: true }
}

// Excepción, no una decisión que todos tengan que tomar: normalmente los
// trucks comparten el color del negocio (units.brand_color = null hereda).
// Solo si alguno opera con otra marca se le da un color propio aquí.
export async function updateUnitBrandColor(input: {
  unitId: string
  brandColor: string | null
}): Promise<{ ok: boolean; error?: string }> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("units")
    .update({ brand_color: input.brandColor })
    .eq("id", input.unitId)
    .eq("business_id", businessId)

  if (error) return { ok: false, error: "No se pudo guardar" }

  revalidatePath("/panel")
  revalidatePath("/[businessSlug]/[unitSlug]/[qrSlug]", "page")
  return { ok: true }
}
