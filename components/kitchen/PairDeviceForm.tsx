"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export function PairDeviceForm() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    setSending(true)
    setError(null)
    try {
      const res = await fetch("/cocina/emparejar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? "No se pudo emparejar")
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
          <h1 className="text-lg font-bold">Emparejar esta pantalla</h1>
          <p className="text-sm text-neutral-400">Pide el código al dueño del negocio.</p>
        </div>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Código de emparejamiento"
          className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-3 text-center text-lg tracking-widest"
          autoFocus
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          onClick={submit}
          disabled={sending || code.trim().length === 0}
          className="w-full rounded-xl bg-white py-3 font-bold text-neutral-900 disabled:opacity-50"
        >
          {sending ? "Emparejando…" : "Emparejar"}
        </button>
      </div>
    </div>
  )
}
