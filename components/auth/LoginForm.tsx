"use client"

import { useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { getPostLoginRedirect } from "@/lib/auth/actions"
import { useLang } from "@/lib/i18n/LangProvider"
import { GoogleIcon } from "./GoogleIcon"

export function LoginForm() {
  const { t } = useLang()
  const p = t.auth
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicSending, setMagicSending] = useState(false)
  const [magicSent, setMagicSent] = useState(false)
  const [magicError, setMagicError] = useState<string | null>(null)

  // El callback manda aquí cuando no pudo canjear el código: enlace ya usado
  // (el antivirus del correo lo abre antes que la persona), vencido, o un
  // Google que se cayó a mitad. Sin esto el dueño aterriza en el login sin una
  // sola palabra sobre por qué, y concluye que el correo nunca llegó.
  const enlaceFallido = useSearchParams().get("error") === "auth"

  async function withGoogle() {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function withPassword(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setSending(false)
    if (error) {
      setError(p.invalidCredentials)
      return
    }
    // Navegación completa, no router.push(): el cliente escribe la cookie de
    // sesión en un listener asíncrono (onAuthStateChange), así que empujar la
    // ruta de inmediato puede ganarle a esa escritura y el Server Component
    // de destino todavía no ve la sesión — obligando a recargar a mano.
    window.location.href = await getPostLoginRedirect()
  }

  async function withMagicLink() {
    if (!email) {
      setError(p.invalidCredentials)
      return
    }
    setMagicSending(true)
    setMagicError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setMagicSending(false)
    if (error) {
      setMagicError(p.magicLinkError)
      return
    }
    setMagicSent(true)
  }

  if (magicSent) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center">
        <h1 className="mb-2 text-lg font-black text-white">{p.magicLinkSentTitle}</h1>
        <p className="text-sm leading-relaxed text-neutral-400">{p.magicLinkSentBody(email)}</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">{p.loginTitle}</h1>
        <p className="mt-1 text-sm text-neutral-400">{p.loginSubtitle}</p>
      </div>

      {enlaceFallido && (
        <div className="rounded-xl border px-3.5 py-3" style={{ borderColor: "#7A5A20", background: "#2A2113" }}>
          <p className="text-[13px] font-semibold leading-snug text-amber-300">{p.linkFailed}</p>
        </div>
      )}

      <button
        onClick={withGoogle}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-neutral-700 bg-white py-2.5 text-sm font-bold text-neutral-900 transition hover:bg-neutral-50"
      >
        <GoogleIcon />
        {p.googleButton}
      </button>

      <div className="flex items-center gap-3 text-xs text-neutral-500">
        <div className="h-px flex-1 bg-neutral-800" />
        {p.dividerLabel}
        <div className="h-px flex-1 bg-neutral-800" />
      </div>

      <form onSubmit={withPassword} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-bold text-neutral-500">{p.emailLabel}</label>
          <input
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={p.emailPlaceholder}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-[#FF5A36]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-neutral-500">{p.passwordLabel}</label>
          <input
            type="password"
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={p.passwordPlaceholder}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-[#FF5A36]"
          />
        </div>
        {error && (
          <div className="rounded-lg border border-red-900/60 bg-red-950/40 p-3">
            <p className="text-sm text-red-300">{error}</p>
            <p className="mt-1 text-xs text-red-400/80">{p.tryMagicLinkHint}</p>
          </div>
        )}
        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition disabled:opacity-60"
          style={{ background: "#FF5A36" }}
        >
          {sending ? p.signingIn : p.signInButton}
        </button>
      </form>

      <button
        onClick={withMagicLink}
        disabled={magicSending}
        className="w-full rounded-xl border border-neutral-700 py-2.5 text-sm font-bold text-neutral-200 transition hover:border-neutral-500 disabled:opacity-60"
      >
        {magicSending ? p.sendingMagicLink : p.magicLinkButton}
      </button>
      {magicError && <p className="text-center text-xs text-red-400">{magicError}</p>}

      <div className="flex items-center justify-center gap-3 text-xs text-neutral-500">
        <Link href="/login/recuperar" className="underline decoration-neutral-700 underline-offset-2 hover:text-neutral-300">
          {p.forgotPassword}
        </Link>
        <span className="text-neutral-700">·</span>
        <Link href="/login/registro" className="underline decoration-neutral-700 underline-offset-2 hover:text-neutral-300">
          {p.registerLink}
        </Link>
      </div>
    </div>
  )
}
