"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { toNumber } from "@/lib/supabase/numeric"
import { useLang } from "@/lib/i18n/LangProvider"
import { BrandProvider } from "@/lib/branding/BrandProvider"
import type { OrderWithItems } from "@/lib/orders/getOrder"

const STEPS = ["recibido", "preparando", "listo", "entregado"] as const

export function TrackingClient({ initial }: { initial: OrderWithItems }) {
  const { lang, t } = useLang()
  const [order, setOrder] = useState(initial.order)
  const [online, setOnline] = useState(true)
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

  async function refetch(supabase: ReturnType<typeof createClient>) {
    const { data } = await supabase.from("orders").select("*").eq("id", initial.order.id).maybeSingle()
    if (data) {
      setOrder((prev) => {
        if (prev.status !== "listo" && data.status === "listo") playDing()
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

    return () => {
      supabase.removeChannel(channel)
      clearInterval(poll)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const stepIndex = STEPS.indexOf(order.status as (typeof STEPS)[number])
  const isDone = order.status === "entregado"

  return (
    <BrandProvider brandColor={initial.order.businesses?.brand_color ?? null}>
      <div className="mx-auto max-w-lg p-4">
        <div
          className="mb-4 flex items-center justify-between rounded-full px-3 py-1 text-xs font-semibold"
          style={{ background: online ? "#E6F4EA" : "#FBE9E7", color: online ? "#1B5E20" : "#B71C1C" }}
        >
          <span>{online ? t.tracking.live : t.tracking.offline}</span>
        </div>

        <div className="mb-1 text-sm text-neutral-500">{t.tracking.yourNumber}</div>
        <div className="mb-6 text-5xl font-black">{order.folio}</div>

        <div className={`mb-6 rounded-2xl p-6 text-center ${stepIndex === 2 ? "animate-pulse" : ""}`} style={{ background: "var(--brand-primary)", color: "var(--brand-on-primary)" }}>
          <div className="text-lg font-bold">{t.tracking.titles[order.status as keyof typeof t.tracking.titles] ?? order.status}</div>
        </div>

        <div className="mb-6 flex justify-between">
          {STEPS.map((s, i) => (
            <div key={s} className={`text-center text-xs ${i <= stepIndex ? "font-bold" : "text-neutral-400"}`}>
              <div
                className="mx-auto mb-1 flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px]"
                style={i <= stepIndex ? { borderColor: "var(--brand-primary)", background: "var(--brand-primary)", color: "var(--brand-on-primary)" } : {}}
              >
                {i < stepIndex ? "✓" : i + 1}
              </div>
              {t.tracking.steps[s]}
            </div>
          ))}
        </div>

        {!isDone && (
          <div className="mb-6 rounded-xl bg-neutral-100 p-3 text-center text-sm font-semibold">
            {order.payment_status === "pagada" ? t.tracking.paid : `${t.tracking.due}: $${order.total.toFixed(2)}`}
          </div>
        )}

        <div className="rounded-xl border border-neutral-200 p-4">
          <h3 className="mb-2 text-sm font-bold uppercase text-neutral-500">{t.tracking.title}</h3>
          {initial.items.map((item) => (
            <div key={item.id} className="flex justify-between py-1 text-sm">
              <span>
                {item.quantity}× {item.product_name_snapshot}
              </span>
              <span>${item.line_total.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </BrandProvider>
  )
}
