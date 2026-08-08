"use client"

import { useState, useTransition } from "react"
import type { OwnerMenuData } from "@/lib/menu/getOwnerMenu"
import { createOptionGroup, deleteOptionGroup, createOption, deleteOption } from "@/lib/menu/actions"

export function OptionGroupsEditor({
  productId,
  groups,
  options,
}: {
  productId: string
  groups: OwnerMenuData["optionGroups"]
  options: OwnerMenuData["options"]
}) {
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [nameEs, setNameEs] = useState("")
  const [nameEn, setNameEn] = useState("")
  const [required, setRequired] = useState(false)
  const [minSelect, setMinSelect] = useState("0")
  const [maxSelect, setMaxSelect] = useState("1")
  const [pending, startTransition] = useTransition()

  function addGroup() {
    if (!nameEs.trim() || !nameEn.trim()) return
    startTransition(async () => {
      await createOptionGroup({
        productId,
        nameEs,
        nameEn,
        required,
        minSelect: parseInt(minSelect, 10) || 0,
        maxSelect: parseInt(maxSelect, 10) || 1,
      })
      setNameEs("")
      setNameEn("")
      setRequired(false)
      setMinSelect("0")
      setMaxSelect("1")
      setShowAddGroup(false)
    })
  }

  return (
    <div className="mt-2 space-y-2.5 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      {groups.length === 0 && !showAddGroup && (
        <p className="text-xs text-neutral-400">Sin grupos de personalización todavía.</p>
      )}
      {groups.map((g) => (
        <OptionGroupRow key={g.id} group={g} options={options.filter((o) => o.group_id === g.id)} />
      ))}

      {showAddGroup ? (
        <div className="space-y-2 rounded-lg border border-neutral-200 bg-white p-2.5">
          <input
            value={nameEs}
            onChange={(e) => setNameEs(e.target.value)}
            placeholder="Nombre en español (ej. ¿Le agregamos algo?)"
            className="w-full rounded border border-neutral-300 px-2 py-1 text-xs"
          />
          <input
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="Name in English"
            className="w-full rounded border border-neutral-300 px-2 py-1 text-xs"
          />
          <div className="flex flex-wrap items-center gap-2.5 text-xs text-neutral-600">
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />
              obligatorio
            </label>
            <label className="flex items-center gap-1">
              mínimo
              <input
                value={minSelect}
                onChange={(e) => setMinSelect(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                className="w-10 rounded border border-neutral-300 px-1 py-0.5"
              />
            </label>
            <label className="flex items-center gap-1">
              máximo
              <input
                value={maxSelect}
                onChange={(e) => setMaxSelect(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                className="w-10 rounded border border-neutral-300 px-1 py-0.5"
              />
            </label>
          </div>
          <div className="flex gap-2">
            <button
              onClick={addGroup}
              disabled={pending}
              className="rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-bold text-white disabled:opacity-60"
            >
              Crear grupo
            </button>
            <button onClick={() => setShowAddGroup(false)} className="text-xs text-neutral-500">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddGroup(true)} className="text-xs font-bold text-neutral-600">
          + Agregar grupo de opciones
        </button>
      )}
    </div>
  )
}

function OptionGroupRow({
  group,
  options,
}: {
  group: OwnerMenuData["optionGroups"][number]
  options: OwnerMenuData["options"]
}) {
  const [showAddOption, setShowAddOption] = useState(false)
  const [nameEs, setNameEs] = useState("")
  const [nameEn, setNameEn] = useState("")
  const [priceDelta, setPriceDelta] = useState("0")
  const [kind, setKind] = useState<"add" | "remove">("add")
  const [gone, setGone] = useState(false)
  const [pending, startTransition] = useTransition()

  if (gone) return null

  function addOption() {
    if (!nameEs.trim() || !nameEn.trim()) return
    startTransition(async () => {
      await createOption({ groupId: group.id, nameEs, nameEn, priceDelta: parseFloat(priceDelta) || 0, kind })
      setNameEs("")
      setNameEn("")
      setPriceDelta("0")
      setKind("add")
      setShowAddOption(false)
    })
  }

  function removeGroup() {
    startTransition(async () => {
      const result = await deleteOptionGroup(group.id)
      if (result.ok) setGone(true)
    })
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-2.5">
      <div className="mb-1.5 flex items-center justify-between">
        <div>
          <div className="text-xs font-bold">{group.group_name_es}</div>
          <div className="text-[11px] text-neutral-400">
            {group.required ? "Obligatorio" : "Opcional"} · elige {group.min_select}–{group.max_select}
          </div>
        </div>
        <button
          onClick={removeGroup}
          disabled={pending}
          className="text-[11px] font-semibold text-neutral-400 hover:text-red-600"
        >
          Eliminar grupo
        </button>
      </div>

      <div className="space-y-1">
        {options.map((o) => (
          <OptionRow key={o.id} option={o} />
        ))}
      </div>

      {showAddOption ? (
        <div className="mt-1.5 space-y-1.5 border-t border-neutral-100 pt-1.5">
          <input
            value={nameEs}
            onChange={(e) => setNameEs(e.target.value)}
            placeholder="Nombre en español"
            className="w-full rounded border border-neutral-300 px-2 py-1 text-xs"
          />
          <input
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="Name in English"
            className="w-full rounded border border-neutral-300 px-2 py-1 text-xs"
          />
          <div className="flex items-center gap-2 text-xs">
            <select
              value={kind}
              onChange={(e) => setKind(e.target.value as "add" | "remove")}
              className="rounded border border-neutral-300 px-1.5 py-1"
            >
              <option value="add">Agregar (con costo)</option>
              <option value="remove">Quitar (sin costo)</option>
            </select>
            {kind === "add" && (
              <input
                value={priceDelta}
                onChange={(e) => setPriceDelta(e.target.value)}
                inputMode="decimal"
                placeholder="+$"
                className="w-16 rounded border border-neutral-300 px-1.5 py-1"
              />
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={addOption}
              disabled={pending}
              className="rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-bold text-white disabled:opacity-60"
            >
              Agregar opción
            </button>
            <button onClick={() => setShowAddOption(false)} className="text-xs text-neutral-500">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddOption(true)} className="mt-1.5 text-[11px] font-bold text-neutral-500">
          + Agregar opción
        </button>
      )}
    </div>
  )
}

function OptionRow({ option }: { option: OwnerMenuData["options"][number] }) {
  const [gone, setGone] = useState(false)
  const [pending, startTransition] = useTransition()
  if (gone) return null

  return (
    <div className="flex items-center justify-between text-xs">
      <span>
        {option.option_name_es}{" "}
        {option.kind === "add" && option.price_delta > 0
          ? `(+$${option.price_delta.toFixed(2)})`
          : option.kind === "remove"
            ? "(quitar)"
            : ""}
      </span>
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            const r = await deleteOption(option.id)
            if (r.ok) setGone(true)
          })
        }
        className="text-neutral-400 hover:text-red-600"
      >
        ✕
      </button>
    </div>
  )
}
