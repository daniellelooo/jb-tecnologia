import Link from 'next/link'
import Image from 'next/image'
import { Plus, Edit, Star, Search, AlertTriangle } from 'lucide-react'
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

  // KPIs (siempre calculados sobre todo el catálogo, no sobre el filtro)
  const { data: allForKpi } = await supabase.from('products').select('stock, is_featured')
  const total = allForKpi?.length ?? 0
  const inStock = allForKpi?.filter((p) => p.stock > 0).length ?? 0
  const featured = allForKpi?.filter((p) => p.is_featured).length ?? 0
  const lowStock = allForKpi?.filter((p) => p.stock > 0 && p.stock < 5).length ?? 0
  const agotado = allForKpi?.filter((p) => p.stock === 0).length ?? 0

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400 mb-2">Catálogo</div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-display">Productos</h1>
        </div>
        <Link
          href="/admin/productos/nuevo"
          className="group inline-flex items-center gap-2 bg-neutral-900 text-white rounded-full pl-4 pr-1.5 py-1.5 text-sm font-medium hover:bg-white/95 hover:text-black transition-all duration-500 ease-premium active:scale-[0.98]"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={1.8} />
          Nuevo producto
        </Link>
      </header>

      {/* KPIs / filtros */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <FilterKpi label="Productos totales" value={total.toString()} href="/admin/productos" active={!sp.filter} />
        <FilterKpi label="En stock" value={`${inStock}/${total}`} href="/admin/productos" active={false} />
        <FilterKpi label="Stock crítico" value={lowStock.toString()} href="?filter=bajo" active={sp.filter === 'bajo'} />
        <FilterKpi label="Agotados" value={agotado.toString()} href="?filter=agotado" active={sp.filter === 'agotado'} dark />
      </div>
      {featured > 0 && (
        <div className="text-[11px] text-neutral-500">{featured} producto{featured === 1 ? '' : 's'} destacado{featured === 1 ? '' : 's'} en la home.</div>
      )}

      {/* Search */}
      <form className="rounded-2xl border border-neutral-800 bg-neutral-900 p-2 flex items-center gap-2">
        <div className="flex items-center gap-2 flex-1">
          <Search className="h-4 w-4 ml-2 text-neutral-400" strokeWidth={1.5} />
          <input
            name="q"
            defaultValue={sp.q ?? ''}
            placeholder="Buscar por nombre, SKU o marca…"
            className="flex-1 h-9 bg-transparent px-1 text-sm placeholder:text-neutral-400 focus:outline-none"
          />
        </div>
        <button type="submit" className="bg-neutral-900 text-white rounded-full px-4 py-1.5 text-xs font-medium hover:bg-white/95 hover:text-black transition-colors">
          Buscar
        </button>
      </form>

      {lowStock > 0 && !sp.filter && (
        <div className="rounded-2xl bg-neutral-800 border border-neutral-800 px-4 py-3 flex items-center gap-3">
          <span className="text-xs font-bold uppercase tracking-[0.18em] bg-neutral-900 text-white px-2 py-1 rounded-full">Alerta</span>
          <span className="text-sm">
            <strong className="font-semibold">{lowStock}</strong> productos tienen stock crítico (&lt; 5 unidades).
          </span>
          <Link href="?filter=bajo" className="ml-auto text-xs font-medium underline underline-offset-2 hover:no-underline">Ver solo críticos →</Link>
        </div>
      )}

      {/* Table */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900 border-b border-neutral-800">
              <tr className="text-left">
                <Th>Producto</Th>
                <Th className="hidden md:table-cell">Categoría</Th>
                <Th className="text-right">Precio</Th>
                <Th className="text-center">Stock</Th>
                <Th className="text-center hidden lg:table-cell">Estado</Th>
                <Th className="text-right">Acción</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {products?.map((p) => {
                const primary = (p.product_images as Array<{ storage_url: string; is_primary: boolean; display_order: number }>)?.find((i) => i.is_primary)?.storage_url
                return (
                  <tr key={p.id} className="hover:bg-neutral-900/50 transition-colors duration-300">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-neutral-800 overflow-hidden relative shrink-0">
                          {primary ? (
                            <Image src={primary} alt={p.name} fill sizes="44px" className="object-contain p-1" />
                          ) : (
                            <div className="absolute inset-0 grid place-items-center text-neutral-400 text-xs">—</div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium flex items-center gap-1.5">
                            {p.is_featured && <Star className="h-3.5 w-3.5 fill-black" strokeWidth={0} />}
                            <span className="line-clamp-1">{p.name}</span>
                          </div>
                          <div className="text-[11px] text-neutral-500 font-mono">{p.sku} · {p.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs text-neutral-600 bg-neutral-800 px-2 py-0.5 rounded-full">
                        {(p.categories as { name: string } | null)?.name ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">{formatCOP(Number(p.price))}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <InlineStock productId={p.id} currentStock={p.stock} />
                        {p.stock === 0 && <AlertTriangle className="h-3 w-3" strokeWidth={1.8} />}
                        {p.stock > 0 && p.stock < 5 && <AlertTriangle className="h-3 w-3 text-neutral-400" strokeWidth={1.5} />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center hidden lg:table-cell">
                      <span className={p.is_active ? 'text-[10px] font-bold uppercase tracking-[0.15em] bg-neutral-900 text-white px-2 py-0.5 rounded-full' : 'text-[10px] font-bold uppercase tracking-[0.15em] bg-neutral-200 text-neutral-600 px-2 py-0.5 rounded-full'}>
                        {p.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/productos/${p.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-white hover:bg-neutral-800 px-2.5 py-1.5 rounded-full transition-colors duration-300">
                        <Edit className="h-3 w-3" strokeWidth={1.5} /> Editar
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

function FilterKpi({ label, value, href, active, dark = false }: { label: string; value: string; href: string; active: boolean; dark?: boolean }) {
  return (
    <Link
      href={href}
      className={`rounded-2xl border px-4 py-3.5 transition-all duration-300 ease-premium block ${
        active
          ? dark ? 'bg-black border-white text-white' : 'bg-neutral-900 border-white ring-2 ring-white/15'
          : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
      }`}
    >
      <div className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${active && dark ? 'text-white/60' : 'text-neutral-400'}`}>{label}</div>
      <div className="text-xl font-bold tabular-nums">{value}</div>
    </Link>
  )
}

function Th({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500 ${className}`}>{children}</th>
}
