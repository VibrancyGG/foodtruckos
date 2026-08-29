"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createPublicClient } from "@/lib/supabase/public"
import { SITE_URL } from "@/lib/utils/siteUrl"
import { getAdminContext } from "@/lib/auth/getAdminContext"
import { trialEndsFromNow } from "@/lib/billing/trial"

type Result = { ok: true } | { ok: false; error: string }

export async function suspendBusiness(businessId: string): Promise<Result> {
  const { isAdmin } = await getAdminContext()
  if (!isAdmin) return { ok: false, error: "No autorizado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("businesses")
    .update({ subscription_status: "suspended" })
    .eq("id", businessId)
  if (error) return { ok: false, error: "No se pudo suspender" }

  await supabase.rpc("log_admin_action", {
    p_business_id: businessId,
    p_action: "business_suspended",
    p_entity_type: "business",
    p_entity_id: businessId,
  })
  revalidatePath("/admin")
  return { ok: true }
}

// El dueño ya puede reactivar su propio truck archivado en minutos desde su
// panel (lib/units/actions.ts) — esto solo registra que el equipo lo
// contactó antes del corte de 2 años, para no perder de vista quién ya
// recibió el aviso. No borra nada por sí sola.
export async function markArchiveWarned(unitId: string): Promise<Result> {
  const { isAdmin } = await getAdminContext()
  if (!isAdmin) return { ok: false, error: "No autorizado" }

  const supabase = await createClient()
  const { data: unit, error } = await supabase
    .from("units")
    .update({ archive_warned_at: new Date().toISOString() })
    .eq("id", unitId)
    .select("business_id")
    .single()
  if (error || !unit) return { ok: false, error: "No se pudo marcar" }

  await supabase.rpc("log_admin_action", {
    p_business_id: unit.business_id,
    p_action: "archive_warning_sent",
    p_entity_type: "unit",
    p_entity_id: unitId,
  })
  revalidatePath("/admin")
  return { ok: true }
}

// Reactivar SIEMPRE pregunta cómo vuelve, porque las dos respuestas cuestan
// dinero en direcciones opuestas: devolver como "de pago" a quien seguía en
// prueba se salta la conversación de cobro, y devolver como "prueba" a quien
// ya pagaba le regala días.
//
// Antes esto asumía "de pago" en silencio. Un negocio con la prueba vencida
// que se suspendía y reactivaba quedaba convertido en cuenta de pago sin que
// nadie lo decidiera.
export async function reactivateBusiness(
  businessId: string,
  como: "trial" | "active",
): Promise<Result> {
  const { isAdmin } = await getAdminContext()
  if (!isAdmin) return { ok: false, error: "No autorizado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("businesses")
    .update(
      como === "trial"
        ? { subscription_status: "trial", trial_ends_at: trialEndsFromNow() }
        : // Se limpia la fecha vieja a propósito: dejarla puesta es una mina —
          // si alguien regresara la cuenta a "prueba" más adelante, nacería
          // vencida en ese mismo instante.
          { subscription_status: "active", trial_ends_at: null },
    )
    .eq("id", businessId)
  if (error) return { ok: false, error: "No se pudo reactivar" }

  await supabase.rpc("log_admin_action", {
    p_business_id: businessId,
    p_action: como === "trial" ? "business_reactivated_as_trial" : "business_reactivated_as_paid",
    p_entity_type: "business",
    p_entity_id: businessId,
  })
  revalidatePath("/admin")
  return { ok: true }
}

// Mover (o quitar) la fecha en que termina la prueba gratis. Siempre se va a
// querer extenderle a alguien, y sin esto la única salida sería tocar la base
// a mano.
//
// `null` = sin vencimiento. Es deliberado que exista: es como quedan los
// negocios internos y los pilotos, y es lo que evita bloquear a alguien por
// descuido (foodtruckos-negocio Regla 5).
export async function setTrialEnd(businessId: string, endsAt: string | null): Promise<Result> {
  const { isAdmin } = await getAdminContext()
  if (!isAdmin) return { ok: false, error: "No autorizado" }

  const supabase = await createClient()
  const { error } = await supabase
    .from("businesses")
    .update({ trial_ends_at: endsAt })
    .eq("id", businessId)
  if (error) return { ok: false, error: "No se pudo guardar la fecha" }

  await supabase.rpc("log_admin_action", {
    p_business_id: businessId,
    p_action: endsAt ? "trial_end_set" : "trial_end_cleared",
    p_entity_type: "business",
    p_entity_id: businessId,
  })
  revalidatePath("/admin")
  return { ok: true }
}

// Desbloquear a un dueño que no puede entrar, SIN conocer su contraseña.
//
// La tentación es un campo "contraseña nueva" en el admin. No se hace: quien
// pone la contraseña puede entrar como el dueño — cambiar precios, marcar
// pedidos pagados, ver ventas — y el día que el cliente diga "yo no cambié
// eso" no habría forma de distinguir quién fue. Aquí solo se dispara el mismo
// correo que el dueño se manda a sí mismo desde "olvidé mi contraseña"; él
// elige la contraseña y nadie de VibrancyGG la ve.
//
// Queda registrado en la bitácora (Regla 5), que es justo lo que un cambio
// directo de contraseña NO dejaría.
export async function sendOwnerRecovery(businessId: string): Promise<Result & { email?: string }> {
  const { isAdmin } = await getAdminContext()
  if (!isAdmin) return { ok: false, error: "No autorizado" }

  const supabase = await createClient()
  // auth.users no se expone por la API; la función es SECURITY DEFINER y
  // vuelve a comprobar platform_admin del lado de la base.
  const { data: email, error: fallo } = await supabase.rpc("admin_owner_email", { p_business_id: businessId })
  if (fallo || !email) return { ok: false, error: "Ese negocio no tiene un dueño con correo registrado" }

  // Cliente sin sesión: mandar el enlace no debe depender de quién está
  // conectado, y no queremos que la sesión del admin toque este camino.
  const publico = createPublicClient()
  const { error: envio } = await publico.auth.resetPasswordForEmail(email, {
    redirectTo: `${SITE_URL}/auth/reset-password`,
  })
  if (envio) {
    // El 429 es el caso frecuente: alguien ya lo pidió hace un momento.
    if (envio.status === 429) {
      return { ok: false, error: "Ya se mandó uno hace poco. Espera un minuto antes de volver a intentarlo." }
    }
    return { ok: false, error: "No se pudo mandar el enlace" }
  }

  await supabase.rpc("log_admin_action", {
    p_business_id: businessId,
    p_action: "owner_recovery_sent",
    p_entity_type: "business",
    p_entity_id: businessId,
  })
  return { ok: true, email }
}

// ---------------------------------------------------------------------------
// Eliminar un negocio
//
// Antes esto no existía: quitar una cuenta de prueba obligaba a escribir SQL a
// mano contra producción, y por ese camino se saltan los dos pasos que no
// perdonan — respaldar antes, y limpiar los archivos de Storage.
//
// El borrado de la base y de las cuentas vive en admin_delete_business
// (SECURITY DEFINER, que vuelve a comprobar platform_admin del lado de la
// base). Aquí solo se hace lo que SQL no puede: vaciar el bucket.
// ---------------------------------------------------------------------------

// Devuelve el respaldo completo para que el admin lo descargue ANTES de borrar.
// La pantalla no habilita el botón de eliminar hasta que esto se descargó.
export async function exportBusiness(
  businessId: string,
): Promise<(Result & { data?: unknown }) | { ok: false; error: string }> {
  const { isAdmin } = await getAdminContext()
  if (!isAdmin) return { ok: false, error: "No autorizado" }

  const supabase = await createClient()
  const { data, error } = await supabase.rpc("admin_export_business", { p_business_id: businessId })
  if (error) return { ok: false, error: "No se pudo generar el respaldo" }
  return { ok: true, data }
}

export async function deleteBusiness(
  businessId: string,
  confirmacion: string,
): Promise<Result & { resumen?: unknown }> {
  const { isAdmin } = await getAdminContext()
  if (!isAdmin) return { ok: false, error: "No autorizado" }

  const supabase = await createClient()

  // Los archivos primero, y a propósito: el borrado de la base es el punto sin
  // retorno y va al final. Si vaciar el bucket falla, no se ha destruido nada
  // todavía y se puede reintentar. Al revés quedarían fotos huérfanas en el
  // bucket para siempre — facturándose y accesibles por URL pública, porque la
  // cascada de la base no toca Storage.
  //
  // Corre con la sesión del propio admin: la política de borrado de
  // business-media ya contempla is_platform_admin(), así que no hace falta la
  // llave de servicio.
  const rutas: string[] = []
  async function recorrer(prefijo: string) {
    const { data } = await supabase.storage.from("business-media").list(prefijo, { limit: 1000 })
    for (const entrada of data ?? []) {
      const ruta = `${prefijo}/${entrada.name}`
      // Sin id es carpeta, no archivo.
      if (entrada.id === null) await recorrer(ruta)
      else rutas.push(ruta)
    }
  }
  await recorrer(businessId)

  if (rutas.length > 0) {
    const { error: fallo } = await supabase.storage.from("business-media").remove(rutas)
    if (fallo) return { ok: false, error: "No se pudieron borrar las fotos; no se eliminó nada" }
  }

  const { data: resumen, error } = await supabase.rpc("admin_delete_business", {
    p_business_id: businessId,
    p_confirmacion: confirmacion,
  })
  if (error) {
    // El mensaje viene de la función y ya está redactado para leerse: nombre que
    // no coincide, suscripción activa, negocio inexistente.
    return { ok: false, error: error.message.replace(/^.*?:\s*/, "") }
  }

  revalidatePath("/admin")
  return { ok: true, resumen }
}
