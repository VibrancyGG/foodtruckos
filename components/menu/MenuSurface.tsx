import { LangProvider } from "@/lib/i18n/LangProvider"
import { BrandProvider } from "@/lib/branding/BrandProvider"
import { MenuClient } from "@/components/menu/MenuClient"
import { PausedScreen } from "@/components/menu/PausedScreen"
import type { MenuData } from "@/lib/menu/getMenuData"

// Lo que el comensal ve, sea cual sea la URL por la que llegó.
//
// Hay dos rutas hacia esta pantalla —la corta /q/{código} de los QR nuevos y
// la larga de los que ya están impresos y pegados en los trucks— y las dos
// tienen que mostrar exactamente lo mismo, incluidos los estados de pausado y
// suspendido. Vive aquí y no duplicado en cada ruta porque si se separan, la
// que se olvide será justamente la vieja: la de los pósters que ya no se
// pueden cambiar.
export function MenuSurface({ data }: { data: MenuData }) {
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

  return (
    <LangProvider defaultLang="es">
      <BrandProvider brandColor={data.business.brand_color}>
        <MenuClient data={data} />
      </BrandProvider>
    </LangProvider>
  )
}
