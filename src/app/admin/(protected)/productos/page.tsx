import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Star, Search, AlertTriangle, Package } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatCOP } from '@/types'
import { InlineStock } from '@/components/admin/inline-stock'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{ q?: string; filter?: string }>
}

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const supabase = createAdminClient()

  let query = supabase
    .from('products')
    .select('id, name, sku, brand, price, stock, is_active, is_featured, category_id, component_slot_id, categories(name), product_images(storage_url, is_primary, display_order)')
    .order('created_at', { ascending: false })

  if (sp.q) {
    query = query.or(`name.ilike.%${sp.q}%,sku.ilike.%${sp.q}%,brand.ilike.%${sp.q}%`)
  }
  if (sp.filter === 'agotado') query = query.eq('stock', 0)
  else if (sp.filter === 'bajo') query = query.lt('stock', 5).gt('stock', 0)

  const { data: products } = await query

  const { data: allForKpi } = await supabase.from('products').select('stock, is_featured')
  const total = allForKpi?.length ?? 0
  const inStock = allForKpi?.filter((p) => p.stock > 0).length ?? 0
  const featured = allForKpi?.filter((p) => p.is_featured).length ?? 0
  const lowStock = allForKpi?.filter((p) => p.stock > 0 && p.stock < 5).length ?? 0
  const agotado = allForKpi?.filter((p) => p.stock === 0).length ?? 0

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-500 mb-2">Catálogo</div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-display text-neutral-900">Productos</h1>
          <p className="text-sm text-neutral-500 mt-2">
            {total} {total === 1 ? 'producto en el catálogo' : 'productos en el catálogo'}
            {featured > 0 && <> · {featured} destacado{featured === 1 ? '' : 's'} en la home</>}
          </p>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 bg-neutral-900 text-white rounded-full px-5 py-2.5 text-sm font-medium hover:bg-neutral-800 transition-colors duration-300 ease-premium"
        >
          <Plus className="h-4 w-4" strokeWidth={1.8} />
          Nuevo producto
        </Link>
      </header>

      {/* KPIs / filtros */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <FilterKpi label="Productos totales" value={total.toString()} href="/admin/productos" active={!sp.filter} />
        <FilterKpi label="En stock" value={`${inStock}/${total}`} sub="Disponibles" href="/admin/productos" active={false} />
        <FilterKpi label="Stock crítico" value={lowStock.toString()} sub="< 5 unidades" href="?filter=bajo" active={sp.filter === 'bajo'} accent={lowStock > 0 ? 'amber' : undefined} />
        <FilterKpi label="Agotados" value={agotado.toString()} sub="Sin existencias" href="?filter=agotado" active={sp.filter === 'agotado'} accent={agotado > 0 ? 'red' : undefined} />
      </div>

      {/* Search */}
      <form className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-2 flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1 px-2">
          <Search className="h-4 w-4 text-neutral-400" strokeWidth={1.5} />
          <input
            name="q"
            defaultValue={sp.q ?? ''}
            placeholder="Buscar por nombre, SKU o marca…"
            className="flex-1 h-10 bg-transparent text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none"
          />
        </div>
        <button type="submit" className="bg-neutral-900 text-white rounded-full px-5 py-2 text-sm font-medium hover:bg-neutral-800 transition-colors">
          Buscar
        </button>
      </form>

      {lowStock > 0 && !sp.filter && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-3.5 flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] bg-amber-600 text-white px-2 py-1 rounded-full">Alerta</span>
          <span className="text-sm text-amber-900">
            <strong className="font-semibold">{lowStock}</strong> producto{lowStock === 1 ? '' : 's'} con stock crítico (&lt; 5 unidades).
          </span>
          <Link href="?filter=bajo" className="ml-auto text-xs font-semibold text-amber-900 hover:text-amber-700">Ver solo críticos →</Link>
        </div>
      )}

      {/* Table */}
      <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr className="text-left">
                <Th>Producto</Th>
                <Th className="hidden md:table-cell">Categoría</Th>
                <Th className="text-right">Precio</Th>
                <Th className="text-center">Stock</Th>
                <Th className="text-center hidden lg:table-cell">Estado</Th>
                <Th className="text-right">Acción</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {!products || products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-neutral-500">
                    <Package className="h-8 w-8 mx-auto text-neutral-300 mb-3" strokeWidth={1.5} />
                    {sp.q ? `No hay productos que coincidan con "${sp.q}"` : 'No hay productos'}
                  </td>
                </tr>
              ) : products.map((p) => {
                const primary = (p.product_images as Array<{ storage_url: string; is_primary: boolean; display_order: number }>)?.find((i) => i.is_primary)?.storage_url
                const isLow = p.stock > 0 && p.stock < 5
                const isOut = p.stock === 0
                return (
                  <tr key={p.id} className="hover:bg-neutral-50 transition-colors duration-200">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-neutral-100 border border-neutral-200 overflow-hidden relative shrink-0">
                          {primary ? (
                            <Image src={primary} alt={p.name} fill sizes="48px" className="object-contain p-1" />
                          ) : (
                            <div className="absolute inset-0 grid place-items-center text-neutral-400 text-xs">—</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-neutral-900 flex items-center gap-1.5">
                            {p.is_featured && <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" strokeWidth={0} />}
                            <span className="line-clamp-1">{p.name}</span>
                          </div>
                          <div className="text-xs text-neutral-500 font-mono mt-0.5">{p.sku} · {p.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-full">
                        {(p.categories as { name: string } | null)?.name ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right font-semibold tabular-nums text-neutral-900">{formatCOP(Number(p.price))}</td>
                    <td className="px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <InlineStock productId={p.id} currentStock={p.stock} />
                        {isOut && <AlertTriangle className="h-3.5 w-3.5 text-red-600" strokeWidth={1.8} />}
                        {isLow && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" strokeWidth={1.5} />}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center hidden lg:table-cell">
                      <span className={
                        p.is_active
                          ? 'text-[11px] font-bold uppercase tracking-[0.15em] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full'
                          : 'text-[11px] font-bold uppercase tracking-[0.15em] bg-neutral-100 text-neutral-500 px-2.5 py-1 rounded-full'
                      }>
                        {p.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link href={`/admin/productos/${p.id}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 px-3 py-1.5 rounded-full transition-colors">
                        <Edit className="h-3.5 w-3.5" strokeWidth={1.5} /> Editar
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const ACCENTS = {
  amber: 'border-amber-200 bg-amber-50/40',
  red: 'border-red-200 bg-red-50/40',
} as const

const ACCENT_TEXT = {
  amber: 'text-amber-700',
  red: 'text-red-700',
} as const

function FilterKpi({
  label,
  value,
  sub,
  href,
  active,
  accent,
}: {
  label: string
  value: string
  sub?: string
  href: string
  active: boolean
  accent?: keyof typeof ACCENTS
}) {
  return (
    <Link
      href={href}
      className={`rounded-3xl border bg-white shadow-sm p-5 md:p-6 transition-all duration-300 ease-premium block hover:shadow-md ${
        active
          ? 'border-neutral-900 ring-2 ring-neutral-900/10'
          : accent ? ACCENTS[accent] : 'border-neutral-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">{label}</div>
        {accent && <div className={`h-2 w-2 rounded-full ${accent === 'amber' ? 'bg-amber-500' : 'bg-red-500'}`} />}
      </div>
      <div className={`text-3xl md:text-4xl font-bold tabular-nums mt-3 ${accent ? ACCENT_TEXT[accent] : 'text-neutral-900'}`}>{value}</div>
      {sub && <div className="text-xs text-neutral-500 mt-1 truncate">{sub}</div>}
    </Link>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-500 ${className}`}>{children}</th>
}
