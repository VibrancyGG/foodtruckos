import { redirect, notFound } from "next/navigation"
import { getMenuData } from "@/lib/menu/getMenuData"
import { MenuSurface } from "@/components/menu/MenuSurface"
import { slugify } from "@/lib/utils/slugify"

// La ruta larga, la de los QR impresos antes de que existiera /q/{código}.
//
// **No se retira nunca.** Hay pósters pegados en trucks que resuelven por
// aquí, y esos no se pueden actualizar a distancia. Sirve exactamente el mismo
// menú que la ruta corta.
//
// El qr_slug es la clave real; businessSlug/unitSlug son cosméticos. Si
// alguien edita esos segmentos a mano pero el qr_slug sigue siendo válido, se
// redirige a la ruta canónica en vez de confiar en lo que escribió.
export default async function MenuPage({
  params,
}: {
  params: Promise<{ businessSlug: string; unitSlug: string; qrSlug: string }>
}) {
  const { businessSlug, unitSlug, qrSlug } = await params
  const data = await getMenuData(qrSlug)

  if (!data) notFound()

  // La corrección de ruta solo aplica al menú servible. Con el negocio
  // suspendido o el truck en pausa no hay ruta canónica que perseguir: se
  // muestra el aviso y se acabó.
  if (!data.suspended && !data.paused) {
    const canonicalBusinessSlug = data.business.slug
    const canonicalUnitSlug = slugify(data.unit.name)

    if (businessSlug !== canonicalBusinessSlug || unitSlug !== canonicalUnitSlug) {
      redirect(`/${canonicalBusinessSlug}/${canonicalUnitSlug}/${qrSlug}`)
    }
  }

  return <MenuSurface data={data} />
}
