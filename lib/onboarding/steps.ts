import type { Dictionary } from "@/lib/i18n/dictionary"

export type OnboardingStep = {
  id: string
  // null = no cambia de pantalla (paso de bienvenida/cierre, centrado)
  route: string | null
  // valor del atributo data-tour del elemento real a resaltar; null = sin
  // spotlight, tarjeta centrada sobre la pantalla completa
  target: string | null
  content: (t: Dictionary) => { title: string; body: string }
}

// Recorre pantallas reales con datos reales — nunca una maqueta aparte. Cada
// target apunta a un botón/sección que ya existe en el panel, así el tour
// nunca se desincroniza de lo que el dueño ve de verdad.
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    route: "/panel/resumen",
    target: null,
    content: (t) => ({ title: t.panel.onboarding.welcomeTitle, body: t.panel.onboarding.welcomeBody }),
  },
  {
    id: "resumen",
    route: "/panel/resumen",
    target: "onboarding-resumen-title",
    content: (t) => ({ title: t.panel.onboarding.resumenTitle, body: t.panel.onboarding.resumenBody }),
  },
  {
    id: "menu",
    route: "/panel/menu",
    target: "onboarding-menu-title",
    content: (t) => ({ title: t.panel.onboarding.menuTitle, body: t.panel.onboarding.menuBody }),
  },
  {
    id: "menu-category",
    route: "/panel/menu",
    target: "onboarding-add-category",
    content: (t) => ({ title: t.panel.onboarding.menuCategoryTitle, body: t.panel.onboarding.menuCategoryBody }),
  },
  {
    id: "menu-product",
    route: "/panel/menu",
    target: "onboarding-add-product",
    content: (t) => ({ title: t.panel.onboarding.menuProductTitle, body: t.panel.onboarding.menuProductBody }),
  },
  {
    id: "trucks",
    route: "/panel/trucks",
    target: "onboarding-trucks-title",
    content: (t) => ({ title: t.panel.onboarding.trucksTitle, body: t.panel.onboarding.trucksBody }),
  },
  {
    id: "trucks-create",
    route: "/panel/trucks",
    target: "onboarding-trucks-settings",
    content: (t) => ({ title: t.panel.onboarding.trucksCreateTitle, body: t.panel.onboarding.trucksCreateBody }),
  },
  {
    id: "marca",
    route: "/panel/marca",
    target: "onboarding-marca-title",
    content: (t) => ({ title: t.panel.onboarding.marcaTitle, body: t.panel.onboarding.marcaBody }),
  },
  {
    id: "personal",
    route: "/panel/personal",
    target: "onboarding-personal-title",
    content: (t) => ({ title: t.panel.onboarding.personalTitle, body: t.panel.onboarding.personalBody }),
  },
  {
    id: "personal-device",
    route: "/panel/personal",
    target: "onboarding-add-device",
    content: (t) => ({ title: t.panel.onboarding.personalDeviceTitle, body: t.panel.onboarding.personalDeviceBody }),
  },
  {
    id: "qr",
    route: "/panel/qr",
    target: "onboarding-qr-title",
    content: (t) => ({ title: t.panel.onboarding.qrTitle, body: t.panel.onboarding.qrBody }),
  },
  {
    id: "cuenta",
    route: "/panel/cuenta",
    target: "onboarding-cuenta-title",
    content: (t) => ({ title: t.panel.onboarding.cuentaTitle, body: t.panel.onboarding.cuentaBody }),
  },
  {
    id: "done",
    route: "/panel/cuenta",
    target: null,
    content: (t) => ({ title: t.panel.onboarding.doneTitle, body: t.panel.onboarding.doneBody }),
  },
]
