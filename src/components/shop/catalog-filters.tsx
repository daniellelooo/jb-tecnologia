'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useState, useTransition, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCOP } from '@/types'

interface CatalogFiltersProps {
  categories: Array<{ slug: string; name: string }>
  brands: string[]
  priceRange: { min: number; max: number }
}

const TAGS = ['gaming', 'oferta', 'nuevo', 'workstation', 'high-end', 'mid-range', 'entrada']

export function CatalogFilters({ categories, brands, priceRange }: CatalogFiltersProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [search, setSearch] = useState(searchParams.get('q') ?? '')

  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString())
      if (search) params.set('q', search)
      else params.delete('q')
      startTransition(() => router.push(`${pathname}?${params.toString()}`))
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  function toggleListParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    const current = params.get(key)?.split(',').filter(Boolean) ?? []
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value]
    if (next.length) params.set(key, next.join(','))
    else params.delete(key)
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  const activeCategory = searchParams.get('categoria')
  const activeBrands = searchParams.get('marca')?.split(',').filter(Boolean) ?? []
  const activeTags = searchParams.get('tag')?.split(',').filter(Boolean) ?? []
  const hasFilters = Boolean(activeCategory || activeBrands.length || activeTags.length || search)

  return (
    <div className="space-y-7">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-mpc-graphite" strokeWidth={1.5} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar producto, SKU…"
          className="w-full h-10 rounded-full border border-white/10 bg-neutral-900 pl-9 pr-3 text-sm placeholder:text-mpc-silver focus:outline-none focus:border-white/40 transition-colors duration-300 ease-premium"
        />
      </div>

      {hasFilters && (
        <button
          onClick={() => {
            setSearch('')
            startTransition(() => router.push(pathname))
          }}
          className="w-full text-xs text-white hover:bg-black hover:text-white border border-white/10 rounded-full py-2 inline-flex items-center justify-center gap-1.5 transition-all duration-300 ease-premium"
        >
          <X className="h-3 w-3" strokeWidth={1.8} /> Limpiar todo
        </button>
      )}

      <FilterGroup title="Categoría">
        <button
          onClick={() => setParam('categoria', null)}
          className={cn(
            'block w-full text-left text-sm py-1.5 transition-colors duration-300 ease-premium',
            !activeCategory ? 'font-semibold' : 'text-mpc-graphite hover:text-foreground'
          )}
        >
          Todas
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            onClick={() => setParam('categoria', c.slug)}
            className={cn(
              'block w-full text-left text-sm py-1.5 transition-colors duration-300 ease-premium',
              activeCategory === c.slug ? 'font-semibold' : 'text-mpc-graphite hover:text-foreground'
            )}
          >
            {c.name}
          </button>
        ))}
      </FilterGroup>

      {brands.length > 0 && (
        <FilterGroup title="Marca">
          <div className="flex flex-wrap gap-1.5">
            {brands.map((brand) => {
              const active = activeBrands.includes(brand)
              return (
                <button
                  key={brand}
                  onClick={() => toggleListParam('marca', brand)}
                  className={cn(
                    'text-[11px] font-medium px-2.5 py-1 rounded-full transition-all duration-300 ease-premium',
                    active
                      ? 'bg-neutral-900 text-white'
                      : 'bg-black/[0.05] hover:bg-white/[0.1] text-foreground'
                  )}
                >
                  {brand}
                </button>
              )
            })}
          </div>
        </FilterGroup>
      )}

      <FilterGroup title="Tipo">
        <div className="flex flex-wrap gap-1.5">
          {TAGS.map((tag) => {
            const active = activeTags.includes(tag)
            return (
              <button
                key={tag}
                onClick={() => toggleListParam('tag', tag)}
                className={cn(
                  'text-[11px] font-medium px-2.5 py-1 rounded-full transition-all duration-300 ease-premium',
                  active
                    ? 'bg-neutral-900 text-white'
                    : 'bg-black/[0.05] hover:bg-white/[0.1] text-foreground'
                )}
              >
                {tag}
              </button>
            )
          })}
        </div>
      </FilterGroup>

      <div className="border-t border-white/[0.06] pt-5">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-mpc-graphite mb-2">Rango de precios</div>
        <div className="text-xs text-foreground tabular-nums font-medium">
          {formatCOP(priceRange.min)} <span className="text-mpc-silver mx-1">—</span> {formatCOP(priceRange.max)}
        </div>
      </div>
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-mpc-graphite mb-3">{title}</h4>
      <div className="space-y-0.5">{children}</div>
    </div>
  )
}
