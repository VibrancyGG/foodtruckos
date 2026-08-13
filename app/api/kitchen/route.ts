import { NextRequest, NextResponse } from "next/server"
import { verifyStaffSession } from "@/lib/staff/session"
import { DEVICE_COOKIE, STAFF_SESSION_COOKIE, isSameOriginRequest } from "@/lib/staff/http"
import { createServiceClient } from "@/lib/supabase/service"

// Único punto de la rebanada que usa la llave de servicio, y solo del lado
// del servidor (Route Handler, nunca en el navegador). La identidad SIEMPRE
// se resuelve aquí a partir de las cookies de personal (verifyStaffSession);
// nunca se confía en business_id/unit_id que mande el cliente en el body.

const NEXT: Record<string, string> = { recibido: "preparando", preparando: "listo" }
const PREV: Record<string, string> = { preparando: "recibido", listo: "preparando" }
const TAX_RATE = 0.08625

type Body =
  | { action: "advance"; orderId: string; unitId?: string }
  | { action: "regress"; orderId: string; unitId?: string }
  | { action: "deliver"; orderId: string; paid: boolean; paymentMethod?: string; unitId?: string }
  | { action: "cancel"; orderId: string; unitId?: string }
  | { action: "soldOut"; unitProductId: string; soldOut: boolean; unitId?: string }
  | { action: "optionSoldOut"; optionId: string; soldOut: boolean }
  | {
      action: "ventanilla"
      unitId?: string
      taxIncluded: boolean
      paidNow: boolean
      paymentMethod?: string
      orderNotes?: string
      items: {
        productId: string
        productName: string
        quantity: number
        unitPrice: number
        customizations: { groupName: string; optionName: string; priceDelta: number; kind: "add" | "remove" }[]
        notes?: string
      }[]
    }

export async function POST(req: NextRequest) {
  if (!isSameOriginRequest(req)) {
    return NextResponse.json({ error: "Origen no permitido" }, { status: 403 })
  }

  const session = await verifyStaffSession(
    req.cookies.get(DEVICE_COOKIE)?.value,
    req.cookies.get(STAFF_SESSION_COOKIE)?.value,
  )
  if (!session) {
    return NextResponse.json({ error: "Sesión de personal no válida" }, { status: 401 })
  }

  const body = (await req.json()) as Body
  const supabase = createServiceClient()

  // El Encargado es el único rol que puede operar un truck distinto al que
  // trae su dispositivo emparejado (foodtruckos-accesos) — cocina y
  // ventanilla siempre se quedan con el de su sesión, sin importar qué
  // unitId venga en el body, porque su rol verificado no lo permite. El
  // truck "prestado" también se confirma contra la base (mismo negocio),
  // nunca se confía en el id solo porque lo mandó el cliente.
  let resolvedUnitId = session.unitId
  if ("unitId" in body && body.unitId && body.unitId !== session.unitId) {
    if (session.role === "encargado") {
      const { data: targetUnit } = await supabase
        .from("units")
        .select("id")
        .eq("id", body.unitId)
        .eq("business_id", session.businessId)
        .maybeSingle()
      if (targetUnit) resolvedUnitId = targetUnit.id
    }
  }
  const unit = { id: resolvedUnitId, business_id: session.businessId }

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
      actor_id: session.staffId,
    })
    return NextResponse.json({ status: to })
  }

  if (body.action === "regress") {
    const { data: order } = await supabase
      .from("orders")
      .select("id, status, unit_id")
      .eq("id", body.orderId)
      .eq("unit_id", unit.id)
      .maybeSingle()
    if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })

    const to = PREV[order.status]
    if (!to) return NextResponse.json({ error: "Ese pedido no puede regresar" }, { status: 400 })

    await supabase.from("orders").update({ status: to }).eq("id", order.id)
    await supabase.from("order_status_events").insert({
      business_id: unit.business_id,
      order_id: order.id,
      from_status: order.status,
      to_status: to,
      actor_type: "staff",
      actor_id: session.staffId,
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

    // payment_method solo se toca cuando hay un cambio real: al cobrar aquí
    // (paymentMethod viene en el body) o al marcar sin cobrar (se limpia).
    // Una orden que YA venía pagada de ventanilla (paidNow) se entrega sin
    // volver a preguntar el método — no debe perder el que ya se registró.
    await supabase
      .from("orders")
      .update({
        status: "entregado",
        payment_status: body.paid ? "pagada" : "pendiente",
        ...(body.paid ? (body.paymentMethod ? { payment_method: body.paymentMethod } : {}) : { payment_method: null }),
      })
      .eq("id", order.id)
    await supabase.from("order_status_events").insert({
      business_id: unit.business_id,
      order_id: order.id,
      from_status: order.status,
      to_status: "entregado",
      actor_type: "staff",
      actor_id: session.staffId,
    })
    return NextResponse.json({ status: "entregado" })
  }

  if (body.action === "cancel") {
    const { data: order } = await supabase
      .from("orders")
      .select("id, status, unit_id")
      .eq("id", body.orderId)
      .eq("unit_id", unit.id)
      .maybeSingle()
    if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    if (order.status === "entregado" || order.status === "cancelado") {
      return NextResponse.json({ error: "Ese pedido ya no se puede cancelar" }, { status: 400 })
    }

    await supabase.from("orders").update({ status: "cancelado" }).eq("id", order.id)
    await supabase.from("order_status_events").insert({
      business_id: unit.business_id,
      order_id: order.id,
      from_status: order.status,
      to_status: "cancelado",
      actor_type: "staff",
      actor_id: session.staffId,
    })
    return NextResponse.json({ status: "cancelado" })
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

  if (body.action === "optionSoldOut") {
    const { error } = await supabase
      .from("product_options")
      .update({ sold_out: body.soldOut })
      .eq("id", body.optionId)
      .eq("business_id", unit.business_id)
    if (error) return NextResponse.json({ error: "No se pudo actualizar" }, { status: 400 })
    return NextResponse.json({ ok: true })
  }

  if (body.action === "ventanilla") {
    if (body.items.length === 0) {
      return NextResponse.json({ error: "El pedido está vacío" }, { status: 400 })
    }
    // Igual que el pedido del comensal: el total se recalcula aquí a partir de
    // las personalizaciones, nunca se confía en el total armado en la tablet.
    const lines = body.items.map((i) => {
      const optionsDelta = i.customizations.reduce((s, c) => s + c.priceDelta, 0)
      const lineTotal = Math.round((i.unitPrice + optionsDelta) * i.quantity * 100) / 100
      return { ...i, lineTotal }
    })
    const subtotal = Math.round(lines.reduce((s, l) => s + l.lineTotal, 0) * 100) / 100
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
        payment_method: body.paidNow ? (body.paymentMethod ?? null) : null,
        subtotal,
        tax_amount: taxAmount,
        tax_included_snapshot: body.taxIncluded,
        total,
        notes: body.orderNotes || null,
      })
      .select("id, folio")
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: "No se pudo crear el pedido" }, { status: 400 })
    }

    await supabase.from("order_items").insert(
      lines.map((l) => ({
        business_id: unit.business_id,
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
    await supabase.from("order_status_events").insert({
      business_id: unit.business_id,
      order_id: order.id,
      from_status: null,
      to_status: "recibido",
      actor_type: "staff",
      actor_id: session.staffId,
    })

    return NextResponse.json({ orderId: order.id, folio: order.folio })
  }

  return NextResponse.json({ error: "Acción desconocida" }, { status: 400 })
}
