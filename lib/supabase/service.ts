import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./types"

// SOLO se importa desde Route Handlers server-side (app/api/**), nunca desde
// un componente cliente ni desde código que pueda terminar en el bundle del
// navegador. Es la única excepción documentada a "todo con la llave anon" —
// existe porque cocina todavía no tiene PIN/dispositivo real (ver
// units.kitchen_access_token) y RLS no puede distinguir personal sin esa
// autenticación. Se borra en cuanto exista.
export function createServiceClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY en el entorno del servidor (Settings → API Keys → secret keys en el dashboard de Supabase).",
    )
  }
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { persistSession: false } },
  )
}
