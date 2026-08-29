// Genera los iconos de la web a partir de una sola definición del glifo.
//
// La P va dibujada como trazado, no como texto: con `<text font-family="Arial">`
// el resultado dependía de qué fuentes tuviera instalada la máquina que corriera
// el script, así que dos personas obtenían iconos distintos. Con un path el
// dibujo es idéntico en cualquier lado.
//
//   node scripts/generate-icons.mjs
//
// Reescribe public/icons/*.png y app/favicon.ico. Es idempotente: si no se
// cambia el glifo, `git status` no debería reportar nada después de correrlo.

import sharp from "sharp"
import { mkdirSync, writeFileSync } from "fs"

mkdirSync("public/icons", { recursive: true })

const TINTA = "#0D0D0D"

// El asta mide 63 de ancho y las barras horizontales 40. Tienen que ser más
// finas que el asta: con el mismo grosor el contador se cierra y la letra se
// lee como un cuadrado. El hueco de la panza es el segundo subtrazado, que se
// vuelve agujero por la regla evenodd.
const GLIFO = "M168,146 H343 V286 H231 V366 H168 Z M231,186 H293 V246 H231 Z"

const conEsquinas = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="102" ry="102" fill="${TINTA}"/>
  <path fill="#FFFFFF" fill-rule="evenodd" d="${GLIFO}"/>
</svg>`

// El icono maskable lo recorta el launcher con la forma que quiera —círculo,
// cuadrado, gota—, así que va a sangre, sin esquinas propias. El glifo cabe de
// sobra dentro de la zona segura (el círculo central del 80%).
const aSangre = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="${TINTA}"/>
  <path fill="#FFFFFF" fill-rule="evenodd" d="${GLIFO}"/>
</svg>`

const objetivos = [
  { nombre: "icon-192.png", svg: conEsquinas, tam: 192 },
  { nombre: "icon-512.png", svg: conEsquinas, tam: 512 },
  { nombre: "icon-maskable-512.png", svg: aSangre, tam: 512 },
  { nombre: "apple-touch-icon.png", svg: conEsquinas, tam: 180 },
]

for (const o of objetivos) {
  await sharp(Buffer.from(o.svg)).resize(o.tam, o.tam).png().toFile(`public/icons/${o.nombre}`)
  console.log("escrito", o.nombre)
}

// favicon.ico se arma a mano porque sharp no escribe .ico. Un .ico moderno
// puede llevar PNGs adentro tal cual: cabecera de 6 bytes, una entrada de
// directorio de 16 por imagen, y luego los PNGs pegados.
const tams = [16, 32, 48]
const pngs = []
for (const t of tams) {
  pngs.push(await sharp(Buffer.from(conEsquinas)).resize(t, t).png().toBuffer())
}

const cabecera = Buffer.alloc(6)
cabecera.writeUInt16LE(0, 0) // reservado
cabecera.writeUInt16LE(1, 2) // tipo 1 = icono
cabecera.writeUInt16LE(tams.length, 4)

let desplazamiento = 6 + 16 * tams.length
const entradas = tams.map((t, i) => {
  const e = Buffer.alloc(16)
  e.writeUInt8(t, 0) // ancho (0 significaría 256)
  e.writeUInt8(t, 1) // alto
  e.writeUInt8(0, 2) // colores de paleta
  e.writeUInt8(0, 3) // reservado
  e.writeUInt16LE(1, 4) // planos
  e.writeUInt16LE(32, 6) // bits por pixel
  e.writeUInt32LE(pngs[i].length, 8)
  e.writeUInt32LE(desplazamiento, 12)
  desplazamiento += pngs[i].length
  return e
})

writeFileSync("app/favicon.ico", Buffer.concat([cabecera, ...entradas, ...pngs]))
console.log("escrito app/favicon.ico")
