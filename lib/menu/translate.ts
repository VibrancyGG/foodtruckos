"use server"

import { getOwnerContext } from "@/lib/auth/dal"

// El dueño siempre confirma o edita la sugerencia antes de guardar — esto
// nunca escribe directo a la base de datos, solo devuelve texto para llenar
// el campo (foodtruckos-contenido: nada de texto de usuario se guarda sin
// que el dueño lo revise). Requiere sesión de dueño para no exponer la
// llamada a quien no tenga negocio vinculado — controla el costo y el abuso.
const MODEL = "claude-haiku-4-5-20251001"
const MAX_CHARS = 500

type TranslateDirection = "es-en" | "en-es"
type TranslateResult = { ok: true; text: string } | { ok: false; error: string }

export async function suggestTranslation(text: string, direction: TranslateDirection): Promise<TranslateResult> {
  const { businessId } = await getOwnerContext()
  if (!businessId) return { ok: false, error: "Sin negocio vinculado" }

  const trimmed = text.trim()
  if (!trimmed) return { ok: false, error: "No hay nada que traducir" }
  if (trimmed.length > MAX_CHARS) return { ok: false, error: "Muy largo para traducir" }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return { ok: false, error: "Traducción no configurada" }

  const from = direction === "es-en" ? "Spanish" : "English"
  const to = direction === "es-en" ? "English" : "Spanish"

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 300,
        system: `You translate food-truck menu text from ${from} to ${to} for a bilingual restaurant ordering app. Keep it natural, appetizing, and concise — how a real bilingual menu would phrase it, not a literal word-for-word translation. Preserve dish names that are commonly left untranslated (e.g. "quesadilla", "birria"). Return ONLY the translated text, no quotes, no preamble, no explanation.`,
        messages: [{ role: "user", content: trimmed }],
      }),
    })

    if (!res.ok) return { ok: false, error: "No se pudo traducir" }

    const data = await res.json()
    const translated = data?.content?.[0]?.text?.trim()
    if (!translated) return { ok: false, error: "No se pudo traducir" }

    return { ok: true, text: translated }
  } catch {
    return { ok: false, error: "No se pudo traducir" }
  }
}
