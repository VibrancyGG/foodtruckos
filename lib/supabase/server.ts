import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "./types"

// El comensal nunca tiene cuenta (foodtruckos-accesos), así que este cliente
// no maneja sesión real — solo se usa por el patrón @supabase/ssr recomendado,
// para no tener que reescribirlo cuando llegue el login del dueño.
export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // Se llama desde un Server Component sin permiso de escritura;
            // se ignora porque aquí no hay sesión que refrescar.
          }
        },
      },
    },
  )
}
