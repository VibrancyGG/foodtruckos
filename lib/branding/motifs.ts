// Juegos de trazo por tipo de negocio — dibujo de fondo discreto en el
// encabezado del menú del comensal. "ic" es el ícono de 24x24 para el
// selector, "pat" es la versión ampliada (viewBox 112x112) que se repite
// como patrón de fondo (ver panel-marca.html).
export const MOTIFS = {
  tacos: {
    name: "Tacos",
    ic: '<path d="M3 17a9 9 0 0 1 18 0"/><path d="M3 17h18"/><path d="M7 13c1.5 1.4 3 1.4 4.5 0s3-1.4 4.5 0"/>',
    pat:
      '<path d="M8 34a13 13 0 0 1 26 0"/><path d="M8 34h26"/><path d="M13 28c2.2 2 4.2 2 6.4 0s4.2-2 6.4 0"/>' +
      '<path d="M68 12c3.6 0 6 4.4 6 12.5S71.6 38 68 38s-6-5-6-13.5S64.4 12 68 12z"/><path d="M62 20h12M62 26h12M62 32h12"/>' +
      '<path d="M20 78c0-5.5 4.4-9.6 9.8-9.6 5.6 0 9.4 4.6 9.4 10.4S34.8 90 28.6 90C23.8 90 20 86.4 20 82z"/><path d="M29.8 68.4c.4-3.6 2.6-5.4 5.6-5.4"/>' +
      '<path d="M82 70h18l-2.6 24H84.6z"/><path d="M83 76h16"/><path d="M92 70V60"/>',
  },
  burgers: {
    name: "Hamburguesas",
    ic: '<path d="M3 9a9 5 0 0 1 18 0"/><path d="M3 12h18"/><path d="M4 15h16a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/>',
    pat:
      '<path d="M8 26a13 7 0 0 1 26 0"/><path d="M8 30h26"/><path d="M9 34h24a6 6 0 0 1-6 6H15a6 6 0 0 1-6-6z"/>' +
      '<path d="M62 14h16l-3 26H65z"/><path d="M66 14V8M72 14V8"/>' +
      '<path d="M20 66h22l-3 26H23z"/><path d="M21 74h20"/>' +
      '<path d="M78 78h20"/><path d="M78 78a10 10 0 0 1 20 0"/><path d="M82 84h12"/>',
  },
  mariscos: {
    name: "Mariscos",
    ic: '<path d="M2 12c4-5 10-7 14-4s4 8-1 10-9 0-13-6z"/><path d="M17 10l5-3v10z"/>',
    pat:
      '<path d="M6 30c8-10 20-13 27-7s5 15-3 18-16-1-24-11z"/><path d="M33 26l10-6v20z"/>' +
      '<path d="M64 16c8 0 12 6 12 13s-5 12-12 12c-6 0-9-3-9-7 0-6 4-8 4-12s-2-6 5-6z"/><path d="M62 24h.01M69 22h.01"/>' +
      '<path d="M22 66c10 0 16 7 16 15H6c0-8 6-15 16-15z"/><path d="M22 66v15M14 70l3 11M30 70l-3 11"/>' +
      '<path d="M84 68a11 11 0 1 1 0 22 11 11 0 0 1 0-22z"/><path d="M84 68v22M73 79h22"/>',
  },
  cafe: {
    name: "Café",
    ic: '<path d="M4 7h13v8a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M17 9h3a3 3 0 0 1 0 6h-3"/><path d="M4 22h14"/>',
    pat:
      '<path d="M8 20h26v16a9 9 0 0 1-9 9h-8a9 9 0 0 1-9-9z"/><path d="M34 24h6a6 6 0 0 1 0 12h-6"/><path d="M8 50h28"/>' +
      '<path d="M66 12c6 0 10 5 10 12s-4 12-10 12-10-5-10-12 4-12 10-12z"/><path d="M66 12c-3 6-3 18 0 24"/>' +
      '<path d="M20 66h20l-4 26H24z"/><path d="M21 74h18"/><path d="M26 66V60h8v6"/>' +
      '<path d="M78 72c0-4 4-6 9-6s9 2 9 6-4 7-9 7-9-3-9-7z"/><path d="M78 78v8c0 3 4 5 9 5s9-2 9-5v-8"/>',
  },
} as const

export type BrandMotif = keyof typeof MOTIFS

export function isBrandMotif(value: string): value is BrandMotif {
  return value in MOTIFS
}
