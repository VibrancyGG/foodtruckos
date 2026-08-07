import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // La llave de servicio salta RLS por completo — solo debe poder llegar a
  // ella el código que ya asume la responsabilidad de comprobar identidad a
  // mano (cocina/personal y su propia infraestructura). Cualquier otro lugar
  // debe usar el cliente anon y dejar que RLS decida.
  {
    files: ["**/*.{ts,tsx}"],
    ignores: [
      "app/api/kitchen/**",
      "app/api/staff/**",
      "app/cocina/**",
      "lib/staff/**",
      "lib/kitchen/**",
      "lib/supabase/service.ts",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/supabase/service",
              message:
                "createServiceClient (llave de servicio, salta RLS) solo se puede importar desde app/api/kitchen, app/api/staff, app/cocina, lib/staff o lib/kitchen.",
            },
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
