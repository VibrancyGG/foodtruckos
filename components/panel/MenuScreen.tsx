"use client"

import { useMemo, useState } from "react"
import type { OwnerMenuData } from "@/lib/menu/getOwnerMenu"
import { useLang } from "@/lib/i18n/LangProvider"
import { ProductRow } from "./ProductRow"
import { ProductModal } from "./menu/ProductModal"
import { CategoryModal } from "./menu/CategoryModal"

export function MenuScreen({ initial }: { initial: OwnerMenuData }) {
  const { t } = useLang()
  const m = t.panel.menuPage
  const [filter, setFilter] = useState<string>("todos")
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState<{ id: string; name_es: string; name_en: string } | null>(null)

  // "Solo Truck X" en el prototipo === is_offered:false en los demás trucks.
  // Sin fila en unit_products para esa unidad se trata como ofrecido — así
  // funcionan los platillos que ya existían antes de que hubiera varios trucks.
  function offeredAt(productId: string, unitId: string) {
    const up = initial.unitProducts.find((x) => x.product_id === productId && x.unit_id === unitId)
    return up ? up.is_offered !== false : true
  }
  function visible(productId: string) {
    return filter === "todos" || offeredAt(productId, filter)
  }

  const productsByCategory = useMemo(() => {
    const map = new Map<string, typeof initial.products>()
    for (const p of initial.products) {
      const key = p.category_id ?? "sin-categoria"
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(p)
    }
    return map
  }, [initial.products])

  const visibleProducts = initial.products.filter((p) => visible(p.id))
  const outCount = visibleProducts.filter((p) => {
    const unitScope = filter === "todos" ? initial.units.map((u) => u.id) : [filter]
    return unitScope.some((uid) => initial.unitProducts.find((up) => up.product_id === p.id && up.unit_id === uid)?.sold_out)
  }).length
  const noPhotoCount = visibleProducts.filter((p) => !p.photo_url).length
  const scopeName = filter === "todos" ? null : (initial.units.find((u) => u.id === filter)?.name ?? null)

  const defaultCategoryId = initial.categories[0]?.id ?? ""
  const defaultExclusiveUnitId = filter === "todos" ? null : filter

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-1 text-2xl font-black">{m.title}</h1>
        <p className="mb-2 text-sm text-neutral-500">{m.subtitle}</p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {initial.units.length > 1 && (
          <>
            <div className="flex overflow-hidden rounded-lg border border-neutral-200 bg-white">
              <button
                onClick={() => setFilter("todos")}
                className={`border-r border-neutral-200 px-3 py-2 text-xs font-bold last:border-r-0 ${filter === "todos" ? "bg-neutral-900 text-white" : "text-neutral-500"}`}
              >
                {m.allTrucksFilter}
              </button>
              {initial.units.map((u) => (
                <button
                  key={u.id}
                  onClick={() => setFilter(u.id)}
                  className={`border-r border-neutral-200 px-3 py-2 text-xs font-bold last:border-r-0 ${filter === u.id ? "bg-neutral-900 text-white" : "text-neutral-500"}`}
                >
                  {u.name}
                </button>
              ))}
            </div>
            <span className="text-xs text-neutral-500">{m.statsLine(visibleProducts.length, outCount, noPhotoCount, scopeName)}</span>
          </>
        )}
        <button
          onClick={() => setShowAddProduct(true)}
          disabled={initial.categories.length === 0}
          className="ml-auto rounded-lg bg-neutral-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-40"
        >
          {m.addProduct}
        </button>
      </div>

      {initial.categories.map((cat) => (
        <CategorySection
          key={cat.id}
          category={cat}
          products={(productsByCategory.get(cat.id) ?? []).filter((p) => visible(p.id))}
          units={initial.units}
          categories={initial.categories}
          unitProducts={initial.unitProducts}
          optionGroups={initial.optionGroups}
          options={initial.options}
          filter={filter}
          onEditCategory={() => setEditingCategory(cat)}
        />
      ))}

      {(productsByCategory.get("sin-categoria")?.filter((p) => visible(p.id)).length ?? 0) > 0 && (
        <CategorySection
          category={{ id: "sin-categoria", name_es: m.noCategory, name_en: m.noCategory }}
          products={(productsByCategory.get("sin-categoria") ?? []).filter((p) => visible(p.id))}
          units={initial.units}
          categories={initial.categories}
          unitProducts={initial.unitProducts}
          optionGroups={initial.optionGroups}
          options={initial.options}
          filter={filter}
        />
      )}

      {filter !== "todos" && visibleProducts.length === 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white p-7 text-center text-sm font-semibold text-neutral-400">
          {m.noTrucksExclusiveYet}
        </div>
      )}

      <button onClick={() => setShowAddCategory(true)} className="text-sm font-bold text-neutral-600">
        {m.addCategory}
      </button>

      {showAddProduct && (
        <ProductModal
          mode="add"
          categories={initial.categories}
          units={initial.units}
          defaultCategoryId={defaultCategoryId}
          defaultExclusiveUnitId={defaultExclusiveUnitId}
          onClose={() => setShowAddProduct(false)}
        />
      )}
      {showAddCategory && <CategoryModal mode="add" onClose={() => setShowAddCategory(false)} />}
      {editingCategory && (
        <CategoryModal mode="edit" category={editingCategory} onClose={() => setEditingCategory(null)} />
      )}
    </div>
  )
}

function CategorySection({
  category,
  products,
  units,
  categories,
  unitProducts,
  optionGroups,
  options,
  filter,
  onEditCategory,
}: {
  category: { id: string; name_es: string; name_en: string }
  products: OwnerMenuData["products"]
  units: OwnerMenuData["units"]
  categories: OwnerMenuData["categories"]
  unitProducts: OwnerMenuData["unitProducts"]
  optionGroups: OwnerMenuData["optionGroups"]
  options: OwnerMenuData["options"]
  filter: string
  onEditCategory?: () => void
}) {
  const { lang, t } = useLang()
  const m = t.panel.menuPage

  if (products.length === 0 && filter !== "todos") return null

  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="flex items-center gap-2.5 border-b border-neutral-100 px-4 py-3">
        <h2 className="text-sm font-black">{lang === "es" ? category.name_es : category.name_en}</h2>
        <span className="text-xs font-bold text-neutral-400">{products.length}</span>
        {onEditCategory && (
          <button onClick={onEditCategory} className="ml-auto text-xs font-bold text-neutral-400 hover:text-neutral-700">
            {m.editCategory}
          </button>
        )}
      </div>
      {products.length === 0 ? (
        <p className="px-4 py-4 text-xs text-neutral-400">{m.noProductsInCategory}</p>
      ) : (
        <div>
          {products.map((p) => (
            <ProductRow
              key={p.id}
              product={p}
              units={units}
              categories={categories}
              unitProducts={unitProducts}
              optionGroups={optionGroups}
              options={options}
              filter={filter}
            />
          ))}
        </div>
      )}
    </section>
  )
}
