"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

export function RegisterForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setSending(false)
    if (error) {
      setError(error.message.includes("already registered") ? "Ese correo ya tiene una cuenta." : "No se pudo crear tu cuenta.")
      return
    }
    if (data.session) {
      window.location.href = "/panel"
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <div className="w-full max-w-sm space-y-3 text-center">
        <p className="text-sm text-neutral-200">
          Te mandamos un correo a <b>{email}</b> para confirmar tu cuenta. Ábrelo para continuar.
        </p>
        <Link href="/login" className="block text-xs text-neutral-400 underline">
          Volver a entrar
        </Link>
      </div>
    )
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
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña (mínimo 8 caracteres)"
          className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-white"
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-lg bg-neutral-100 py-2.5 text-sm font-bold text-neutral-900 disabled:opacity-60"
        >
          {sending ? "Creando cuenta…" : "Crear cuenta"}
        </button>
      </form>

      <Link href="/login" className="block text-center text-xs text-neutral-400 underline">
        Ya tengo cuenta, entrar
      </Link>
    </div>
  )
}
