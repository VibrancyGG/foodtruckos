"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ADMIN_VIEW_COOKIE } from "@/lib/auth/dal"

// "Abrir" en Admin interno entra de verdad al panel del dueño (no a una
// copia aparte): pone una cookie con el negocio a ver y getOwnerContext la
// respeta si quien la trae sigue siendo platform_admin en ese momento — RLS
// (is_platform_admin() en las políticas) es la barrera real, esto solo
// decide qué negocio se muestra.
export async function startImpersonation(businessId: string) {
  const supabase = await createClient()
  const { data: isAdmin } = await supabase.rpc("is_platform_admin")
  if (!isAdmin) return

  const { data: business } = await supabase.from("businesses").select("id").eq("id", businessId).maybeSingle()
  if (!business) return

  const store = await cookies()
  store.set(ADMIN_VIEW_COOKIE, businessId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 2, // 2h — igual que una sesión de trabajo, no queda pegado
  })

  await supabase.rpc("log_admin_action", {
    p_business_id: businessId,
    p_action: "admin_viewed_business",
    p_entity_type: "business",
    p_entity_id: businessId,
  })

  redirect("/panel")
}

export async function stopImpersonation() {
  const store = await cookies()
  store.delete(ADMIN_VIEW_COOKIE)
  redirect("/admin")
}
