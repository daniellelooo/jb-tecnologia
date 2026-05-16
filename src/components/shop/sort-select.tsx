'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition } from 'react'

const OPTIONS = [
  { value: 'relevance', label: 'Más relevantes' },
  { value: 'featured', label: 'Destacados' },
  { value: 'price_asc', label: 'Precio ↑' },
  { value: 'price_desc', label: 'Precio ↓' },
  { value: 'newest', label: 'Más nuevos' },
]

export function SortSelect() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const current = searchParams.get('orden') ?? 'relevance'

  function onChange(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'relevance') params.delete('orden')
    else params.set('orden', value)
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-full border border-white/10 bg-neutral-900 pl-4 pr-9 text-sm font-medium appearance-none cursor-pointer focus:outline-none focus:border-white/40 transition-colors duration-300 ease-premium bg-[url('data:image/svg+xml,%3Csvg%20viewBox=%270%200%2016%2016%27%20xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cpath%20d=%27M4%206l4%204%204-4%27%20stroke=%27black%27%20stroke-width=%271.5%27%20fill=%27none%27%20stroke-linecap=%27round%27/%3E%3C/svg%3E')] bg-no-repeat bg-[length:14px_14px] bg-[position:right_12px_center]"
    >
      {OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}
