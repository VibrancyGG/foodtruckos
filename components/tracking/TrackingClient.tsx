"use client"

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"
import { createPublicClient } from "@/lib/supabase/public"
import { toNumber } from "@/lib/supabase/numeric"
import { useLang } from "@/lib/i18n/LangProvider"
import { BrandProvider } from "@/lib/branding/BrandProvider"
import { displayFont } from "@/lib/fonts"
import type { OrderWithItems } from "@/lib/orders/getOrder"

const STEPS = ["recibido", "preparando", "listo", "entregado"] as const
const LINE = "#E4DCD0"
const INK = "#1A1512"
const INK_SOFT = "#6B615A"

// La ventana que se le promete al comensal alrededor del promedio del truck.
// Un minuto exacto sería una promesa que la cocina no controla; un rango de
// unos cinco minutos se cumple casi siempre, y cuando no, la pantalla lo dice
// en vez de sostener una hora que ya pasó.
const ETA_ANTES = 2
const ETA_DESPUES = 3

// Lo que compone la hora en sí; lo que venga después es el meridiano ("p.m.",
// "PM"), que cambia con el idioma y no se puede dar por sentado.
const DIGITOS_HORA = "0123456789:"

type Conexion = "conectando" | "vivo" | "caido"

// Bandera de "ya estamos en el navegador", sin efecto ni estado: en el
// servidor devuelve false y en el cliente true, y React reconcilia solo.
const sinSuscripcion = () => () => {}
const enServidor = () => false
const enCliente = () => true

function monogram(name: string) {
  const words = name.trim().split(/\s+/)
  return words.length > 1 ? (words[0][0] + words[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase()
}

export function TrackingClient({ initial }: { initial: OrderWithItems }) {
  const { lang, t } = useLang()
  const [order, setOrder] = useState(initial.order)
  const [conexion, setConexion] = useState<Conexion>("conectando")
  const [notifyOn, setNotifyOn] = useState(false)
  const [avisando, setAvisando] = useState(false)
  const [avisadoLocal, setAvisadoLocal] = useState(false)
  const [readyAt, setReadyAt] = useState<string | null>(initial.readyAt)
  const [now, setNow] = useState(() => Date.now())

  // Las horas se arman con la zona horaria del navegador. En el servidor esa
  // zona es UTC, así que pintarlas antes de montar mostraría una hora ajena y
  // además rompería la hidratación.
  const montado = useSyncExternalStore(sinSuscripcion, enCliente, enServidor)

  // El aviso de llegada llega solo por Realtime (el refetch trae la orden
  // completa), así que sobrevive a recargar la página o a cambiar de celular
  // — no vive solo en esta pestaña. El estado local es únicamente para que el
  // botón se apague en el mismo toque, sin esperar la ida y vuelta.
  const arrived = Boolean(order.customer_arrived_at) || avisadoLocal

  const audioCtx = useRef<AudioContext | null>(null)
  // El aviso se lee por referencia, no por dependencia: si entrara en las deps
  // del efecto, tocar la campana destruiría y recrearía el canal en vivo.
  const notifyOnRef = useRef(false)
  useEffect(() => {
    notifyOnRef.current = notifyOn
  }, [notifyOn])

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
  const notifyReady = useCallback(() => {
    playDing()
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      try {
        new Notification(t.tracking.titles.listo, { body: `${t.tracking.yourNumber} ${order.folio}` })
      } catch {
        // la notificación del navegador es un extra sobre el sonido, nunca bloquea
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order.folio])

  const refetch = useCallback(
    async (supabase: ReturnType<typeof createPublicClient>) => {
      const { data } = await supabase.from("orders").select("*").eq("id", initial.order.id).maybeSingle()
      if (!data) return
      setOrder((prev) => {
        if (prev.status !== "listo" && data.status === "listo") {
          // El momento en que la cocina lo marcó, visto en vivo. Al recargar,
          // el servidor lo trae del evento de estado.
          setReadyAt(new Date().toISOString())
          if (notifyOnRef.current) notifyReady()
        }
        return {
          ...prev,
          ...data,
          subtotal: toNumber(data.subtotal),
          tax_amount: toNumber(data.tax_amount),
          total: toNumber(data.total),
        }
      })
    },
    [initial.order.id, notifyReady],
  )

  // Reconexión sola. Antes, si el canal se caía, la pantalla se quedaba en
  // "sin conexión" hasta que el comensal recargara a mano — y un comensal
  // parado en la banqueta no recarga: se queda mirando un estado viejo.
  useEffect(() => {
    const supabase = createPublicClient()
    let canal: ReturnType<typeof supabase.channel> | null = null
    let intentos = 0
    let reintento: ReturnType<typeof setTimeout> | null = null
    let estado: Conexion = "conectando"
    let vivo = true
    let vuelta = 0

    const aplicar = (c: Conexion) => {
      estado = c
      setConexion(c)
    }

    const programarReintento = () => {
      if (!vivo || reintento) return
      // 2 s, 4 s, 8 s, y de ahí en adelante cada 15 s. Sin techo, un truck sin
      // señal media hora dejaría de intentar justo cuando vuelve la señal.
      const espera = Math.min(2000 * 2 ** intentos, 15000)
      intentos++
      reintento = setTimeout(() => {
        reintento = null
        conectar()
      }, espera)
    }

    const conectar = () => {
      if (!vivo) return
      const anterior = canal
      // Nombre nuevo en cada intento: reutilizar el mismo deja al canal viejo
      // peleando con el nuevo por la misma suscripción.
      const nuevo = supabase.channel(`order-${initial.order.id}-${vuelta++}`)
      canal = nuevo
      if (anterior) supabase.removeChannel(anterior)
      if (estado !== "vivo") aplicar("conectando")

      nuevo
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${initial.order.id}` },
          () => refetch(supabase),
        )
        .subscribe((status) => {
          // Un canal que ya reemplazamos sigue avisando su cierre; sus avisos
          // no deben mover el estado del que está en uso.
          if (!vivo || canal !== nuevo) return
          if (status === "SUBSCRIBED") {
            intentos = 0
            aplicar("vivo")
            refetch(supabase) // re-sincroniza el estado completo al (re)conectar
          } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
            aplicar("caido")
            programarReintento()
          }
        })
    }

    conectar()

    // Respaldo: cada 8 s con el canal sano, cada 4 s mientras esté caído.
    let tic = 0
    const poll = setInterval(() => {
      tic++
      if (estado === "vivo" && tic % 2) return
      refetch(supabase)
    }, 4000)
    const reloj = setInterval(() => setNow(Date.now()), 15000)

    // Volver a la pestaña es la señal más fuerte de que el comensal quiere ver
    // su pedido ahora: se re-consulta de inmediato y, si el canal está caído,
    // se reconecta sin esperar el siguiente rebote.
    const alVolver = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return
      setNow(Date.now())
      refetch(supabase)
      if (estado !== "vivo") {
        intentos = 0
        if (reintento) {
          clearTimeout(reintento)
          reintento = null
        }
        conectar()
      }
    }
    const alPerderRed = () => aplicar("caido")

    document.addEventListener("visibilitychange", alVolver)
    window.addEventListener("online", alVolver)
    window.addEventListener("offline", alPerderRed)

    return () => {
      vivo = false
      if (reintento) clearTimeout(reintento)
      if (canal) supabase.removeChannel(canal)
      clearInterval(poll)
      clearInterval(reloj)
      document.removeEventListener("visibilitychange", alVolver)
      window.removeEventListener("online", alVolver)
      window.removeEventListener("offline", alPerderRed)
    }
  }, [initial.order.id, refetch])

  // Se escribe directo con el cliente anónimo, sin ruta propia: la base tiene
  // un permiso por columna que deja al comensal tocar SOLO customer_arrived_at
  // de un pedido que siga vivo. Cualquier otro campo lo rechaza Postgres, así
  // que no hace falta una ruta de servidor que salte RLS.
  //
  // El `.is(null)` hace que la primera vez mande: volver a tocar el botón no
  // reescribe la hora, y la cocina sigue viendo hace cuánto está esperando.
  async function avisarLlegue() {
    if (avisando || arrived) return
    // La confirmación aparece en el mismo toque, no cuando vuelva la red: el
    // comensal que no ve respuesta vuelve a picar el botón cinco veces.
    setAvisadoLocal(true)
    setAvisando(true)
    try {
      const supabase = createPublicClient()
      const { error } = await supabase
        .from("orders")
        .update({ customer_arrived_at: new Date().toISOString() })
        .eq("id", order.id)
        .is("customer_arrived_at", null)
      if (error) throw error
      await refetch(supabase)
    } catch {
      // Si no se pudo escribir, se deshace el aviso optimista para que el
      // botón vuelva y pueda intentarlo otra vez. Mentirle es peor.
      setAvisadoLocal(false)
    } finally {
      setAvisando(false)
    }
  }

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
  const isCancelled = order.status === "cancelado"
  const isReady = order.status === "listo"
  const activo = !isDone && !isCancelled
  const business = order.businesses

  const notifDenied = typeof Notification !== "undefined" && Notification.permission === "denied"

  // Cuánto falta, no cuánto lleva. El promedio sale de los pedidos reales de
  // este truck (getOrder), así que en hora pico sube solo. Y si la ventana ya
  // pasó, no se sostiene una hora mentirosa: se dice que va demorado.
  const locale = lang === "en" ? "en-US" : "es-MX"
  const hhmm = (d: Date) => d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" })
  // "entre las 5:28 p.m. y las 5:33 p.m." se lee como un trabalenguas. Si las
  // dos horas caen en el mismo meridiano, se dice una sola vez al final.
  function rango(a: Date, b: Date): [string, string] {
    const desde = hhmm(a)
    const hasta = hhmm(b)
    let i = 0
    while (i < hasta.length && (DIGITOS_HORA.includes(hasta[i]) || hasta[i].trim() === "")) i++
    const meridiano = hasta.slice(i)
    if (meridiano && desde.endsWith(meridiano)) {
      return [desde.slice(0, desde.length - meridiano.length).trim(), hasta]
    }
    return [desde, hasta]
  }
  const creado = new Date(order.created_at).getTime()
  const avg = initial.avgPrepMinutes

  function lineaTiempo() {
    if (!montado) return null
    if (isReady) {
      const desde = readyAt ? new Date(readyAt).getTime() : null
      if (!desde) return null
      const mins = Math.floor((now - desde) / 60000)
      return mins < 1 ? t.tracking.readyNow : t.tracking.readyAgo(mins)
    }
    // Sin al menos tres pedidos para promediar no se inventa una hora: el
    // truck recién abierto simplemente no muestra esta línea.
    if (!activo || !avg) return null
    const hasta = creado + (avg + ETA_DESPUES) * 60000
    if (now > hasta) return t.tracking.etaLate
    const desde = creado + Math.max(1, avg - ETA_ANTES) * 60000
    return t.tracking.etaWindow(...rango(new Date(desde), new Date(hasta)))
  }

  const tiempo = lineaTiempo()

  // El botón de llegada solo donde significa algo:
  //   - pedido de ventanilla: lo tomaron cara a cara, ya sabían que estaba ahí;
  //   - pedido ya listo: va camino a la ventanilla de todos modos;
  //   - entregado o cancelado: no queda nada que avisar.
  const puedeAvisarLlegada = activo && !isReady && order.channel !== "ventanilla"

  const pill: Record<Conexion, { color: string; texto: string | null }> = {
    vivo: { color: "#4ADE80", texto: null },
    conectando: { color: "#FBBF24", texto: t.tracking.connecting },
    caido: { color: "#FF8A80", texto: t.tracking.offline },
  }
  const estadoPill = pill[conexion]

  return (
    <BrandProvider brandColor={business?.brand_color ?? null}>
      {/* El crema y la banda de marca van al ancho completo de la pantalla; lo
          que se limita a max-w-lg es el CONTENIDO. Si el color viviera solo
          dentro de la columna, cualquier ventana más ancha que 512 px — un
          navegador con el zoom por debajo del 100 %, una tablet, la vista de
          escritorio — dejaría el encabezado flotando en medio de una página
          blanca, como una tarjeta suelta. */}
      <div className={`${displayFont.variable} pb-8`} style={{ background: "#FFFDF9", color: INK, minHeight: "100vh" }}>
        <header
          style={
            business?.header_style === "black"
              ? { background: "#0A0A0A", color: "#fff" }
              : { background: "var(--brand-primary)", color: "var(--brand-on-primary)" }
          }
        >
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-3.5">
          {business?.logo_url ? (
            // Mismo criterio que MenuClient: montado directo sobre el header,
            // sin placa — adopta el fondo (color de marca o negro).
            // eslint-disable-next-line @next/next/no-img-element
            <img src={business.logo_url} alt="" className="h-12 w-12 flex-none object-contain" />
          ) : (
            <div
              className="grid h-11 w-11 flex-none place-items-center rounded-full"
              style={
                business?.header_style === "black"
                  ? { background: "rgba(255,255,255,0.1)" }
                  : { background: "var(--brand-on-primary)", color: "var(--brand-primary)" }
              }
            >
              <span style={{ fontFamily: "var(--font-display)", fontSize: 15 }}>{monogram(business?.name ?? "FT")}</span>
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate uppercase leading-none" style={{ fontFamily: "var(--font-display)", fontSize: 17 }}>
              {business?.name}
            </h1>
            {order.units?.name && <div className="mt-0.5 text-[11px] font-medium opacity-90">{order.units.name}</div>}
          </div>
          {/* Conectado no necesita palabras: el punto verde basta. Solo cuando
              algo va mal la pantalla gasta texto en explicarlo. */}
          <div
            className="flex flex-none items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-bold"
            style={{ background: business?.header_style === "black" ? "rgba(255,255,255,.15)" : "rgba(0,0,0,.22)" }}
            title={estadoPill.texto ?? t.tracking.live}
            aria-label={estadoPill.texto ?? t.tracking.live}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: estadoPill.color }} />
            {estadoPill.texto}
          </div>
          </div>
        </header>

        <div className="mx-auto max-w-lg px-4 pt-5">
          <div className="pb-4 text-center">
            <div className="text-xs font-bold uppercase tracking-wide" style={{ color: INK_SOFT }}>
              {t.tracking.yourNumber}
            </div>
            <div className="leading-none" style={{ fontFamily: "var(--font-display)", fontSize: 72 }}>
              {order.folio}
            </div>
            {tiempo && (
              <div className="mx-auto mt-1.5 max-w-[19rem] text-[13px] font-medium leading-snug" style={{ color: INK_SOFT }}>
                {tiempo}
              </div>
            )}
          </div>

          <div
            className={`mb-5 rounded-2xl border-2 px-4 py-5 text-center ${isReady ? "animate-pulse" : ""}`}
            style={
              isDone
                ? { background: "#E8F5EE", borderColor: "#BFE3CE" }
                : isReady
                  ? { background: "var(--brand-primary)", borderColor: "var(--brand-primary)", color: "var(--brand-on-primary)" }
                  : { background: "#FFFDF9", borderColor: LINE }
            }
          >
            <div
              className="text-balance uppercase leading-tight"
              style={{ fontFamily: "var(--font-display)", fontSize: 24, color: isDone ? "#14603C" : undefined }}
            >
              {t.tracking.titles[order.status as keyof typeof t.tracking.titles] ?? order.status}
            </div>
            <p
              className="mx-auto mt-2 max-w-[22rem] text-balance text-sm leading-snug"
              style={{ color: isDone ? "#14603C" : isReady ? undefined : INK_SOFT, opacity: isReady ? 0.94 : 1 }}
            >
              {t.tracking.subs[order.status as keyof typeof t.tracking.subs] ?? ""}
            </p>
          </div>

          <div className="mb-5 flex">
            {STEPS.map((s, i) => (
              <div key={s} className="relative min-w-0 flex-1 text-center">
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
                <div className="truncate px-0.5 text-[11px] font-bold" style={{ color: i <= stepIndex ? INK : INK_SOFT }}>
                  {t.tracking.steps[s]}
                </div>
              </div>
            ))}
          </div>

          {/* El estado de pago manda sobre el texto: la misma tarjeta dice algo
              distinto mientras cocinan (puedes adelantarlo) que cuando ya está
              listo (págalo al recogerlo). Un "¿pasas a pagar ahora?" junto a un
              pedido que ya está en la ventanilla no significa nada. */}
          {activo &&
            (order.payment_status === "pagada" ? (
              <div className="mb-3 rounded-xl px-4 py-3 text-sm font-bold" style={{ background: "#E8F5EE", color: "#14603C" }}>
                {t.tracking.paid}
              </div>
            ) : (
              <div className="mb-3 rounded-xl px-4 py-3.5" style={{ background: "#FDF3E0", border: "1px solid #F0D9A8" }}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-extrabold uppercase tracking-wide" style={{ color: "#6B4A12" }}>
                    {t.tracking.payDueTitle}
                  </span>
                  <span className="text-lg font-black tabular-nums" style={{ color: "#6B4A12" }}>
                    ${order.total.toFixed(2)}
                  </span>
                </div>
                <p className="mt-1.5 text-[13px] leading-snug" style={{ color: "#7A5A20" }}>
                  {isReady ? t.tracking.payDueBodyReady : t.tracking.payDueBody}
                </p>
              </div>
            ))}

          {puedeAvisarLlegada && (
            <div className="mb-3">
              {arrived ? (
                <div
                  className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-center text-sm font-bold"
                  style={{ background: "#E8F5EE", color: "#14603C" }}
                >
                  <span aria-hidden="true">✅</span>
                  {t.tracking.imHereDone}
                </div>
              ) : (
                <>
                  <button
                    onClick={avisarLlegue}
                    disabled={avisando}
                    className="w-full rounded-xl border-2 py-3.5 text-sm font-extrabold disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ background: "#FFFDF9", borderColor: INK, color: INK }}
                  >
                    {t.tracking.imHere}
                  </button>
                  <p className="mt-1.5 text-center text-xs leading-relaxed" style={{ color: INK_SOFT }}>
                    {t.tracking.imHereHint}
                  </p>
                </>
              )}
            </div>
          )}

          {activo && !isReady && (
            <>
              <button
                onClick={toggleNotify}
                className="mb-2 w-full rounded-xl border-2 py-3.5 text-sm font-extrabold"
                style={notifyOn ? { background: "#E8F5EE", borderColor: "#BFE3CE", color: "#14603C" } : { background: "#FFFDF9", borderColor: INK, color: INK }}
              >
                {notifyOn ? t.tracking.bellOn : t.tracking.bell}
              </button>
              <p className="mb-4 text-center text-xs leading-relaxed" style={{ color: INK_SOFT }}>
                {notifyOn
                  ? notifDenied
                    ? t.tracking.bellDenied
                    : t.tracking.bellNote
                  : conexion === "caido"
                    ? t.tracking.bellHintOff
                    : t.tracking.bellHint}
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

          {/* Lo último que ve quien ya tiene su comida en la mano: qué hacer
              con esta pantalla. Sin esto la deja abierta sin saber si debe. */}
          {!activo && (
            <p className="mx-auto mt-5 max-w-[20rem] text-balance text-center text-xs leading-relaxed" style={{ color: INK_SOFT }}>
              {t.tracking.doneClose}
            </p>
          )}
        </div>
      </div>
    </BrandProvider>
  )
}
