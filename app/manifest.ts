import type { MetadataRoute } from "next"

// Cocina y panel del dueño deben poder instalarse como PWA (CLAUDE.md). Un
// solo manifest para todo el origen es suficiente — el menú del comensal
// simplemente no ofrece el prompt de instalación, no hace daño que también
// quede enlazado ahí.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pavessa",
    short_name: "Pavessa",
    description: "Panel de Pavessa: cocina y administración del negocio.",
    start_url: "/panel",
    display: "standalone",
    background_color: "#0B0B0B",
    theme_color: "#0B0B0B",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
