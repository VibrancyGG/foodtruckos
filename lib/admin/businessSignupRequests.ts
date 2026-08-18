"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { trialEndsFromNow } from "@/lib/billing/trial"

type Result = { ok: true } | { ok: false; error: string }

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

// Crea el negocio, vincula al dueño que ya se registró solo y le da su
// primer truck — todo en un solo paso de aprobación, igual que el resto del
// admin nunca deja un negocio a medias. Nunca se crea nada hasta que un
// humano lo confirma (foodtruckos-negocio Regla 2: el alta no es
// autoservicio en Fase 1).
export async function approveBusinessSignup(
  requestId: string,
  input: { unitName: string; unitLocation: string },
): Promise<Result> {
  const supabase = await createClient()

  const { data: request } = await supabase
    .from("business_signup_requests")
    .select("id, auth_user_id, business_name, status")
    .eq("id", requestId)
    .maybeSingle()
  if (!request || request.status !== "pending") return { ok: false, error: "Solicitud no encontrada" }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Sin sesión" }

  const baseSlug = slugify(request.business_name) || "negocio"
  let slug = baseSlug
  for (let i = 2; i < 50; i++) {
    const { data: taken } = await supabase.from("businesses").select("id").eq("slug", slug).maybeSingle()
    if (!taken) break
    slug = `${baseSlug}-${i}`
  }

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    // Prueba gratis de 14 días desde la aprobación. Sin esto el negocio nace
    // sin fecha de vencimiento y nunca se le avisa ni se le bloquea nada.
    .insert({ name: request.business_name, slug, trial_ends_at: trialEndsFromNow() })
    .select("id")
    .single()
  if (businessError || !business) return { ok: false, error: "No se pudo crear el negocio" }

  const { error: memberError } = await supabase
    .from("business_members")
    .insert({ business_id: business.id, auth_user_id: request.auth_user_id, role: "owner" })
  if (memberError) return { ok: false, error: "El negocio se creó pero no se pudo vincular al dueño" }

  const unitName = input.unitName.trim() || "Truck 1"
  const { data: newUnit, error: unitError } = await supabase
    .from("units")
    .insert({
      business_id: business.id,
      name: unitName,
      location: input.unitLocation.trim() || null,
    })
    .select("id")
    .single()
  if (unitError || !newUnit) return { ok: false, error: "El negocio se creó pero no se pudo dar de alta el primer truck" }

  // Igual que en approveTruckRequest: sin order_point el truck no tiene QR
  // ni forma de recibir pedidos — nunca queda a medias.
  const { error: orderPointError } = await supabase.from("order_points").insert({
    business_id: business.id,
    unit_id: newUnit.id,
    qr_slug: `${slug}-${slugify(unitName)}`,
  })
  if (orderPointError) return { ok: false, error: "El negocio se creó pero no se pudo generar el código QR del truck" }

  const { error: reqError } = await supabase
    .from("business_signup_requests")
    .update({
      status: "approved",
      resolved_at: new Date().toISOString(),
      resolved_by: user.id,
      resolved_business_id: business.id,
    })
    .eq("id", requestId)
  if (reqError) return { ok: false, error: "El negocio se creó pero no se pudo cerrar la solicitud" }

  await supabase.rpc("log_admin_action", {
    p_business_id: business.id,
    p_action: "business_signup_approved",
    p_entity_type: "business_signup_request",
    p_entity_id: requestId,
  })

  revalidatePath("/admin")
  return { ok: true }
}

export async function rejectBusinessSignup(requestId: string): Promise<Result> {
  const supabase = await createClient()

  const { data: request } = await supabase
    .from("business_signup_requests")
    .select("id, status")
    .eq("id", requestId)
    .maybeSingle()
  if (!request || request.status !== "pending") return { ok: false, error: "Solicitud no encontrada" }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Sin sesión" }

  const { error } = await supabase
    .from("business_signup_requests")
    .update({ status: "rejected", resolved_at: new Date().toISOString(), resolved_by: user.id })
    .eq("id", requestId)
  if (error) return { ok: false, error: "No se pudo rechazar" }

  // Sin negocio todavía no hay a qué business_id atar el registro de
  // auditoría (log_admin_action lo exige) — a diferencia de aprobar, donde
  // el negocio ya existe.
  revalidatePath("/admin")
  return { ok: true }
}
