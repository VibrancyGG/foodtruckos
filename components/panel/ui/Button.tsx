"use client"

import type { ButtonHTMLAttributes } from "react"

type Variant = "primary" | "secondary" | "danger" | "dangerSolid" | "ghost"

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-panel-brand text-white hover:bg-panel-brand-deep active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-[0_1px_2px_rgba(226,67,31,0.25)]",
  secondary:
    "bg-panel-bg text-panel-ink hover:bg-panel-line/70 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100",
  dangerSolid:
    "bg-rose-600 text-white hover:bg-rose-700 active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-[0_1px_2px_rgba(225,29,72,0.25)]",
  danger: "text-rose-600 hover:text-rose-700 font-bold",
  ghost: "text-panel-ink-soft hover:text-panel-ink font-semibold",
}

const SIZE = "rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-150"
const SIZE_GHOST = "text-sm"

export function Button({
  variant = "primary",
  className = "",
  ...props
}: { variant?: Variant } & ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = variant === "danger" || variant === "ghost" ? SIZE_GHOST : SIZE
  return <button className={`${base} ${VARIANTS[variant]} ${className}`} {...props} />
}
