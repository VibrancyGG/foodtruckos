"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { getPostLoginRedirect } from "@/lib/auth/actions"
import { useLang } from "@/lib/i18n/LangProvider"

type Estado = "revisando" | "listo" | "sinEnlace"

export function NewPasswordForm() {
  const { t } = useLang()
  const p = t.auth

  const [password, setPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [estado, setEstado] = useState<Estado>("revisando")

  // El enlace de recuperación llega con la sesión en el FRAGMENTO de la URL
  // (#access_token=…), no en la consulta. Eso es a propósito: el fragmento no
  // viaja al servidor, así que el enlace no depende del navegador que lo pidió
  // — se puede pedir en la computadora y abrir en el celular, que es como lo
  // usa la gente de verdad.
  //
  // Aquí se canjea a mano por una sesión de cookie (setSession), que es la que
  // el panel entiende, y se limpia el fragmento para que la contraseña nueva
  // no quede escrita en el historial del navegador.
  useEffect(() => {
    const supabase = createClient()

    async function abrirSesion() {
      const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : ""
      const params = new URLSearchParams(hash)

      const descripcion = params.get("error_description")
      if (descripcion) {
        setEstado("sinEnlace")
        return
      }

      const access_token = params.get("access_token")
      const refresh_token = params.get("refresh_token")

      if (access_token && refresh_token) {
        const { error: fallo } = await supabase.auth.setSession({ access_token, refresh_token })
        // Se borra el fragmento pase lo que pase: dejar tokens en la barra de
        // direcciones no le sirve a nadie.
        window.history.replaceState(null, "", window.location.pathname)
        setEstado(fallo ? "sinEnlace" : "listo")
        return
      }

      // Sin fragmento: puede que ya venga con sesión (volvió a la pestaña, o
      // entró desde el panel a cambiar su contraseña).
      const { data } = await supabase.auth.getSession()
      setEstado(data.session ? "listo" : "sinEnlace")
    }

    abrirSesion()
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
    // Navegación completa y por el mismo camino que el login normal: la cookie
    // de sesión se escribe en un listener asíncrono, así que empujar la ruta de
    // inmediato puede ganarle a esa escritura. Y el destino depende del rol —
    // no todos los que recuperan contraseña van al panel del dueño.
    const destino = await getPostLoginRedirect()
    setTimeout(() => {
      window.location.href = destino
    }, 1200)
  }

  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-1 text-2xl font-black tracking-tight text-neutral-50">{p.newPasswordTitle}</h1>
      <p className="mb-6 text-sm text-neutral-400">{p.newPasswordSubtitle}</p>

      {done ? (
        <p className="text-sm font-bold text-emerald-400">{p.newPasswordDone}</p>
      ) : estado === "sinEnlace" ? (
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
            disabled={estado === "revisando"}
            className="w-full rounded-xl border px-3.5 py-3 text-sm text-neutral-50 placeholder:text-neutral-500 disabled:opacity-50"
            style={{ background: "#161617", borderColor: "#3A3A3D" }}
          />
          {error && <p className="text-sm font-semibold text-amber-400">{error}</p>}
          <button
            type="submit"
            disabled={saving || estado === "revisando"}
            className="w-full rounded-xl bg-white py-3 text-sm font-black text-neutral-900 disabled:opacity-50"
          >
            {saving ? p.newPasswordSaving : p.newPasswordSave}
          </button>
        </form>
      )}
    </div>
  )
}
