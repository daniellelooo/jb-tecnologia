'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { Check, AlertCircle, ArrowLeft, ArrowRight, SkipForward } from 'lucide-react'
import { useConfiguratorStore, SLOT_ORDER } from '@/lib/stores/configurator-store'
import type { Product, SlotKey, CpuSpecs, MotherboardSpecs, RamSpecs, GpuSpecs, PsuSpecs, CoolingSpecs, StorageSpecs, CaseSpecs, ProductImage } from '@/types'
import { formatCOP } from '@/types'
import { cn } from '@/lib/utils'
import { getFilterForSlot } from '@/lib/configurator/compatibility'
import { getPrimaryImage, wixCdnUrl } from '@/lib/product-image'

type ProductWithImages = Product & { product_images?: Pick<ProductImage, 'storage_url' | 'is_primary' | 'display_order' | 'alt_text'>[] | null }

interface SlotPickerProps {
  components: Record<SlotKey, ProductWithImages[]>
  slots: Array<{ slug: SlotKey; name: string; help_text: string; is_required: boolean }>
}

export function SlotPicker({ components, slots: slotsMeta }: SlotPickerProps) {
  const currentSlot = useConfiguratorStore((s) => s.currentSlot)
  const slots = useConfiguratorStore((s) => s.slots)
  const selectComponent = useConfiguratorStore((s) => s.selectComponent)
  const goToSlot = useConfiguratorStore((s) => s.goToSlot)
  const nextSlot = useConfiguratorStore((s) => s.nextSlot)
  const prevSlot = useConfiguratorStore((s) => s.prevSlot)

  const currentMeta = slotsMeta.find((s) => s.slug === currentSlot)
  const selected = slots[currentSlot]

  const filtered = useMemo(() => {
    const allOptions = components[currentSlot] ?? []
    const filter = getFilterForSlot(currentSlot, slots)
    return allOptions.filter((p) => {
      const spec = p.specs as Record<string, unknown>
      if (filter.socket && currentSlot === 'motherboard') return (spec.socket as string) === filter.socket
      if (filter.ramTypes && currentSlot === 'ram') return filter.ramTypes.includes(spec.ram_type as string)
      if (filter.formFactor && currentSlot === 'case') {
        const order: Record<string, number> = { 'Mini-ITX': 1, 'Micro-ATX': 2, 'ATX': 3, 'E-ATX': 4 }
        return order[spec.form_factor as string] >= order[filter.formFactor]
      }
      if (filter.socketSupport && currentSlot === 'cooling') return Array.isArray(spec.socket_support) && (spec.socket_support as string[]).includes(filter.socketSupport)
      return true
    })
  }, [components, currentSlot, slots])

  const currentIdx = SLOT_ORDER.indexOf(currentSlot)
  const isFirst = currentIdx === 0
  const isLast = currentIdx === SLOT_ORDER.length - 1

  return (
    <div className="space-y-8">
      {/* Progress dots */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {slotsMeta.map((slot, idx) => {
          const isActive = slot.slug === currentSlot
          const isCompleted = !!slots[slot.slug]
          return (
            <button
              key={slot.slug}
              onClick={() => goToSlot(slot.slug)}
              className={cn(
                'shrink-0 flex items-center gap-1.5 rounded-full text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-300 ease-premium',
                isActive ? 'bg-neutral-900 text-white px-3 py-1.5' : isCompleted ? 'bg-white/[0.06] text-foreground hover:bg-white/[0.1] px-3 py-1.5' : 'bg-transparent text-mpc-silver hover:text-mpc-graphite px-3 py-1.5'
              )}
            >
              <span className="text-[10px] opacity-70 tabular-nums">{(idx + 1).toString().padStart(2, '0')}</span>
              {slot.name}
              {isCompleted && <Check className="h-3 w-3" strokeWidth={1.8} />}
            </button>
          )
        })}
      </div>

      {/* Header */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-mpc-graphite mb-3">
          Paso {currentIdx + 1} de {SLOT_ORDER.length} · {currentMeta?.is_required ? <span className="text-foreground">Requerido</span> : 'Opcional'}
        </div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-display leading-[1.05]">{currentMeta?.name}</h2>
        <p className="text-sm text-mpc-graphite mt-3 max-w-2xl leading-relaxed">{currentMeta?.help_text}</p>
      </div>

      {/* Selected indicator */}
      {selected && (
        <div className="rounded-[1.5rem] bg-neutral-900 text-white px-5 py-4 flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
            <Check className="h-4 w-4" strokeWidth={1.8} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/50 font-bold">Seleccionado</div>
            <div className="font-medium truncate">{selected.name}</div>
          </div>
          <div className="font-bold tabular-nums">{formatCOP(Number(selected.price))}</div>
        </div>
      )}

      {/* Product list */}
      {filtered.length === 0 ? (
        <div className="rounded-[1.5rem] border border-dashed border-white/15 p-12 text-center">
          <AlertCircle className="h-10 w-10 mx-auto mb-3" strokeWidth={1.2} />
          <p className="font-bold mb-1 tracking-display text-xl">No hay opciones compatibles</p>
          <p className="text-sm text-mpc-graphite max-w-md mx-auto">Las selecciones anteriores limitan las opciones aquí. Considera cambiar el procesador o tarjeta madre.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              slot={currentSlot}
              isSelected={selected?.id === product.id}
              onSelect={() => selectComponent(currentSlot, product)}
            />
          ))}
        </div>
      )}

      {/* Navigation */}
      <div className="sticky bottom-4 z-10 flex gap-2 bg-black/70 backdrop-blur-xl rounded-full p-1.5 border border-white/10 shadow-soft-dark">
        <button
          onClick={prevSlot}
          disabled={isFirst}
          className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-mpc-graphite hover:text-foreground hover:bg-white/[0.04] transition-all duration-300 ease-premium disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} /> Anterior
        </button>
        <div className="flex-1" />
        {!currentMeta?.is_required && !selected && (
          <button
            onClick={nextSlot}
            disabled={isLast}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium text-mpc-graphite hover:text-foreground hover:bg-white/[0.04] transition-all duration-300 ease-premium"
          >
            <SkipForward className="h-3.5 w-3.5" strokeWidth={1.5} /> Omitir
          </button>
        )}
        <button
          onClick={nextSlot}
          disabled={isLast}
          className="group inline-flex items-center gap-2 bg-neutral-900 text-white rounded-full pl-5 pr-1.5 py-1.5 text-sm font-medium hover:bg-white/95 hover:text-black transition-all duration-300 ease-premium active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Siguiente
          <span className="h-7 w-7 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-500 ease-premium group-hover:translate-x-0.5">
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </span>
        </button>
      </div>
    </div>
  )
}

function ProductRow({
  product,
  slot,
  isSelected,
  onSelect,
}: {
  product: ProductWithImages
  slot: SlotKey
  isSelected: boolean
  onSelect: () => void
}) {
  const specSummary = useMemo(() => specsSummary(product, slot), [product, slot])
  const img = wixCdnUrl(getPrimaryImage(product), 200, 200)

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left rounded-[1.25rem] p-1.5 transition-all duration-500 ease-premium',
        isSelected ? 'bg-white' : 'bg-white/[0.04] hover:bg-white/[0.08]'
      )}
    >
      <div className={cn(
        'rounded-[1rem] p-4 flex items-start gap-4',
        isSelected ? 'bg-neutral-900 text-white ring-2 ring-white' : 'bg-neutral-900 ring-1 ring-white/[0.08]'
      )}>
        <div className={cn(
          'h-16 w-16 rounded-xl overflow-hidden shrink-0 relative',
          isSelected ? 'bg-white/10' : 'bg-mpc-fog'
        )}>
          {img ? (
            <Image src={img} alt={product.name} fill sizes="64px" className="object-contain p-2" />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-mpc-fog to-mpc-mist">
              <svg className={cn('h-8 w-8', isSelected ? 'text-white/40' : 'text-mpc-silver')} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M3 21V3l9 11L21 3v18" strokeLinecap="square" />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className={cn('text-[10px] uppercase tracking-[0.18em] font-bold mb-0.5', isSelected ? 'text-white/50' : 'text-mpc-graphite')}>
            {product.brand}
          </div>
          <div className="font-semibold leading-snug">{product.name}</div>
          <div className={cn('text-xs mt-2 flex flex-wrap gap-x-3 gap-y-0.5', isSelected ? 'text-white/60' : 'text-mpc-graphite')}>
            {specSummary.map((s) => (
              <span key={s.label}>
                <span className={cn('font-medium', isSelected ? 'text-white/80' : 'text-foreground/70')}>{s.label}:</span> {s.value}
              </span>
            ))}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-bold tabular-nums text-base">{formatCOP(Number(product.price))}</div>
          <div className={cn('text-[10px] mt-1', isSelected ? 'text-white/40' : 'text-mpc-silver')}>
            {product.stock > 0 ? `${product.stock} disp.` : 'Agotado'}
          </div>
          {isSelected && (
            <div className="text-[10px] mt-1.5 inline-flex items-center gap-1 bg-white text-black px-1.5 py-0.5 rounded-full font-bold">
              <Check className="h-2.5 w-2.5" strokeWidth={2} /> Elegido
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

function specsSummary(product: Product, slot: SlotKey): Array<{ label: string; value: string }> {
  const s = product.specs as Record<string, unknown>
  switch (slot) {
    case 'cpu': {
      const c = s as unknown as CpuSpecs
      return [{ label: 'Socket', value: c.socket }, { label: 'Núcleos', value: `${c.cores}c/${c.threads}t` }, { label: 'Turbo', value: c.boost_clock }, { label: 'TDP', value: `${c.tdp}W` }]
    }
    case 'motherboard': {
      const m = s as unknown as MotherboardSpecs
      return [{ label: 'Socket', value: m.socket }, { label: 'Form', value: m.form_factor }, { label: 'RAM', value: Array.isArray(m.ram_type) ? m.ram_type.join('/') : String(m.ram_type) }, { label: 'Chipset', value: m.chipset }]
    }
    case 'ram': {
      const r = s as unknown as RamSpecs
      return [{ label: 'Cap.', value: `${r.capacity_gb}GB` }, { label: 'Tipo', value: r.ram_type }, { label: 'Vel.', value: `${r.speed_mhz}MHz` }]
    }
    case 'storage': {
      const st = s as unknown as StorageSpecs
      return [{ label: 'Cap.', value: st.capacity_gb >= 1000 ? `${st.capacity_gb / 1000}TB` : `${st.capacity_gb}GB` }, { label: 'Tipo', value: st.type }, ...(st.read_speed ? [{ label: 'R/W', value: `${st.read_speed} MB/s` }] : [])]
    }
    case 'gpu': {
      const g = s as unknown as GpuSpecs
      return [{ label: 'VRAM', value: `${g.vram}GB` }, { label: 'TDP', value: `${g.tdp}W` }, { label: 'PCIe', value: g.pcie_version }]
    }
    case 'psu': {
      const p = s as unknown as PsuSpecs
      return [{ label: 'W', value: `${p.wattage}W` }, { label: 'Cert', value: p.certification }, { label: 'Modular', value: p.modular === true ? 'Full' : p.modular === 'semi' ? 'Semi' : 'No' }]
    }
    case 'case': {
      const c = s as unknown as CaseSpecs
      return [{ label: 'Form', value: c.form_factor }, ...(c.max_gpu_length ? [{ label: 'GPU', value: `${c.max_gpu_length}mm` }] : []), { label: 'RGB', value: c.has_rgb ? 'Sí' : 'No' }]
    }
    case 'cooling': {
      const co = s as unknown as CoolingSpecs
      return [{ label: 'Tipo', value: co.type === 'aio' ? 'Líquida' : 'Aire' }, { label: 'TDP', value: `${co.tdp_support}W` }, { label: 'Sockets', value: co.socket_support.slice(0, 2).join('/') + (co.socket_support.length > 2 ? '…' : '') }]
    }
  }
}
