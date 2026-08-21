"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useLang } from "@/lib/i18n/LangProvider"

export function NewPasswordForm() {
  const { t } = useLang()
  const p = t.auth
  const router = useRouter()

  const [password, setPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  // Sin sesión no hay nada que guardar: el enlace se usó, venció, o lo abrió
  // el antivirus del correo antes que la persona. Decirlo al entrar evita que
  // teclee una contraseña nueva para que se la rechacen al final.
  const [sesion, setSesion] = useState<"revisando" | "si" | "no">("revisando")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data }) => setSesion(data.session ? "si" : "no"))
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const supabase = createClient()
    const { error: fallo } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (fallo) {
      setError(p.newPasswordFailed)
      return
    }
    setDone(true)
    setTimeout(() => router.push("/panel"), 1500)
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-1 text-2xl font-black tracking-tight text-neutral-50">{p.newPasswordTitle}</h1>
      <p className="mb-6 text-sm text-neutral-400">{p.newPasswordSubtitle}</p>

      {done ? (
        <p className="text-sm font-bold text-emerald-400">{p.newPasswordDone}</p>
      ) : sesion === "no" ? (
        <>
          <p className="mb-4 text-sm font-semibold text-amber-400">{p.newPasswordNoSession}</p>
          <Link
            href="/login/recuperar"
            className="block w-full rounded-xl bg-white py-3 text-center text-sm font-black text-neutral-900"
          >
            {p.recoverSend}
          </Link>
        </>
      ) : (
        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={p.newPasswordField}
            autoComplete="new-password"
            disabled={sesion === "revisando"}
            className="w-full rounded-xl border px-3.5 py-3 text-sm text-neutral-50 placeholder:text-neutral-500"
            style={{ background: "#161617", borderColor: "#3A3A3D" }}
          />
          {error && <p className="text-sm font-semibold text-amber-400">{error}</p>}
          <button
            type="submit"
            disabled={saving || sesion === "revisando"}
            className="w-full rounded-xl bg-white py-3 text-sm font-black text-neutral-900 disabled:opacity-50"
          >
            {saving ? p.newPasswordSaving : p.newPasswordSave}
          </button>
        </form>
      )}
    </div>
  )
}
