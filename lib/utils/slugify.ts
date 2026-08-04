// Compartido entre la resolución canónica del menú (app/[businessSlug]/...)
// y la generación de códigos QR — el mismo truck siempre produce la misma
// URL en los dos lugares.
export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
