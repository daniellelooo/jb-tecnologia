'use client'

import { useMemo } from 'react'
import { Briefcase, Gamepad2, Zap, Crown, ArrowRight, Sparkles } from 'lucide-react'
import { useConfiguratorStore, SLOT_ORDER } from '@/lib/stores/configurator-store'
import { formatCOP, type Product, type SlotKey, type BuildSlots } from '@/types'
import { toast } from 'sonner'

interface PresetDefinition {
  id: string
  name: string
  tagline: string
  icon: typeof Briefcase
  useCase: string
  ids: Partial<Record<SlotKey, string>>
}

// IDs from supabase seed — actual products in the catalog.
const PRESETS: PresetDefinition[] = [
  {
    id: 'oficina',
    name: 'Oficina + Estudio',
    tagline: 'Para productividad y tareas diarias sin complicaciones.',
    icon: Briefcase,
    useCase: 'trabajo',
    ids: {
      cpu: 'c1000000-0000-0000-0000-000000000001',          // i3-12100F
      motherboard: 'c2000000-0000-0000-0000-000000000001',  // ASUS B660M-K D4
      ram: 'c3000000-0000-0000-0000-000000000001',          // Kingston Fury Beast 16GB DDR4
      storage: 'c4000000-0000-0000-0000-000000000001',      // Kingston NV2 500GB
      gpu: 'c5000000-0000-0000-0000-000000000001',          // GTX 1650
      psu: 'c6000000-0000-0000-0000-000000000001',          // Corsair CV550
      case: 'c7000000-0000-0000-0000-000000000001',         // Aerocool Cylon
      cooling: 'c8000000-0000-0000-0000-000000000001',      // Hyper 212
    },
  },
  {
    id: 'gaming-1080',
    name: 'Gaming 1080p',
    tagline: 'Jugar al máximo en Full HD con buena tasa de fps.',
    icon: Gamepad2,
    useCase: 'gaming',
    ids: {
      cpu: 'c1000000-0000-0000-0000-000000000005',          // Ryzen 5 5600X
      motherboard: 'c2000000-0000-0000-0000-000000000005',  // ASRock B550M Pro4
      ram: 'c3000000-0000-0000-0000-000000000001',          // Kingston Fury Beast 16GB DDR4
      storage: 'c4000000-0000-0000-0000-000000000002',      // Samsung 970 EVO Plus 1TB
      gpu: 'c5000000-0000-0000-0000-000000000002',          // RTX 3060 12GB
      psu: 'c6000000-0000-0000-0000-000000000002',          // EVGA 650W Gold
      case: 'c7000000-0000-0000-0000-000000000001',         // Aerocool Cylon
      cooling: 'c8000000-0000-0000-0000-000000000001',      // Hyper 212
    },
  },
  {
    id: 'gaming-1440',
    name: 'Gaming 1440p / Stream',
    tagline: 'QHD a alta tasa de fps con margen para transmitir.',
    icon: Zap,
    useCase: 'streaming',
    ids: {
      cpu: 'c1000000-0000-0000-0000-000000000003',          // i5-13600K
      motherboard: 'c2000000-0000-0000-0000-000000000002',  // MSI Pro Z690-A DDR4
      ram: 'c3000000-0000-0000-0000-000000000002',          // Corsair Vengeance 32GB DDR4
      storage: 'c4000000-0000-0000-0000-000000000003',      // WD Black SN850X 1TB
      gpu: 'c5000000-0000-0000-0000-000000000004',          // RTX 4060 8GB
      psu: 'c6000000-0000-0000-0000-000000000003',          // Seasonic Focus GX-750
      case: 'c7000000-0000-0000-0000-000000000002',         // NZXT H510 ATX
      cooling: 'c8000000-0000-0000-0000-000000000003',      // Corsair H100i 240mm AIO
    },
  },
  {
    id: 'workstation',
    name: 'Workstation 4K',
    tagline: 'Edición de video, render 3D y multitarea pesada.',
    icon: Crown,
    useCase: 'diseno_grafico',
    ids: {
      cpu: 'c1000000-0000-0000-0000-000000000008',          // Ryzen 9 7900X
      motherboard: 'c2000000-0000-0000-0000-000000000004',  // ASUS X670E-F Gaming
      ram: 'c3000000-0000-0000-0000-000000000005',          // Corsair Dominator 32GB DDR5
      storage: 'c4000000-0000-0000-0000-000000000003',      // WD Black SN850X 1TB
      gpu: 'c5000000-0000-0000-0000-000000000005',          // RTX 4070 12GB
      psu: 'c6000000-0000-0000-0000-000000000004',          // Corsair RM1000x
      case: 'c7000000-0000-0000-0000-000000000004',         // Fractal Meshify 2
      cooling: 'c8000000-0000-0000-0000-000000000004',      // NZXT Kraken X63 280mm
    },
  },
]

interface BuildPresetsProps {
  components: Record<SlotKey, Product[]>
}

function resolvePreset(def: PresetDefinition, components: Record<SlotKey, Product[]>): { resolved: Partial<BuildSlots>; missing: number; total: number } {
  const resolved: Partial<BuildSlots> = {}
  let missing = 0
  let total = 0
  for (const slot of SLOT_ORDER) {
    const targetId = def.ids[slot]
    if (!targetId) continue
    const product = components[slot]?.find((p) => p.id === targetId)
    if (product) {
      resolved[slot] = product
      total += Number(product.price)
    } else {
      missing += 1
    }
  }
  return { resolved, missing, total }
}

export function BuildPresets({ components }: BuildPresetsProps) {
  const loadPreset = useConfiguratorStore((s) => s.loadPreset)

  const resolvedPresets = useMemo(
    () => PRESETS.map((p) => ({ def: p, ...resolvePreset(p, components) })),
    [components]
  )

  return (
    <section className="mb-14">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1 mb-4">
          <Sparkles className="h-3 w-3" strokeWidth={1.5} />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Empezar rápido</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-display leading-tight mb-3">
          Plantillas <span className="text-mpc-silver">listas para personalizar.</span>
        </h2>
        <p className="text-sm md:text-base text-mpc-graphite max-w-2xl mx-auto leading-relaxed">
          Carga un build pre-armado de un click y modifica los componentes que quieras antes de pedirlo.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {resolvedPresets.map(({ def, resolved, total, missing }) => {
          const Icon = def.icon
          const disabled = missing > 4
          return (
            <button
              key={def.id}
              disabled={disabled}
              onClick={() => {
                loadPreset(resolved, def.useCase)
                toast.success(`Plantilla "${def.name}" cargada`, { description: 'Editá lo que quieras antes de pedirlo.' })
              }}
              className="group relative text-left rounded-[1.75rem] p-1.5 bg-white/[0.04] hover:bg-white/[0.1] transition-all duration-500 ease-premium disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <div className="rounded-[1.4rem] bg-neutral-900 ring-1 ring-white/[0.08] p-6 h-full flex flex-col gap-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="h-11 w-11 rounded-2xl bg-white/[0.06] text-white flex items-center justify-center">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <ArrowRight className="h-4 w-4 text-mpc-silver transition-all duration-500 ease-premium group-hover:translate-x-0.5 group-hover:text-white" strokeWidth={1.5} />
                </div>
                <div className="flex-1">
                  <div className="text-xl font-bold tracking-display leading-tight">{def.name}</div>
                  <div className="text-[11px] text-mpc-graphite mt-2 leading-relaxed line-clamp-2">{def.tagline}</div>
                </div>
                <div className="pt-3 border-t border-white/[0.08]">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-mpc-graphite">Desde</div>
                  <div className="text-lg font-bold tracking-display tabular-nums mt-0.5">{formatCOP(total)}</div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
