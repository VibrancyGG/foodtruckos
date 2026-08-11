"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getOwnerContext } from "@/lib/auth/dal"
import { slugify } from "@/lib/utils/slugify"

type Result = { ok: true } | { ok: false; error: string }

// El dueño pide un truck nuevo desde su panel — antes esto era un mailto,
// ahora queda una solicitud real que el admin ve y aprueba. Un negocio nunca
// tiene dos solicitudes pendientes a la vez: pedir de nuevo mientras hay una
// en curso no tendría sentido, así que se bloquea antes de insertar.
export async function requestNewTruck(note: string): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { data: existing } = await supabase
    .from("truck_requests")
    .select("id")
    .eq("business_id", businessId)
    .eq("status", "pending")
    .maybeSingle()

  if (existing) return { ok: false, error: "Ya tienes una solicitud pendiente" }

  const { error } = await supabase.from("truck_requests").insert({
    business_id: businessId,
    note: note.trim() || null,
  })

  if (error) return { ok: false, error: "No se pudo enviar la solicitud" }
  revalidatePath("/panel/trucks")
  return { ok: true }
}

export async function getPendingTruckRequest(businessId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("truck_requests")
    .select("id, created_at")
    .eq("business_id", businessId)
    .eq("status", "pending")
    .maybeSingle()
  return data
}

// La solicitud aprobada más reciente que el dueño todavía no ha visto — deja
// de aparecer en cuanto la reconoce (acknowledgeTruckApproval), nunca por
// tiempo, para no perderla si el dueño tarda unos días en volver a entrar.
export async function getUnacknowledgedApprovedTruckRequest(businessId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from("truck_requests")
    .select("id, resolved_at, units:resolved_unit_id(name)")
    .eq("business_id", businessId)
    .eq("status", "approved")
    .is("owner_acknowledged_at", null)
    .order("resolved_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!data) return null
  const unit = Array.isArray(data.units) ? data.units[0] : data.units
  return { id: data.id, resolvedAt: data.resolved_at, unitName: unit?.name ?? null }
}

export async function acknowledgeTruckApproval(requestId: string): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("truck_requests")
    .update({ owner_acknowledged_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("business_id", businessId)
  if (error) return { ok: false, error: "No se pudo actualizar" }
  return { ok: true }
}

// Aprobar da de alta el truck DE INMEDIATO — regla de negocio: un truck
// nuevo se cobra el mes completo desde el día que se aprueba, nunca se
// prorratea ni se agenda para el siguiente periodo. Como el MRR se calcula
// contando trucks activos ahora mismo (lib/billing/pricing), no hace falta
// lógica de facturación aparte: crear la unidad ya lo factura este mes.
export async function approveTruckRequest(requestId: string): Promise<Result> {
  const supabase = await createClient()

  const { data: request } = await supabase
    .from("truck_requests")
    .select("id, business_id, status")
    .eq("id", requestId)
    .maybeSingle()
  if (!request || request.status !== "pending") return { ok: false, error: "Solicitud no encontrada" }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Sin sesión" }

  const { count } = await supabase
    .from("units")
    .select("id", { count: "exact", head: true })
    .eq("business_id", request.business_id)
    .neq("status", "archived")

  const unitName = `Truck ${(count ?? 0) + 1}`
  const { data: newUnit, error: unitError } = await supabase
    .from("units")
    .insert({
      business_id: request.business_id,
      name: unitName,
      status: "active",
    })
    .select("id")
    .single()
  if (unitError || !newUnit) return { ok: false, error: "No se pudo crear el truck" }

  // Sin esto el truck queda invisible en Códigos QR y sin forma real de
  // recibir pedidos: getMenuData resuelve todo por qr_slug de order_points,
  // nunca por el nombre del truck — un truck nuevo sin su propio punto de
  // pedido es un truck que no existe para el comensal.
  const { data: business } = await supabase.from("businesses").select("slug").eq("id", request.business_id).single()
  if (business) {
    const { error: orderPointError } = await supabase.from("order_points").insert({
      business_id: request.business_id,
      unit_id: newUnit.id,
      qr_slug: `${business.slug}-${slugify(unitName)}`,
    })
    if (orderPointError) return { ok: false, error: "El truck se creó pero no se pudo generar su código QR" }
  }

  const { error: reqError } = await supabase
    .from("truck_requests")
    .update({ status: "approved", resolved_at: new Date().toISOString(), resolved_by: user.id, resolved_unit_id: newUnit.id })
    .eq("id", requestId)
  if (reqError) return { ok: false, error: "El truck se creó pero no se pudo cerrar la solicitud" }

  await supabase.rpc("log_admin_action", {
    p_business_id: request.business_id,
    p_action: "truck_request_approved",
    p_entity_type: "truck_request",
    p_entity_id: requestId,
  })

  revalidatePath("/admin")
  // El truck nuevo se factura de inmediato (ver comentario arriba) — sin
  // esto, Trucks/Cuenta del dueño podían quedarse con el conteo viejo
  // cacheado hasta su siguiente navegación que invalidara la ruta.
  revalidatePath("/panel/trucks")
  revalidatePath("/panel/cuenta")
  revalidatePath("/panel/qr")
  return { ok: true }
}

export async function rejectTruckRequest(requestId: string): Promise<Result> {
  const supabase = await createClient()

  const { data: request } = await supabase
    .from("truck_requests")
    .select("id, business_id, status")
    .eq("id", requestId)
    .maybeSingle()
  if (!request || request.status !== "pending") return { ok: false, error: "Solicitud no encontrada" }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Sin sesión" }

  const { error } = await supabase
    .from("truck_requests")
    .update({ status: "rejected", resolved_at: new Date().toISOString(), resolved_by: user.id })
    .eq("id", requestId)
  if (error) return { ok: false, error: "No se pudo rechazar" }

  await supabase.rpc("log_admin_action", {
    p_business_id: request.business_id,
    p_action: "truck_request_rejected",
    p_entity_type: "truck_request",
    p_entity_id: requestId,
  })

  revalidatePath("/admin")
  return { ok: true }
}
