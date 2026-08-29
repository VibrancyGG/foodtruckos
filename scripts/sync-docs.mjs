// Copia docs/ a la carpeta espejo de OneDrive.
//
// Por qué existe: los documentos de negocio viven en docs/ dentro del repo,
// para tener historial igual que el código. Pero la carpeta de OneDrive es la
// que se abre desde la tablet o el celular, y —más importante— es la que se
// carga como instrucciones al empezar cada sesión de trabajo.
//
// Cuando las dos se separan, el síntoma es feo y silencioso: se arranca la
// sesión leyendo una versión vieja del proyecto y se repiten afirmaciones ya
// corregidas. Pasó de verdad: durante semanas el espejo siguió diciendo que la
// comanda imprime "aunque el truck esté sin señal", una afirmación que el repo
// ya había corregido tras probarlo en modo avión.
//
//   node scripts/sync-docs.mjs           copia lo que difiera
//   node scripts/sync-docs.mjs --check   no copia; sale con 1 si hay desfase
//
// El repo siempre gana. Nunca copia en sentido contrario, y nunca borra: si el
// espejo tiene archivos que el repo no tiene, los reporta y los deja en paz.

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from "fs"
import { join, relative, dirname } from "path"

const ORIGEN = "docs"
// La carpeta sigue llamándose FoodTruckOS aunque el producto ya sea Pavessa, y
// tiene que seguir así: la clave del proyecto —y con ella el historial de
// sesiones y la carpeta de memoria— se deriva de esta ruta. Renombrarla los
// dejaría huérfanos a cambio de nada que se vea.
const ESPEJO =
  process.env.PAVESSA_DOCS_MIRROR ||
  "C:/Users/Edwin/OneDrive/Documentos/Claude/FoodTruckOS"

const soloRevisar = process.argv.includes("--check")

if (!existsSync(ESPEJO)) {
  // En otra máquina, o en CI, no hay OneDrive. No es un error: no hay nada que
  // espejar. Se avisa y se sale bien, para no romper un hook ni un build.
  console.log(`sync-docs: no existe el espejo (${ESPEJO}) — nada que hacer.`)
  process.exit(0)
}

function archivosDe(dir) {
  const salida = []
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const ruta = join(dir, entrada.name)
    if (entrada.isDirectory()) salida.push(...archivosDe(ruta))
    else salida.push(ruta)
  }
  return salida
}

const copiados = []
const iguales = []

for (const ruta of archivosDe(ORIGEN)) {
  const rel = relative(ORIGEN, ruta)
  const destino = join(ESPEJO, rel)
  const contenido = readFileSync(ruta)

  if (existsSync(destino) && readFileSync(destino).equals(contenido)) {
    iguales.push(rel)
    continue
  }

  copiados.push(rel)
  if (soloRevisar) continue

  mkdirSync(dirname(destino), { recursive: true })
  writeFileSync(destino, contenido)
}

// Lo que solo existe en el espejo se reporta pero no se toca. Borrarlo
// automáticamente convertiría este script en algo peligroso de correr, y hay
// documentos que viven solo ahí a propósito.
const enRepo = new Set(archivosDe(ORIGEN).map((r) => relative(ORIGEN, r)))
const sobrantes = []
function buscarSobrantes(dir) {
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    if (entrada.name === ".claude") continue
    const ruta = join(dir, entrada.name)
    if (entrada.isDirectory()) buscarSobrantes(ruta)
    else {
      const rel = relative(ESPEJO, ruta)
      if (!enRepo.has(rel)) sobrantes.push(rel)
    }
  }
}
if (statSync(ESPEJO).isDirectory()) buscarSobrantes(ESPEJO)

console.log(`sync-docs: ${iguales.length} al día, ${copiados.length} ${soloRevisar ? "desfasados" : "copiados"}`)
for (const c of copiados) console.log(`  ${soloRevisar ? "≠" : "→"} ${c}`)
if (sobrantes.length) {
  console.log(`sync-docs: ${sobrantes.length} solo en el espejo (no se tocan):`)
  for (const s of sobrantes) console.log(`  · ${s}`)
}

if (soloRevisar && copiados.length) process.exit(1)
