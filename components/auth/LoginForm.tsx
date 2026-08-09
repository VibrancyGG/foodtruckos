"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { getPostLoginRedirect } from "@/lib/auth/actions"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      setError("Correo o contraseña incorrectos.")
      return
    }
    // Navegación completa, no router.push(): el cliente escribe la cookie de
    // sesión en un listener asíncrono (onAuthStateChange), así que empujar la
    // ruta de inmediato puede ganarle a esa escritura y el Server Component
    // de destino todavía no ve la sesión — obligando a recargar a mano.
    window.location.href = await getPostLoginRedirect()
  }

  return (
    <div className="w-full max-w-sm space-y-4">
      <button
        onClick={withGoogle}
        className="w-full rounded-lg border border-neutral-700 bg-white py-2.5 text-sm font-bold text-neutral-900"
      >
        Continuar con Google
      </button>

      <div className="flex items-center gap-3 text-xs text-neutral-500">
        <div className="h-px flex-1 bg-neutral-800" />
        o con tu correo
        <div className="h-px flex-1 bg-neutral-800" />
      </div>

      <form onSubmit={withPassword} className="space-y-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo"
          className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-lg bg-neutral-100 py-2.5 text-sm font-bold text-neutral-900 disabled:opacity-60"
        >
          {sending ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <div className="flex items-center justify-center gap-3 text-xs text-neutral-400">
        <Link href="/login/recuperar" className="underline">
          Olvidé mi contraseña
        </Link>
        <span className="text-neutral-700">·</span>
        <Link href="/login/registro" className="underline">
          Regístrate
        </Link>
      </div>
    </div>
  )
}
