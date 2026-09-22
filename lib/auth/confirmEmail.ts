"use server"

import type { EmailOtpType } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"
import { resolvePostLoginDestination } from "@/lib/auth/postLoginDestination"
import { submitPendingBusinessSignupIfAny } from "@/lib/business/signupRequests"

const TIPOS: EmailOtpType[] = ["email", "signup", "magiclink", "invite", "email_change"]

/** Canjea el token del enlace de correo por una sesión. La llama la página
 *  /auth/confirm desde el navegador, nunca al cargarse en el servidor: ver el
 *  porqué allí. */
export async function confirmEmailToken(
  tokenHash: string,
  type: string,
): Promise<{ ok: true; destination: string } | { ok: false }> {
  const supabase = await createClient()
  const tipo = TIPOS.includes(type as EmailOtpType) ? (type as EmailOtpType) : "email"
  const { error } = await supabase.auth.verifyOtp({ type: tipo, token_hash: tokenHash })

  if (error) {
    // El token ya se usó, pero si este navegador ya tiene la sesión (doble
    // clic, pestaña repetida) no hay nada que reportar: se sigue adelante.
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { ok: false }
  }

  await submitPendingBusinessSignupIfAny()
  return { ok: true, destination: await resolvePostLoginDestination() }
}
