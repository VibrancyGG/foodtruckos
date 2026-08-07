"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function EnterPinForm() {
  const router = useRouter()
  const [pin, setPin] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setSending(true)
    setError(null)
    try {
      const res = await fetch("/cocina/entrar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "No se pudo entrar")
        setPin("")
        return
      }
      router.refresh()
    } catch {
      setError("No se pudo conectar")
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-900 p-4 text-white">
      <div className="w-full max-w-xs space-y-4">
        <div>
          <h1 className="text-lg font-bold">Entrar a cocina</h1>
          <p className="text-sm text-neutral-400">Ingresa tu PIN.</p>
        </div>
        <input
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          onKeyDown={(e) => e.key === "Enter" && submit()}
          type="password"
          inputMode="numeric"
          placeholder="••••"
          className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-3 text-center text-2xl tracking-[0.5em]"
          autoFocus
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          onClick={submit}
          disabled={sending || pin.length === 0}
          className="w-full rounded-xl bg-white py-3 font-bold text-neutral-900 disabled:opacity-50"
        >
          {sending ? "Entrando…" : "Entrar"}
        </button>
      </div>
    </div>
  )
}
