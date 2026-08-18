// Prepara una copia de juguete de La Villita para que alguien la pruebe sin
// riesgo. NO TOCA el negocio original: solo lee de él.
//
//   npx tsx scripts/crear-demo-villita.mts
//
// El rol de servicio puede LEER las tablas y manejar el storage, pero no
// puede INSERTAR (los permisos de la base no se lo dan). Así que este script
// hace lo que sí puede — copiar imágenes y crear el usuario — y deja escrito
// un archivo .sql con el resto, que se ejecuta aparte.

import { readFileSync, writeFileSync } from "node:fs"
import { createHmac, randomBytes, randomUUID } from "node:crypto"
import { createClient } from "@supabase/supabase-js"
import bcrypt from "bcrypt"

const ORIGINAL = "98a50f5b-84ad-460c-aeea-fabcc0eaeb76"
const SALIDA = "scripts/demo-villita.sql"

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
)

const URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY
const PEPPER = env.STAFF_PIN_PEPPER
if (!URL || !SERVICE || !PEPPER) throw new Error("Faltan variables en .env.local")

const db = createClient(URL, SERVICE, { auth: { persistSession: false } })
// El codigo de emparejamiento se guarda como HMAC pelado...
const hash = (s: string) => createHmac("sha256", PEPPER).update(s).digest("hex")
// ...pero el PIN va con bcrypt POR ENCIMA del HMAC. Guardar solo el HMAC
// deja un PIN que nunca valida (lib/staff/session.ts usa bcrypt.compare).
const hashPin = (pin: string) => bcrypt.hash(hash(pin), 10)

const CORREO = "demo.villita@vibrancygg.com"
const CLAVE = "DemoVillita2026!"
const SLUG = "la-villita-demo"

const ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const codigoEmparejar = () => Array.from(randomBytes(6), (b) => ALFABETO[b % ALFABETO.length]).join("")

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")

/** Comilla para SQL. null se vuelve NULL, y las comillas simples se duplican. */
const q = (v: string | number | boolean | null | undefined) => {
  if (v === null || v === undefined) return "NULL"
  if (typeof v === "number") return String(v)
  if (typeof v === "boolean") return v ? "true" : "false"
  return "'" + String(v).replace(/'/g, "''") + "'"
}

// Dos por categoría, prefiriendo los que ya tienen foto.
const ELEGIDOS = [
  "Taco",
  "Quesabirria",
  "Salsa Roja Extra",
  "Orden De Crema",
  "Arroz Con Leche",
  "Fresas con crema",
  "Coca Cola Mexicana",
  "Agua De Horchata",
]

const rutaDeUrl = (url: string) => url.split("/business-media/")[1] ?? null
const urlDeRuta = (ruta: string) => `${URL}/storage/v1/object/public/business-media/${ruta}`

const NEG = randomUUID()

/** Copia un archivo del storage a la carpeta del negocio nuevo. Se copia en
 *  vez de apuntar al original para no dejar el id de otro negocio expuesto en
 *  las URLs de una cuenta que se le entrega a un tercero. */
async function copiarMedia(urlOriginal: string | null) {
  if (!urlOriginal) return null
  const ruta = rutaDeUrl(urlOriginal)
  // No todas las imágenes viven en nuestro storage: varias son de un banco
  // gratuito. Esas se reusan tal cual — no hay nada del otro negocio que
  // proteger en una URL pública de Unsplash.
  if (!ruta) return urlOriginal
  const destino = ruta.replace(ORIGINAL, NEG)
  const { error } = await db.storage.from("business-media").copy(ruta, destino)
  if (error && !String(error.message).toLowerCase().includes("exists")) {
    console.warn("  ! no se pudo copiar", ruta.slice(0, 60), "-", error.message)
    return null
  }
  return urlDeRuta(destino)
}

async function main() {
  const { data: existe } = await db.from("businesses").select("id").eq("slug", SLUG).maybeSingle()
  if (existe) throw new Error(`Ya existe ${SLUG}. Bórralo antes de recrearlo.`)

  const { data: orig } = await db.from("businesses").select("*").eq("id", ORIGINAL).single()
  if (!orig) throw new Error("No se encontró La Villita original")
  console.log("Leyendo de:", orig.name)

  const sql: string[] = [
    "-- Cuenta demo de La Villita. Generado por scripts/crear-demo-villita.mts",
    "-- No toca el negocio original.",
    "begin;",
    "",
  ]

  // ── Negocio ────────────────────────────────────────────────────────────
  const logo = await copiarMedia(orig.logo_url)
  const portada = await copiarMedia(orig.cover_photo_url)
  console.log("Marca:", logo ? "logo ok" : "sin logo", portada ? "· portada ok" : "· sin portada")

  sql.push(
    `insert into businesses (id, name, slug, tax_included, brand_color, logo_url, cover_photo_url, menu_style, brand_motif, header_style, timezone, default_alert_amber_minutes, default_alert_red_minutes, subscription_status, billing_mode, onboarding_completed_at) values (${[
      q(NEG),
      q(orig.name),
      q(SLUG),
      q(orig.tax_included),
      q(orig.brand_color),
      q(logo),
      q(portada),
      q(orig.menu_style),
      q(orig.brand_motif),
      q(orig.header_style),
      q(orig.timezone),
      q(orig.default_alert_amber_minutes),
      q(orig.default_alert_red_minutes),
      // Activa y sin fin de prueba: es un cajón de arena, no queremos que se
      // bloquee sola a mitad de una demostración.
      q("active"),
      q("manual"),
      "now()",
    ].join(", ")});`,
    `insert into business_counters (business_id, next_folio) values (${q(NEG)}, 1);`,
    "",
  )

  // ── Categorías ─────────────────────────────────────────────────────────
  const { data: cats } = await db.from("menu_categories").select("*").eq("business_id", ORIGINAL).order("sort_order")
  const mapaCat = new Map<string, string>()
  for (const c of cats ?? []) {
    const id = randomUUID()
    mapaCat.set(c.id, id)
    sql.push(
      `insert into menu_categories (id, business_id, name_es, name_en, sort_order) values (${q(id)}, ${q(NEG)}, ${q(c.name_es)}, ${q(c.name_en)}, ${q(c.sort_order)});`,
    )
  }
  sql.push("")
  console.log("Categorías:", mapaCat.size)

  // ── Productos ──────────────────────────────────────────────────────────
  const { data: prods } = await db
    .from("products")
    .select("*")
    .eq("business_id", ORIGINAL)
    .eq("status", "active")
    .in("name_es", ELEGIDOS)

  const porNombre = new Map<string, NonNullable<typeof prods>[number]>()
  for (const p of prods ?? []) {
    const previo = porNombre.get(p.name_es)
    if (!previo || (!previo.photo_url && p.photo_url)) porNombre.set(p.name_es, p)
  }

  const idsProd: string[] = []
  const sinFoto: string[] = []
  for (const nombre of ELEGIDOS) {
    const p = porNombre.get(nombre)
    if (!p) {
      console.warn("  ! no encontrado:", nombre)
      continue
    }
    const foto = await copiarMedia(p.photo_url)
    if (!foto) sinFoto.push(nombre)
    const pid = randomUUID()
    idsProd.push(pid)
    sql.push(
      `insert into products (id, business_id, category_id, name_es, name_en, description_es, description_en, price, photo_url, status) values (${[
        q(pid),
        q(NEG),
        q(mapaCat.get(p.category_id)),
        q(p.name_es),
        q(p.name_en),
        q(p.description_es),
        q(p.description_en),
        q(p.price),
        q(foto),
        q("active"),
      ].join(", ")});`,
    )

    // Personalización: sin esto no se puede probar "sin cebolla, extra queso".
    const { data: grupos } = await db.from("product_option_groups").select("*").eq("product_id", p.id).order("sort_order")
    for (const g of grupos ?? []) {
      const gid = randomUUID()
      sql.push(
        `insert into product_option_groups (id, business_id, product_id, group_name_es, group_name_en, min_select, max_select, required, sort_order, kind) values (${[
          q(gid),
          q(NEG),
          q(pid),
          q(g.group_name_es),
          q(g.group_name_en),
          q(g.min_select),
          q(g.max_select),
          q(g.required),
          q(g.sort_order),
          q(g.kind),
        ].join(", ")});`,
      )
      const { data: ops } = await db.from("product_options").select("*").eq("group_id", g.id).order("sort_order")
      for (const o of ops ?? []) {
        sql.push(
          `insert into product_options (id, business_id, group_id, option_name_es, option_name_en, price_delta, kind, sort_order, sold_out) values (${[
            q(randomUUID()),
            q(NEG),
            q(gid),
            q(o.option_name_es),
            q(o.option_name_en),
            q(o.price_delta),
            q(o.kind),
            q(o.sort_order),
            "false",
          ].join(", ")});`,
        )
      }
    }
  }
  sql.push("")
  console.log(`Productos: ${idsProd.length} (${idsProd.length - sinFoto.length} con foto)`)

  // ── Tres trucks ────────────────────────────────────────────────────────
  const { data: modelo } = await db
    .from("units")
    .select("hours")
    .eq("business_id", ORIGINAL)
    .eq("name", "Truck Norman")
    .single()
  const horario = modelo?.hours ? q(JSON.stringify(modelo.hours)) + "::jsonb" : "NULL"

  const TRUCKS = [
    { nombre: "Truck Norman", lugar: "506 N Porter Ave, Norman, OK 73071" },
    { nombre: "Truck Mustang", lugar: "325 W State Hwy 152, Mustang, OK 73064" },
    { nombre: "Truck Centro", lugar: "300 W Sheridan Ave, Oklahoma City, OK 73102" },
  ]
  const unidades: { id: string; nombre: string; qr: string }[] = []
  TRUCKS.forEach((t, i) => {
    const uid = randomUUID()
    const qr = `${SLUG}-truck-${i + 1}`
    unidades.push({ id: uid, nombre: t.nombre, qr })
    sql.push(
      `insert into units (id, business_id, type, name, location, hours, status) values (${q(uid)}, ${q(NEG)}, 'truck', ${q(t.nombre)}, ${q(t.lugar)}, ${horario}, 'active');`,
      `insert into order_points (id, business_id, unit_id, label, qr_slug, active) values (${q(randomUUID())}, ${q(NEG)}, ${q(uid)}, 'Principal', ${q(qr)}, true);`,
    )
    // Todo el menú se ofrece en todos los trucks: si no, el menú sale vacío.
    for (const pid of idsProd) {
      sql.push(
        `insert into unit_products (id, business_id, unit_id, product_id, is_offered, sold_out) values (${q(randomUUID())}, ${q(NEG)}, ${q(uid)}, ${q(pid)}, true, false);`,
      )
    }
  })
  sql.push("")
  console.log("Trucks:", unidades.length)

  // ── Personal: uno por rol ──────────────────────────────────────────────
  const PERSONAL = [
    { nombre: "Rosa Martínez", rol: "cajero", pin: "1234", unidad: unidades[0].id },
    { nombre: "Miguel Ángel Ruiz", rol: "cocina", pin: "2345", unidad: unidades[0].id },
    // El encargado no se ata a un truck: los ve todos.
    { nombre: "Laura Jiménez", rol: "encargado", pin: "3456", unidad: null },
  ]
  for (const p of PERSONAL) {
    const pinHash = await hashPin(p.pin)
    sql.push(
      `insert into staff (id, business_id, unit_id, name, role, pin_hash, active) values (${[
        q(randomUUID()),
        q(NEG),
        q(p.unidad),
        q(p.nombre),
        q(p.rol),
        q(pinHash),
        "true",
      ].join(", ")});`,
    )
  }
  sql.push("")

  // ── Un aparato por truck, con código de larga duración ─────────────────
  const dentroDeUnAno = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
  const aparatos: { truck: string; codigo: string }[] = []
  for (const u of unidades) {
    const codigo = codigoEmparejar()
    aparatos.push({ truck: u.nombre, codigo })
    sql.push(
      `insert into devices (id, business_id, unit_id, label, pairing_code_hash, pairing_code_expires_at) values (${[
        q(randomUUID()),
        q(NEG),
        q(u.id),
        q(`Tablet ${u.nombre}`),
        q(hash(codigo)),
        q(dentroDeUnAno),
      ].join(", ")});`,
    )
  }
  sql.push("")

  // ── Usuario dueño ──────────────────────────────────────────────────────
  const res = await fetch(`${URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: { Authorization: `Bearer ${SERVICE}`, apikey: SERVICE, "Content-Type": "application/json" },
    body: JSON.stringify({ email: CORREO, password: CLAVE, email_confirm: true }),
  })
  let usuario = await res.json()
  if (!res.ok) {
    // Si ya existe de un intento anterior, se reutiliza en vez de fallar.
    const lista = await fetch(`${URL}/auth/v1/admin/users?page=1&per_page=200`, {
      headers: { Authorization: `Bearer ${SERVICE}`, apikey: SERVICE },
    })
    const { users } = await lista.json()
    const previo = (users ?? []).find((u: { email: string }) => u.email === CORREO)
    if (!previo) throw new Error("No se pudo crear el usuario: " + JSON.stringify(usuario))
    usuario = previo
    console.log("Usuario reutilizado (ya existía):", CORREO)
  } else {
    console.log("Usuario creado:", CORREO)
  }
  sql.push(
    `insert into business_members (id, business_id, auth_user_id, role) values (${q(randomUUID())}, ${q(NEG)}, ${q(usuario.id)}, 'owner');`,
    "",
    "commit;",
    "",
  )

  writeFileSync(SALIDA, sql.join("\n"), "utf8")

  const base = env.NEXT_PUBLIC_SITE_URL
  console.log(`\nSQL escrito en ${SALIDA} (${sql.length} líneas) — falta ejecutarlo.\n`)
  console.log("=".repeat(62))
  console.log("DATOS DE LA CUENTA DEMO")
  console.log("=".repeat(62))
  console.log(`\nPanel del dueño   ${base}/login`)
  console.log(`  correo          ${CORREO}`)
  console.log(`  contraseña      ${CLAVE}`)
  console.log(`\nPINs del personal`)
  for (const p of PERSONAL) console.log(`  ${p.pin}   ${p.nombre} — ${p.rol}`)
  console.log(`\nCódigos para emparejar tablet (vencen en 1 año)`)
  for (const a of aparatos) console.log(`  ${a.codigo}   ${a.truck}`)
  console.log(`\nMenú del comensal`)
  for (const u of unidades) console.log(`  ${u.nombre.padEnd(14)} ${base}/${SLUG}/${slugify(u.nombre)}/${u.qr}`)
  if (sinFoto.length) console.log(`\nSin foto (no existe en el original): ${sinFoto.join(", ")}`)
  console.log(`\nnegocio id  ${NEG}`)
  console.log("=".repeat(62))
}

main().catch((e) => {
  console.error("\nFALLÓ:", e.message)
  process.exit(1)
})
