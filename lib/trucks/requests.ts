"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getOwnerContext } from "@/lib/auth/dal"

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

  const { error: unitError } = await supabase.from("units").insert({
    business_id: request.business_id,
    name: `Truck ${(count ?? 0) + 1}`,
    status: "active",
  })
  if (unitError) return { ok: false, error: "No se pudo crear el truck" }

  const { error: reqError } = await supabase
    .from("truck_requests")
    .update({ status: "approved", resolved_at: new Date().toISOString(), resolved_by: user.id })
    .eq("id", requestId)
  if (reqError) return { ok: false, error: "El truck se creó pero no se pudo cerrar la solicitud" }

  await supabase.rpc("log_admin_action", {
    p_business_id: request.business_id,
    p_action: "truck_request_approved",
    p_entity_type: "truck_request",
    p_entity_id: requestId,
  })

  revalidatePath("/admin")
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
