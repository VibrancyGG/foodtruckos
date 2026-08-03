// PostgREST regresa las columnas `numeric` de Postgres como texto (p.ej. "3.25"),
// no como number — para no perder precisión en JSON. Los tipos generados dicen
// `number` pero en tiempo de ejecución es string; se convierte explícitamente
// en el borde de datos en vez de confiar en el tipo.
export function toNumber(v: unknown): number {
  if (typeof v === "number") return v
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
