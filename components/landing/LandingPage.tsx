"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useLang } from "@/lib/i18n/LangProvider"
import { displayFont, landingMonoFont } from "@/lib/fonts"
import { MOTIFS } from "@/lib/branding/motifs"
import styles from "./landing.module.css"

function BenefitIcon({ path }: { path: string }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  )
}

const ICON_PATHS = {
  live: "M12 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm-4.2-2.2a6 6 0 0 1 0-7.6M16.2 8.2a6 6 0 0 1 0 7.6M4.9 19.1a10 10 0 0 1 0-14.2M19.1 4.9a10 10 0 0 1 0 14.2",
  bolt: "M13 2 4 14h6l-1 8 9-12h-6l1-8Z",
  noFee: "M5 19 19 5M8 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm8 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  phone: "M7 3h10a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm3 15h4",
  menu: "M4 19 15 8l1 5-11 6-1-5ZM17 5l2 2-2 2-2-2 2-2Z",
  print: "M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-2M6 14h12v7H6v-7Z",
  qr: "M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h2v2h-2v-2Zm4 0h2v2h-2v-2Zm-4 4h2v2h-2v-2Zm4 0h2v2h-2v-2Z",
  brand: "M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1.1.9-2 2-2h2.3A4.2 4.2 0 0 0 21 12c0-5-4-9-9-9Z M7.5 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm3-4a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm5 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  sparkles: "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3ZM5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8L5 15Z",
}

// La comanda tal como sale de lib/kitchen/escpos.ts: nombre del truck
// centrado, el folio grande porque es lo que se busca de un vistazo entre diez
// tickets colgados del riel, las cantidades a la izquierda y lo que se QUITA en
// mayúsculas — el error caro en cocina. Las reglas son guiones de verdad, no
// bordes: es una impresora térmica, no una hoja de estilos.
function Ticket({ l }: { l: ReturnType<typeof useLang>["t"]["landing"] }) {
  const regla = "-".repeat(80)
  return (
    <div className={styles.ticket} aria-label={l.ticketCaption}>
      <div className={`${styles.ticketCenter} ${styles.ticketUnit}`}>{l.ticketTruck}</div>
      <div className={styles.ticketRule}>{regla}</div>
      <div className={`${styles.ticketCenter} ${styles.ticketFolio}`}>
        {l.ticketOrder} #12
      </div>
      <div className={styles.ticketRule}>{regla}</div>
      <div className={styles.ticketGap} />
      <div className={styles.ticketItem}>{" 2  " + l.ticketItem1}</div>
      <div className={styles.ticketMod}>{"      - " + l.ticketItem1Remove}</div>
      <div className={styles.ticketMod}>{"      + " + l.ticketItem1Add}</div>
      <div className={styles.ticketItem}>{" 1  " + l.ticketItem2}</div>
      <div className={styles.ticketMod}>{'      "' + l.ticketItem2Note + '"'}</div>
      <div className={styles.ticketItem}>{" 1  " + l.ticketItem3}</div>
      <div className={styles.ticketRule}>{regla}</div>
      {/* space-between en vez de rellenar con espacios: el ticket real cuadra
          por número de caracteres, pero aquí el ancho lo manda el contenedor. */}
      <div className={styles.ticketRow}>
        <span>QR {l.ticketCustomer}</span>
        <span>7:48</span>
      </div>
      <div className={`${styles.ticketRow} ${styles.ticketFoot}`}>
        <span>{l.ticketCollect}</span>
        <span>$29.50</span>
      </div>
    </div>
  )
}

// Réplica del menú real, no una interpretación: mismo encabezado con el
// motivo de marca, mismos nombres en la tipografía de títulos y en mayúsculas,
// y los PRECIOS DEL DEMO tal cual. Los precios inventados son lo primero que
// delata una captura falsa ante alguien que sí tiene un food truck.
function PhoneMenu({ l }: { l: ReturnType<typeof useLang>["t"]["landing"] }) {
  const platillos = [
    { nombre: l.scanDish1, nota: l.scanDish1Note, precio: "$8.50", personalizable: true },
    { nombre: l.scanDish2, nota: l.scanDish2Note, precio: "$4.00", personalizable: false },
    { nombre: l.scanDish3, nota: l.scanDish3Note, precio: "$7.50", personalizable: true },
  ]
  return (
    <div className={styles.phone} aria-label={l.scanCaption}>
      <div className={styles.phoneScreen}>
        <div className={styles.phoneTop}>
          <svg width="100%" height="100%" className={styles.phoneMotif} aria-hidden="true">
            <defs>
              <pattern id="landingPhoneMotif" width="112" height="112" patternUnits="userSpaceOnUse">
                <g
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dangerouslySetInnerHTML={{ __html: MOTIFS.tacos.pat }}
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#landingPhoneMotif)" />
          </svg>
          <div className={styles.phoneLogo} />
          <div className={styles.phoneName} style={{ fontFamily: "var(--font-display)" }}>
            {l.ticketTruck}
          </div>
        </div>
        <div className={styles.phoneList}>
          {platillos.map((d) => (
            <div key={d.nombre} className={styles.dish}>
              <div className={styles.dishPhoto} />
              <div className={styles.dishBody}>
                <div className={styles.dishName} style={{ fontFamily: "var(--font-display)" }}>
                  {d.nombre}
                </div>
                {d.nota && <div className={styles.dishNote}>{d.nota}</div>}
                {d.personalizable && (
                  <span className={styles.dishChip}>
                    <i /> {l.scanCustomChip}
                  </span>
                )}
              </div>
              <div className={styles.dishPrice}>{d.precio}</div>
            </div>
          ))}
        </div>
        <div className={styles.phoneBar}>{l.scanPhoneCta}</div>
      </div>
    </div>
  )
}

const ORDER_IDS = ["#0148", "#0147", "#0146"] as const
const BADGE_CLASS = [styles.badgeNew, styles.badgeWarn, styles.badgeReady]

// El campo de pavesas del hero.
//
// Pavesa es la brasa que salta del fuego y sube apagándose. Antes esto era una
// rejilla de dieciocho puntos idénticos a dos alturas fijas: eso se lee como una
// guirnalda de feria, no como brasas. Una brasa real es densa cerca del fuego y
// rala arriba, cada una de su tamaño, y ninguna parpadea al mismo compás que su
// vecina.
//
// De ahí las tres cosas que definen cada una:
//   · la altura sesga la densidad — hay muchas abajo y pocas arriba
//   · el tamaño baja con la altura: las de arriba están más lejos y ya se apagan
//   · el tono va de oro a bermellón, con las más calientes abajo
//
// Las posiciones se calculan con un generador de semilla fija, no con
// Math.random: tienen que salir idénticas en el servidor y en el navegador o
// React se queja de que el HTML no coincide al hidratar.
function generarPavesas(cuantas: number) {
  let semilla = 20260829
  const aleatorio = () => {
    semilla = (semilla * 1664525 + 1013904223) % 4294967296
    return semilla / 4294967296
  }

  return Array.from({ length: cuantas }, () => {
    // Elevar a una potencia empuja el reparto hacia abajo: sin esto quedarían
    // uniformes de arriba abajo y volveríamos a la guirnalda.
    const altura = Math.pow(aleatorio(), 0.78)
    const y = 4 + altura * 92
    const cercania = altura            // 0 arriba y lejos, 1 abajo y cerca
    return {
      x: aleatorio() * 100,
      y,
      tam: 2 + cercania * 4.4,
      // Las de abajo arden más; las de arriba ya casi se apagaron.
      tono: cercania > 0.72 ? 2 : cercania > 0.42 ? 1 : 0,
      opacidad: 0.3 + cercania * 0.45,
      // Cada una con su propio compás, para que el campo nunca lata al unísono.
      subida: 9 + aleatorio() * 13,
      demora: aleatorio() * -22,
      parpadeo: 2.6 + aleatorio() * 3.4,
    }
  })
}

const PAVESAS = generarPavesas(88)

// El mismo aire, pero para el resto de la página.
//
// El hero es la lumbre; todo lo que viene debajo está cada vez más lejos de
// ella. Por eso este campo es otra cosa y no una copia: muchas menos, más
// pequeñas, más apagadas y subiendo más despacio — así se leen como brasas
// lejanas y no compiten con el texto de las secciones, que es lo que la gente
// vino a leer.
//
// El desvanecido hacia abajo NO se calcula aquí sino con una máscara en el CSS.
// Repartir la opacidad pavesa por pavesa daba escalones visibles; una máscara
// degradada sobre toda la capa baja parejo hasta desaparecer, y además es una
// sola declaración en vez de aritmética en ochenta y tantos elementos.
// Cuánto apaga la máscara del CSS a una altura dada de la página. Es la misma
// curva que .bgLightsLayer, escrita aquí para poder compensarla.
//
// Hace falta porque la máscara multiplica TODO lo que hay debajo, y eso incluye
// el avivado del cursor: en las secciones de abajo las pavesas sí reaccionaban,
// pero el resultado quedaba tan apagado que no se veía nada. La máscara debe
// apagar el reposo, no la reacción.
const PARADAS: [number, number][] = [
  [0, 1],
  [0.35, 0.72],
  [0.65, 0.46],
  [0.88, 0.2],
  [1, 0],
]

function mascaraEn(t: number) {
  for (let i = 1; i < PARADAS.length; i++) {
    const [x1, v1] = PARADAS[i]
    if (t <= x1) {
      const [x0, v0] = PARADAS[i - 1]
      return v0 + ((v1 - v0) * (t - x0)) / (x1 - x0)
    }
  }
  return 0
}

function generarPavesasDeFondo(cuantas: number) {
  let semilla = 71042
  const aleatorio = () => {
    semilla = (semilla * 1664525 + 1013904223) % 4294967296
    return semilla / 4294967296
  }

  return Array.from({ length: cuantas }, () => {
    const x = aleatorio() * 100
    // Repartidas parejo por el alto de la página: aquí no hay foco de calor
    // hacia el que apiñarse, la lumbre quedó arriba.
    const y = aleatorio() * 100
    return {
      x,
      y,
      // Lo que hay que multiplicar el avivado para que la máscara no se lo
      // coma. Se topa en 6 porque abajo del todo la máscara llega a cero y esto
      // se dispararía al infinito: ahí la pavesa ya no está, y forzarla a
      // brillar sería contradecir el desvanecido en el único sitio donde debe
      // ser total.
      compensa: Math.min(6, 1 / Math.max(mascaraEn(y / 100), 0.16)),
      tam: 1.6 + aleatorio() * 1.9,
      // Casi todas doradas. Una de cada seis se pone ámbar para que el campo no
      // quede plano, pero ninguna llega a bermellón: ese calor es del hero.
      tono: aleatorio() > 0.84 ? 1 : 0,
      opacidad: 0.22 + aleatorio() * 0.3,
      subida: 17 + aleatorio() * 18,
      demora: aleatorio() * -34,
    }
  })
}

const PAVESAS_FONDO = generarPavesasDeFondo(84)

// Oro, ámbar y bermellón: los tres tonos que ya usa la marca. El campo no
// introduce color nuevo, solo lo reparte por temperatura.
const TONOS = ["255,209,102", "255,138,61", "255,90,54"] as const

export function LandingPage() {
  const { lang, setLang, t } = useLang()
  const l = t.landing

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const heroRef = useRef<HTMLElement>(null)
  const lightsRef = useRef<HTMLDivElement>(null)
  const bgLightsRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const showcaseRef = useRef<HTMLElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  // El tablero se movía solo al pasar el mouse por encima — o sea, en ningún
  // celular, que es donde va a verse la mitad de las veces. Ahora las órdenes
  // avanzan solas: cada una toma el estado de la siguiente, igual que en un
  // turno real, y eso se ve igual con dedo que con mouse.
  const [turno, setTurno] = useState(0)
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const id = setInterval(() => setTurno((v) => v + 1), 2800)
    return () => clearInterval(id)
  }, [])

  // Revelado al hacer scroll: consistente en todas las secciones para que
  // ninguna "pierda fuerza" bajando la página, no solo el hero.
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll(`.${styles.reveal}, .${styles.staggerGrid}`)
    if (!els) return
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.in)
            io.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  // La luz que sigue el cursor vive en una capa fija de toda la página, no
  // solo del hero, para que el efecto acompañe al visitante en cualquier
  // sección. Se desactiva en pantallas táctiles, donde no hay puntero real
  // que seguir.
  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    if (!canHover) return

    const root = document.documentElement

    // Las dos capas se recorren juntas: la del hero y la de fondo. Cada una
    // tiene su propia caja de referencia, así que se guardan emparejadas.
    const grupos = [
      { capa: lightsRef.current, datos: PAVESAS },
      { capa: bgLightsRef.current, datos: PAVESAS_FONDO },
    ]
    const pavesas: { el: HTMLDivElement; grupo: number; i: number; ultimo: number }[] = []
    grupos.forEach((g, gi) => {
      if (!g.capa) return
      Array.from(g.capa.children).forEach((el, i) => {
        pavesas.push({ el: el as HTMLDivElement, grupo: gi, i, ultimo: 0 })
      })
    })

    // Dónde está cada pavesa, sin preguntárselo al navegador.
    //
    // La versión anterior llamaba a getBoundingClientRect() sobre cada punto en
    // cada movimiento del ratón. Eso obliga a recalcular la maquetación por
    // punto y por evento: con dieciocho ya costaba, y con cincuenta y cuatro la
    // página se habría atascado justo al mover el cursor, que es cuando se
    // supone que luce.
    //
    // Se mide UNA sola caja —la de la capa— y el resto sale de aritmética: la
    // posición de cada pavesa es un porcentaje fijo de esa caja.
    // Se guarda en coordenadas del DOCUMENTO, no de la pantalla: getBoundingClientRect
    // devuelve la posición relativa a la ventana, y esa cambia con cada scroll.
    // Guardándola en coordenadas de pantalla, bastaba que el visitante bajara un
    // poco para que el avivado apuntara cientos de píxeles fuera de sitio y
    // dejara de encenderse nada.
    const cajas = grupos.map(() => ({ x: 0, y: 0, w: 0, h: 0 }))
    function medir() {
      grupos.forEach((g, gi) => {
        const r = g.capa?.getBoundingClientRect()
        if (r) cajas[gi] = { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height }
      })
    }
    medir()

    // Y las pavesas SUBEN: el fotograma las desplaza hasta 118px hacia arriba a
    // lo largo de su ciclo. Un centro guardado al montar se queda viejo en
    // segundos, y el cursor acabaría encendiendo brasas que ya no están ahí.
    //
    // Como el recorrido es determinista (los mismos valores que declara el
    // fotograma ascender), la posición actual se calcula en vez de medirse —
    // exacto y sin tocar la maquetación.
    const DESDE_Y = 14
    const HASTA_Y = -104
    const HASTA_X = 14
    const RADIO = 260

    // desX/desY son el scroll actual: se leen una vez por cuadro, no una vez
    // por pavesa, y devuelven la posición a coordenadas de pantalla para poder
    // compararla con la del puntero.
    function centro(grupo: number, i: number, ahora: number, desX: number, desY: number): [number, number] {
      const p = grupos[grupo].datos[i]
      const caja = cajas[grupo]
      // La demora es negativa, así que restarla suma: la pavesa ya iba a medio
      // camino cuando la página cargó.
      const vuelta = ((ahora - p.demora) / p.subida) % 1
      const base = vuelta < 0 ? vuelta + 1 : vuelta
      return [
        caja.x - desX + (p.x / 100) * caja.w + p.tam / 2 + HASTA_X * base,
        caja.y - desY + (p.y / 100) * caja.h + p.tam / 2 + DESDE_Y + (HASTA_Y - DESDE_Y) * base,
      ]
    }

    // El desplazamiento se guarda y se aplica una sola vez por cuadro. Sin
    // esto el navegador dispara pointermove muchas más veces de las que puede
    // pintar, y se hace trabajo que nadie llega a ver.
    let x = 0
    let y = 0
    let pendiente = false

    function pintar() {
      pendiente = false
      root.style.setProperty("--mx", (x / window.innerWidth) * 100 + "%")
      root.style.setProperty("--my", (y / window.innerHeight) * 100 + "%")

      const ahora = performance.now() / 1000
      const desX = window.scrollX
      const desY = window.scrollY
      const alto = window.innerHeight

      for (let i = 0; i < pavesas.length; i++) {
        const p = pavesas[i]
        const c = centro(p.grupo, p.i, ahora, desX, desY)

        // Con dos capas hay ciento y pico de pavesas, y casi todas están fuera
        // de la pantalla en cualquier momento. Descartarlas con una resta antes
        // de hacer la raíz cuadrada evita el grueso del trabajo.
        let cerca = 0
        if (c[1] > -RADIO && c[1] < alto + RADIO) {
          const dx = x - c[0]
          const dy = y - c[1]
          if (dx > -RADIO && dx < RADIO && dy > -RADIO && dy < RADIO) {
            const d = Math.hypot(dx, dy)
            if (d < RADIO) cerca = 1 - d / RADIO
          }
        }

        // Y no se escribe si ya estaba apagada y sigue apagada: escribir una
        // propiedad personalizada obliga al navegador a recalcular estilos de
        // ese elemento, y sería tirar ese trabajo por las ~140 que en cualquier
        // momento están lejos del cursor.
        if (cerca === 0 && p.ultimo === 0) continue
        p.ultimo = cerca
        // El color lo compone el CSS a partir de esta sola propiedad. El tono
        // de cada pavesa es suyo: al acercarse el cursor se aviva, no se vuelve
        // del mismo dorado que todas las demás.
        p.el.style.setProperty("--avivada", cerca.toFixed(3))
      }
    }

    function handlePointerMove(e: PointerEvent) {
      x = e.clientX
      y = e.clientY
      if (!pendiente) {
        pendiente = true
        requestAnimationFrame(pintar)
      }
    }

    window.addEventListener("resize", medir)

    function handleShowcaseMove(e: PointerEvent) {
      const board = boardRef.current
      if (!board) return
      const br = board.getBoundingClientRect()
      const px = (e.clientX - (br.left + br.width / 2)) / br.width
      const py = (e.clientY - (br.top + br.height / 2)) / br.height
      const rx = Math.max(-9, Math.min(9, -py * 14))
      const ry = Math.max(-11, Math.min(11, px * 18))
      board.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`
    }
    function handleShowcaseLeave() {
      if (boardRef.current) boardRef.current.style.transform = ""
    }

    window.addEventListener("pointermove", handlePointerMove)
    const showcaseEl = showcaseRef.current
    showcaseEl?.addEventListener("pointermove", handleShowcaseMove)
    showcaseEl?.addEventListener("pointerleave", handleShowcaseLeave)

    return () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("resize", medir)
      showcaseEl?.removeEventListener("pointermove", handleShowcaseMove)
      showcaseEl?.removeEventListener("pointerleave", handleShowcaseLeave)
    }
  }, [])

  const orders = [
    { name: l.order1Name, items: l.order1Items, badge: l.order1Badge },
    { name: l.order2Name, items: l.order2Items, badge: l.order2Badge },
    { name: l.order3Name, items: l.order3Items, badge: l.order3Badge },
  ]
  const stats = [
    { n: "37", label: l.stat1Label },
    { n: "6.2m", label: l.stat2Label },
    { n: "$684", label: l.stat3Label },
  ]
  const benefits = [
    { icon: ICON_PATHS.live, title: l.benefit1Title, body: l.benefit1Body },
    { icon: ICON_PATHS.bolt, title: l.benefit2Title, body: l.benefit2Body },
    { icon: ICON_PATHS.noFee, title: l.benefit3Title, body: l.benefit3Body },
    { icon: ICON_PATHS.phone, title: l.benefit4Title, body: l.benefit4Body },
    { icon: ICON_PATHS.menu, title: l.benefit5Title, body: l.benefit5Body },
    { icon: ICON_PATHS.qr, title: l.benefit6Title, body: l.benefit6Body },
    { icon: ICON_PATHS.brand, title: l.benefit7Title, body: l.benefit7Body },
    { icon: ICON_PATHS.sparkles, title: l.benefit8Title, body: l.benefit8Body },
  ]
  const prices = [
    { tag: l.price1Tag, amount: "$69", mid: false },
    { tag: l.price2Tag, amount: "$59", mid: true },
    { tag: l.price3Tag, amount: "$49", mid: false },
  ]

  return (
    <div ref={rootRef} className={`${styles.page} ${displayFont.variable} ${landingMonoFont.variable}`}>
      {/* Va antes del contenido y por debajo de él: las pavesas de fondo son
          aire, no decoración encima del texto. La capa cubre el alto entero de
          la página porque .page es el contenedor posicionado. */}
      <div ref={bgLightsRef} className={styles.bgLightsLayer} aria-hidden="true">
        {PAVESAS_FONDO.map((p, i) => (
          <div
            key={i}
            className={styles.bulb}
            style={
              {
                left: `${p.x.toFixed(2)}%`,
                top: `${p.y.toFixed(2)}%`,
                width: `${p.tam.toFixed(2)}px`,
                height: `${p.tam.toFixed(2)}px`,
                "--tono": TONOS[p.tono],
                "--brillo": p.opacidad.toFixed(2),
                "--compensa": p.compensa.toFixed(2),
                animationDuration: `${p.subida.toFixed(1)}s`,
                animationDelay: `${p.demora.toFixed(1)}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      <div className={styles.pageGlow} />

      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <img src="/icons/icon-512.png" alt="" />
            {/* El nombre y la categoría, uno debajo del otro.
                "Pavessa" no dice por sí solo a qué se dedica, y en una landing
                que un dueño abre por primera vez eso cuesta caro. El renglón de
                abajo lo resuelve sin robarle protagonismo: mono, pequeño y muy
                espaciado, que es como se lee un descriptor y no un segundo
                nombre. Van en la misma jerarquía visual que tienen de verdad —
                la marca manda, la categoría explica. */}
            <span className={styles.brandLockup}>
              <span className={styles.brandName}>Pavessa</span>
              <span className={styles.brandDescriptor} style={{ fontFamily: "var(--font-landing-mono)" }}>
                FoodTruck OS
              </span>
            </span>
          </div>
          <nav className={styles.nav}>
            <a href="#pedir">{l.navScan}</a>
            <a href="#escaparate">{l.navProduct}</a>
            <a href="#comanda">{l.printEyebrow}</a>
            <a href="#precios">{l.navPricing}</a>
          </nav>
          <div className={styles.headerActions}>
            <button
              type="button"
              onClick={() => setLang(lang === "es" ? "en" : "es")}
              className={styles.langToggle}
              aria-label={lang === "es" ? "Switch to English" : "Cambiar a español"}
            >
              {lang === "es" ? "EN" : "ES"}
            </button>
            <Link href="/login" className={`${styles.btn} ${styles.btnGhost}`}>
              {l.navEnter}
            </Link>
            <Link href="/login/registro" className={`${styles.btn} ${styles.btnPrimary} ${styles.headerTrial}`}>
              {l.ctaTrial}
            </Link>
          </div>
        </header>

        <section ref={heroRef} className={styles.hero}>
          <div ref={lightsRef} className={styles.lightsLayer}>
            {PAVESAS.map((p, i) => (
              <div
                key={i}
                className={styles.bulb}
                style={
                  {
                    left: `${p.x.toFixed(2)}%`,
                    top: `${p.y.toFixed(2)}%`,
                    width: `${p.tam.toFixed(2)}px`,
                    height: `${p.tam.toFixed(2)}px`,
                    "--tono": TONOS[p.tono],
                    "--brillo": p.opacidad.toFixed(2),
                    // La demora es negativa: cada pavesa arranca a media
                    // subida, así el campo se ve ya encendido al cargar en vez
                    // de empezar las cincuenta y cuatro a la vez desde cero.
                    animationDuration: `${p.subida.toFixed(1)}s`,
                    animationDelay: `${p.demora.toFixed(1)}s`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>

          <span className={styles.eyebrow}>
            <span className={styles.eyebrowDot} /> {l.heroEyebrow}
          </span>
          <h1 className={styles.heroTitle} style={{ fontFamily: "var(--font-display)" }}>
            {l.heroTitleLine1}
            <br />
            <span className={styles.heroTitleAccent}>{l.heroTitleAccent}</span>
          </h1>
          <p className={styles.heroSub}>{l.heroSub}</p>
          <div className={styles.heroCta}>
            <Link href="/login/registro" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}>
              {l.heroCtaPrimary}
            </Link>
            <a href="#beneficios" className={`${styles.btn} ${styles.btnGhost} ${styles.btnLg}`}>
              {l.heroCtaSecondary}
            </a>
          </div>
          <p className={styles.heroMeta}>{l.heroMeta}</p>
        </section>

        <section id="pedir" className={styles.section}>
          <div className={`${styles.sectionHead} ${styles.reveal}`}>
            <div className={styles.sectionEyebrow} style={{ fontFamily: "var(--font-landing-mono)" }}>
              {l.scanEyebrow}
            </div>
            <h2 className={styles.sectionTitle}>{l.scanTitle}</h2>
            <p className={styles.sectionSub}>{l.scanSub}</p>
          </div>

          <div className={`${styles.scanGrid} ${styles.reveal}`}>
            <div className={styles.phoneCol}>
              <PhoneMenu l={l} />
              <p className={styles.phoneCaption}>{l.scanCaption}</p>
            </div>

            <div className={styles.scanSteps}>
              {[
                { t: l.scanStep1Title, b: l.scanStep1Body },
                { t: l.scanStep2Title, b: l.scanStep2Body },
                { t: l.scanStep3Title, b: l.scanStep3Body },
              ].map((paso, i) => (
                <div key={i} className={styles.scanStep}>
                  <span className={styles.n}>{i + 1}</span>
                  <div>
                    <h3>{paso.t}</h3>
                    <p>{paso.b}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section ref={showcaseRef} id="escaparate" className={`${styles.section} ${styles.showcase}`}>
          <div className={`${styles.sectionHead} ${styles.reveal}`}>
            <div className={styles.sectionEyebrow} style={{ fontFamily: "var(--font-landing-mono)" }}>
              {l.showcaseEyebrow}
            </div>
            <h2 className={styles.sectionTitle}>{l.showcaseTitle}</h2>
            <p className={styles.sectionSub}>{l.showcaseSub}</p>
          </div>
          <div className={`${styles.showcaseWrap} ${styles.reveal}`}>
            <div ref={boardRef} className={styles.boardCard}>
              <div className={styles.boardTop}>
                <span className="title">{l.boardTitle}</span>
                <span className={styles.boardLive} style={{ fontFamily: "var(--font-landing-mono)" }}>
                  <span className={styles.boardLiveDot} /> {l.boardLive}
                </span>
              </div>
              {orders.map((o, i) => (
                <div key={i} className={styles.order}>
                  <div className={styles.orderNum} style={{ fontFamily: "var(--font-landing-mono)" }}>
                    {ORDER_IDS[i]}
                  </div>
                  <div className={styles.orderMid}>
                    <div className={styles.orderName}>{o.name}</div>
                    <div className={styles.orderItems}>{o.items}</div>
                  </div>
                  {(() => {
                    const paso = (i + turno) % orders.length
                    return (
                      <span
                        key={paso}
                        className={`${styles.badge} ${BADGE_CLASS[paso]} ${styles.badgeSwap}`}
                        style={{ fontFamily: "var(--font-landing-mono)" }}
                      >
                        {orders[paso].badge}
                      </span>
                    )
                  })()}
                </div>
              ))}
              <div className={styles.boardStats}>
                {stats.map((s, i) => (
                  <div key={i} className={styles.stat}>
                    <div className={styles.statNum} style={{ fontFamily: "var(--font-landing-mono)" }}>
                      {s.n}
                    </div>
                    <div className={styles.statLabel}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className={`${styles.showcaseHint} ${styles.reveal}`}>{l.showcaseHint}</p>
        </section>

        <section id="comanda" className={styles.section}>
          <div className={`${styles.sectionHead} ${styles.reveal}`}>
            <div className={styles.sectionEyebrow} style={{ fontFamily: "var(--font-landing-mono)" }}>
              {l.printEyebrow}
            </div>
            <h2 className={styles.sectionTitle}>{l.printTitle}</h2>
            <p className={styles.sectionSub}>{l.printSub}</p>
          </div>

          <div className={`${styles.printGrid} ${styles.reveal}`}>
            <div className={styles.ticketCol}>
              <Ticket l={l} />
              <p className={styles.ticketCaption}>{l.ticketCaption}</p>
            </div>

            <div>
              <div className={styles.printWhy}>
                {[
                  { t: l.printWhy1Title, b: l.printWhy1Body },
                  { t: l.printWhy2Title, b: l.printWhy2Body },
                ].map((w, i) => (
                  <div key={i}>
                    <h3>{w.t}</h3>
                    <p>{w.b}</p>
                  </div>
                ))}
              </div>

              {/* Una línea, en voz baja. Lo que el prospecto necesita saber
                  aquí es que la opción existe — qué equipo hace falta y cuánto
                  cuesta es conversación de venta, no de landing. */}
              <p className={styles.printNote}>{l.printChoice}</p>
              <p className={styles.printCompat}>{l.printCompat}</p>
            </div>
          </div>
        </section>

        <section id="beneficios" className={styles.section}>
          <div className={`${styles.sectionHead} ${styles.reveal}`}>
            <div className={styles.sectionEyebrow} style={{ fontFamily: "var(--font-landing-mono)" }}>
              {l.benefitsEyebrow}
            </div>
            <h2 className={styles.sectionTitle}>{l.benefitsTitle}</h2>
            <p className={styles.sectionSub}>{l.benefitsSub}</p>
          </div>
          <div className={`${styles.benefits} ${styles.staggerGrid} ${styles.reveal}`}>
            {benefits.map((b, i) => (
              <div key={i} className={styles.benefitCard}>
                <div className={styles.benefitIcon}>
                  <BenefitIcon path={b.icon} />
                </div>
                <h3>{b.title}</h3>
                <p>{b.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="precios" className={styles.section}>
          <div className={`${styles.sectionHead} ${styles.reveal}`}>
            <div className={styles.sectionEyebrow} style={{ fontFamily: "var(--font-landing-mono)" }}>
              {l.pricingEyebrow}
            </div>
            <h2 className={styles.sectionTitle}>{l.pricingTitle}</h2>
            <p className={styles.sectionSub}>{l.pricingSub}</p>
          </div>
          <div className={`${styles.pricing} ${styles.staggerGrid} ${styles.reveal}`}>
            {prices.map((p, i) => (
              <div key={i} className={`${styles.priceCard} ${p.mid ? styles.priceCardMid : ""}`}>
                <div className={styles.priceTag}>{p.tag}</div>
                <div className={styles.priceNum} style={{ fontFamily: "var(--font-display)" }}>
                  {p.amount}
                  <span>{l.pricePer}</span>
                </div>
                <div className={styles.priceNote}>{l.priceNote}</div>
              </div>
            ))}
          </div>
        </section>

        <div className={`${styles.ctaBand} ${styles.reveal}`}>
          <h2>{l.ctaTitle}</h2>
          <p>{l.ctaSub}</p>
          <Link href="/login/registro" className={`${styles.btn} ${styles.btnPrimary} ${styles.btnLg}`}>
            {l.heroCtaPrimary}
          </Link>
        </div>

        <footer className={styles.footer}>
          <div className={styles.footerCredit}>
            <img src="/logo-vibrancy.png" alt="Vibrancy GG" />
            <span>{l.footerCredit}</span> © {new Date().getFullYear()}
          </div>
        </footer>
      </div>
    </div>
  )
}
