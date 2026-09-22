import { NextResponse } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { resolvePostLoginDestination } from "@/lib/auth/postLoginDestination"
import { submitPendingBusinessSignupIfAny } from "@/lib/business/signupRequests"

// Destino de los enlaces de correo (confirmar cuenta y enlace para entrar).
//
// Existe porque /auth/callback usa PKCE: el enlace solo funciona en el MISMO
// navegador donde se pidió, porque ahí quedó guardada la mitad secreta del
// intercambio. Quien llena el formulario en un navegador y abre el correo en
// otro (la app de Gmail, el celular) veía "No pudimos validar ese enlace".
// Aquí se valida con token_hash, que viaja completo en el enlace: sirve en
// cualquier navegador o dispositivo.
//
// Requiere que las plantillas de correo de Supabase apunten aquí:
//   https://pavessa.com/auth/confirm?token_hash={{ .TokenHash }}&type=email
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const tokenHash = searchParams.get("token_hash")
  const type = (searchParams.get("type") ?? "email") as EmailOtpType

  if (tokenHash) {
    const supabase = await createClient()
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
    if (!error) {
      await submitPendingBusinessSignupIfAny()
      return NextResponse.redirect(`${origin}${await resolvePostLoginDestination()}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
