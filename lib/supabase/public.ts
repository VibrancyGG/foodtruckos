import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./types"

// Cliente para la superficie del comensal. NO lee cookies, a propósito.
//
// El comensal nunca tiene cuenta (Regla de Oro 3), pero eso no significa que
// nunca traiga una sesión encima: un dueño probando su propio QR, personal de
// un truck comprando en otro, o cualquiera que alguna vez entró al panel en
// ese celular. Si el camino del comensal usa el cliente con cookies, hereda
// esa identidad y le pasan cosas que a un comensal normal no:
//
//   - Una sesión de alguien que no pertenece al negocio cae en las reglas de
//     dueño en vez de las públicas.
//   - Una sesión VENCIDA es peor todavía: la petición ni siquiera llega a las
//     reglas, se rechaza al validar el token (PGRST301) y no hay política que
//     lo arregle. El pedido falla en ESE celular para siempre, mientras en
//     cualquier otro funciona — que es justo lo difícil de diagnosticar.
//
// Pedir comida por un QR público no depende de quién eres. Este cliente lo
// hace cierto en el código, no solo en la intención.
// Sirve igual en el servidor y en el navegador: no toca cookies ni almacena
// sesión en ninguno de los dos. La pantalla de seguimiento del comensal lo usa
// desde el navegador por el mismo motivo que el servidor lo usa al crear el
// pedido — y porque ya nos mordió: el aviso de "ya llegué" quedaba rechazado
// en silencio si ese celular traía una sesión de dueño encima.
export function createPublicClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
