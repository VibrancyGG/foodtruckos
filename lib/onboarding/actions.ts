"use server"

import { createClient } from "@/lib/supabase/server"
import { getOwnerContext } from "@/lib/auth/dal"

// Se guarda una sola vez (terminado o saltado) para no auto-arrancar el
// tour en cada login — "Ver tutorial de nuevo" en Cuenta lo vuelve a
// mostrar sin tocar esta bandera, así que no hace falta limpiarla nunca.
export async function markOnboardingSeen(): Promise<{ ok: boolean }> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false }

  const supabase = await createClient()
  await supabase
    .from("businesses")
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq("id", businessId)
    .is("onboarding_completed_at", null)

  return { ok: true }
}
