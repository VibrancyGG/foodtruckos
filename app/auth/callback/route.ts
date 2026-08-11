import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { resolvePostLoginDestination } from "@/lib/auth/postLoginDestination"
import { submitBusinessSignupRequest } from "@/lib/business/signupRequests"

// "next" sirve para flujos que no deben caer en el destino normal
// post-login (paneles según rol) — hoy solo lo usa recuperación de
// contraseña, que necesita aterrizar en /auth/reset-password con la sesión
// ya intercambiada, antes de que el dueño vea ningún panel.
//
// "intent=business_signup" es el registro nuevo (sin contraseña): los datos
// del negocio viajan como query params en la URL de retorno del enlace
// mágico/Google, y en cuanto la sesión queda establecida aquí se deja la
// solicitud registrada — el dueño nunca ve un formulario aparte después de
// confirmar su correo.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next")
  const intent = searchParams.get("intent")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      if (intent === "business_signup") {
        const businessName = searchParams.get("business_name") ?? ""
        const city = searchParams.get("city") ?? ""
        if (businessName.trim() && city.trim()) {
          await submitBusinessSignupRequest({
            businessName,
            city,
            phone: searchParams.get("phone") ?? "",
            note: "",
          })
        }
      }
      const destination = next && next.startsWith("/") ? next : await resolvePostLoginDestination()
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
