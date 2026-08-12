// Trazo redondeado, viewBox 24x24, currentColor — mismo lenguaje visual que
// los motivos de marca (lib/branding/motifs.ts), para que el panel y el
// menú del comensal se sientan parte de la misma familia sin copiarse.
type IconProps = { className?: string }

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

export function IconFlame({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 3c1 3-3 4-3 7a3 3 0 0 0 6 0c1.2 1 2 2.6 2 4.3A5.3 5.3 0 0 1 11.7 21 5.5 5.5 0 0 1 6 15.6C6 11 12 9 12 3z" />
    </svg>
  )
}

export function IconClock({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  )
}

export function IconCalendarStar({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M3.5 9.5h17M8 3v3.5M16 3v3.5" />
      <path d="M12 12.2l.9 1.9 2 .3-1.5 1.4.4 2-1.8-1-1.8 1 .4-2-1.5-1.4 2-.3z" />
    </svg>
  )
}

export function IconTimerBolt({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 3.5h2.4M10 2.8h4" />
      <path d="M13.1 9.4l-2.9 4.2h2.4l-1.4 3.1 3.4-4.4h-2.3z" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconTruck({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M3 7h10v9H3z" />
      <path d="M13 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.7" />
      <circle cx="17" cy="18" r="1.7" />
    </svg>
  )
}

export function IconUsers({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c.6-3.3 3-5 5.5-5s4.9 1.7 5.5 5" />
      <circle cx="17" cy="9" r="2.6" />
      <path d="M15.3 19c.4-2.4 1.7-3.9 3.7-4.4" />
    </svg>
  )
}

export function IconQr({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.3" />
      <rect x="14" y="3.5" width="6.5" height="6.5" rx="1.3" />
      <rect x="3.5" y="14" width="6.5" height="6.5" rx="1.3" />
      <path d="M14 14h3v3h-3zM19.5 14v6.5M14 19.5h6.5" />
    </svg>
  )
}

export function IconWallet({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M3.5 7.5A2.5 2.5 0 0 1 6 5h11a2 2 0 0 1 2 2v2" />
      <rect x="3.5" y="7.5" width="17" height="12" rx="2.5" />
      <path d="M15.5 13.5h3" />
    </svg>
  )
}

export function IconChart({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4 20V10M11 20V4M18 20v-7" />
      <path d="M2.5 20h19" />
    </svg>
  )
}

export function IconPalette({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17c1 0 1.7-.8 1.7-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H16a4 4 0 0 0 4-4c0-3.9-3.6-7-8-7z" />
      <circle cx="7.3" cy="10.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="9.5" cy="7" r="1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="7.2" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function IconDevice({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="6" y="2.5" width="12" height="19" rx="2.3" />
      <path d="M10.5 18.3h3" />
    </svg>
  )
}
