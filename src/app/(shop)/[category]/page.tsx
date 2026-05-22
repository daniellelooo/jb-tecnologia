import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import {
  getProducts,
  getCategoryBySlug,
  getCategories,
  getBrandsForCategory,
} from '@/lib/queries/products'
import { ProductCard } from '@/components/shop/product-card'
import { SortSelect } from '@/components/shop/sort-select'
import type { Metadata } from 'next'
import { cn } from '@/lib/utils'

const VALID_CATEGORY_SLUGS = ['escritorios', 'portatiles', 'monitores', 'perifericos', 'componentes', 'sillas-gaming']

export async function generateStaticParams() {
  return VALID_CATEGORY_SLUGS.map((slug) => ({ category: slug }))
}

interface PageProps {
  params: Promise<{ category: string }>
  searchParams: Promise<{ subcat?: string; marca?: string; orden?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'featured'; page?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { category } = await params
  const cat = await getCategoryBySlug(category)
  if (!cat) return { title: 'Categoría no encontrada' }
  return {
    title: cat.name,
    description: cat.description ?? `Explora ${cat.name.toLowerCase()} en JB Tecnología MED Medellín.`,
  }
}

const CATEGORY_TAGLINES: Record<string, string> = {
  escritorios: 'Equipos de escritorio JB ensamblados a mano en Medellín con componentes de alto rendimiento.',
  portatiles: 'Laptops gaming y workstation para movilidad sin compromisos.',
  monitores: 'Pantallas profesionales con tasa de refresco y color calibrado.',
  perifericos: 'Teclados mecánicos, mice gaming, headsets y accesorios premium.',
  componentes: 'Procesadores, tarjetas gráficas, memorias y todo lo necesario para tu build.',
  'sillas-gaming': 'Sillas ergonómicas para sesiones largas de gaming o trabajo.',
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const { category } = await params
  const sp = await searchParams

  if (!VALID_CATEGORY_SLUGS.includes(category)) notFound()
  const categoryData = await getCategoryBySlug(category)
  if (!categoryData) notFound()

  const [subcategories, brands, result] = await Promise.all([
    getCategories().then((cs) => cs.filter((c) => c.parent_id === categoryData.id)),
    getBrandsForCategory(sp.subcat ?? category),
    getProducts({
      category: sp.subcat ?? category,
      brand: sp.marca,
      sort: sp.orden,
      page: sp.page ? Number(sp.page) : 1,
      pageSize: 24,
    }),
  ])

  const tagline = CATEGORY_TAGLINES[category] ?? categoryData.description

  return (
    <div className="container mx-auto px-4 pt-12 lg:pt-20 pb-24">
      {/* Editorial header */}
      <div className="mb-16">
        <Link href="/" className="text-xs text-mpc-graphite hover:text-foreground inline-flex items-center gap-1.5 mb-6 transition-colors">
          <ArrowRight className="h-3 w-3 rotate-180" strokeWidth={1.5} /> Inicio
        </Link>
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mpc-graphite mb-4">
          {result.total} productos en catálogo
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-display leading-[0.92]">
          {categoryData.name}<span className="text-mpc-silver">.</span>
        </h1>
        {tagline && (
          <p className="text-lg text-mpc-graphite max-w-2xl mt-6 leading-relaxed">{tagline}</p>
        )}
      </div>

      {/* Subcategory chips */}
      {subcategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-10">
          <Link
            href={`/${category}`}
            className={cn(
              'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ease-premium',
              !sp.subcat ? 'bg-neutral-900 text-white' : 'bg-black/[0.05] hover:bg-white/[0.1]'
            )}
          >
            Todos
          </Link>
          {subcategories.map((sub) => (
            <Link
              key={sub.slug}
              href={`/${category}?subcat=${sub.slug}`}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ease-premium',
                sp.subcat === sub.slug ? 'bg-neutral-900 text-white' : 'bg-black/[0.05] hover:bg-white/[0.1]'
              )}
            >
              {sub.name}
            </Link>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-4 mb-8 pb-5 border-b border-white/[0.08]">
        <p className="text-sm text-mpc-graphite">
          <span className="text-foreground font-medium">{result.products.length}</span> de {result.total}
          {brands.length > 0 && (
            <span className="ml-2 text-mpc-silver">· {brands.length} marcas</span>
          )}
        </p>
        <SortSelect />
      </div>

      {result.products.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-white/15 p-16 text-center">
          <p className="text-2xl font-bold mb-2 tracking-display">Próximamente</p>
          <p className="text-sm text-mpc-graphite mb-8">Estamos agregando productos a esta categoría.</p>
          <Link
            href="/tienda"
            className="inline-flex items-center gap-2 bg-neutral-900 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-white/95 hover:text-black transition-colors duration-500 ease-premium"
          >
            Ver catálogo completo <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {result.products.map((p) => (
            <ProductCard key={p.id} product={p} categorySlug={category} />
          ))}
        </div>
      )}
    </div>
  )
}
