"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function RecuperarPage() {
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    })
    setSending(false)
    setSent(true) // se muestra igual exista o no la cuenta, para no filtrar qué correos están registrados
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
      <div className="w-full max-w-sm rounded-2xl bg-neutral-900 p-6 text-white">
        <h1 className="mb-4 text-lg font-bold">Recuperar contraseña</h1>
        {sent ? (
          <p className="text-sm text-neutral-300">
            Si ese correo tiene una cuenta, te llegó un enlace para elegir una contraseña nueva.
          </p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu correo"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-lg bg-white py-2 text-sm font-bold text-neutral-900 disabled:opacity-60"
            >
              {sending ? "Enviando…" : "Mandar enlace"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
