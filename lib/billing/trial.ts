const WARNING_WINDOW_DAYS = 5

export type TrialInfo = {
  // Vencida de verdad: se trata exactamente igual que "suspended" en todos
  // los puntos de acceso (getOwnerContext, verifyStaffSession) — un solo
  // criterio, no dos bloqueos distintos que mantener sincronizados.
  expired: boolean
  daysLeft: number | null
  showWarning: boolean
}

// trial_ends_at=null significa "sin vencimiento automático" — negocios
// internos/piloto de antes de esta función, o cualquiera que el equipo
// decida no ponerle límite. Nunca se bloquea a nadie por default (foodtruckos-negocio
// Regla 5: cada bloqueo debe ser una decisión explícita, no un descuido).
export function getTrialInfo(subscriptionStatus: string, trialEndsAt: string | null, now: Date = new Date()): TrialInfo {
  if (subscriptionStatus !== "trial" || !trialEndsAt) {
    return { expired: false, daysLeft: null, showWarning: false }
  }
  const end = new Date(trialEndsAt)
  const msLeft = end.getTime() - now.getTime()
  const daysLeft = Math.ceil(msLeft / (24 * 60 * 60 * 1000))
  const expired = msLeft <= 0
  return {
    expired,
    daysLeft,
    showWarning: !expired && daysLeft <= WARNING_WINDOW_DAYS,
  }
}

// Días de prueba gratis para un negocio nuevo. Se fija al aprobarlo; el admin
// puede moverlo después desde su panel.
export const TRIAL_DAYS = 14

export function trialEndsFromNow(days = TRIAL_DAYS, now: Date = new Date()): string {
  return new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString()
}

// UN SOLO criterio de "esta cuenta no puede operar", para que no se repita
// mal en cada pantalla. Lo usan los cuatro puntos de entrada: panel del
// dueño, sesión de personal, menú del comensal y creación de pedidos.
//
// Que el menú del comensal se quedara fuera era el agujero grave: el QR
// seguía tomando pedidos que nadie podía ver ni cocinar, porque el dueño y
// la cocina sí estaban bloqueados.
export function accessBlocked(
  subscriptionStatus: string,
  trialEndsAt: string | null,
  now: Date = new Date(),
): boolean {
  if (subscriptionStatus === "suspended") return true
  return getTrialInfo(subscriptionStatus, trialEndsAt, now).expired
}
