import "server-only"

// Mejora de fotos de platillos. HOY ESTÁ APAGADO A PROPÓSITO.
//
// La decisión de producto ya está tomada (CLAUDE.md, decisión 7): se conecta
// una API antes de salir a la venta. Lo único que falta es elegir proveedor y
// empezar a gastar, y no queremos gastar mientras se prueba. Así que el
// enganche vive aquí, escrito y sin llave: procesa cero imágenes y no cuesta
// un centavo hasta que alguien ponga FOTO_MEJORA_API_KEY.
//
// La línea que este archivo NUNCA debe cruzar (foodtruckos-contenido): se
// mejora la foto real del platillo del cliente — luz, fondo, acabado. Jamás se
// genera de cero un platillo que nadie cocinó. Si algún proveedor futuro
// ofrece "generar imagen del platillo", no es candidato.

/** Si el dueño subió algo enorme, se sube tal cual: mandarlo a procesar
 *  costaría más y tardaría más de lo que vale. */
const TAMANO_MAXIMO = 10 * 1024 * 1024

export function mejoraDeFotosActiva(): boolean {
  return Boolean(process.env.FOTO_MEJORA_API_KEY)
}

/**
 * Devuelve la foto mejorada, o `null` si no se mejoró — por estar apagado,
 * por error, o porque no valía la pena. `null` no es un fallo: el llamador
 * sube la original y el dueño ni se entera.
 *
 * Nunca lanza. Una foto sin mejorar es un inconveniente; una subida rota es
 * un dueño que no puede publicar su menú.
 */
export async function mejorarFoto(file: File): Promise<File | null> {
  const llave = process.env.FOTO_MEJORA_API_KEY
  if (!llave) return null
  if (file.size > TAMANO_MAXIMO) return null
  if (!file.type.startsWith("image/")) return null

  try {
    // ─────────────────────────────────────────────────────────────────────
    //  AQUÍ VA LA LLAMADA AL PROVEEDOR, cuando se elija.
    //
    //  El contrato que tiene que cumplir quien lo implemente:
    //    - entra un File de imagen, sale un File de imagen del MISMO platillo
    //    - se corta a los ~20 segundos: el dueño está esperando su foto, y
    //      más allá de eso vale más publicar la original que hacerlo esperar
    //    - si algo sale mal, lanza — el catch de abajo lo convierte en null
    //
    //  Ejemplo de la forma esperada:
    //    const body = new FormData()
    //    body.append("image", file)
    //    const res = await fetch(URL_DEL_PROVEEDOR, {
    //      method: "POST",
    //      headers: { Authorization: `Bearer ${llave}` },
    //      body,
    //      signal: AbortSignal.timeout(20_000),
    //    })
    //    if (!res.ok) throw new Error(`proveedor respondió ${res.status}`)
    //    const bytes = await res.arrayBuffer()
    //    return new File([bytes], file.name, { type: "image/webp" })
    // ─────────────────────────────────────────────────────────────────────

    // Sin proveedor conectado todavía. Se avisa fuerte porque este caso
    // significa que alguien puso la llave esperando mejora y no la va a
    // recibir — es mejor verlo en la bitácora que descubrirlo por una queja.
    console.error(
      "[mejorarFoto] FOTO_MEJORA_API_KEY está puesta pero no hay proveedor conectado. " +
        "Las fotos se están publicando sin mejorar. Ver lib/media/mejorarFoto.ts",
    )
    return null
  } catch (e) {
    console.error("[mejorarFoto] no se pudo mejorar, se publica la original:", e)
    return null
  }
}
