import "server-only"
import { createClient } from "@/lib/supabase/server"

// El login es uno solo para dueños y para admins de plataforma — nunca hay
// que hacerles elegir. Dueño manda a /panel; admin sin negocio propio manda
// a /admin; nadie de los dos casos cae en /panel/sin-acceso.
export async function resolvePostLoginDestination(): Promise<string> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return "/login"

  const { data: membership } = await supabase
    .from("business_members")
    .select("business_id")
    .eq("auth_user_id", user.id)
    .maybeSingle()
  if (membership) return "/panel"

  const { data: isAdmin } = await supabase.rpc("is_platform_admin")
  if (isAdmin) return "/admin"

  return "/panel/sin-acceso"
}
