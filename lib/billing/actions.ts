"use server"

import { createClient } from "@/lib/supabase/server"
import { getOwnerContext } from "@/lib/auth/dal"

type Result = { ok: true } | { ok: false; error: string }

// No hay autoservicio real de cancelación en Fase 1 (foodtruckos-negocio
// Regla 1: la gestión de suscripciones es del panel admin interno, sin
// Stripe todavía). Esto deja un registro real en audit_log — vía la función
// SECURITY DEFINER, no un INSERT directo — para que VibrancyGG lo procese;
// nada se cancela solo.
export async function requestCancellation(note: string): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const supabase = await createClient()
  const { error } = await supabase.rpc("request_subscription_cancel", {
    p_business_id: businessId,
    p_note: note || null,
  })

  if (error) return { ok: false, error: "No se pudo enviar la solicitud" }
  return { ok: true }
}
