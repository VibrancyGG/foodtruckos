"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getOwnerContext } from "@/lib/auth/dal"

// El business_id SIEMPRE sale de la sesión (getOwnerContext), nunca de lo que
// mande el formulario — RLS igual lo bloquearía, pero no hay razón para
// confiar en un id que viene del cliente cuando ya sabemos quién es.
type UploadResult = { ok: false; error: string } | { ok: true; publicUrl: string }

async function uploadBusinessImage(
  formData: FormData,
  kind: "logo" | "cover",
): Promise<UploadResult> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const file = formData.get("file") as File | null
  if (!file || file.size === 0) return { ok: false, error: "Elige una imagen" }

  const supabase = await createClient()
  const ext = file.name.split(".").pop() || "webp"
  const path = `${businessId}/branding/${kind}-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("business-media")
    .upload(path, file, { contentType: file.type })

  if (uploadError) return { ok: false, error: "No se pudo subir la imagen" }

  const {
    data: { publicUrl },
  } = supabase.storage.from("business-media").getPublicUrl(path)

  const { error: updateError } = await supabase
    .from("businesses")
    .update(kind === "logo" ? { logo_url: publicUrl } : { cover_photo_url: publicUrl })
    .eq("id", businessId)

  if (updateError) return { ok: false, error: "La imagen se subió pero no se pudo guardar" }

  revalidatePath("/panel")
  return { ok: true, publicUrl }
}

export async function uploadLogo(formData: FormData) {
  return uploadBusinessImage(formData, "logo")
}

export async function uploadCoverPhoto(formData: FormData) {
  return uploadBusinessImage(formData, "cover")
}

export async function saveBrandSettings(input: {
  brandColor: string
  menuStyle: "vibrante" | "tradicional"
}): Promise<{ ok: boolean; error?: string }> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("businesses")
    .update({ brand_color: input.brandColor, menu_style: input.menuStyle })
    .eq("id", businessId)

  if (error) return { ok: false, error: "No se pudo guardar" }

  revalidatePath("/panel")
  return { ok: true }
}
