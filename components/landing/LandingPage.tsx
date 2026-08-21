"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import { useLang } from "@/lib/i18n/LangProvider"
import { displayFont, landingMonoFont } from "@/lib/fonts"
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
      <div className={styles.ticketRule}>{regla}</div>
      {/* space-between en vez de rellenar con espacios: el ticket real cuadra
          por número de caracteres, pero aquí el ancho lo manda el contenedor. */}
      <div className={styles.ticketRow}>
        <span>QR {l.ticketCustomer}</span>
        <span>7:48</span>
      </div>
      <div className={`${styles.ticketRow} ${styles.ticketFoot}`}>
        <span>{l.ticketCollect}</span>
        <span>$70.61</span>
      </div>
    </div>
  )
}

const ORDER_IDS = ["#0148", "#0147", "#0146"] as const
const BADGE_CLASS = [styles.badgeNew, styles.badgeWarn, styles.badgeReady]

// Posiciones fijas de los focos ambientales del hero — dato estático, no
// pertenece a un ref (no cambia entre renders ni necesita sobrevivir a uno).
const BULB_POSITIONS: [number, number][] = [
  [8, 18], [16, 10], [24, 20], [32, 9], [40, 18], [48, 8], [56, 17], [64, 9], [72, 18], [80, 10], [88, 19], [94, 11],
  [12, 30], [28, 28], [44, 32], [60, 27], [76, 31], [90, 28],
]

export function LandingPage() {
  const { lang, setLang, t } = useLang()
  const l = t.landing

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const heroRef = useRef<HTMLElement>(null)
  const lightsRef = useRef<HTMLDivElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const showcaseRef = useRef<HTMLElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

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
    const bulbs = lightsRef.current ? Array.from(lightsRef.current.children) as HTMLDivElement[] : []

    function handlePointerMove(e: PointerEvent) {
      const mx = (e.clientX / window.innerWidth) * 100
      const my = (e.clientY / window.innerHeight) * 100
      root.style.setProperty("--mx", mx + "%")
      root.style.setProperty("--my", my + "%")

      bulbs.forEach((b) => {
        const br = b.getBoundingClientRect()
        const bx = br.left + br.width / 2
        const by = br.top + br.height / 2
        const d = Math.hypot(e.clientX - bx, e.clientY - by)
        const t2 = Math.max(0, 1 - d / 240)
        b.style.background = `rgba(255,209,102,${(0.35 + 0.65 * t2).toFixed(2)})`
        b.style.boxShadow = `0 0 ${(6 + 34 * t2).toFixed(0)}px ${(2 + 10 * t2).toFixed(0)}px rgba(255,209,102,${(0.15 + 0.65 * t2).toFixed(2)})`
      })
    }

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
      <div className={styles.pageGlow} />

      <div className={styles.content}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <img src="/icons/icon-512.png" alt="" />
            FoodTruck<span style={{ color: "var(--brand)" }}>OS</span>
          </div>
          <nav className={styles.nav}>
            <a href="#escaparate">{l.navProduct}</a>
            <a href="#beneficios">{l.navBenefits}</a>
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
            {BULB_POSITIONS.map(([x, y], i) => (
              <div
                key={i}
                className={styles.bulb}
                style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(i * 0.37) % 3}s` }}
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
                  <span className={`${styles.badge} ${BADGE_CLASS[i]}`} style={{ fontFamily: "var(--font-landing-mono)" }}>
                    {o.badge}
                  </span>
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
                  { t: l.printWhy3Title, b: l.printWhy3Body },
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
