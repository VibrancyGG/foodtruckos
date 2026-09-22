"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { getOwnerContext } from "@/lib/auth/dal"

type Result = { ok: true } | { ok: false; error: string }

// El teléfono de contacto del dueño, editable desde su pantalla de Cuenta.
//
// Vive en business_contacts y no en businesses porque el menú público lee
// businesses(*) con la llave anónima: ahí quedaría a la vista de cualquier
// comensal. Quién puede escribirlo lo decide la política de la tabla (el dueño
// del negocio o un admin de plataforma), no este archivo.
export async function updateContactPhone(phone: string): Promise<Result> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio" }

  const limpio = phone.trim()
  // Se guarda tal como lo escribió: un número extranjero o con extensión no se
  // "arregla" mejor a la fuerza. Solo se exige que tenga al menos 7 dígitos,
  // para no guardar basura. Vacío se permite: es borrar el teléfono.
  if (limpio && limpio.replace(/\D/g, "").length < 7) {
    return { ok: false, error: "Ese teléfono parece incompleto" }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("business_contacts")
    .upsert({ business_id: businessId, phone: limpio || null, updated_at: new Date().toISOString() })
  if (error) return { ok: false, error: "No se pudo guardar" }

  revalidatePath("/panel/cuenta")
  return { ok: true }
}
