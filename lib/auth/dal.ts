import "server-only"
import { cache } from "react"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export const ADMIN_VIEW_COOKIE = "ft_admin_view"

// Capa de conveniencia DELANTE de RLS, nunca un sustituto (foodtruckos-datos
// Regla 1): toda pantalla/Server Action del panel llama esto para saber quién
// es el dueño y a qué negocio pertenece, pero cualquier consulta de datos
// reales sigue dependiendo de las políticas de la base, no de este resultado.
export const getOwnerContext = cache(async () => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { user: null, businessId: null, business: null, impersonating: false, suspended: false } as const

  const { data: membership } = await supabase
    .from("business_members")
    .select("business_id, businesses(name, slug, subscription_status)")
    .eq("auth_user_id", user.id)
    .maybeSingle()

  if (membership) {
    return {
      user,
      businessId: membership.business_id,
      business: membership.businesses,
      impersonating: false,
      // Suspendido por falta de pago: RLS sigue dejando leer/escribir (la
      // suspensión no es un problema de permisos), el bloqueo real vive aquí
      // y en verifyStaffSession/getMenuData — así una sola bandera corta el
      // panel, cocina y el menú del comensal a la vez.
      suspended: membership.businesses?.subscription_status === "suspended",
    } as const
  }

  // Sin membresía propia: si es admin de plataforma y trae la cookie de "ver
  // como", le mostramos el panel de ese negocio — es lo que hace real el
  // botón "Abrir" en Admin interno. La barrera de seguridad de verdad es RLS
  // (is_platform_admin() ya está en las políticas de escritura/lectura); esta
  // cookie solo decide qué negocio mostrar, nunca amplía permisos por sí sola.
  const store = await cookies()
  const viewingId = store.get(ADMIN_VIEW_COOKIE)?.value
  if (viewingId) {
    const { data: isAdmin } = await supabase.rpc("is_platform_admin")
    if (isAdmin) {
      const { data: business } = await supabase
        .from("businesses")
        .select("id, name, slug")
        .eq("id", viewingId)
        .maybeSingle()
      if (business) {
        return {
          user,
          businessId: business.id,
          business: { name: business.name, slug: business.slug },
          impersonating: true,
          // El admin necesita poder entrar a una cuenta suspendida para
          // arreglarla — el bloqueo es solo para el dueño real.
          suspended: false,
        } as const
      }
    }
  }

  return { user, businessId: null, business: null, impersonating: false, suspended: false } as const
})
