"use client"

import { useState, useTransition } from "react"
import { PALETTE } from "@/lib/branding/palette"
import { onColorFor, contrastRatio } from "@/lib/branding/color"
import { MOTIFS, isBrandMotif, type BrandMotif } from "@/lib/branding/motifs"
import { uploadLogo, saveBrandSettings, updateUnitBrandColor } from "@/lib/media/actions"
import { useLang } from "@/lib/i18n/LangProvider"
import { toNumber } from "@/lib/supabase/numeric"
import { displayFont } from "@/lib/fonts"
import { Button } from "./ui/Button"

type MenuStyle = "vibrante" | "tradicional"
type UnitBrand = { id: string; name: string; brand_color: string | null }
type PreviewProduct = {
  id: string
  name_es: string
  name_en: string | null
  description_es: string | null
  description_en: string | null
  price: number
  photo_url: string | null
}

export function MarcaForm({
  businessName,
  initialLogoUrl,
  initialColor,
  initialStyle,
  initialMotif,
  initialHeaderStyle,
  units,
  previewProducts,
}: {
  businessName: string
  initialLogoUrl: string | null
  initialColor: string
  initialStyle: string
  initialMotif: string
  initialHeaderStyle: "color" | "black"
  units: UnitBrand[]
  previewProducts: PreviewProduct[]
}) {
  const { lang, t } = useLang()
  const p = t.panel.marcaPage
  const c = t.panel.common
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl)
  const [color, setColor] = useState(initialColor)
  const [style, setStyle] = useState<MenuStyle>(
    initialStyle === "tradicional" ? "tradicional" : "vibrante",
  )
  const [motif, setMotif] = useState<BrandMotif>(isBrandMotif(initialMotif) ? initialMotif : "tacos")
  const [headerStyle, setHeaderStyle] = useState<"color" | "black">(initialHeaderStyle)
  const [dirty, setDirty] = useState(false)
  const [saving, startSaving] = useTransition()
  const [saved, setSaved] = useState(false)

  const onColor = onColorFor(color)

  function save() {
    setSaved(false)
    startSaving(async () => {
      const result = await saveBrandSettings({ brandColor: color, menuStyle: style, brandMotif: motif, headerStyle })
      if (result.ok) {
        setDirty(false)
        setSaved(true)
      }
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <div data-tour="onboarding-marca-title" className="panel-animate-in">
          <h1 className="mb-1 font-[family-name:var(--font-panel-display)] text-2xl font-bold text-panel-ink">{p.title}</h1>
          <p className="mb-2 text-sm text-panel-ink-soft">{p.subtitle}</p>
        </div>

        <section
          data-tour="onboarding-marca-logo"
          className="panel-animate-in rounded-[20px] border border-panel-line bg-panel-surface p-5 shadow-[0_1px_2px_rgba(23,20,15,0.04)]"
          style={{ animationDelay: "40ms" }}
        >
          <span className="text-[11px] font-black tracking-wide text-panel-brand">{p.step1}</span>
          <h2 className="mb-1 font-bold text-panel-ink">{p.uploadLogoTitle}</h2>
          <p className="mb-4 text-sm text-panel-ink-soft">{p.uploadLogoHint}</p>
          <ImageUploaderInline
            currentUrl={logoUrl}
            action={uploadLogo}
            onUploaded={(url) => setLogoUrl(url)}
          />
        </section>

        <section
          className="panel-animate-in rounded-[20px] border border-panel-line bg-panel-surface p-5 shadow-[0_1px_2px_rgba(23,20,15,0.04)]"
          style={{ animationDelay: "80ms" }}
        >
          <span className="text-[11px] font-black tracking-wide text-panel-brand">{p.step2}</span>
          <h2 className="mb-1 font-bold text-panel-ink">{p.chooseColorTitle}</h2>
          <p className="mb-4 text-sm text-panel-ink-soft">{p.chooseColorHint}</p>
          <div className="flex flex-wrap gap-2.5" role="group" aria-label="Color de marca">
            {PALETTE.map((pt) => (
              <button
                key={pt.hex}
                type="button"
                aria-pressed={color === pt.hex}
                title={pt.name}
                onClick={() => {
                  setColor(pt.hex)
                  setDirty(true)
                }}
                className="relative h-12 w-12 rounded-xl border-2 transition-transform active:scale-95"
                style={{
                  background: pt.hex,
                  borderColor: color === pt.hex ? "#1A1512" : "transparent",
                }}
              >
                {color === pt.hex && (
                  <span
                    className="absolute inset-0 flex items-center justify-center text-lg font-black"
                    style={{ color: onColorFor(pt.hex) }}
                  >
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="mt-3.5 flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
            <span aria-hidden="true">✓</span>
            <span>
              {p.contrastConfirm(
                PALETTE.find((pt) => pt.hex === color)?.name ?? color,
                contrastRatio(color, onColor).toFixed(1),
              )}
            </span>
          </div>
        </section>

        <section
          className="panel-animate-in rounded-[20px] border border-panel-line bg-panel-surface p-5 shadow-[0_1px_2px_rgba(23,20,15,0.04)]"
          style={{ animationDelay: "120ms" }}
        >
          <span className="text-[11px] font-black tracking-wide text-panel-brand">{p.step3}</span>
          <h2 className="mb-1 font-bold text-panel-ink">{p.styleTitle}</h2>
          <p className="mb-4 text-sm text-panel-ink-soft">{p.styleHint}</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              aria-pressed={style === "vibrante"}
              onClick={() => {
                setStyle("vibrante")
                setDirty(true)
              }}
              className={`rounded-xl border-2 p-3.5 text-left transition-colors ${style === "vibrante" ? "border-panel-brand bg-panel-brand-soft/50" : "border-panel-line hover:border-panel-ink/15"}`}
            >
              <div className="font-bold text-panel-ink">{p.vibrante}</div>
              <div className="text-xs text-panel-ink-soft">{p.vibranteHint}</div>
            </button>
            <button
              type="button"
              aria-pressed={style === "tradicional"}
              onClick={() => {
                setStyle("tradicional")
                setDirty(true)
              }}
              className={`rounded-xl border-2 p-3.5 text-left transition-colors ${style === "tradicional" ? "border-panel-brand bg-panel-brand-soft/50" : "border-panel-line hover:border-panel-ink/15"}`}
            >
              <div className="font-bold text-panel-ink">{p.tradicional}</div>
              <div className="text-xs text-panel-ink-soft">{p.tradicionalHint}</div>
            </button>
          </div>
        </section>

        <section
          className="panel-animate-in rounded-[20px] border border-panel-line bg-panel-surface p-5 shadow-[0_1px_2px_rgba(23,20,15,0.04)]"
          style={{ animationDelay: "160ms" }}
        >
          <span className="text-[11px] font-black tracking-wide text-panel-brand">{p.motifStep}</span>
          <h2 className="mb-1 font-bold text-panel-ink">{p.motifTitle}</h2>
          <p className="mb-4 text-sm text-panel-ink-soft">{p.motifHint}</p>
          <div className="flex flex-wrap gap-2.5">
            {(Object.entries(MOTIFS) as [BrandMotif, (typeof MOTIFS)[BrandMotif]][]).map(([key, m]) => (
              <button
                key={key}
                type="button"
                aria-pressed={motif === key}
                onClick={() => {
                  setMotif(key)
                  setDirty(true)
                }}
                className={`flex items-center gap-2 rounded-xl border-2 px-3.5 py-2 text-sm font-bold transition-colors ${motif === key ? "border-panel-brand bg-panel-brand-soft/50 text-panel-ink" : "border-panel-line text-panel-ink-soft hover:border-panel-ink/15"}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                  dangerouslySetInnerHTML={{ __html: m.ic }}
                />
                {m.name}
              </button>
            ))}
          </div>

          {units.length > 1 && (
            <details className="mt-4 border-t border-panel-line pt-3.5">
              <summary className="cursor-pointer text-sm font-bold text-panel-ink-soft hover:text-panel-ink">{p.truckOverrideSummary}</summary>
              <p className="mt-2.5 text-xs leading-relaxed text-panel-ink-soft">{p.truckOverrideBody}</p>
              <div className="mt-2 space-y-0.5">
                {units.map((u) => (
                  <TruckBrandOverrideRow key={u.id} unit={u} businessColor={color} />
                ))}
              </div>
            </details>
          )}
        </section>

        <section
          className="panel-animate-in rounded-[20px] border border-panel-line bg-panel-surface p-5 shadow-[0_1px_2px_rgba(23,20,15,0.04)]"
          style={{ animationDelay: "200ms" }}
        >
          <span className="text-[11px] font-black tracking-wide text-panel-brand">{p.headerStyleStep}</span>
          <h2 className="mb-1 font-bold text-panel-ink">{p.headerStyleTitle}</h2>
          <p className="mb-4 text-sm text-panel-ink-soft">{p.headerStyleHint}</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              aria-pressed={headerStyle === "color"}
              onClick={() => {
                setHeaderStyle("color")
                setDirty(true)
              }}
              className={`rounded-xl border-2 p-3.5 text-left transition-colors ${headerStyle === "color" ? "border-panel-brand bg-panel-brand-soft/50" : "border-panel-line hover:border-panel-ink/15"}`}
            >
              <div className="font-bold text-panel-ink">{p.headerStyleColor}</div>
              <div className="text-xs text-panel-ink-soft">{p.headerStyleColorHint}</div>
            </button>
            <button
              type="button"
              aria-pressed={headerStyle === "black"}
              onClick={() => {
                setHeaderStyle("black")
                setDirty(true)
              }}
              className={`rounded-xl border-2 p-3.5 text-left transition-colors ${headerStyle === "black" ? "border-panel-brand bg-panel-brand-soft/50" : "border-panel-line hover:border-panel-ink/15"}`}
            >
              <div className="font-bold text-panel-ink">{p.headerStyleBlack}</div>
              <div className="text-xs text-panel-ink-soft">{p.headerStyleBlackHint}</div>
            </button>
          </div>
        </section>

        <div className="sticky bottom-4 flex items-center justify-between rounded-[20px] border border-panel-line bg-panel-surface p-4 shadow-[0_16px_40px_-12px_rgba(23,20,15,0.25)]">
          <span className="text-sm text-panel-ink-soft">
            {saving ? c.saving : saved ? c.saved : dirty ? p.unsavedLabel : p.noChangesLabel}
          </span>
          <Button onClick={save} disabled={!dirty || saving}>
            {p.saveChanges}
          </Button>
        </div>
      </div>

      <aside className="order-first sticky top-0 z-10 -mx-4 bg-panel-bg px-4 pb-3 lg:order-none lg:static lg:top-4 lg:mx-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:sticky">
        <div className="mb-2 flex items-center justify-between text-xs font-bold text-panel-ink-soft">
          <span>{p.previewLabel}</span>
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-700">{p.liveLabel}</span>
        </div>
        <div className={`${displayFont.variable} overflow-hidden rounded-[28px] border-[10px] border-neutral-900 bg-white`}>
          <div
            className="relative flex items-center gap-2.5 overflow-hidden px-3 py-3.5"
            style={headerStyle === "black" ? { background: "#0A0A0A", color: "#fff" } : { background: color, color: onColor }}
          >
            <svg className="pointer-events-none absolute inset-0 opacity-20" aria-hidden="true">
              <defs>
                <pattern id="marcaPreviewMotif" width="112" height="112" patternUnits="userSpaceOnUse">
                  <g
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    dangerouslySetInnerHTML={{ __html: MOTIFS[motif].pat }}
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#marcaPreviewMotif)" />
            </svg>
            {/* Mismo tratamiento que el header real (MenuClient/TrackingClient):
                misma tipografía, mismo mayúsculas, misma proporción logo/texto
                — para que "así lo verá tu cliente" no mienta. */}
            {logoUrl ? (
              // Montado directo sobre el header, sin placa — adopta el fondo
              // (color de marca o negro), igual que en el menú real.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="relative z-10 h-12 w-12 flex-none object-contain" />
            ) : (
              <div
                className="relative z-10 h-10 w-10 flex-none rounded-full"
                style={{ background: headerStyle === "black" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.25)" }}
              />
            )}
            <div
              className="relative z-10 truncate uppercase leading-[0.95] tracking-tight"
              style={{ fontFamily: "var(--font-display)", fontSize: 19 }}
            >
              {businessName}
            </div>
          </div>
          {previewProducts.length === 0 ? (
            <p className="p-4 text-center text-xs text-neutral-400">{p.previewNoProducts}</p>
          ) : style === "vibrante" ? (
            <div className="divide-y divide-neutral-200">
              {previewProducts.map((prod) => {
                const name = (lang === "es" ? prod.name_es : prod.name_en) || prod.name_es
                const desc = (lang === "es" ? prod.description_es : prod.description_en) || ""
                return (
                  <div key={prod.id} className="grid grid-cols-[44px_1fr_auto] items-start gap-2.5 p-2.5">
                    {prod.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={prod.photo_url} alt="" className="h-11 w-11 rounded-sm object-cover" />
                    ) : (
                      <div
                        className="grid h-11 w-11 place-items-center rounded-sm text-sm font-black"
                        style={{ background: color, color: onColor }}
                      >
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="truncate text-xs font-bold uppercase text-neutral-900">{name}</div>
                      {desc && <div className="mt-0.5 line-clamp-2 text-[10px] text-neutral-500">{desc}</div>}
                    </div>
                    <div className="whitespace-nowrap text-xs font-black text-neutral-900">${toNumber(prod.price).toFixed(2)}</div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="divide-y divide-neutral-200">
              {previewProducts.map((prod) => {
                const name = (lang === "es" ? prod.name_es : prod.name_en) || prod.name_es
                const desc = (lang === "es" ? prod.description_es : prod.description_en) || ""
                return (
                  <div key={prod.id} className="p-2.5">
                    <div className="flex items-baseline gap-1.5">
                      <span className="flex-none text-xs font-bold uppercase text-neutral-900">{name}</span>
                      <span className="-translate-y-1 flex-1 border-b border-dotted border-neutral-300" />
                      <span className="whitespace-nowrap text-xs font-black text-neutral-900">${toNumber(prod.price).toFixed(2)}</span>
                    </div>
                    {desc && <div className="mt-0.5 text-[10px] text-neutral-500">{desc}</div>}
                  </div>
                )
              })}
            </div>
          )}
          <div className="p-2.5">
            <div
              className="rounded-lg py-2 text-center text-xs font-black uppercase"
              style={{ background: color, color: onColor }}
            >
              {p.addPreviewLabel}
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

function TruckBrandOverrideRow({ unit, businessColor }: { unit: UnitBrand; businessColor: string }) {
  const { t } = useLang()
  const p = t.panel.marcaPage
  const [color, setColor] = useState(unit.brand_color)
  const [open, setOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function setUnitColor(next: string | null) {
    setColor(next)
    setOpen(false)
    startTransition(async () => {
      await updateUnitBrandColor({ unitId: unit.id, brandColor: next })
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-panel-line py-3 last:border-0">
      <span
        className="h-7 w-7 flex-none rounded-lg border border-panel-line"
        style={{ background: color ?? businessColor }}
      />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-bold text-panel-ink">{unit.name}</div>
        <div className="text-xs text-panel-ink-soft">
          {color ? `${p.truckOverrideOwn}: ${PALETTE.find((pt) => pt.hex === color)?.name ?? color}` : p.truckOverrideInherits}
        </div>
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() => (color ? setUnitColor(null) : setOpen((s) => !s))}
        className="rounded-lg border border-panel-line px-3 py-1.5 text-xs font-bold text-panel-ink transition-colors hover:border-panel-brand hover:text-panel-brand"
      >
        {color ? p.truckOverrideRemove : p.truckOverrideOwn}
      </button>
      {open && (
        <div className="flex w-full flex-wrap gap-1.5 pt-1">
          {PALETTE.map((pt) => (
            <button
              key={pt.hex}
              type="button"
              title={pt.name}
              aria-pressed={color === pt.hex}
              onClick={() => setUnitColor(pt.hex)}
              className="h-7 w-7 rounded-lg border-2"
              style={{ background: pt.hex, borderColor: color === pt.hex ? "#1A1512" : "transparent" }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ImageUploaderInline({
  currentUrl,
  wide,
  action,
  onUploaded,
}: {
  currentUrl: string | null
  wide?: boolean
  action: (formData: FormData) => Promise<{ ok: boolean; publicUrl?: string; error?: string }>
  onUploaded: (url: string) => void
}) {
  const { t } = useLang()
  const c = t.panel.common
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex ${wide ? "h-[74px] w-[118px]" : "h-[74px] w-[74px]"} flex-none items-center justify-center overflow-hidden rounded-xl border border-panel-line bg-panel-bg text-xs font-semibold text-panel-ink/40`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          c.noPhoto
        )}
      </div>
      <div>
        <label className="cursor-pointer rounded-lg border border-panel-line bg-panel-surface px-3 py-2 text-xs font-bold text-panel-ink transition-colors hover:border-panel-brand hover:text-panel-brand">
          {pending ? c.uploading : c.chooseImage}
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            disabled={pending}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (!file) return
              setError(null)
              setPreview(URL.createObjectURL(file))
              const formData = new FormData()
              formData.set("file", file)
              startTransition(async () => {
                const result = await action(formData)
                if (!result.ok) {
                  setError(result.error ?? "Error")
                  return
                }
                if (result.publicUrl) {
                  setPreview(result.publicUrl)
                  onUploaded(result.publicUrl)
                }
              })
            }}
          />
        </label>
        {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
      </div>
    </div>
  )
}
