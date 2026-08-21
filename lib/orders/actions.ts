"use server"

import { createPublicClient } from "@/lib/supabase/public"
import { isOpenNow, parseWeeklyHours } from "@/lib/units/hours"
import { accessBlocked } from "@/lib/billing/trial"
import { avisarAdmin } from "@/lib/notificaciones/avisoAdmin"

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
export type CreateOrderErrorCode = "emptyCart" | "verifyFailed" | "unavailable" | "paused" | "closed" | "sendFailed" | "badCart" | "soldOut"

// Un pedido que no se pudo guardar es una venta perdida que NADIE ve: el
// comensal se va, el dueño no se entera, y nosotros tampoco. Un truck podría
// estar sin recibir pedidos toda una tarde sin que suene una alarma.
//
// Ojo con qué se avisa: "cerrado", "en pausa" y "carrito vacío" son respuestas
// normales del negocio, no fallas. Avisarlas volvería el correo ruido, y el
// ruido hace que nadie mire el correo el día que sí importa.
const CODIGOS_QUE_ALARMAN: CreateOrderErrorCode[] = ["verifyFailed", "sendFailed", "badCart"]

// Freno para que un truck averiado no mande cien correos en una hora. Vive en
// memoria: si el servidor levanta otra instancia puede colarse algún aviso
// repetido, y está bien — el error de repetir un aviso es mucho más barato que
// el de callarse uno.
const ultimoAviso = new Map<string, number>()
const ESPERA_ENTRE_AVISOS_MS = 10 * 60 * 1000

function avisarPedidoFallido(input: {
  codigo: CreateOrderErrorCode
  negocio: string
  truck: string
  businessId: string
  detalle?: string
}) {
  if (!CODIGOS_QUE_ALARMAN.includes(input.codigo)) return

  const ahora = Date.now()
  const previo = ultimoAviso.get(input.businessId)
  if (previo && ahora - previo < ESPERA_ENTRE_AVISOS_MS) return
  ultimoAviso.set(input.businessId, ahora)

  avisarAdmin({
    asunto: `Pedido fallido: ${input.negocio}`,
    titulo: "Un comensal no pudo hacer su pedido",
    datos: [
      ["Negocio", input.negocio],
      ["Truck", input.truck],
      ["Motivo", input.codigo],
      ["Detalle", input.detalle ?? ""],
    ],
    nota: "El comensal vio un error y probablemente se fue. Revisa este truck cuanto antes.",
    destino: "/admin",
  })
}

export async function createOrder(input: {
  businessId: string
  unitId: string
  orderPointId: string
  taxIncluded: boolean
  customerName?: string
  items: CartItemInput[]
}): Promise<{ orderId: string; folio: number } | { error: CreateOrderErrorCode; soldOutItems?: string[] }> {
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
    supabase.from("units").select("name, status, hours, paused_until").eq("id", input.unitId).single(),
    supabase
      .from("businesses")
      .select("name, timezone, subscription_status, trial_ends_at")
      .eq("id", input.businessId)
      .single(),
  ])

  if (!unit || !business) {
    console.error("[createOrder] no se pudo leer truck o negocio", { unitId: input.unitId, businessId: input.businessId })
    avisarPedidoFallido({ codigo: "verifyFailed", negocio: business?.name ?? "?", truck: unit?.name ?? "?", businessId: input.businessId })
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

  // La misma desconfianza, ahora por platillo. La pantalla del comensal es una
  // foto del momento en que cargó: no escucha cambios, y su carrito sobrevive
  // en el celular entre visitas. Así que alguien puede tener abierto un menú de
  // ayer, o restaurar el carrito de ayer, y mandar algo que el dueño ya marcó
  // agotado. Antes entraba, y a la cocina le llegaba una comanda de algo que no
  // podían hacer.
  //
  // Mismo criterio que el menú (getMenuData): sin fila en unit_products el
  // platillo se considera ofrecido y disponible — la fila solo existe cuando
  // alguien tocó algo.
  const { data: disponibilidad, error: errorDisponibilidad } = await supabase
    .from("unit_products")
    .select("product_id, is_offered, sold_out")
    .eq("unit_id", input.unitId)
    .in("product_id", input.items.map((i) => i.productId))

  if (errorDisponibilidad) {
    console.error("[createOrder] no se pudo comprobar disponibilidad", errorDisponibilidad)
    avisarPedidoFallido({ codigo: "verifyFailed", negocio: business.name, truck: unit.name, businessId: input.businessId, detalle: "fallo al leer unit_products" })
    return { error: "verifyFailed" }
  }

  const noDisponibles = input.items
    .filter((item) => {
      const fila = (disponibilidad ?? []).find((d) => d.product_id === item.productId)
      if (!fila) return false
      return fila.sold_out === true || fila.is_offered === false
    })
    // El nombre va tal como el comensal lo tiene en su carrito, en su idioma:
    // decirle "se acabó el #a3f2-…" no le sirve de nada.
    .map((item) => item.productName)

  if (noDisponibles.length > 0) {
    // No alarma por correo: que se acabe un platillo es la operación normal de
    // un truck, no una falla nuestra.
    return { error: "soldOut", soldOutItems: noDisponibles }
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
    avisarPedidoFallido({ codigo: "badCart", negocio: business.name, truck: unit.name, businessId: input.businessId, detalle: "importes de línea inválidos" })
    return { error: "badCart" }
  }

  const subtotal = Math.round(lines.reduce((s, l) => s + l.lineTotal, 0) * 100) / 100
  const taxAmount = input.taxIncluded ? 0 : Math.round(subtotal * TAX_RATE * 100) / 100
  const total = Math.round((subtotal + taxAmount) * 100) / 100

  if (!Number.isFinite(subtotal) || !Number.isFinite(taxAmount) || !Number.isFinite(total)) {
    console.error("[createOrder] totales inválidos", { subtotal, taxAmount, total })
    avisarPedidoFallido({ codigo: "badCart", negocio: business.name, truck: unit.name, businessId: input.businessId, detalle: "totales inválidos" })
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
    avisarPedidoFallido({ codigo: "sendFailed", negocio: business.name, truck: unit.name, businessId: input.businessId, detalle: orderError?.code ? "base: " + orderError.code : "no se creó el pedido" })
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
    avisarPedidoFallido({ codigo: "sendFailed", negocio: business.name, truck: unit.name, businessId: input.businessId, detalle: "no se guardaron los platillos: " + (itemsError.code ?? "?") })
    return { error: "sendFailed" }
  }

  if (!order.folio) {
    console.error("[createOrder] el pedido quedó sin folio", { orderId: order.id })
    avisarPedidoFallido({ codigo: "sendFailed", negocio: business.name, truck: unit.name, businessId: input.businessId, detalle: "pedido sin folio" })
    return { error: "sendFailed" }
  }

  return { orderId: order.id, folio: order.folio }
}
