"use client"

import { useState, useTransition } from "react"
import { updateUnit, uploadUnitPhoto, removeUnitPhoto } from "@/lib/units/actions"
import { useLang } from "@/lib/i18n/LangProvider"
import type { OwnerUnitsData } from "@/lib/units/getOwnerUnits"
import { Modal } from "../ui/Modal"
import { Button } from "../ui/Button"
import { inputClass, labelClass } from "../ui/tokens"

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
    <Modal size="md">
      <h3 className="mb-1.5 font-[family-name:var(--font-panel-display)] text-xl font-bold">{unit.name}</h3>
      <p className="mb-4 text-sm text-panel-ink-soft">{p.editTruckHint}</p>

      <label className={labelClass}>{p.photoLabelTruck}</label>
      <div className="mb-4 flex items-center gap-3">
        <div className="h-20 w-20 flex-none overflow-hidden rounded-xl border border-dashed border-panel-line bg-panel-bg">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-center text-[10px] text-panel-ink/35">{c.noPhoto}</div>
          )}
        </div>
        <div>
          <label className="mr-2 inline-block cursor-pointer rounded-lg border border-panel-line px-3 py-1.5 text-xs font-bold transition-colors hover:border-panel-brand hover:text-panel-brand">
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
              className="rounded-lg border border-panel-line px-3 py-1.5 text-xs font-bold transition-colors hover:border-rose-300 hover:text-rose-600"
            >
              {p.removePhoto}
            </button>
          )}
          <p className="mt-1.5 text-[11px] leading-snug text-panel-ink/40">{p.photoHintTruck}</p>
        </div>
      </div>

      <label className={labelClass}>{p.nameQuestion}</label>
      <input value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} mb-3`} />
      <label className={labelClass}>{p.locationQuestion}</label>
      <input value={location} onChange={(e) => setLocation(e.target.value)} className={`${inputClass} mb-4`} />

      {error && <p className="mb-3 text-xs text-rose-600">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} className="px-3 py-2">
          {c.cancel}
        </Button>
        <Button onClick={submit} disabled={pending}>
          {pending ? c.saving : c.save}
        </Button>
      </div>
    </Modal>
  )
}
