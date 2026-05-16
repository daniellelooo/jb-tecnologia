import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  getProducts,
  getCategories,
  getBrandsForCategory,
  getPriceRangeForCategory,
} from '@/lib/queries/products'
import { ProductCard } from '@/components/shop/product-card'
import { CatalogFilters } from '@/components/shop/catalog-filters'
import { SortSelect } from '@/components/shop/sort-select'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tienda',
  description: 'Catálogo completo de JB Tecnología MED: computadores, componentes, periféricos y más.',
}

interface PageProps {
  searchParams: Promise<{
    categoria?: string
    marca?: string
    tag?: string
    q?: string
    orden?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'featured'
    page?: string
  }>
}

export default async function CatalogPage({ searchParams }: PageProps) {
  const sp = await searchParams

  const [categories, brands, priceRange, result] = await Promise.all([
    getCategories().then((c) => c.filter((cat) => !cat.parent_id)),
    getBrandsForCategory(sp.categoria),
    getPriceRangeForCategory(sp.categoria),
    getProducts({
      category: sp.categoria,
      brand: sp.marca?.split(',')[0],
      tags: sp.tag?.split(',').filter(Boolean),
      search: sp.q,
      sort: sp.orden,
      page: sp.page ? Number(sp.page) : 1,
    }),
  ])

  return (
    <div className="container mx-auto px-4 pt-12 lg:pt-20 pb-24">
      {/* Editorial header */}
      <div className="mb-16 max-w-4xl">
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mpc-graphite mb-4">
          Catálogo · {result.total} productos
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-display leading-[0.92]">
          {sp.q ? <>Búsqueda<br /><span className="text-mpc-silver">&ldquo;{sp.q}&rdquo;</span></> : <>Toda la<br /><span className="text-mpc-silver">tienda.</span></>}
        </h1>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-10 lg:gap-16">
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start max-h-[calc(100vh-7rem)] overflow-y-auto pr-2">
          <CatalogFilters categories={categories} brands={brands} priceRange={priceRange} />
        </aside>

        <div>
          <div className="flex items-center justify-between gap-4 mb-8 pb-5 border-b border-white/[0.08]">
            <p className="text-sm text-mpc-graphite">
              <span className="text-foreground font-medium">{result.products.length}</span> de {result.total}
            </p>
            <SortSelect />
          </div>

          {result.products.length === 0 ? (
            <div className="rounded-[1.75rem] border border-dashed border-white/15 p-16 text-center">
              <p className="text-2xl font-bold mb-2 tracking-display">Sin coincidencias</p>
              <p className="text-sm text-mpc-graphite mb-8">Ajusta los filtros o explora todo el catálogo.</p>
              <Link
                href="/tienda"
                className="inline-flex items-center gap-2 bg-neutral-900 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-white/95 hover:text-black transition-colors duration-500 ease-premium"
              >
                Limpiar filtros <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {result.products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}

          {result.totalPages > 1 && (
            <Pagination current={result.page} total={result.totalPages} />
          )}
        </div>
      </div>
    </div>
  )
}

function Pagination({ current, total }: { current: number; total: number }) {
  const pages = Array.from({ length: total }, (_, i) => i + 1)
  return (
    <nav className="flex justify-center gap-1 mt-12">
      {pages.map((p) => (
        <Link
          key={p}
          href={`?page=${p}`}
          scroll={false}
          className={`min-w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors duration-300 ease-premium ${
            p === current
              ? 'bg-neutral-900 text-white'
              : 'hover:bg-white/5'
          }`}
        >
          {p}
        </Link>
      ))}
    </nav>
  )
}
