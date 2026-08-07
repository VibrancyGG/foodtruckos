"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getAdminContext } from "@/lib/auth/getAdminContext"

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

export async function reactivateBusiness(businessId: string): Promise<Result> {
  const { isAdmin } = await getAdminContext()
  if (!isAdmin) return { ok: false, error: "No autorizado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("businesses")
    .update({ subscription_status: "active" })
    .eq("id", businessId)
  if (error) return { ok: false, error: "No se pudo reactivar" }

  await supabase.rpc("log_admin_action", {
    p_business_id: businessId,
    p_action: "business_reactivated",
    p_entity_type: "business",
    p_entity_id: businessId,
  })
  revalidatePath("/admin")
  return { ok: true }
}
