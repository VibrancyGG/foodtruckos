import { revalidatePath } from "next/cache"

// Todas las rutas por las que un comensal puede estar viendo el menú.
//
// Son dos, y las dos son permanentes:
//
//   /q/[code]                              la corta, de los QR nuevos
//   /[businessSlug]/[unitSlug]/[qrSlug]    la larga, de los pósters ya impresos
//
// Existe como función y no como dos líneas copiadas en cada acción por un
// motivo concreto: este archivo nació de un defecto real en el que seis
// acciones revalidaban solo el panel, y entre ellas estaba el interruptor de
// "se acabó" — el dueño marcaba agotado, lo veía agotado, y el comensal
// seguía pudiendo pedirlo. Con dos rutas del comensal en vez de una, repetir
// el par a mano en dieciocho sitios es la misma apuesta perdida: basta que
// alguien agregue una acción nueva y copie solo una línea.
//
// Al agregar una ruta nueva del comensal, se agrega aquí y queda cubierta en
// todas partes.
export function revalidarMenuDelComensal() {
  revalidatePath("/[businessSlug]/[unitSlug]/[qrSlug]", "page")
  revalidatePath("/q/[code]", "page")
}
