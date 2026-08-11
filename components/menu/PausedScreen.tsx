"use client"

import { useLang } from "@/lib/i18n/LangProvider"

// Pantalla comercial de "cerrado por ahora" — lleva la marca del cliente
// (logo, color) porque es lo primero que ve un comensal parado frente al
// truck (foodtruckos-diseno: lo que ve el comensal pertenece al cliente).
// "notAvailable" (negocio suspendido por falta de pago) se queda neutro a
// propósito: no es un día de descanso del negocio, es un problema de cuenta.
export function PausedScreen({
  businessName,
  unitName,
  logoUrl,
  brandColor,
  reopenTime,
  notAvailable,
}: {
  businessName: string
  unitName?: string
  logoUrl?: string | null
  brandColor?: string | null
  reopenTime?: string | null
  notAvailable?: boolean
}) {
  const { lang, setLang, t } = useLang()
  const p = t.menu

  if (notAvailable) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-neutral-950 px-6 text-center text-white">
        <h1 className="text-xl font-bold">{businessName}</h1>
        <p className="text-neutral-400">{p.notAvailableBody}</p>
      </div>
    )
  }

  const accent = brandColor || "#E4572E"

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-5 px-6 text-center" style={{ background: "#141414" }}>
      <button
        onClick={() => setLang(lang === "es" ? "en" : "es")}
        className="absolute right-4 top-4 rounded-full border border-white/20 px-2.5 py-1 text-xs font-bold text-white/70"
      >
        {lang === "es" ? "EN" : "ES"}
      </button>

      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" className="h-24 w-24 object-contain" />
      ) : (
        <div
          className="grid h-24 w-24 place-items-center rounded-full text-3xl font-black text-white"
          style={{ background: accent }}
        >
          {businessName[0]?.toUpperCase()}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-black tracking-tight text-white">{businessName}</h1>
        {unitName && <p className="mt-0.5 text-sm text-white/50">{unitName}</p>}
      </div>

      <div className="rounded-2xl border px-5 py-4" style={{ borderColor: `${accent}55`, background: `${accent}1A` }}>
        <div className="mb-1 text-sm font-black uppercase tracking-wide" style={{ color: accent }}>
          {p.closedTitle}
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-white/80">
          {unitName ? p.closedBody(unitName) : null} {reopenTime ? p.reopensAt(reopenTime) : p.tryLaterHint}
        </p>
      </div>
    </div>
  )
}
