"use client"

import { useState, useTransition } from "react"
import { PALETTE } from "@/lib/branding/palette"
import { onColorFor } from "@/lib/branding/color"
import { uploadLogo, uploadCoverPhoto, saveBrandSettings } from "@/lib/media/actions"

type MenuStyle = "vibrante" | "tradicional"

export function MarcaForm({
  businessName,
  initialLogoUrl,
  initialCoverUrl,
  initialColor,
  initialStyle,
}: {
  businessName: string
  initialLogoUrl: string | null
  initialCoverUrl: string | null
  initialColor: string
  initialStyle: string
}) {
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl)
  const [coverUrl, setCoverUrl] = useState(initialCoverUrl)
  const [color, setColor] = useState(initialColor)
  const [style, setStyle] = useState<MenuStyle>(
    initialStyle === "tradicional" ? "tradicional" : "vibrante",
  )
  const [dirty, setDirty] = useState(false)
  const [saving, startSaving] = useTransition()
  const [saved, setSaved] = useState(false)

  const onColor = onColorFor(color)

  function save() {
    setSaved(false)
    startSaving(async () => {
      const result = await saveBrandSettings({ brandColor: color, menuStyle: style })
      if (result.ok) {
        setDirty(false)
        setSaved(true)
      }
    })
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-4">
        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <span className="text-[11px] font-black tracking-wide text-neutral-400">1 · TU LOGO</span>
          <h2 className="mb-1 font-bold">Sube tu logo</h2>
          <p className="mb-4 text-sm text-neutral-500">PNG o JPG. Se ve mejor cuadrado.</p>
          <ImageUploaderInline
            currentUrl={logoUrl}
            action={uploadLogo}
            onUploaded={(url) => setLogoUrl(url)}
          />
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <span className="text-[11px] font-black tracking-wide text-neutral-400">2 · TU COLOR</span>
          <h2 className="mb-1 font-bold">Elige tu color</h2>
          <p className="mb-4 text-sm text-neutral-500">
            Diez colores probados bajo el sol. Cualquiera funciona — no hay forma de elegir mal.
          </p>
          <div className="flex flex-wrap gap-2.5" role="group" aria-label="Color de marca">
            {PALETTE.map((p) => (
              <button
                key={p.hex}
                type="button"
                aria-pressed={color === p.hex}
                title={p.name}
                onClick={() => {
                  setColor(p.hex)
                  setDirty(true)
                }}
                className="relative h-12 w-12 rounded-xl border-2"
                style={{
                  background: p.hex,
                  borderColor: color === p.hex ? "#1A1512" : "transparent",
                }}
              >
                {color === p.hex && (
                  <span
                    className="absolute inset-0 flex items-center justify-center text-lg font-black"
                    style={{ color: onColorFor(p.hex) }}
                  >
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <span className="text-[11px] font-black tracking-wide text-neutral-400">3 · TU PORTADA</span>
          <h2 className="mb-1 font-bold">Foto de portada</h2>
          <p className="mb-4 text-sm text-neutral-500">
            La foto de tu truck o de tu comida, arriba del menú. Es opcional.
          </p>
          <ImageUploaderInline
            currentUrl={coverUrl}
            wide
            action={uploadCoverPhoto}
            onUploaded={(url) => setCoverUrl(url)}
          />
        </section>

        <section className="rounded-2xl border border-neutral-200 bg-white p-5">
          <span className="text-[11px] font-black tracking-wide text-neutral-400">4 · TU ESTILO</span>
          <h2 className="mb-1 font-bold">Cómo se ve tu menú</h2>
          <p className="mb-4 text-sm text-neutral-500">
            Si todavía no tienes fotos de tus platillos, Tradicional se ve mejor.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              aria-pressed={style === "vibrante"}
              onClick={() => {
                setStyle("vibrante")
                setDirty(true)
              }}
              className={`rounded-xl border-2 p-3.5 text-left ${style === "vibrante" ? "border-neutral-900" : "border-neutral-200"}`}
            >
              <div className="font-bold">Vibrante</div>
              <div className="text-xs text-neutral-500">Con foto de cada platillo.</div>
            </button>
            <button
              type="button"
              aria-pressed={style === "tradicional"}
              onClick={() => {
                setStyle("tradicional")
                setDirty(true)
              }}
              className={`rounded-xl border-2 p-3.5 text-left ${style === "tradicional" ? "border-neutral-900" : "border-neutral-200"}`}
            >
              <div className="font-bold">Tradicional</div>
              <div className="text-xs text-neutral-500">Lista con precios alineados.</div>
            </button>
          </div>
        </section>

        <div className="sticky bottom-4 flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4 shadow-lg">
          <span className="text-sm text-neutral-500">
            {saving ? "Guardando…" : saved ? "Guardado ✓" : dirty ? "Sin guardar" : "Sin cambios por guardar"}
          </span>
          <button
            onClick={save}
            disabled={!dirty || saving}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-40"
          >
            Guardar cambios
          </button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-4">
        <div className="mb-2 flex items-center justify-between text-xs font-bold text-neutral-500">
          <span>Así lo verá tu cliente</span>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">En vivo</span>
        </div>
        <div className="overflow-hidden rounded-[28px] border-[10px] border-neutral-900 bg-white">
          <div className="flex items-center gap-2 px-3 py-3" style={{ background: color, color: onColor }}>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-white/25" />
            )}
            <div className="text-sm font-bold">{businessName}</div>
          </div>
          {coverUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" className="h-28 w-full object-cover" />
          ) : (
            <div className="flex h-16 items-center justify-center bg-neutral-100 text-xs text-neutral-400">
              Tu foto de portada aquí
            </div>
          )}
          <div className="space-y-2 p-3">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border border-neutral-200 p-2">
                <div>
                  <div className="h-2.5 w-24 rounded bg-neutral-800" />
                  <div className="mt-1.5 h-2 w-10 rounded bg-neutral-300" />
                </div>
                <div
                  className="rounded-full px-2.5 py-1 text-[10px] font-bold"
                  style={{ background: color, color: onColor }}
                >
                  Agregar
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
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
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex ${wide ? "h-[74px] w-[118px]" : "h-[74px] w-[74px]"} flex-none items-center justify-center overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100 text-xs font-semibold text-neutral-400`}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          "Sin foto"
        )}
      </div>
      <div>
        <label className="cursor-pointer rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-bold">
          {pending ? "Subiendo…" : "Elegir imagen"}
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
                  setError(result.error ?? "No se pudo subir la imagen")
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
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </div>
  )
}
