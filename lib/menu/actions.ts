"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getOwnerContext } from "@/lib/auth/dal"

type Result = { ok: true } | { ok: false; error: string }

export async function updateProduct(input: {
  productId: string
  nameEs: string
  nameEn: string
  price: number
}): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }
  if (!input.nameEs.trim() || !input.nameEn.trim()) return { ok: false, error: "Falta el nombre" }
  if (!(input.price > 0)) return { ok: false, error: "El precio debe ser mayor a cero" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("products")
    .update({ name_es: input.nameEs, name_en: input.nameEn, price: input.price })
    .eq("id", input.productId)
    .eq("business_id", businessId)

  if (error) return { ok: false, error: "No se pudo guardar" }
  revalidatePath("/panel/menu")
  return { ok: true }
}

// "Retirar" es permanente en el sentido de que ya no se puede ordenar — pero
// nunca se borra el registro (foodtruckos-datos Regla 2), así que los pedidos
// pasados siguen mostrando este platillo tal como era. Es una decisión
// distinta de "se acabó hoy" (unit_products.sold_out), que se revierte solo.
export async function retireProduct(productId: string): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("products")
    .update({ status: "retired" })
    .eq("id", productId)
    .eq("business_id", businessId)

  if (error) return { ok: false, error: "No se pudo quitar del menú" }
  revalidatePath("/panel/menu")
  return { ok: true }
}

export async function toggleSoldOut(input: {
  unitProductId: string
  soldOut: boolean
}): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("unit_products")
    .update({ sold_out: input.soldOut })
    .eq("id", input.unitProductId)
    .eq("business_id", businessId)

  if (error) return { ok: false, error: "No se pudo actualizar" }
  revalidatePath("/panel/menu")
  return { ok: true }
}

export async function createCategory(input: {
  nameEs: string
  nameEn: string
}): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }
  if (!input.nameEs.trim() || !input.nameEn.trim()) return { ok: false, error: "Falta el nombre" }

  const supabase = await createClient()
  const { count } = await supabase
    .from("menu_categories")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)

  const { error } = await supabase.from("menu_categories").insert({
    business_id: businessId,
    name_es: input.nameEs,
    name_en: input.nameEn,
    sort_order: count ?? 0,
  })

  if (error) return { ok: false, error: "No se pudo crear la categoría" }
  revalidatePath("/panel/menu")
  return { ok: true }
}

// Un platillo nuevo se ofrece en todos los trucks del negocio por default —
// "menú base compartido, con posibilidad de exclusivo por truck" (brief) —
// el dueño desactiva unit_products.is_offered después si quiere excluirlo
// de una unidad específica; no se le pide elegir truck por truck al crearlo.
export async function createProduct(input: {
  categoryId: string
  nameEs: string
  nameEn: string
  price: number
}): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }
  if (!input.nameEs.trim() || !input.nameEn.trim()) return { ok: false, error: "Falta el nombre" }
  if (!(input.price > 0)) return { ok: false, error: "El precio debe ser mayor a cero" }

  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      business_id: businessId,
      category_id: input.categoryId,
      name_es: input.nameEs,
      name_en: input.nameEn,
      price: input.price,
    })
    .select("id")
    .single()

  if (error || !product) return { ok: false, error: "No se pudo crear el platillo" }

  const { data: units } = await supabase.from("units").select("id").eq("business_id", businessId)
  if (units && units.length > 0) {
    await supabase
      .from("unit_products")
      .insert(units.map((u) => ({ business_id: businessId, unit_id: u.id, product_id: product.id })))
  }

  revalidatePath("/panel/menu")
  return { ok: true }
}

type UploadResult = { ok: false; error: string } | { ok: true; publicUrl: string }

export async function uploadProductPhoto(
  productId: string,
  formData: FormData,
): Promise<UploadResult> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const file = formData.get("file") as File | null
  if (!file || file.size === 0) return { ok: false, error: "Elige una imagen" }

  const supabase = await createClient()
  const ext = file.name.split(".").pop() || "webp"
  const path = `${businessId}/products/${productId}-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("business-media")
    .upload(path, file, { contentType: file.type })
  if (uploadError) return { ok: false, error: "No se pudo subir la imagen" }

  const {
    data: { publicUrl },
  } = supabase.storage.from("business-media").getPublicUrl(path)

  const { error: updateError } = await supabase
    .from("products")
    .update({ photo_url: publicUrl })
    .eq("id", productId)
    .eq("business_id", businessId)

  if (updateError) return { ok: false, error: "La imagen se subió pero no se pudo guardar" }

  revalidatePath("/panel/menu")
  return { ok: true, publicUrl }
}
