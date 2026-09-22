"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { avisarAdmin } from "@/lib/notificaciones/avisoAdmin"

type Result = { ok: true } | { ok: false; error: string }

// Un prospecto nunca tiene dos solicitudes pendientes a la vez — igual que
// las solicitudes de truck nuevo, pedir de nuevo mientras hay una en curso
// no tendría sentido.
export async function submitBusinessSignupRequest(input: {
  businessName: string
  city: string
  phone: string
  note: string
}): Promise<Result> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Sin sesión" }

  if (!input.businessName.trim() || !input.city.trim()) {
    return { ok: false, error: "Faltan datos" }
  }

  const { data: existing } = await supabase
    .from("business_signup_requests")
    .select("id")
    .eq("auth_user_id", user.id)
    .eq("status", "pending")
    .maybeSingle()
  if (existing) return { ok: false, error: "Ya tienes una solicitud pendiente" }

  const { error } = await supabase.from("business_signup_requests").insert({
    auth_user_id: user.id,
    contact_email: user.email ?? "",
    business_name: input.businessName.trim(),
    city: input.city.trim(),
    phone: input.phone.trim() || null,
    note: input.note.trim() || null,
  })
  if (error) return { ok: false, error: "No se pudo enviar la solicitud" }

  // Un prospecto esperando es lo más caro que hay: si nadie lo ve, se va con
  // otro. El aviso no puede tumbar la solicitud, así que nunca relanza.
  avisarAdmin({
    asunto: `Negocio nuevo: ${input.businessName.trim()}`,
    titulo: "Alguien quiere abrir su panel",
    datos: [
      ["Negocio", input.businessName.trim()],
      ["Ciudad", input.city.trim()],
      ["Correo", user.email ?? ""],
      ["Teléfono", input.phone.trim()],
    ],
    nota: input.note,
    destino: "/admin",
  })

  revalidatePath("/panel/sin-acceso")
  return { ok: true }
}

/** Guarda lo que escribió el prospecto en "Solicita tu acceso", ANTES de que
 *  tenga cuenta. Si esto fallara y siguiéramos, el correo saldría igual y
 *  volveríamos a pedirle todo después, así que el formulario se detiene. */
export async function savePendingBusinessSignup(input: {
  email: string
  businessName: string
  city: string
  phone: string
}): Promise<Result> {
  if (!input.email.trim() || !input.businessName.trim() || !input.city.trim()) {
    return { ok: false, error: "Faltan datos" }
  }
  const supabase = await createClient()
  const { error } = await supabase.rpc("save_pending_business_signup", {
    p_email: input.email,
    p_business_name: input.businessName,
    p_city: input.city,
    p_phone: input.phone,
  })
  if (error) return { ok: false, error: "No se pudo guardar la solicitud" }
  return { ok: true }
}

/** Se llama justo después de iniciar sesión, por cualquier vía (enlace,
 *  Google). Si esa cuenta dejó datos en "Solicita tu acceso", la solicitud se
 *  arma con ellos y no se le vuelven a pedir. La base solo los entrega si el
 *  correo de la cuenta está confirmado y coincide. */
export async function submitPendingBusinessSignupIfAny(): Promise<void> {
  const supabase = await createClient()
  const { data } = await supabase.rpc("claim_pending_business_signup")
  const pendiente = data?.[0]
  if (!pendiente) return
  await submitBusinessSignupRequest({
    businessName: pendiente.business_name,
    city: pendiente.city,
    phone: pendiente.phone ?? "",
    note: "",
  })
}

export async function getMyPendingBusinessSignupRequest() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from("business_signup_requests")
    .select("id, business_name, city, created_at")
    .eq("auth_user_id", user.id)
    .eq("status", "pending")
    .maybeSingle()
  return data
}
