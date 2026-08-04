// Escalera de precios (foodtruckos-negocio Regla 1). Sin comisión por
// pedido, nunca — es el diferenciador, no se toca en ninguna fase.
export function pricePerTruck(activeTrucks: number): number {
  if (activeTrucks <= 1) return 49
  if (activeTrucks === 2) return 39
  return 29
}

export function monthlyTotal(activeTrucks: number): number {
  return activeTrucks * pricePerTruck(Math.max(activeTrucks, 1))
}
