"use client"

import { useState, useTransition } from "react"
import { uploadLogo } from "@/lib/media/actions"

export function LogoUploadForm({ currentLogoUrl }: { currentLogoUrl: string | null }) {
  const [preview, setPreview] = useState<string | null>(currentLogoUrl)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const result = await uploadLogo(formData)
      if (!result.ok) {
        setError(result.error)
        return
      }
      setPreview(result.publicUrl)
    })
  }

  return (
    <div className="space-y-3">
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="Logo" className="h-20 w-20 rounded-full object-cover" />
      )}
      <form action={onSubmit} className="flex items-center gap-2">
        <input type="file" name="file" accept="image/png,image/jpeg,image/webp" required />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-bold text-white disabled:opacity-60"
        >
          {pending ? "Subiendo…" : "Subir logo"}
        </button>
      </form>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
