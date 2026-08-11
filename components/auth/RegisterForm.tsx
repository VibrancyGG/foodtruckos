"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useLang } from "@/lib/i18n/LangProvider"
import { GoogleIcon } from "./GoogleIcon"

// Registrarse no crea una cuenta con acceso inmediato — deja una solicitud
// (foodtruckos-negocio Regla 2: el alta no es autoservicio en Fase 1). El
// correo confirma la identidad vía enlace mágico (sin contraseña que
// inventar ni recordar); los datos del negocio viajan en la URL de retorno y
// app/auth/callback/route.ts los usa para dejar la solicitud registrada en
// cuanto la sesión queda establecida.
export function RegisterForm() {
  const { t } = useLang()
  const p = t.auth
  const [businessName, setBusinessName] = useState("")
  const [city, setCity] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function withGoogle() {
    const supabase = createClient()
    const params = new URLSearchParams({ intent: "business_signup", business_name: businessName, city, phone })
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?${params.toString()}` },
    })
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!businessName.trim() || !city.trim() || !email.trim()) return
    setSending(true)
    setError(null)
    const supabase = createClient()
    const params = new URLSearchParams({ intent: "business_signup", business_name: businessName, city, phone })
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?${params.toString()}` },
    })
    setSending(false)
    if (error) {
      setError(p.requestError)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-6 text-center">
        <h1 className="mb-2 text-lg font-black text-white">{p.requestSentTitle}</h1>
        <p className="text-sm leading-relaxed text-neutral-400">{p.requestSentBody(email)}</p>
        <Link href="/login" className="mt-4 inline-block text-xs text-neutral-500 underline decoration-neutral-700 underline-offset-2">
          {p.backToLogin}
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">{p.registerTitle}</h1>
        <p className="mt-1 text-sm leading-relaxed text-neutral-400">{p.registerSubtitle}</p>
        <p className="mt-2 inline-block rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: "rgba(255,90,54,.14)", color: "#FF8A5C" }}>
          {p.freeTrialNote}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="mb-1 block text-xs font-bold text-neutral-500">{p.businessNameLabel}</label>
          <input
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder={p.businessNamePlaceholder}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-[#FF5A36]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-neutral-500">{p.cityLabel}</label>
          <input
            required
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder={p.cityPlaceholder}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-[#FF5A36]"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-neutral-500">{p.phoneLabel}</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={p.phonePlaceholder}
            className="w-full rounded-xl border border-neutral-700 bg-neutral-900 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-[#FF5A36]"
          />
        </div>
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
          <p className="mt-1.5 text-xs leading-relaxed text-neutral-500">{p.registerEmailHint}</p>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-xl py-2.5 text-sm font-bold text-white transition disabled:opacity-60"
          style={{ background: "#FF5A36" }}
        >
          {sending ? p.sendingRequest : p.requestButton}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-neutral-500">
        <div className="h-px flex-1 bg-neutral-800" />
        {p.orGoogleLabel}
        <div className="h-px flex-1 bg-neutral-800" />
      </div>

      <button
        onClick={withGoogle}
        disabled={!businessName.trim() || !city.trim()}
        className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-neutral-700 bg-white py-2.5 text-sm font-bold text-neutral-900 transition hover:bg-neutral-50 disabled:opacity-50"
      >
        <GoogleIcon />
        {p.googleButton}
      </button>

      <p className="text-center text-xs text-neutral-500">
        {p.alreadyHaveAccount}{" "}
        <Link href="/login" className="underline decoration-neutral-700 underline-offset-2 hover:text-neutral-300">
          {p.backToLogin}
        </Link>
      </p>
    </div>
  )
}
