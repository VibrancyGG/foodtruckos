"use client"

import { useState, useTransition } from "react"
import { updateUnit, uploadUnitPhoto, removeUnitPhoto } from "@/lib/units/actions"
import { useLang } from "@/lib/i18n/LangProvider"
import type { OwnerUnitsData } from "@/lib/units/getOwnerUnits"

export function EditTruckModal({ unit, onClose }: { unit: OwnerUnitsData["active"][number]; onClose: () => void }) {
  const { t } = useLang()
  const p = t.panel.trucksPage
  const c = t.panel.common
  const [name, setName] = useState(unit.name)
  const [location, setLocation] = useState(unit.location ?? "")
  const [photoUrl, setPhotoUrl] = useState(unit.photo_url)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function onPhotoPick(file: File) {
    setPhotoFile(file)
    setPhotoUrl(URL.createObjectURL(file))
  }

  function submit() {
    setError(null)
    if (!name.trim()) {
      setError(p.nameRequired)
      return
    }
    startTransition(async () => {
      const result = await updateUnit({ unitId: unit.id, name, location })
      if (!result.ok) {
        setError(result.error)
        return
      }
      if (photoFile) {
        const formData = new FormData()
        formData.set("file", photoFile)
        const photoResult = await uploadUnitPhoto(unit.id, formData)
        if (!photoResult.ok) {
          setError(photoResult.error)
          return
        }
      } else if (photoUrl === null && unit.photo_url) {
        const removeResult = await removeUnitPhoto(unit.id)
        if (!removeResult.ok) {
          setError(removeResult.error)
          return
        }
      }
      onClose()
    })
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-5">
      <div className="w-full max-w-md rounded-2xl bg-white p-6" role="dialog" aria-modal="true">
        <h3 className="mb-1.5 text-xl font-black">{unit.name}</h3>
        <p className="mb-4 text-sm text-neutral-500">{p.editTruckHint}</p>

        <label className="mb-1.5 block text-xs font-bold text-neutral-500">{p.photoLabelTruck}</label>
        <div className="mb-4 flex items-center gap-3">
          <div className="h-20 w-20 flex-none overflow-hidden rounded-xl border border-dashed border-neutral-300 bg-neutral-50">
            {photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-center text-[10px] text-neutral-400">{c.noPhoto}</div>
            )}
          </div>
          <div>
            <label className="mr-2 inline-block cursor-pointer rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-bold">
              {photoUrl ? p.changePhoto : p.choosePhoto}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) onPhotoPick(file)
                }}
              />
            </label>
            {photoUrl && (
              <button
                type="button"
                onClick={() => {
                  setPhotoFile(null)
                  setPhotoUrl(null)
                }}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-bold"
              >
                {p.removePhoto}
              </button>
            )}
            <p className="mt-1.5 text-[11px] leading-snug text-neutral-400">{p.photoHintTruck}</p>
          </div>
        </div>

        <label className="mb-1.5 block text-xs font-bold text-neutral-500">{p.nameQuestion}</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="mb-3 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />
        <label className="mb-1.5 block text-xs font-bold text-neutral-500">{p.locationQuestion}</label>
        <input value={location} onChange={(e) => setLocation(e.target.value)} className="mb-4 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm" />

        {error && <p className="mb-3 text-xs text-red-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-bold text-neutral-500">
            {c.cancel}
          </button>
          <button
            onClick={submit}
            disabled={pending}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
          >
            {pending ? c.saving : c.save}
          </button>
        </div>
      </div>
    </div>
  )
}
