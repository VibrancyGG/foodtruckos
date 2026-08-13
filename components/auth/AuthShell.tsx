"use client"

import { useEffect, useState } from "react"
import { useLang } from "@/lib/i18n/LangProvider"

// Tickets de ejemplo para el panel de marca — el mismo lenguaje visual que
// el tablero real de cocina (columnas Nueva/Preparando/Lista, color solo con
// función), para que el primer momento de la app ya sea el producto mismo
// en vez de una ilustración genérica.
const DEMO_TICKETS = ["Burrito x2", "Taco al pastor", "Torta mexicana", "Quesabirria", "Elote en vaso"]

const COLUMN_STYLE = [
  { border: "#5B8DEF", chip: "rgba(91,141,239,.14)", text: "#8FB2FF" },
  { border: "#F5A524", chip: "rgba(245,165,36,.14)", text: "#FFCB6B" },
  { border: "#30A46C", chip: "rgba(48,164,108,.14)", text: "#7EE2A8" },
]

function useTicketCycle() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setStep((s) => s + 1), 2600)
    return () => clearInterval(id)
  }, [])
  return step
}

export function AuthShell({ children }: { children: React.ReactNode }) {
  const { lang, setLang, t } = useLang()
  const p = t.auth
  const step = useTicketCycle()
  const columns = [p.ticketNew, p.ticketPrep, p.ticketReady]

  return (
    <div className="flex min-h-screen flex-col lg:flex-row" style={{ background: "#0B0B0C" }}>
      <aside className="relative hidden overflow-hidden px-10 py-12 lg:flex lg:w-[46%] lg:flex-col lg:justify-between">
        <div
          className="pointer-events-none absolute inset-0 motion-safe:animate-[pulse_8s_ease-in-out_infinite]"
          style={{ background: "radial-gradient(circle at 15% 15%, rgba(255,90,54,.16), transparent 55%)" }}
        />
        <div className="relative">
          <div className="text-sm font-black tracking-tight text-white">FoodTruckOS</div>
        </div>

        <div className="relative">
          <div
            className="mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
            style={{ background: "rgba(255,90,54,.14)", color: "#FF8A5C" }}
          >
            <span className="h-1.5 w-1.5 rounded-full motion-safe:animate-pulse" style={{ background: "#FF5A36" }} />
            {p.signatureEyebrow}
          </div>
          <h1 className="mb-2.5 max-w-sm text-[26px] font-black leading-[1.1] tracking-tight text-white">{p.signatureHeadline}</h1>
          <p className="max-w-sm text-sm leading-relaxed text-neutral-400">{p.signatureBody}</p>
        </div>

        <div className="relative grid grid-cols-3 gap-2.5">
          {columns.map((label, col) => {
            const style = COLUMN_STYLE[col]
            const ticket = DEMO_TICKETS[(step + DEMO_TICKETS.length - col) % DEMO_TICKETS.length]
            return (
              <div key={col} className="rounded-xl border p-2.5" style={{ borderColor: "#232019", background: "#141414" }}>
                <div className="mb-2 text-[10px] font-black uppercase tracking-wide" style={{ color: style.text }}>
                  {label}
                </div>
                <div
                  key={ticket}
                  className="rounded-lg px-2 py-2.5 text-[11.5px] font-bold leading-tight text-white motion-safe:animate-[ticketIn_.5s_ease-out]"
                  style={{ background: style.chip, borderLeft: `3px solid ${style.border}` }}
                >
                  {ticket}
                </div>
              </div>
            )
          })}
        </div>
      </aside>

      <main className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <span className="text-sm font-black tracking-tight text-white">FoodTruckOS</span>
            <button
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              className="rounded-full border border-neutral-700 px-2.5 py-1 text-[11px] font-bold text-neutral-300"
            >
              {lang === "es" ? "EN" : "ES"}
            </button>
          </div>

          {/* Versión condensada del momento de marca del panel izquierdo —
              en pantallas < 1024px ese panel se oculta por completo
              (lg:flex), y la mayoría de dueños entra desde el celular, así
              que sin esto el primer momento de la app era un formulario
              genérico en vez del producto mismo. */}
          <div className="mb-7 lg:hidden">
            <div
              className="mb-2.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
              style={{ background: "rgba(255,90,54,.14)", color: "#FF8A5C" }}
            >
              <span className="h-1.5 w-1.5 rounded-full motion-safe:animate-pulse" style={{ background: "#FF5A36" }} />
              {p.signatureEyebrow}
            </div>
            <h1 className="text-[20px] font-black leading-[1.15] tracking-tight text-white">{p.signatureHeadline}</h1>
          </div>
          <div className="mb-6 hidden justify-end lg:flex">
            <button
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              className="rounded-full border border-neutral-700 px-2.5 py-1 text-[11px] font-bold text-neutral-300"
            >
              {lang === "es" ? "EN" : "ES"}
            </button>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
