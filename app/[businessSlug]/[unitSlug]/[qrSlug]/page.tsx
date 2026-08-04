import { redirect, notFound } from "next/navigation"
import { getMenuData } from "@/lib/menu/getMenuData"
import { LangProvider } from "@/lib/i18n/LangProvider"
import { BrandProvider } from "@/lib/branding/BrandProvider"
import { MenuClient } from "@/components/menu/MenuClient"

// El qr_slug es la clave real; businessSlug/unitSlug en la URL son cosméticos.
// Si alguien edita esos segmentos a mano pero el qr_slug sigue siendo válido,
// se redirige a la ruta canónica en vez de confiar en lo que escribió.
export default async function MenuPage({
  params,
}: {
  params: Promise<{ businessSlug: string; unitSlug: string; qrSlug: string }>
}) {
  const { businessSlug, unitSlug, qrSlug } = await params
  const data = await getMenuData(qrSlug)

  if (!data) notFound()

  if (data.paused) {
    const reopenTime = data.pausedUntil
      ? new Date(data.pausedUntil).toLocaleString("es-MX", {
          weekday: "long",
          hour: "numeric",
          minute: "2-digit",
        })
      : null
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-neutral-950 px-6 text-center text-white">
        <h1 className="text-xl font-bold">{data.business.name}</h1>
        <p className="text-neutral-400">
          {data.unit.name} está cerrado por ahora.
          {reopenTime ? ` Reabre ${reopenTime}.` : " Vuelve a intentar más tarde."}
        </p>
      </div>
    )
  }

  const canonicalBusinessSlug = data.business.slug
  const canonicalUnitSlug = slugify(data.unit.name)

  if (businessSlug !== canonicalBusinessSlug || unitSlug !== canonicalUnitSlug) {
    redirect(`/${canonicalBusinessSlug}/${canonicalUnitSlug}/${qrSlug}`)
  }

  return (
    <LangProvider defaultLang="es">
      <BrandProvider brandColor={data.business.brand_color}>
        <MenuClient data={data} />
      </BrandProvider>
    </LangProvider>
  )
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
