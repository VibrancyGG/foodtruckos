import { notFound } from "next/navigation"
import { getMenuData } from "@/lib/menu/getMenuData"
import { MenuSurface } from "@/components/menu/MenuSurface"

// La ruta corta del QR: pavessa.com/q/k7m2xp
//
// Sustituye a /{negocio}/{truck}/{qr_slug}, donde el nombre del negocio salía
// dos veces y los dos primeros segmentos no servían para nada. El largo de
// aquella dependía del nombre que el dueño escribiera, sin tope: había un
// punto de pedido con una URL de 168 caracteres. Mientras más texto lleva un
// QR, más cuadros necesita y más pequeños quedan — y esto se escanea de noche,
// con la lámina sucia y el celular en la mano de alguien con hambre.
//
// No redirige a la ruta larga: servir aquí mismo es justamente el punto.
export default async function MenuCortoPage({
  params,
}: {
  params: Promise<{ code: string }>
}) {
  const { code } = await params

  // El código se genera en minúsculas, pero alguien puede teclearlo desde un
  // póster con el teclado en mayúsculas. Se normaliza para no fallar por eso.
  const data = await getMenuData(code.toLowerCase(), "short_code")

  if (!data) notFound()

  return <MenuSurface data={data} />
}
