// Reparte 4 copias de un ícono de 24x24 dentro del mosaico de 112x112 que se
// repite de fondo — mismo criterio que los 4 motivos originales (dibujados a
// mano), pero generado para no repetir 4 veces las coordenadas de cada ícono
// nuevo. Tamaños y posiciones ligeramente distintos entre copias para que no
// se vea como una cuadrícula perfecta.
function scatter(ic: string): string {
  const placements: [number, number, number][] = [
    [4, 2, 1.15],
    [60, 8, 0.95],
    [12, 62, 1.0],
    [64, 64, 1.2],
  ]
  return placements.map(([x, y, s]) => `<g transform="translate(${x},${y}) scale(${s})">${ic}</g>`).join("")
}

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
  grill: {
    name: "Parrilla",
    ic:
      '<circle cx="12" cy="14" r="7"/><path d="M6 12h12M6 15h12M6.5 18h11"/>' +
      '<path d="M8 6c0-1.6 1.2-2 1.2-3.4M12 5c0-1.6 1.2-2 1.2-3.4M16 6c0-1.6 1.2-2 1.2-3.4"/>',
    get pat() {
      return scatter(this.ic)
    },
  },
  flame: {
    name: "Llama",
    ic: '<path d="M12 2c1 3-3 4-3 8a3 3 0 0 0 6 0c0-1.5-1-2-1-3.5 1.5 1 2.5 3 2.5 5.5a5 5 0 0 1-10 0C6.5 8 9 6 12 2z"/>',
    get pat() {
      return scatter(this.ic)
    },
  },
  forkSpatula: {
    name: "Tenedor y espátula",
    ic:
      '<path d="M5 2v5a1 1 0 0 0 2 0V2M7 2v5M9 2v7M7 9v13" transform="rotate(-20 7 12)"/>' +
      '<path d="M17 2h-3a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h3z" transform="rotate(20 17 12)"/>' +
      '<path d="M17 8v14" transform="rotate(20 17 12)"/>',
    get pat() {
      return scatter(this.ic)
    },
  },
  foodtruck: {
    name: "Food truck",
    ic:
      '<path d="M2 17V9h11v8M13 11h5l4 4v2h-2M2 17h1a2 2 0 0 0 4 0h8a2 2 0 0 0 4 0h2"/>' +
      '<circle cx="6" cy="17" r="1.6"/><circle cx="17" cy="17" r="1.6"/>',
    get pat() {
      return scatter(this.ic)
    },
  },
  forkRoad: {
    name: "Tenedor y carretera",
    ic: '<path d="M7 2v6M10 2v6M13 2v6M10 8v2"/><path d="M10 10L3 22M10 10l7 12"/><path d="M10 14v1M10 17v1M10 20v1"/>',
    get pat() {
      return scatter(this.ic)
    },
  },
  tacoPin: {
    name: "Taco y ubicación",
    ic:
      '<path d="M12 22s7-7.5 7-13a7 7 0 0 0-14 0c0 5.5 7 13 7 13z"/><path d="M7.5 8.5a4.5 4.5 0 0 1 9 0"/>' +
      '<path d="M7.5 8.5h9"/><path d="M10 6.5c.8.6 1.6.6 2.4 0s1.6-.6 2.4 0"/>',
    get pat() {
      return scatter(this.ic)
    },
  },
  burgerWheels: {
    name: "Hamburguesa sobre ruedas",
    ic:
      '<path d="M4 10a8 3 0 0 1 16 0"/><path d="M4 12h16"/><path d="M5 14h14a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3z"/>' +
      '<circle cx="7" cy="19.5" r="1.6"/><circle cx="17" cy="19.5" r="1.6"/><path d="M7 17.5v.4M17 17.5v.4"/>',
    get pat() {
      return scatter(this.ic)
    },
  },
  truckSteam: {
    name: "Camión con humo",
    ic:
      '<path d="M1 16V10h9v6M10 11h5l3.5 3.5V16H17M1 16h1a1.8 1.8 0 0 0 3.6 0h6.8a1.8 1.8 0 0 0 3.6 0h2.5"/>' +
      '<circle cx="4.5" cy="16" r="1.4"/><circle cx="15.5" cy="16" r="1.4"/>' +
      '<path d="M13 8c1-1 1-2 0-3M15 6.5c1-1 1-2 0-3" stroke-width="1.4"/>',
    get pat() {
      return scatter(this.ic)
    },
  },
} as const

export type BrandMotif = keyof typeof MOTIFS

export function isBrandMotif(value: string): value is BrandMotif {
  return value in MOTIFS
}
