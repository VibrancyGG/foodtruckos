"use server"

import { createPublicClient } from "@/lib/supabase/public"
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
export type CreateOrderErrorCode = "emptyCart" | "verifyFailed" | "unavailable" | "paused" | "closed" | "sendFailed" | "badCart"

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

  // Cliente sin cookies: el pedido del comensal no debe depender de si ese
  // celular trae una sesión encima, vigente o vencida.
  const supabase = createPublicClient()

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
    // Un carrito guardado en el celular puede venir de una versión anterior de
    // la pantalla y traer un dato faltante. Sin esta defensa, ese dato produce
    // NaN, NaN viaja como null, y la columna NOT NULL rechaza la inserción: el
    // comensal ve "revisa tu conexión" para siempre, porque el carrito malo
    // sigue guardado y se restaura en cada intento.
    const optionsDelta = item.customizations.reduce(
      (s, c) => s + (Number.isFinite(c.priceDelta) ? c.priceDelta : 0),
      0,
    )
    const lineTotal = Math.round((item.unitPrice + optionsDelta) * item.quantity * 100) / 100
    return { ...item, lineTotal }
  })

  // El precio sí se exige válido: dar por bueno un cero aquí regalaría comida.
  if (lines.some((l) => !Number.isFinite(l.lineTotal))) {
    console.error("[createOrder] carrito con importes inválidos", JSON.stringify(input.items))
    return { error: "badCart" }
  }

  const subtotal = Math.round(lines.reduce((s, l) => s + l.lineTotal, 0) * 100) / 100
  const taxAmount = input.taxIncluded ? 0 : Math.round(subtotal * TAX_RATE * 100) / 100
  const total = Math.round((subtotal + taxAmount) * 100) / 100

  if (!Number.isFinite(subtotal) || !Number.isFinite(taxAmount) || !Number.isFinite(total)) {
    console.error("[createOrder] totales inválidos", { subtotal, taxAmount, total })
    return { error: "badCart" }
  }

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
    // Sin esto, cualquier motivo —una regla de seguridad, una columna que no
    // admite nulos, un dato fuera de rango— se le presenta al comensal como
    // "revisa tu conexión", y desde fuera es imposible saber qué pasó. Cuando
    // falló en producción nos costó horas de diagnóstico a ciegas.
    console.error("[createOrder] no se pudo crear el pedido", {
      motivo: orderError?.message,
      codigo: orderError?.code,
      detalle: orderError?.details,
      businessId: input.businessId,
      unitId: input.unitId,
      orderPointId: input.orderPointId,
      subtotal,
      total,
    })
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
    console.error("[createOrder] no se pudieron guardar los platillos", {
      motivo: itemsError.message,
      codigo: itemsError.code,
      detalle: itemsError.details,
      orderId: order.id,
    })
    // El pedido ya existe sin líneas: se intenta cancelar para que nadie en
    // cocina lo prepare vacío. Ojo — el comensal no tiene permiso de cambiar
    // pedidos (y no debe tenerlo), así que esta limpieza puede no pasar. Se
    // registra si falla en vez de darla por hecha: una orden vacía colgada en
    // el tablero confunde a la cocina y hay que poder detectarla.
    const { error: cancelError } = await supabase
      .from("orders")
      .update({ status: "cancelado" })
      .eq("id", order.id)
    if (cancelError) {
      console.error("[createOrder] quedó un pedido vacío sin cancelar", {
        orderId: order.id,
        motivo: cancelError.message,
      })
    }
    return { error: "sendFailed" }
  }

  if (!order.folio) {
    return { error: "sendFailed" }
  }

  return { orderId: order.id, folio: order.folio }
}
