// Contraste automático (foodtruckos-diseno): ninguna elección de la paleta
// puede producir un menú difícil de leer, así que el color de texto se
// calcula, nunca se elige.
function luminance(hex: string) {
  const c = hex
    .replace("#", "")
    .match(/../g)!
    .map((x) => {
      const v = parseInt(x, 16) / 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
}

function contrastRatio(a: string, b: string) {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

const INK = "#1A1512"

export function onColorFor(hex: string) {
  return contrastRatio(hex, "#FFFFFF") >= contrastRatio(hex, INK) ? "#FFFFFF" : INK
}
