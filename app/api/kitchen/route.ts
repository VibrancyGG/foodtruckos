import { NextRequest, NextResponse } from "next/server"
import { resolveUnitByToken } from "@/lib/kitchen/resolveUnit"
import { createServiceClient } from "@/lib/supabase/service"

// Único punto de la rebanada que usa la llave de servicio, y solo del lado
// del servidor (Route Handler, nunca en el navegador). Existe porque cocina
// no tiene autenticación real todavía (units.kitchen_access_token es un
// parche temporal) — ver TODO(auth-phase) en resolveUnit.ts.
// El token SIEMPRE se vuelve a resolver aquí; nunca se confía en business_id/
// unit_id que mande el cliente.

const NEXT: Record<string, string> = { recibido: "preparando", preparando: "listo" }
const TAX_RATE = 0.08625

type Body =
  | { action: "advance"; token: string; orderId: string }
  | { action: "deliver"; token: string; orderId: string; paid: boolean }
  | { action: "soldOut"; token: string; unitProductId: string; soldOut: boolean }
  | {
      action: "ventanilla"
      token: string
      taxIncluded: boolean
      paidNow: boolean
      items: { productId: string; productName: string; quantity: number; unitPrice: number; notes?: string }[]
    }

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Body
  const unit = await resolveUnitByToken(body.token)
  if (!unit) {
    return NextResponse.json({ error: "Token de cocina inválido o unidad archivada" }, { status: 401 })
  }

  const supabase = createServiceClient()

  if (body.action === "advance") {
    const { data: order } = await supabase
      .from("orders")
      .select("id, status, unit_id")
      .eq("id", body.orderId)
      .eq("unit_id", unit.id) // nunca se confía en que el pedido sea de esta unidad sin comprobarlo
      .maybeSingle()
    if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })

    const to = NEXT[order.status]
    if (!to) return NextResponse.json({ error: "Ese pedido no puede avanzar así" }, { status: 400 })

    await supabase.from("orders").update({ status: to }).eq("id", order.id)
    await supabase.from("order_status_events").insert({
      business_id: unit.business_id,
      order_id: order.id,
      from_status: order.status,
      to_status: to,
      actor_type: "staff",
    })
    return NextResponse.json({ status: to })
  }

  if (body.action === "deliver") {
    const { data: order } = await supabase
      .from("orders")
      .select("id, status, unit_id")
      .eq("id", body.orderId)
      .eq("unit_id", unit.id)
      .maybeSingle()
    if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })

    await supabase
      .from("orders")
      .update({ status: "entregado", payment_status: body.paid ? "pagada" : "pendiente" })
      .eq("id", order.id)
    await supabase.from("order_status_events").insert({
      business_id: unit.business_id,
      order_id: order.id,
      from_status: order.status,
      to_status: "entregado",
      actor_type: "staff",
    })
    return NextResponse.json({ status: "entregado" })
  }

  if (body.action === "soldOut") {
    const { error } = await supabase
      .from("unit_products")
      .update({ sold_out: body.soldOut })
      .eq("id", body.unitProductId)
      .eq("unit_id", unit.id)
    if (error) return NextResponse.json({ error: "No se pudo actualizar" }, { status: 400 })
    return NextResponse.json({ ok: true })
  }

  if (body.action === "ventanilla") {
    if (body.items.length === 0) {
      return NextResponse.json({ error: "El pedido está vacío" }, { status: 400 })
    }
    const subtotal = Math.round(body.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) * 100) / 100
    const taxAmount = body.taxIncluded ? 0 : Math.round(subtotal * TAX_RATE * 100) / 100
    const total = Math.round((subtotal + taxAmount) * 100) / 100

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        business_id: unit.business_id,
        unit_id: unit.id,
        channel: "ventanilla",
        status: "recibido",
        payment_status: body.paidNow ? "pagada" : "pendiente",
        subtotal,
        tax_amount: taxAmount,
        tax_included_snapshot: body.taxIncluded,
        total,
      })
      .select("id, folio")
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "No se pudo crear el pedido" }, { status: 400 })
    }

    await supabase.from("order_items").insert(
      body.items.map((i) => ({
        business_id: unit.business_id,
        order_id: order.id,
        product_id: i.productId,
        product_name_snapshot: i.productName,
        unit_price_snapshot: i.unitPrice,
        quantity: i.quantity,
        customizations_snapshot: [],
        line_total: Math.round(i.unitPrice * i.quantity * 100) / 100,
        notes: i.notes || null,
      })),
    )

    return NextResponse.json({ orderId: order.id, folio: order.folio })
  }

  return NextResponse.json({ error: "Acción desconocida" }, { status: 400 })
}
