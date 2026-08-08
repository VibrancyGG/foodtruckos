import { Anton } from "next/font/google"

// Solo para las pantallas del comensal (menú, seguimiento) — la tipografía
// condensada de carácter es parte de "la marca es del cliente"; el panel del
// dueño y cocina se quedan con la tipografía neutra del sistema.
export const displayFont = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
})
