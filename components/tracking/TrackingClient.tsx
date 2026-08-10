"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toNumber } from "@/lib/supabase/numeric"
import { useLang } from "@/lib/i18n/LangProvider"
import { BrandProvider } from "@/lib/branding/BrandProvider"
import { displayFont } from "@/lib/fonts"
import type { OrderWithItems } from "@/lib/orders/getOrder"

const STEPS = ["recibido", "preparando", "listo", "entregado"] as const
const LINE = "#E4DCD0"
const INK = "#1A1512"
const INK_SOFT = "#6B615A"

function monogram(name: string) {
  const words = name.trim().split(/\s+/)
  return words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

export function TrackingClient({ initial }: { initial: OrderWithItems }) {
  const { t } = useLang()
  const [order, setOrder] = useState(initial.order)
  const [online, setOnline] = useState(true)
  const [notifyOn, setNotifyOn] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const audioCtx = useRef<AudioContext | null>(null)

  function playDing() {
    try {
      audioCtx.current ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      const ac = audioCtx.current
      ;[0, 0.2].forEach((d, i) => {
        const osc = ac.createOscillator()
        const gain = ac.createGain()
        osc.connect(gain)
        gain.connect(ac.destination)
        osc.type = "sine"
        osc.frequency.value = i ? 1175 : 880
        const t0 = ac.currentTime + d
        gain.gain.setValueAtTime(0.0001, t0)
        gain.gain.exponentialRampToValueAtTime(0.3, t0 + 0.012)
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.34)
        osc.start(t0)
        osc.stop(t0 + 0.36)
      })
      if (navigator.vibrate) navigator.vibrate([120, 70, 120])
    } catch {
      // sonido es un extra, nunca bloquea el flujo si el navegador lo rechaza
    }
  }

  // El aviso es opt-in (botón "Avísame cuando esté listo"): sin tocarlo, no
  // suena nada al llegar a "listo" — nadie quiere un sonido sorpresa que no pidió.
  function notifyReady() {
    playDing()
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        new Notification(t.tracking.titles.listo, { body: `${t.tracking.yourNumber} ${order.folio}` })
      } catch {
        // la notificación del navegador es un extra sobre el sonido, nunca bloquea
      }
    }
  }

  async function refetch(supabase: ReturnType<typeof createClient>) {
    const { data } = await supabase.from("orders").select("*").eq("id", initial.order.id).maybeSingle()
    if (data) {
      setOrder((prev) => {
        if (prev.status !== "listo" && data.status === "listo" && notifyOn) notifyReady()
        return {
          ...prev,
          ...data,
          subtotal: toNumber(data.subtotal),
          tax_amount: toNumber(data.tax_amount),
          total: toNumber(data.total),
        }
      })
    }
  }

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel(`order-${initial.order.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${initial.order.id}` },
        () => refetch(supabase),
      )
      .subscribe((status) => {
        setOnline(status === "SUBSCRIBED")
        if (status === "SUBSCRIBED") refetch(supabase) // re-sincroniza estado completo al (re)conectar
      })

    // Respaldo: si el canal en vivo se cae, no dejamos de intentar.
    const poll = setInterval(() => refetch(supabase), 8000)
    const clock = setInterval(() => setNow(Date.now()), 15000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(poll)
      clearInterval(clock)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifyOn])

  function toggleNotify() {
    setNotifyOn((v) => {
      const next = !v
      if (next && typeof Notification !== "undefined" && Notification.permission === "default") {
        Notification.requestPermission()
      }
      return next
    })
  }

  const stepIndex = STEPS.indexOf(order.status as (typeof STEPS)[number])
  const isDone = order.status === "entregado"
  const elapsedMin = Math.max(1, Math.round((now - new Date(order.created_at).getTime()) / 60000))
  const business = order.businesses

  const notifDenied = typeof Notification !== "undefined" && Notification.permission === "denied"

  return (
    <BrandProvider brandColor={business?.brand_color ?? null}>
      <div className={`${displayFont.variable} mx-auto max-w-lg pb-8`} style={{ background: "#FFFDF9", color: INK, minHeight: "100vh" }}>
        <header
          className="flex items-center gap-3 px-4 py-3.5"
          style={{ background: "var(--brand-primary)", color: "var(--brand-on-primary)" }}
        >
          <div
            className="grid h-11 w-11 flex-none place-items-center overflow-hidden rounded-full"
            style={{ background: "var(--brand-on-primary)", color: "var(--brand-primary)", boxShadow: "0 0 0 2px rgba(255,255,255,0.5)" }}
          >
            {business?.logo_url ? (
              // Mismo criterio que MenuClient: el logo es un sello, "contain"
              // con margen evita el aro oscuro que dejaba "cover" a este tamaño.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={business.logo_url} alt="" className="h-[88%] w-[88%] rounded-full object-contain" />
            ) : (
              <span style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>{monogram(business?.name ?? "FT")}</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="truncate uppercase leading-none" style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>
              {business?.name}
            </h1>
            {order.units?.name && <div className="mt-0.5 text-[11px] font-medium opacity-90">{order.units.name}</div>}
          </div>
          <div
            className="flex flex-none items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
            style={{ background: "rgba(0,0,0,.22)" }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: online ? "#4ADE80" : "#FF8A80" }} />
            {online ? t.tracking.live : t.tracking.offline}
          </div>
        </header>

        <div className="px-4 pt-5">
          <div className="pb-4 text-center">
            <div className="text-xs font-bold uppercase tracking-wide" style={{ color: INK_SOFT }}>
              {t.tracking.yourNumber}
            </div>
            <div className="leading-none" style={{ fontFamily: "var(--font-display)", fontSize: 72 }}>
              {order.folio}
            </div>
            {!isDone && (
              <div className="mt-1.5 text-[13px] font-medium" style={{ color: INK_SOFT }}>
                {initial.avgPrepMinutes ? t.tracking.waitWithAvg(elapsedMin, initial.avgPrepMinutes) : t.tracking.wait(elapsedMin)}
              </div>
            )}
          </div>

          <div
            className={`mb-5 rounded-2xl border-2 p-5 text-center ${stepIndex === 2 ? "animate-pulse" : ""}`}
            style={
              isDone
                ? { background: "#E8F5EE", borderColor: "#BFE3CE" }
                : stepIndex === 2
                  ? { background: "var(--brand-primary)", borderColor: "var(--brand-primary)", color: "var(--brand-on-primary)" }
                  : { background: "#FFFDF9", borderColor: LINE }
            }
          >
            <div className="uppercase leading-tight" style={{ fontFamily: "var(--font-display)", fontSize: 26, color: isDone ? "#14603C" : undefined }}>
              {t.tracking.titles[order.status as keyof typeof t.tracking.titles] ?? order.status}
            </div>
            <p className="mt-1.5 text-sm" style={{ color: isDone ? "#14603C" : stepIndex === 2 ? undefined : INK_SOFT, opacity: stepIndex === 2 && !isDone ? 0.94 : 1 }}>
              {t.tracking.subs[order.status as keyof typeof t.tracking.subs] ?? ""}
            </p>
          </div>

          <div className="mb-5 flex">
            {STEPS.map((s, i) => (
              <div key={s} className="relative flex-1 text-center">
                {i > 0 && (
                  <div
                    className="absolute top-[13px] h-[3px] w-full"
                    style={{ left: "-50%", background: i <= stepIndex ? "var(--brand-primary)" : LINE, zIndex: 1 }}
                  />
                )}
                <div
                  className="relative z-10 mx-auto mb-1.5 flex h-[26px] w-[26px] items-center justify-center rounded-full text-[13px] font-extrabold"
                  style={i <= stepIndex ? { background: "var(--brand-primary)", color: "var(--brand-on-primary)" } : { background: LINE, color: INK_SOFT }}
                >
                  {i < stepIndex ? "✓" : i + 1}
                </div>
                <div className="text-[11px] font-bold" style={{ color: i <= stepIndex ? INK : INK_SOFT }}>
                  {t.tracking.steps[s]}
                </div>
              </div>
            ))}
          </div>

          {!isDone && (
            <div
              className="mb-3 rounded-xl px-4 py-3 text-sm font-bold"
              style={
                order.payment_status === "pagada"
                  ? { background: "#E8F5EE", color: "#14603C" }
                  : { background: "#FDF3E0", color: "#6B4A12" }
              }
            >
              {order.payment_status === "pagada" ? t.tracking.paid : `${t.tracking.due}: $${order.total.toFixed(2)}`}
            </div>
          )}

          {stepIndex < 2 && (
            <>
              <button
                onClick={toggleNotify}
                className="mb-2 w-full rounded-xl border-2 py-3.5 text-sm font-extrabold"
                style={notifyOn ? { background: "#E8F5EE", borderColor: "#BFE3CE", color: "#14603C" } : { background: "#FFFDF9", borderColor: INK, color: INK }}
              >
                {notifyOn ? t.tracking.bellOn : t.tracking.bell}
              </button>
              <p className="mb-4 text-center text-xs leading-relaxed" style={{ color: INK_SOFT }}>
                {notifyOn ? (notifDenied ? t.tracking.bellDenied : t.tracking.bellNote) : online ? t.tracking.bellHint : t.tracking.bellHintOff}
              </p>
            </>
          )}

          <div className="rounded-xl border p-4" style={{ borderColor: LINE }}>
            <h3 className="mb-2.5 uppercase tracking-wide" style={{ fontFamily: "var(--font-display)", fontSize: 15, color: INK_SOFT }}>
              {t.tracking.whatYouOrdered}
            </h3>
            {initial.items.map((item) => {
              const customizations =
                (item.customizations_snapshot as { optionName: string; kind: string }[] | null) ?? []
              return (
                <div key={item.id} className="flex gap-2.5 border-b py-2 last:border-b-0" style={{ borderColor: LINE }}>
                  <div className="grid h-[26px] w-[26px] flex-none place-items-center rounded font-extrabold" style={{ background: "#F1EBE1" }}>
                    {item.quantity}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold leading-tight">{item.product_name_snapshot}</div>
                    {(customizations.length > 0 || item.notes) && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {customizations.map((c, i) => (
                          <span
                            key={i}
                            className="rounded px-1.5 py-0.5 text-[11px] font-bold"
                            style={c.kind === "add" ? { background: "#E4F3EA", color: "#14603C" } : { background: "#FBE7E7", color: "#8A1F23" }}
                          >
                            {c.kind === "add" ? "+ " : "− "}
                            {c.optionName}
                          </span>
                        ))}
                        {item.notes && (
                          <span className="rounded px-1.5 py-0.5 text-[11px] font-bold" style={{ background: "#F1EBE1", color: INK_SOFT }}>
                            &quot;{item.notes}&quot;
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex-none text-sm font-extrabold tabular-nums">${item.line_total.toFixed(2)}</div>
                </div>
              )
            })}
            <div className="mt-1 flex items-baseline justify-between border-t-2 pt-2.5" style={{ borderColor: LINE }}>
              <div className="font-extrabold">{t.tracking.total}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20 }}>${order.total.toFixed(2)}</div>
            </div>
          </div>
        </div>
      </div>
    </BrandProvider>
  )
}
