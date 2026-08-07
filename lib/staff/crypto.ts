import { randomBytes, createHmac, timingSafeEqual } from "crypto"

// Un token opaco de dos partes: un id que sirve de índice de búsqueda (nunca
// secreto por sí solo) y un secreto de alta entropía que solo se guarda
// hasheado. El id nunca cambia de tamaño/forma entre llamadas; el secreto sí
// se compara siempre en tiempo constante.
export function generateOpaqueToken() {
  const id = randomBytes(16).toString("hex")
  const secret = randomBytes(32).toString("hex")
  return { id, secret, token: `${id}.${secret}` }
}

export function parseOpaqueToken(token: string | undefined | null) {
  if (!token) return null
  const dot = token.indexOf(".")
  if (dot < 0) return null
  const id = token.slice(0, dot)
  const secret = token.slice(dot + 1)
  if (!id || !secret) return null
  return { id, secret }
}

// Código corto de emparejamiento (el que el dueño teclea en la tablet), no
// necesita tanta entropía porque es de un solo uso y expira rápido.
export function generatePairingCode() {
  return randomBytes(4).toString("hex")
}

export function hashSecret(secret: string) {
  const pepper = requireEnv("STAFF_PIN_PEPPER")
  return createHmac("sha256", pepper).update(secret).digest("hex")
}

export function secretMatches(secret: string, hash: string) {
  const computed = Buffer.from(hashSecret(secret), "hex")
  const expected = Buffer.from(hash, "hex")
  if (computed.length !== expected.length) return false
  return timingSafeEqual(computed, expected)
}

export function pepperedPin(pin: string) {
  const pepper = requireEnv("STAFF_PIN_PEPPER")
  return createHmac("sha256", pepper).update(pin).digest("hex")
}

function requireEnv(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`Falta la variable de entorno ${name}`)
  return value
}
