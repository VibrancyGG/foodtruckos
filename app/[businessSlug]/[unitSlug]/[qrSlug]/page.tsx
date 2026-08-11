import { redirect, notFound } from "next/navigation"
import { getMenuData } from "@/lib/menu/getMenuData"
import { LangProvider } from "@/lib/i18n/LangProvider"
import { BrandProvider } from "@/lib/branding/BrandProvider"
import { MenuClient } from "@/components/menu/MenuClient"
import { PausedScreen } from "@/components/menu/PausedScreen"
import { slugify } from "@/lib/utils/slugify"

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

  if (data.suspended) {
    return (
      <LangProvider defaultLang="es">
        <PausedScreen businessName={data.business.name} notAvailable />
      </LangProvider>
    )
  }

  if (data.paused) {
    const reopenTime = data.pausedUntil
      ? new Date(data.pausedUntil).toLocaleString("es-MX", {
          timeZone: data.business.timezone,
          weekday: "long",
          hour: "numeric",
          minute: "2-digit",
        })
      : null
    return (
      <LangProvider defaultLang="es">
        <PausedScreen
          businessName={data.business.name}
          unitName={data.unit.name}
          logoUrl={data.business.logo_url}
          brandColor={data.business.brand_color}
          reopenTime={reopenTime}
        />
      </LangProvider>
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
