import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { resolvePostLoginDestination } from "@/lib/auth/postLoginDestination"

// "next" sirve para flujos que no deben caer en el destino normal
// post-login (paneles según rol) — hoy solo lo usa recuperación de
// contraseña, que necesita aterrizar en /auth/reset-password con la sesión
// ya intercambiada, antes de que el dueño vea ningún panel.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const next = searchParams.get("next")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const destination = next && next.startsWith("/") ? next : await resolvePostLoginDestination()
      return NextResponse.redirect(`${origin}${destination}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
