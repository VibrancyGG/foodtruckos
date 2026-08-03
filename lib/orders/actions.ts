"use server"

import { createClient } from "@/lib/supabase/server"

const TAX_RATE = 0.08625 // Norman, Oklahoma — mover a configuración por negocio cuando haya más de un estado.

export type CartItemInput = {
  productId: string
  quantity: number
  unitPrice: number // precio del producto + deltas de personalización ya sumados, calculado en el cliente para mostrarlo, pero SIEMPRE se recalcula aquí antes de guardar
  productName: string
  customizations: { groupName: string; optionName: string; priceDelta: number; kind: "add" | "remove" }[]
  notes?: string
}

export async function createOrder(input: {
  businessId: string
  unitId: string
  orderPointId: string
  taxIncluded: boolean
  customerName?: string
  items: CartItemInput[]
}): Promise<{ orderId: string; folio: number } | { error: string }> {
  if (input.items.length === 0) {
    return { error: "El carrito está vacío" }
  }

  const supabase = await createClient()

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
    return { error: "No pudimos enviar tu pedido. Revisa tu conexión e intenta otra vez" }
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
    return { error: "No pudimos enviar tu pedido. Revisa tu conexión e intenta otra vez" }
  }

  if (!order.folio) {
    return { error: "No pudimos enviar tu pedido. Revisa tu conexión e intenta otra vez" }
  }

  return { orderId: order.id, folio: order.folio }
}
