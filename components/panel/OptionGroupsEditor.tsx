"use client"

import { useState, useTransition } from "react"
import type { OwnerMenuData } from "@/lib/menu/getOwnerMenu"
import { createOptionGroup, deleteOptionGroup, createOption, updateOption, deleteOption } from "@/lib/menu/actions"
import { useLang } from "@/lib/i18n/LangProvider"
import { TranslateFieldActions } from "./TranslateFieldActions"

export function OptionGroupsEditor({
  productId,
  groups,
  options,
}: {
  productId: string
  groups: OwnerMenuData["optionGroups"]
  options: OwnerMenuData["options"]
}) {
  const { t } = useLang()
  const m = t.panel.menuPage
  const c = t.panel.common
  const [showAddGroup, setShowAddGroup] = useState(false)
  const [nameEs, setNameEs] = useState("")
  const [nameEn, setNameEn] = useState("")
  const [kind, setKind] = useState<"add" | "remove">("add")
  const [required, setRequired] = useState(false)
  const [minSelect, setMinSelect] = useState("0")
  const [maxSelect, setMaxSelect] = useState("1")
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function addGroup() {
    setError(null)
    if (!nameEs.trim() || !nameEn.trim()) {
      setError(m.categoryFormError)
      return
    }
    startTransition(async () => {
      await createOptionGroup({
        productId,
        nameEs,
        nameEn,
        kind,
        required,
        minSelect: parseInt(minSelect, 10) || 0,
        maxSelect: parseInt(maxSelect, 10) || 1,
      })
      setNameEs("")
      setNameEn("")
      setKind("add")
      setRequired(false)
      setMinSelect("0")
      setMaxSelect("1")
      setShowAddGroup(false)
    })
  }

  return (
    <div className="mt-2 space-y-2.5 rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      {groups.length === 0 && !showAddGroup && (
        <p className="text-xs text-neutral-400">{m.noOptionGroups}</p>
      )}
      {groups.map((g) => (
        <OptionGroupRow key={g.id} group={g} options={options.filter((o) => o.group_id === g.id)} />
      ))}

      {showAddGroup ? (
        <div className="space-y-2 rounded-lg border border-neutral-200 bg-white p-2.5">
          <div>
            <p className="mb-1.5 text-[11px] font-bold text-neutral-500">{m.groupKindQuestion}</p>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setKind("add")}
                className={`rounded-lg border-2 p-2 text-left ${kind === "add" ? "border-green-600 bg-green-50" : "border-neutral-200"}`}
              >
                <div className="text-xs font-bold" style={kind === "add" ? { color: "#15803D" } : undefined}>
                  + {m.groupKindAdd}
                </div>
                <div className="text-[10px] text-neutral-400">{m.groupKindAddHint}</div>
              </button>
              <button
                type="button"
                onClick={() => setKind("remove")}
                className={`rounded-lg border-2 p-2 text-left ${kind === "remove" ? "border-red-600 bg-red-50" : "border-neutral-200"}`}
              >
                <div className="text-xs font-bold" style={kind === "remove" ? { color: "#B91C1C" } : undefined}>
                  − {m.groupKindRemove}
                </div>
                <div className="text-[10px] text-neutral-400">{m.groupKindRemoveHint}</div>
              </button>
            </div>
          </div>
          <input
            value={nameEs}
            onChange={(e) => setNameEs(e.target.value)}
            placeholder={c.nameEsPlaceholder}
            className="w-full rounded border border-neutral-300 px-2 py-1 text-xs"
          />
          <TranslateFieldActions sourceValue={nameEn} setTarget={setNameEs} direction="en-es" />
          <input
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder={c.nameEnPlaceholder}
            className="w-full rounded border border-neutral-300 px-2 py-1 text-xs"
          />
          <TranslateFieldActions sourceValue={nameEs} setTarget={setNameEn} direction="es-en" allowCopy />
          <div className="flex flex-wrap items-center gap-2.5 pt-1 text-xs text-neutral-600">
            <label className="flex items-center gap-1">
              <input type="checkbox" checked={required} onChange={(e) => setRequired(e.target.checked)} />
              {m.requiredLabel}
            </label>
            <label className="flex items-center gap-1">
              {m.minLabel}
              <input
                value={minSelect}
                onChange={(e) => setMinSelect(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                className="w-10 rounded border border-neutral-300 px-1 py-0.5"
              />
            </label>
            <label className="flex items-center gap-1">
              {m.maxLabel}
              <input
                value={maxSelect}
                onChange={(e) => setMaxSelect(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                className="w-10 rounded border border-neutral-300 px-1 py-0.5"
              />
            </label>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={addGroup}
              disabled={pending}
              className="rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-bold text-white disabled:opacity-60"
            >
              {c.create}
            </button>
            <button
              onClick={() => {
                setError(null)
                setShowAddGroup(false)
              }}
              className="text-xs text-neutral-500"
            >
              {c.cancel}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddGroup(true)} className="text-xs font-bold text-neutral-600">
          {m.addOptionGroup}
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
  const { lang, t } = useLang()
  const m = t.panel.menuPage
  const c = t.panel.common
  const groupKind = group.kind as "add" | "remove"
  const [showAddOption, setShowAddOption] = useState(false)
  const [nameEs, setNameEs] = useState("")
  const [nameEn, setNameEn] = useState("")
  const [hasCost, setHasCost] = useState(false)
  const [priceDelta, setPriceDelta] = useState("0")
  const [error, setError] = useState<string | null>(null)
  const [gone, setGone] = useState(false)
  const [pending, startTransition] = useTransition()

  if (gone) return null

  function addOption() {
    setError(null)
    if (!nameEs.trim() || !nameEn.trim()) {
      setError(m.optionNameMissingError)
      return
    }
    startTransition(async () => {
      await createOption({
        groupId: group.id,
        nameEs,
        nameEn,
        priceDelta: hasCost ? parseFloat(priceDelta) || 0 : 0,
      })
      setNameEs("")
      setNameEn("")
      setHasCost(false)
      setPriceDelta("0")
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
          <div className="flex items-center gap-1.5">
            <span
              className="rounded px-1.5 py-0.5 text-[10px] font-black"
              style={groupKind === "remove" ? { background: "#FDE8E8", color: "#B91C1C" } : { background: "#E7F6EC", color: "#15803D" }}
            >
              {groupKind === "remove" ? `− ${m.groupKindRemove}` : `+ ${m.groupKindAdd}`}
            </span>
            <div className="text-xs font-bold">{lang === "es" ? group.group_name_es : group.group_name_en}</div>
          </div>
          <div className="mt-0.5 text-[11px] text-neutral-400">
            {group.required ? m.required : m.optionalLabel} · {m.selectRange(group.min_select, group.max_select)}
          </div>
        </div>
        <button
          onClick={removeGroup}
          disabled={pending}
          className="text-[11px] font-semibold text-neutral-400 hover:text-red-600"
        >
          {m.deleteGroup}
        </button>
      </div>

      <div className="space-y-1">
        {options.map((o) => (
          <OptionRow key={o.id} option={o} groupKind={groupKind} />
        ))}
      </div>

      {showAddOption ? (
        <div className="mt-1.5 space-y-1.5 border-t border-neutral-100 pt-1.5">
          <input
            value={nameEs}
            onChange={(e) => setNameEs(e.target.value)}
            placeholder={c.nameEsPlaceholder}
            className="w-full rounded border border-neutral-300 px-2 py-1 text-xs"
          />
          <TranslateFieldActions sourceValue={nameEn} setTarget={setNameEs} direction="en-es" />
          <input
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder={c.nameEnPlaceholder}
            className="w-full rounded border border-neutral-300 px-2 py-1 text-xs"
          />
          <TranslateFieldActions sourceValue={nameEs} setTarget={setNameEn} direction="es-en" allowCopy />
          {groupKind === "add" && (
            <div className="flex items-center gap-2 text-xs">
              <select
                value={hasCost ? "cost" : "free"}
                onChange={(e) => setHasCost(e.target.value === "cost")}
                className="rounded border border-neutral-300 px-1.5 py-1"
              >
                <option value="free">{m.addNoCost}</option>
                <option value="cost">{m.addWithCost}</option>
              </select>
              {hasCost && (
                <input
                  value={priceDelta}
                  onChange={(e) => setPriceDelta(e.target.value)}
                  inputMode="decimal"
                  placeholder={m.priceDeltaPlaceholder}
                  className="w-16 rounded border border-neutral-300 px-1.5 py-1"
                />
              )}
            </div>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={addOption}
              disabled={pending}
              className="rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-bold text-white disabled:opacity-60"
            >
              {m.addOption}
            </button>
            <button
              onClick={() => {
                setError(null)
                setShowAddOption(false)
              }}
              className="text-xs text-neutral-500"
            >
              {c.cancel}
            </button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddOption(true)} className="mt-1.5 text-[11px] font-bold text-neutral-500">
          {m.addOption}
        </button>
      )}
    </div>
  )
}

function OptionRow({ option, groupKind }: { option: OwnerMenuData["options"][number]; groupKind: "add" | "remove" }) {
  const { lang, t } = useLang()
  const m = t.panel.menuPage
  const c = t.panel.common
  const [gone, setGone] = useState(false)
  const [editing, setEditing] = useState(false)
  const [nameEs, setNameEs] = useState(option.option_name_es)
  const [nameEn, setNameEn] = useState(option.option_name_en)
  const [hasCost, setHasCost] = useState(option.price_delta > 0)
  const [priceDelta, setPriceDelta] = useState(String(option.price_delta))
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  if (gone) return null

  function save() {
    setError(null)
    if (!nameEs.trim() || !nameEn.trim()) {
      setError(m.optionNameMissingError)
      return
    }
    startTransition(async () => {
      const r = await updateOption({
        optionId: option.id,
        nameEs,
        nameEn,
        priceDelta: hasCost ? parseFloat(priceDelta) || 0 : 0,
      })
      if (!r.ok) {
        setError(r.error)
        return
      }
      setEditing(false)
    })
  }

  function cancelEdit() {
    setError(null)
    setNameEs(option.option_name_es)
    setNameEn(option.option_name_en)
    setHasCost(option.price_delta > 0)
    setPriceDelta(String(option.price_delta))
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="space-y-1.5 rounded border border-neutral-200 bg-neutral-50 p-1.5">
        <input
          value={nameEs}
          onChange={(e) => setNameEs(e.target.value)}
          placeholder={c.nameEsPlaceholder}
          className="w-full rounded border border-neutral-300 px-2 py-1 text-xs"
        />
        <TranslateFieldActions sourceValue={nameEn} setTarget={setNameEs} direction="en-es" />
        <input
          value={nameEn}
          onChange={(e) => setNameEn(e.target.value)}
          placeholder={c.nameEnPlaceholder}
          className="w-full rounded border border-neutral-300 px-2 py-1 text-xs"
        />
        <TranslateFieldActions sourceValue={nameEs} setTarget={setNameEn} direction="es-en" allowCopy />
        {groupKind === "add" && (
          <div className="flex items-center gap-2 text-xs">
            <select
              value={hasCost ? "cost" : "free"}
              onChange={(e) => setHasCost(e.target.value === "cost")}
              className="rounded border border-neutral-300 px-1.5 py-1"
            >
              <option value="free">{m.addNoCost}</option>
              <option value="cost">{m.addWithCost}</option>
            </select>
            {hasCost && (
              <input
                value={priceDelta}
                onChange={(e) => setPriceDelta(e.target.value)}
                inputMode="decimal"
                placeholder={m.priceDeltaPlaceholder}
                className="w-16 rounded border border-neutral-300 px-1.5 py-1"
              />
            )}
          </div>
        )}
        {error && <p className="text-xs text-red-600">{error}</p>}
        <div className="flex gap-2">
          <button
            onClick={save}
            disabled={pending}
            className="rounded-lg bg-neutral-900 px-2.5 py-1 text-xs font-bold text-white disabled:opacity-60"
          >
            {pending ? c.saving : c.save}
          </button>
          <button onClick={cancelEdit} className="text-xs text-neutral-500">
            {c.cancel}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between text-xs">
      <span>
        {lang === "es" ? option.option_name_es : option.option_name_en}{" "}
        {option.kind === "add" && option.price_delta > 0
          ? `(+$${option.price_delta.toFixed(2)})`
          : option.kind === "remove"
            ? "(−)"
            : ""}
      </span>
      <span className="flex items-center gap-2.5">
        <button onClick={() => setEditing(true)} className="text-neutral-400 hover:text-neutral-700">
          {m.editOption}
        </button>
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
      </span>
    </div>
  )
}
