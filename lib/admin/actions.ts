"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getAdminContext } from "@/lib/auth/getAdminContext"
import { trialEndsFromNow } from "@/lib/billing/trial"

type Result = { ok: true } | { ok: false; error: string }

export async function suspendBusiness(businessId: string): Promise<Result> {
  const { isAdmin } = await getAdminContext()
  if (!isAdmin) return { ok: false, error: "No autorizado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("businesses")
    .update({ subscription_status: "suspended" })
    .eq("id", businessId)
  if (error) return { ok: false, error: "No se pudo suspender" }

  await supabase.rpc("log_admin_action", {
    p_business_id: businessId,
    p_action: "business_suspended",
    p_entity_type: "business",
    p_entity_id: businessId,
  })
  revalidatePath("/admin")
  return { ok: true }
}

// El dueño ya puede reactivar su propio truck archivado en minutos desde su
// panel (lib/units/actions.ts) — esto solo registra que el equipo lo
// contactó antes del corte de 2 años, para no perder de vista quién ya
// recibió el aviso. No borra nada por sí sola.
export async function markArchiveWarned(unitId: string): Promise<Result> {
  const { isAdmin } = await getAdminContext()
  if (!isAdmin) return { ok: false, error: "No autorizado" }

  const supabase = await createClient()
  const { data: unit, error } = await supabase
    .from("units")
    .update({ archive_warned_at: new Date().toISOString() })
    .eq("id", unitId)
    .select("business_id")
    .single()
  if (error || !unit) return { ok: false, error: "No se pudo marcar" }

  await supabase.rpc("log_admin_action", {
    p_business_id: unit.business_id,
    p_action: "archive_warning_sent",
    p_entity_type: "unit",
    p_entity_id: unitId,
  })
  revalidatePath("/admin")
  return { ok: true }
}

// Reactivar SIEMPRE pregunta cómo vuelve, porque las dos respuestas cuestan
// dinero en direcciones opuestas: devolver como "de pago" a quien seguía en
// prueba se salta la conversación de cobro, y devolver como "prueba" a quien
// ya pagaba le regala días.
//
// Antes esto asumía "de pago" en silencio. Un negocio con la prueba vencida
// que se suspendía y reactivaba quedaba convertido en cuenta de pago sin que
// nadie lo decidiera.
export async function reactivateBusiness(
  businessId: string,
  como: "trial" | "active",
): Promise<Result> {
  const { isAdmin } = await getAdminContext()
  if (!isAdmin) return { ok: false, error: "No autorizado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("businesses")
    .update(
      como === "trial"
        ? { subscription_status: "trial", trial_ends_at: trialEndsFromNow() }
        : // Se limpia la fecha vieja a propósito: dejarla puesta es una mina —
          // si alguien regresara la cuenta a "prueba" más adelante, nacería
          // vencida en ese mismo instante.
          { subscription_status: "active", trial_ends_at: null },
    )
    .eq("id", businessId)
  if (error) return { ok: false, error: "No se pudo reactivar" }

  await supabase.rpc("log_admin_action", {
    p_business_id: businessId,
    p_action: como === "trial" ? "business_reactivated_as_trial" : "business_reactivated_as_paid",
    p_entity_type: "business",
    p_entity_id: businessId,
  })
  revalidatePath("/admin")
  return { ok: true }
}

// Mover (o quitar) la fecha en que termina la prueba gratis. Siempre se va a
// querer extenderle a alguien, y sin esto la única salida sería tocar la base
// a mano.
//
// `null` = sin vencimiento. Es deliberado que exista: es como quedan los
// negocios internos y los pilotos, y es lo que evita bloquear a alguien por
// descuido (foodtruckos-negocio Regla 5).
export async function setTrialEnd(businessId: string, endsAt: string | null): Promise<Result> {
  const { isAdmin } = await getAdminContext()
  if (!isAdmin) return { ok: false, error: "No autorizado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("businesses")
    .update({ trial_ends_at: endsAt })
    .eq("id", businessId)
  if (error) return { ok: false, error: "No se pudo guardar la fecha" }

  await supabase.rpc("log_admin_action", {
    p_business_id: businessId,
    p_action: endsAt ? "trial_end_set" : "trial_end_cleared",
    p_entity_type: "business",
    p_entity_id: businessId,
  })
  revalidatePath("/admin")
  return { ok: true }
}
