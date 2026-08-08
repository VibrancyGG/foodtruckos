"use client"

import { useMemo, useState } from "react"
import type { OwnerMenuData } from "@/lib/menu/getOwnerMenu"
import { createCategory, createProduct } from "@/lib/menu/actions"
import { useLang } from "@/lib/i18n/LangProvider"
import { ProductRow } from "./ProductRow"

export function MenuScreen({ initial }: { initial: OwnerMenuData }) {
  const { t } = useLang()
  const [categories, setCategories] = useState(initial.categories)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCatEs, setNewCatEs] = useState("")
  const [newCatEn, setNewCatEn] = useState("")
  const [savingCat, setSavingCat] = useState(false)

  const productsByCategory = useMemo(() => {
    const map = new Map<string, typeof initial.products>()
    for (const p of initial.products) {
      const key = p.category_id ?? "sin-categoria"
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(p)
    }
    return map
  }, [initial.products])

  async function addCategory() {
    if (!newCatEs.trim() || !newCatEn.trim()) return
    setSavingCat(true)
    const result = await createCategory({ nameEs: newCatEs, nameEn: newCatEn })
    setSavingCat(false)
    if (result.ok) {
      setCategories((c) => [...c, { id: `temp-${Date.now()}`, business_id: "", name_es: newCatEs, name_en: newCatEn, sort_order: c.length }])
      setNewCatEs("")
      setNewCatEn("")
      setShowAddCategory(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-black">{t.panel.menuPage.title}</h1>
        <p className="mb-2 text-sm text-neutral-500">{t.panel.menuPage.subtitle}</p>
      </div>

      {categories.map((cat) => (
        <CategorySection
          key={cat.id}
          category={cat}
          products={productsByCategory.get(cat.id) ?? []}
          units={initial.units}
          unitProducts={initial.unitProducts}
          optionGroups={initial.optionGroups}
          options={initial.options}
        />
      ))}

      {(productsByCategory.get("sin-categoria")?.length ?? 0) > 0 && (
        <CategorySection
          category={{ id: "sin-categoria", name_es: t.panel.menuPage.noCategory, name_en: t.panel.menuPage.noCategory }}
          products={productsByCategory.get("sin-categoria") ?? []}
          units={initial.units}
          unitProducts={initial.unitProducts}
          optionGroups={initial.optionGroups}
          options={initial.options}
        />
      )}

      <section className="rounded-2xl border border-dashed border-neutral-300 p-4">
        {showAddCategory ? (
          <div className="space-y-2">
            <input
              value={newCatEs}
              onChange={(e) => setNewCatEs(e.target.value)}
              placeholder={t.panel.common.nameEsPlaceholder}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
            <input
              value={newCatEn}
              onChange={(e) => setNewCatEn(e.target.value)}
              placeholder={t.panel.common.nameEnPlaceholder}
              className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={addCategory}
                disabled={savingCat}
                className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-bold text-white disabled:opacity-60"
              >
                {savingCat ? t.panel.common.saving : t.panel.menuPage.createCategory}
              </button>
              <button
                onClick={() => setShowAddCategory(false)}
                className="rounded-lg px-3 py-1.5 text-sm text-neutral-500"
              >
                {t.panel.common.cancel}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowAddCategory(true)}
            className="text-sm font-bold text-neutral-600"
          >
            {t.panel.menuPage.addCategory}
          </button>
        )}
      </section>
    </div>
  )
}

function CategorySection({
  category,
  products,
  units,
  unitProducts,
  optionGroups,
  options,
}: {
  category: { id: string; name_es: string; name_en: string }
  products: OwnerMenuData["products"]
  units: OwnerMenuData["units"]
  unitProducts: OwnerMenuData["unitProducts"]
  optionGroups: OwnerMenuData["optionGroups"]
  options: OwnerMenuData["options"]
}) {
  const { lang, t } = useLang()
  const [showAdd, setShowAdd] = useState(false)
  const [nameEs, setNameEs] = useState("")
  const [nameEn, setNameEn] = useState("")
  const [price, setPrice] = useState("")
  const [saving, setSaving] = useState(false)

  async function addProduct() {
    const priceNum = parseFloat(price)
    if (!nameEs.trim() || !nameEn.trim() || !(priceNum > 0)) return
    setSaving(true)
    const result = await createProduct({
      categoryId: category.id,
      nameEs,
      nameEn,
      price: priceNum,
    })
    setSaving(false)
    if (result.ok) {
      setNameEs("")
      setNameEn("")
      setPrice("")
      setShowAdd(false)
    }
  }

  return (
    <section>
      <h2 className="mb-2 text-sm font-black uppercase tracking-wide text-neutral-500">
        {lang === "es" ? category.name_es : category.name_en}
      </h2>
      <div className="space-y-2">
        {products.map((p) => (
          <ProductRow
            key={p.id}
            product={p}
            units={units}
            unitProducts={unitProducts}
            optionGroups={optionGroups.filter((g) => g.product_id === p.id)}
            options={options}
          />
        ))}
      </div>

      {showAdd ? (
        <div className="mt-2 space-y-2 rounded-xl border border-neutral-200 bg-white p-3">
          <input
            value={nameEs}
            onChange={(e) => setNameEs(e.target.value)}
            placeholder={t.panel.common.nameEsPlaceholder}
            className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          />
          <input
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder={t.panel.common.nameEnPlaceholder}
            className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          />
          <input
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={t.panel.menuPage.pricePlaceholder}
            inputMode="decimal"
            className="w-full rounded-lg border border-neutral-300 px-3 py-1.5 text-sm"
          />
          <div className="flex gap-2">
            <button
              onClick={addProduct}
              disabled={saving}
              className="rounded-lg bg-neutral-900 px-3 py-1.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {saving ? t.panel.common.saving : t.panel.common.add}
            </button>
            <button onClick={() => setShowAdd(false)} className="text-sm text-neutral-500">
              {t.panel.common.cancel}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAdd(true)}
          className="mt-2 text-sm font-bold text-neutral-500"
        >
          {t.panel.menuPage.addProduct}
        </button>
      )}
    </section>
  )
}
