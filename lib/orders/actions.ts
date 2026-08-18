"use server"

import { createClient } from "@/lib/supabase/server"
import { isOpenNow, parseWeeklyHours } from "@/lib/units/hours"
import { accessBlocked } from "@/lib/billing/trial"

const TAX_RATE = 0.08625 // Norman, Oklahoma — mover a configuración por negocio cuando haya más de un estado.

export type CartItemInput = {
  productId: string
  quantity: number
  unitPrice: number // precio del producto + deltas de personalización ya sumados, calculado en el cliente para mostrarlo, pero SIEMPRE se recalcula aquí antes de guardar
  productName: string
  customizations: { groupName: string; optionName: string; priceDelta: number; kind: "add" | "remove" }[]
  notes?: string
}

// Códigos, no texto: el mensaje real que ve el comensal se arma del lado del
// cliente con el diccionario bilingüe (t.menu.orderError.*), según el idioma
// que tenga activo en ese momento — el servidor no sabe en qué idioma está
// viendo la pantalla quien pidió.
export type CreateOrderErrorCode = "emptyCart" | "verifyFailed" | "unavailable" | "paused" | "closed" | "sendFailed"

export async function createOrder(input: {
  businessId: string
  unitId: string
  orderPointId: string
  taxIncluded: boolean
  customerName?: string
  items: CartItemInput[]
}): Promise<{ orderId: string; folio: number } | { error: CreateOrderErrorCode }> {
  if (input.items.length === 0) {
    return { error: "emptyCart" }
  }

  const supabase = await createClient()

  // Nunca se confía en que la pantalla del comensal esté al día — pudo cargar
  // el menú minutos antes de que el truck cerrara o se pausara. El servidor
  // vuelve a comprobar horario/pausa/suspensión justo antes de insertar,
  // igual que ya recalcula el precio en vez de confiar en lo que mandó el
  // navegador.
  const [{ data: unit }, { data: business }] = await Promise.all([
    supabase.from("units").select("status, hours, paused_until").eq("id", input.unitId).single(),
    supabase
      .from("businesses")
      .select("timezone, subscription_status, trial_ends_at")
      .eq("id", input.businessId)
      .single(),
  ])

  if (!unit || !business) {
    return { error: "verifyFailed" }
  }
  // Mismo criterio que el menú: prueba vencida bloquea igual que suspensión.
  // Esta es la última puerta antes de insertar, así que aunque alguien tuviera
  // el menú abierto de antes, el pedido no entra.
  if (accessBlocked(business.subscription_status, business.trial_ends_at) || unit.status === "archived") {
    return { error: "unavailable" }
  }
  if (unit.status === "paused") {
    const stillPaused = !unit.paused_until || new Date(unit.paused_until) > new Date()
    if (stillPaused) return { error: "paused" }
  }
  const openStatus = isOpenNow(parseWeeklyHours(unit.hours), business.timezone)
  if (!openStatus.open) {
    return { error: "closed" }
  }

  // El precio de línea se recalcula aquí, del lado del servidor, a partir de lo
  // que el cliente mandó como personalización — nunca se confía en un total
  // armado en el navegador, aunque RLS ya bloquee cruzar de negocio.
  const lines = input.items.map((item) => {
    const optionsDelta = item.customizations.reduce((s, c) => s + c.priceDelta, 0)
    const lineUnitPrice = item.unitPrice
    const lineTotal = Math.round((lineUnitPrice + optionsDelta) * item.quantity * 100) / 100
    return { ...item, lineTotal }
  })

  const subtotal = Math.round(lines.reduce((s, l) => s + l.lineTotal, 0) * 100) / 100
  const taxAmount = input.taxIncluded ? 0 : Math.round(subtotal * TAX_RATE * 100) / 100
  const total = Math.round((subtotal + taxAmount) * 100) / 100

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      business_id: input.businessId,
      unit_id: input.unitId,
      order_point_id: input.orderPointId,
      channel: "qr",
      status: "recibido",
      payment_status: "pendiente",
      customer_name: input.customerName || null,
      subtotal,
      tax_amount: taxAmount,
      tax_included_snapshot: input.taxIncluded,
      total,
    })
    .select("id, folio")
    .single()

  if (orderError || !order) {
    return { error: "sendFailed" }
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    lines.map((l) => ({
      business_id: input.businessId,
      order_id: order.id,
      product_id: l.productId,
      product_name_snapshot: l.productName,
      unit_price_snapshot: l.unitPrice,
      quantity: l.quantity,
      customizations_snapshot: l.customizations,
      line_total: l.lineTotal,
      notes: l.notes || null,
    })),
  )

  if (itemsError) {
    // El pedido ya existe sin líneas — no lo dejamos así de silencio; se marca
    // cancelado para que nadie en cocina lo prepare vacío por error.
    await supabase.from("orders").update({ status: "cancelado" }).eq("id", order.id)
    return { error: "sendFailed" }
  }

  if (!order.folio) {
    return { error: "sendFailed" }
  }

  return { orderId: order.id, folio: order.folio }
}
