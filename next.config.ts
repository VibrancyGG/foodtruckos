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
};

export default nextConfig;
