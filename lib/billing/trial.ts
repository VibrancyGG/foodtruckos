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
