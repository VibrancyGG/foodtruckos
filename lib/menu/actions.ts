"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getOwnerContext } from "@/lib/auth/dal"

type Result = { ok: true } | { ok: false; error: string }

export async function updateProduct(input: {
  productId: string
  nameEs: string
  nameEn: string
  descriptionEs: string
  descriptionEn: string
  price: number
  categoryId: string
}): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }
  if (!input.nameEs.trim() || !input.nameEn.trim()) return { ok: false, error: "Falta el nombre" }
  if (!(input.price > 0)) return { ok: false, error: "El precio debe ser mayor a cero" }
  if (!input.categoryId) return { ok: false, error: "Elige una categoría" }

  const supabase = await createClient()

  // Se lee el precio anterior antes de sobrescribirlo — sin esto, el registro
  // de auditoría solo diría "se cambió el precio", no cuánto era antes
  // (foodtruckos-datos: auditar modificaciones en precios).
  const { data: before } = await supabase
    .from("products")
    .select("name_es, price")
    .eq("id", input.productId)
    .eq("business_id", businessId)
    .maybeSingle()

  const { error } = await supabase
    .from("products")
    .update({
      name_es: input.nameEs,
      name_en: input.nameEn,
      description_es: input.descriptionEs.trim() || null,
      description_en: input.descriptionEn.trim() || null,
      price: input.price,
      category_id: input.categoryId,
    })
    .eq("id", input.productId)
    .eq("business_id", businessId)

  if (error) return { ok: false, error: "No se pudo guardar" }

  if (before && before.price !== input.price) {
    await supabase.rpc("log_owner_action", {
      p_business_id: businessId,
      p_action: "product_price_changed",
      p_entity_type: "product",
      p_entity_id: input.productId,
      p_before: { name: before.name_es, price: before.price },
      p_after: { name: input.nameEs, price: input.price },
    })
  }

  revalidatePath("/panel/menu")
  revalidatePath("/[businessSlug]/[unitSlug]/[qrSlug]", "page")
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

  await supabase.rpc("log_owner_action", {
    p_business_id: businessId,
    p_action: "product_retired",
    p_entity_type: "product",
    p_entity_id: productId,
  })

  revalidatePath("/panel/menu")
  revalidatePath("/[businessSlug]/[unitSlug]/[qrSlug]", "page")
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

// "Se acabó hoy" puede tocar varios trucks a la vez cuando el dueño está
// viendo "Todos los trucks" — un solo interruptor, pero afecta a cada truck
// que sí vende ese platillo (nunca a uno que ya lo tiene excluido).
export async function setSoldOutForUnits(input: {
  productId: string
  soldOut: boolean
  unitIds: string[]
}): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }
  if (input.unitIds.length === 0) return { ok: true }

  const supabase = await createClient()
  const { error } = await supabase
    .from("unit_products")
    .upsert(
      input.unitIds.map((unitId) => ({
        business_id: businessId,
        unit_id: unitId,
        product_id: input.productId,
        sold_out: input.soldOut,
      })),
      { onConflict: "unit_id,product_id" },
    )

  if (error) return { ok: false, error: "No se pudo actualizar" }
  revalidatePath("/panel/menu")
  revalidatePath("/[businessSlug]/[unitSlug]/[qrSlug]", "page")
  return { ok: true }
}

// Exclusividad: como en el prototipo, es una elección única — "Todos" o
// "Solo un truck", nunca un subconjunto arbitrario. exclusiveUnitId=null
// vuelve a ofrecerlo en todos (borra las exclusiones); si se pasa un id,
// ese truck queda con is_offered=true (o sin fila, que es lo mismo) y todos
// los demás quedan en false.
export async function setProductExclusivity(input: {
  productId: string
  businessUnitIds: string[]
  exclusiveUnitId: string | null
}): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()

  if (input.exclusiveUnitId === null) {
    const { error } = await supabase
      .from("unit_products")
      .update({ is_offered: true })
      .eq("business_id", businessId)
      .eq("product_id", input.productId)
    if (error) return { ok: false, error: "No se pudo actualizar" }
  } else {
    const rows = input.businessUnitIds.map((unitId) => ({
      business_id: businessId,
      unit_id: unitId,
      product_id: input.productId,
      is_offered: unitId === input.exclusiveUnitId,
    }))
    const { error } = await supabase
      .from("unit_products")
      .upsert(rows, { onConflict: "unit_id,product_id" })
    if (error) return { ok: false, error: "No se pudo actualizar" }
  }

  revalidatePath("/panel/menu")
  revalidatePath("/[businessSlug]/[unitSlug]/[qrSlug]", "page")
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
  revalidatePath("/[businessSlug]/[unitSlug]/[qrSlug]", "page")
  return { ok: true }
}

export async function updateCategory(input: {
  categoryId: string
  nameEs: string
  nameEn: string
}): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }
  if (!input.nameEs.trim() || !input.nameEn.trim()) return { ok: false, error: "Falta el nombre" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("menu_categories")
    .update({ name_es: input.nameEs, name_en: input.nameEn })
    .eq("id", input.categoryId)
    .eq("business_id", businessId)

  if (error) return { ok: false, error: "No se pudo guardar" }
  revalidatePath("/panel/menu")
  revalidatePath("/[businessSlug]/[unitSlug]/[qrSlug]", "page")
  return { ok: true }
}

export async function deleteCategory(categoryId: string): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  // Solo cuenta platillos activos — uno retirado ya no aparece en el Menú del
  // dueño (getOwnerMenu.ts filtra por status="active"), así que contarlo aquí
  // bloqueaba borrar una categoría que en pantalla se ve vacía.
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", categoryId)
    .eq("business_id", businessId)
    .eq("status", "active")

  if (count && count > 0) return { ok: false, error: "Esta categoría tiene platillos — muévelos antes de eliminarla" }

  const { error } = await supabase
    .from("menu_categories")
    .delete()
    .eq("id", categoryId)
    .eq("business_id", businessId)

  if (error) return { ok: false, error: "No se pudo eliminar" }
  revalidatePath("/panel/menu")
  revalidatePath("/[businessSlug]/[unitSlug]/[qrSlug]", "page")
  return { ok: true }
}

// Un platillo nuevo se ofrece en todos los trucks del negocio por default —
// "menú base compartido, con posibilidad de exclusivo por truck" (brief) —
// salvo que el dueño ya elija "Solo Truck X" al crearlo, en cuyo caso queda
// excluido de los demás desde el primer momento.
type CreateProductResult = { ok: false; error: string } | { ok: true; productId: string }

export async function createProduct(input: {
  categoryId: string
  nameEs: string
  nameEn: string
  descriptionEs: string
  descriptionEn: string
  price: number
  exclusiveUnitId: string | null
}): Promise<CreateProductResult> {
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
      description_es: input.descriptionEs.trim() || null,
      description_en: input.descriptionEn.trim() || null,
      price: input.price,
    })
    .select("id")
    .single()

  if (error || !product) return { ok: false, error: "No se pudo crear el platillo" }

  await supabase.rpc("log_owner_action", {
    p_business_id: businessId,
    p_action: "product_created",
    p_entity_type: "product",
    p_entity_id: product.id,
    p_after: { name: input.nameEs, price: input.price },
  })

  // Todo platillo nuevo ya trae listos los dos grupos que casi siempre se
  // usan — "le agregamos algo" / "le quitamos algo" — vacíos de opciones,
  // para que el dueño solo tenga que llenarlos una vez por platillo en vez
  // de teclear el mismo nombre de grupo cada vez (evitar carga manual
  // repetitiva cuando el patrón es el mismo en todos los productos).
  await supabase.from("product_option_groups").insert([
    {
      business_id: businessId,
      product_id: product.id,
      group_name_es: "¿Le agregamos algo?",
      group_name_en: "Add anything?",
      required: false,
      min_select: 0,
      max_select: 3,
      sort_order: 0,
    },
    {
      business_id: businessId,
      product_id: product.id,
      group_name_es: "¿Le quitamos algo?",
      group_name_en: "Take anything off?",
      required: false,
      min_select: 0,
      max_select: 3,
      sort_order: 1,
    },
  ])

  const { data: units } = await supabase.from("units").select("id").eq("business_id", businessId).neq("status", "archived")
  if (units && units.length > 0) {
    await supabase.from("unit_products").insert(
      units.map((u) => ({
        business_id: businessId,
        unit_id: u.id,
        product_id: product.id,
        is_offered: input.exclusiveUnitId === null || u.id === input.exclusiveUnitId,
      })),
    )
  }

  revalidatePath("/panel/menu")
  revalidatePath("/[businessSlug]/[unitSlug]/[qrSlug]", "page")
  return { ok: true, productId: product.id }
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
  kind: "add" | "remove"
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
    kind: input.kind,
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

// El kind de la opción siempre lo hereda del grupo — nunca lo decide el
// cliente — así un grupo de "quitar" no puede terminar con una opción que
// cobra, ni uno de "agregar" con una que aparece como "quitar".
export async function createOption(input: {
  groupId: string
  nameEs: string
  nameEn: string
  priceDelta: number
}): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }
  if (!input.nameEs.trim() || !input.nameEn.trim()) return { ok: false, error: "Falta el nombre" }

  const supabase = await createClient()
  const { data: group } = await supabase
    .from("product_option_groups")
    .select("kind")
    .eq("id", input.groupId)
    .eq("business_id", businessId)
    .maybeSingle()
  if (!group) return { ok: false, error: "No se encontró el grupo" }

  const { count } = await supabase
    .from("product_options")
    .select("id", { count: "exact", head: true })
    .eq("group_id", input.groupId)

  const { error } = await supabase.from("product_options").insert({
    business_id: businessId,
    group_id: input.groupId,
    option_name_es: input.nameEs,
    option_name_en: input.nameEn,
    price_delta: group.kind === "remove" ? 0 : input.priceDelta,
    kind: group.kind,
    sort_order: count ?? 0,
  })

  if (error) return { ok: false, error: "No se pudo crear la opción" }
  revalidatePath("/panel/menu")
  return { ok: true }
}

export async function updateOption(input: {
  optionId: string
  nameEs: string
  nameEn: string
  priceDelta: number
}): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }
  if (!input.nameEs.trim() || !input.nameEn.trim()) return { ok: false, error: "Falta el nombre" }

  const supabase = await createClient()
  const { data: existing } = await supabase
    .from("product_options")
    .select("group_id, product_option_groups!inner(kind)")
    .eq("id", input.optionId)
    .eq("business_id", businessId)
    .maybeSingle()
  if (!existing) return { ok: false, error: "No se encontró la opción" }
  const groupKind = (existing.product_option_groups as unknown as { kind: "add" | "remove" }).kind

  const { error } = await supabase
    .from("product_options")
    .update({
      option_name_es: input.nameEs,
      option_name_en: input.nameEn,
      price_delta: groupKind === "remove" ? 0 : input.priceDelta,
      kind: groupKind,
    })
    .eq("id", input.optionId)
    .eq("business_id", businessId)

  if (error) return { ok: false, error: "No se pudo guardar" }
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
  revalidatePath("/[businessSlug]/[unitSlug]/[qrSlug]", "page")
  return { ok: true, publicUrl }
}
