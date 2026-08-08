"use client"

import { useRef, useState } from "react"
import { dictionary, type Lang } from "@/lib/i18n/dictionary"

// Botones rápidos primero, escribir después, dictado como extra: en una
// taquería casi siempre es la misma nota, así que un toque cubre la mayoría
// de los casos y el micrófono queda de respaldo (necesita señal y ambiente
// silencioso, nunca puede ser el único camino).
type SpeechResultEvent = { results: { [i: number]: { [j: number]: { transcript: string } } } }

type SpeechRecognitionCtor = new () => {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: ((e: SpeechResultEvent) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
}

function getSpeechRecognition(): SpeechRecognitionCtor | null {
  if (typeof window === "undefined") return null
  const w = window as unknown as { SpeechRecognition?: SpeechRecognitionCtor; webkitSpeechRecognition?: SpeechRecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function NoteInput({
  chips,
  selected,
  onToggleChip,
  text,
  onText,
  placeholder,
  lang,
}: {
  chips: { label: string; group?: string }[]
  selected: Set<string>
  onToggleChip: (chip: { label: string; group?: string }) => void
  text: string
  onText: (v: string) => void
  placeholder: string
  lang: Lang
}) {
  const t = dictionary[lang].kitchen
  const [recording, setRecording] = useState(false)
  const [hint, setHint] = useState<string | null>(null)
  const [hintErr, setHintErr] = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)
  const SR = getSpeechRecognition()

  function dictate() {
    if (!SR) return
    const r = new SR()
    r.lang = lang === "es" ? "es-MX" : "en-US"
    r.interimResults = false
    r.maxAlternatives = 1
    setRecording(true)
    setHintErr(false)
    setHint(t.micListening)
    r.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim()
      onText(text ? `${text} ${transcript}` : transcript)
      setHint(t.micDone)
    }
    r.onerror = (e) => {
      setRecording(false)
      setHintErr(true)
      setHint(
        e.error === "not-allowed"
          ? t.micDenied
          : e.error === "no-speech"
            ? t.micNoSpeech
            : e.error === "network"
              ? t.micNetwork
              : t.micGeneric,
      )
    }
    r.onend = () => setRecording(false)
    try {
      r.start()
    } catch {
      setRecording(false)
      setHintErr(true)
      setHint(t.micGeneric)
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center gap-2 text-[11.5px] font-bold uppercase tracking-wide text-neutral-400">
        <b className="text-neutral-100">{t.notesLabel}</b>
        <span className="normal-case font-semibold">{t.notesHint}</span>
      </div>
      <div className="mb-2 flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <button
            key={c.label}
            onClick={() => onToggleChip(c)}
            aria-pressed={selected.has(c.label)}
            className="min-h-[42px] rounded-full border px-3.5 text-[13.5px] font-bold"
            style={
              selected.has(c.label)
                ? { background: "#F5A524", borderColor: "#F5A524", color: "#231602" }
                : { background: "#232019", borderColor: "#332F29", color: "#F6F3ED" }
            }
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="relative">
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => onText(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full rounded-lg border px-3 py-2.5 pr-12 text-[14.5px] font-medium"
          style={{ background: "#232019", borderColor: "#332F29", color: "#F6F3ED" }}
        />
        {SR && (
          <button
            onClick={dictate}
            aria-label={t.micDictate}
            title={t.micDictate}
            className="absolute right-2 top-2 grid h-[38px] w-[38px] place-items-center rounded-full border"
            style={
              recording
                ? { background: "#E5484D", borderColor: "#E5484D", color: "#fff" }
                : { background: "#1B1917", borderColor: "#332F29", color: "#F6F3ED" }
            }
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-[19px] w-[19px]">
              <rect x="9" y="2" width="6" height="12" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0" />
              <path d="M12 18v3" />
            </svg>
          </button>
        )}
      </div>
      {hint && <p className="mt-1.5 text-xs" style={{ color: hintErr ? "#FFB3B5" : "#9C948A" }}>{hint}</p>}
      {!SR && !hint && <p className="mt-1.5 text-xs text-neutral-500">{t.micUnsupported}</p>}
    </div>
  )
}
