import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./types"

// SOLO se importa desde Route Handlers server-side (app/api/**), nunca desde
// un componente cliente ni desde código que pueda terminar en el bundle del
// navegador. Es la única excepción documentada a "todo con la llave anon" —
// personal (cocina/ventanilla) nunca pasa por Supabase Auth ni por RLS, así
// que sus mutaciones necesitan la llave de servicio una vez que su propia
// sesión ya fue verificada a mano (ver lib/staff/session.ts). La regla de
// ESLint no-restricted-imports en eslint.config.mjs hace cumplir esto.
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
