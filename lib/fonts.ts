import { Anton, Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google"

// Solo para las pantallas del comensal (menú, seguimiento) — la tipografía
// condensada de carácter es parte de "la marca es del cliente"; el panel del
// dueño y cocina se quedan con la tipografía neutra del sistema.
export const displayFont = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
})

// Identidad propia del panel del dueño — el único lugar donde la marca
// FoodTruckOS se muestra con fuerza (foodtruckos-diseno). Space Grotesk para
// cifras y encabezados (carácter técnico, de "centro de operaciones"), Inter
// para todo lo demás porque el dueño debe entender sin capacitación y la
// legibilidad manda sobre la personalidad en texto de cuerpo.
export const panelDisplayFont = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-panel-display",
})

export const panelBodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-panel-body",
})

// Solo para acentos "de datos" del landing público (etiquetas de sección,
// el tablero de cocina en vivo) — evoca el centro de operaciones sin
// tomar prestada ninguna de las otras dos identidades tipográficas.
export const landingMonoFont = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-landing-mono",
})
