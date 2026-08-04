import "server-only"
import { cache } from "react"
import { createClient } from "@/lib/supabase/server"

// Capa de conveniencia DELANTE de RLS, nunca un sustituto (foodtruckos-datos
// Regla 1): toda pantalla/Server Action del panel llama esto para saber quién
// es el dueño y a qué negocio pertenece, pero cualquier consulta de datos
// reales sigue dependiendo de las políticas de la base, no de este resultado.
export const getOwnerContext = cache(async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { user: null, businessId: null } as const

  const { data: membership } = await supabase
    .from("business_members")
    .select("business_id, businesses(name, slug)")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  if (!membership) return { user, businessId: null, business: null } as const

  return {
    user,
    businessId: membership.business_id,
    business: membership.businesses,
  } as const
})
