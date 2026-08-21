"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createPublicClient } from "@/lib/supabase/public"
import { useLang } from "@/lib/i18n/LangProvider"

// Supabase limita cuántos correos manda al mismo destinatario seguidos. Antes
// ese rechazo se tragaba en silencio y la pantalla decía "te llegó un enlace"
// igual — que es exactamente cómo alguien termina convencido de que el correo
// de recuperación no funciona. Ahora se dice, con la cuenta regresiva.
//
// El enlace se pide con el cliente SIN sesión, no con el de @supabase/ssr, y
// no es un detalle: el de ssr usa PKCE, que deja un "verificador" guardado en
// el navegador que pidió el enlace y exige presentarlo al abrirlo. Eso rompe
// el caso más común de todos — pedirlo en la computadora y abrir el correo en
// el celular — y rompe por completo el enlace que dispara el admin, porque
// ahí el verificador nace en el servidor y no llega a ningún lado.
//
// Sin PKCE, Supabase manda la sesión en el fragmento de la URL y el enlace
// sirve desde cualquier aparato. Por eso apunta directo a la pantalla de
// contraseña nueva y no a /auth/callback: el fragmento nunca viaja al
// servidor, solo lo puede leer el navegador.
export function RecoverForm() {
  const { t } = useLang()
  const p = t.auth

  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [espera, setEspera] = useState(0)

  useEffect(() => {
    if (espera <= 0) return
    const id = setTimeout(() => setEspera((s) => s - 1), 1000)
    return () => clearTimeout(id)
  }, [espera])

  async function pedirEnlace() {
    setSending(true)
    setError(null)
    const supabase = createPublicClient()
    const { error: fallo } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    setSending(false)

    if (!fallo) {
      // El "si ese correo tiene una cuenta" se mantiene: no se revela cuáles
      // están registrados. Lo que ya no se finge es el envío en sí.
      setSent(true)
      setEspera(60)
      return
    }

    if (fallo.status === 429) {
      // Supabase dice cuántos segundos faltan dentro del mensaje.
      const segundos = Number(fallo.message.match(/\d+/)?.[0] ?? 60)
      setEspera(segundos)
      setError(p.recoverTooSoon(segundos))
      return
    }
    setError(p.recoverFailed)
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-1 text-2xl font-black tracking-tight text-neutral-50">{p.recoverTitle}</h1>
      <p className="mb-6 text-sm text-neutral-400">{sent ? p.recoverSentBody(email) : p.recoverSubtitle}</p>

      {sent ? (
        <>
          <div className="mb-4 rounded-xl border p-4" style={{ borderColor: "#3A3A3D", background: "#161617" }}>
            <p className="text-sm font-bold text-neutral-100">{p.recoverSentTitle}</p>
            <p className="mt-1.5 text-[13px] leading-relaxed text-neutral-400">{p.recoverSentNote}</p>
          </div>
          {error && <p className="mb-3 text-sm font-semibold text-amber-400">{error}</p>}
          <button
            onClick={pedirEnlace}
            disabled={sending || espera > 0}
            className="w-full rounded-xl border py-3 text-sm font-bold text-neutral-200 disabled:opacity-50"
            style={{ borderColor: "#3A3A3D" }}
          >
            {espera > 0 ? p.recoverResendIn(espera) : sending ? p.recoverSending : p.recoverResend}
          </button>
        </>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            pedirEnlace()
          }}
          className="space-y-3"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={p.recoverEmail}
            autoComplete="email"
            className="w-full rounded-xl border px-3.5 py-3 text-sm text-neutral-50 placeholder:text-neutral-500"
            style={{ background: "#161617", borderColor: "#3A3A3D" }}
          />
          {error && <p className="text-sm font-semibold text-amber-400">{error}</p>}
          <button
            type="submit"
            disabled={sending || espera > 0}
            className="w-full rounded-xl bg-white py-3 text-sm font-black text-neutral-900 disabled:opacity-50"
          >
            {espera > 0 ? p.recoverResendIn(espera) : sending ? p.recoverSending : p.recoverSend}
          </button>
        </form>
      )}

      <Link href="/login" className="mt-5 block text-center text-sm text-neutral-400 underline underline-offset-2 hover:text-neutral-200">
        {p.recoverBackToLogin}
      </Link>
    </div>
  )
}
