// Clases repetidas en formularios de todo el panel — un solo lugar para que
// el look de un input sea idéntico en Menú, Trucks, Marca, Personal, etc.
export const inputClass =
  "w-full rounded-xl border border-panel-line bg-panel-bg/60 px-3.5 py-2.5 text-sm text-panel-ink outline-none transition-colors focus:border-panel-brand focus:bg-panel-surface focus:ring-4 focus:ring-panel-brand/10"

export const inputClassSm =
  "w-full rounded-lg border border-panel-line bg-panel-bg/60 px-2.5 py-1.5 text-xs text-panel-ink outline-none transition-colors focus:border-panel-brand focus:bg-panel-surface focus:ring-2 focus:ring-panel-brand/10"

export const labelClass = "mb-1.5 block text-xs font-bold text-panel-ink-soft"

export const cardSelectClass = (active: boolean) =>
  `rounded-xl border-2 p-2.5 text-left transition-colors ${
    active ? "border-panel-brand bg-panel-brand-soft/50" : "border-panel-line bg-panel-surface hover:border-panel-ink/15"
  }`
