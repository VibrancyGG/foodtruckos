import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // El límite por defecto de Next.js para Server Actions es 1MB — mucho
    // menos que el máximo real de 5MB que ya tiene el bucket de Supabase
    // (business-media), así que las fotos de logo/portada se rechazaban en
    // silencio antes de siquiera llegar a esa validación.
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
  async headers() {
    // Deliberadamente sin Content-Security-Policy aquí: la app usa Supabase
    // Storage (fotos), Supabase Realtime (websocket), Google OAuth y web
    // push — un CSP mal mapeado rompe alguno de esos en silencio. Estos
    // headers no dependen de conocer esos orígenes, así que no tienen ese
    // riesgo.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
