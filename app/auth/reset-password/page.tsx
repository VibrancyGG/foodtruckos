"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSending(true)
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    setSending(false)
    if (error) {
      setError("No pudimos actualizar tu contraseña. Pide un nuevo enlace de recuperación.")
      return
    }
    setDone(true)
    setTimeout(() => router.push("/panel"), 1500)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-6">
      <div className="w-full max-w-sm rounded-2xl bg-neutral-900 p-6 text-white">
        <h1 className="mb-4 text-lg font-bold">Nueva contraseña</h1>
        {done ? (
          <p className="text-sm text-green-400">Listo, entrando a tu panel…</p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nueva contraseña"
              className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={sending}
              className="w-full rounded-lg bg-white py-2 text-sm font-bold text-neutral-900 disabled:opacity-60"
            >
              {sending ? "Guardando…" : "Guardar contraseña"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
