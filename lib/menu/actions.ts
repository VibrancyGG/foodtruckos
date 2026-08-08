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

// Sin fila en unit_products, un platillo se trata como ofrecido y no
// agotado (así funcionan los que ya existían antes de que hubiera varios
// trucks, o antes de que se diera de alta un truck nuevo). Por eso estas dos
// acciones hacen upsert por (unit_id, product_id) en vez de exigir un id de
// fila que puede no existir todavía — si el dueño toca el switch, la fila se
// crea en ese momento con el valor que acaba de elegir.
export async function toggleSoldOut(input: {
  productId: string
  unitId: string
  soldOut: boolean
}): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("unit_products")
    .upsert(
      { business_id: businessId, unit_id: input.unitId, product_id: input.productId, sold_out: input.soldOut },
      { onConflict: "unit_id,product_id" },
    )

  if (error) return { ok: false, error: "No se pudo actualizar" }
  revalidatePath("/panel/menu")
  return { ok: true }
}

// Exclusividad por truck: el menú es compartido por default, y el dueño
// apaga is_offered en los trucks donde ESE platillo no aplica — no es lo
// mismo que "se acabó" (sold_out), que se revierte solo y no cambia el menú
// base.
export async function toggleOffered(input: {
  productId: string
  unitId: string
  isOffered: boolean
}): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("unit_products")
    .upsert(
      { business_id: businessId, unit_id: input.unitId, product_id: input.productId, is_offered: input.isOffered },
      { onConflict: "unit_id,product_id" },
    )

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

// Grupos y opciones de personalización ("¿le agregamos algo?" / "¿le
// quitamos algo?") — configuración de menú, no historial de pedidos: un
// pedido ya hecho guarda su propia copia en order_items.customizations_snapshot
// (Regla 2), así que borrar un grupo u opción de aquí nunca corrompe un
// pedido pasado.

export async function createOptionGroup(input: {
  productId: string
  nameEs: string
  nameEn: string
  required: boolean
  minSelect: number
  maxSelect: number
}): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }
  if (!input.nameEs.trim() || !input.nameEn.trim()) return { ok: false, error: "Falta el nombre" }

  const supabase = await createClient()
  const { count } = await supabase
    .from("product_option_groups")
    .select("id", { count: "exact", head: true })
    .eq("product_id", input.productId)

  const { error } = await supabase.from("product_option_groups").insert({
    business_id: businessId,
    product_id: input.productId,
    group_name_es: input.nameEs,
    group_name_en: input.nameEn,
    required: input.required,
    min_select: input.minSelect,
    max_select: input.maxSelect,
    sort_order: count ?? 0,
  })

  if (error) return { ok: false, error: "No se pudo crear el grupo" }
  revalidatePath("/panel/menu")
  return { ok: true }
}

export async function deleteOptionGroup(groupId: string): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("product_option_groups")
    .delete()
    .eq("id", groupId)
    .eq("business_id", businessId)

  if (error) return { ok: false, error: "No se pudo eliminar" }
  revalidatePath("/panel/menu")
  return { ok: true }
}

export async function createOption(input: {
  groupId: string
  nameEs: string
  nameEn: string
  priceDelta: number
  kind: "add" | "remove"
}): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }
  if (!input.nameEs.trim() || !input.nameEn.trim()) return { ok: false, error: "Falta el nombre" }

  const supabase = await createClient()
  const { count } = await supabase
    .from("product_options")
    .select("id", { count: "exact", head: true })
    .eq("group_id", input.groupId)

  const { error } = await supabase.from("product_options").insert({
    business_id: businessId,
    group_id: input.groupId,
    option_name_es: input.nameEs,
    option_name_en: input.nameEn,
    price_delta: input.kind === "remove" ? 0 : input.priceDelta,
    kind: input.kind,
    sort_order: count ?? 0,
  })

  if (error) return { ok: false, error: "No se pudo crear la opción" }
  revalidatePath("/panel/menu")
  return { ok: true }
}

export async function deleteOption(optionId: string): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("product_options")
    .delete()
    .eq("id", optionId)
    .eq("business_id", businessId)

  if (error) return { ok: false, error: "No se pudo eliminar" }
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
