'use client'

import { useConfiguratorStore } from '@/lib/stores/configurator-store'
import { UseCaseSelector } from '@/components/configurator/use-case-selector'
import { SlotPicker } from '@/components/configurator/slot-picker'
import { BuildSummary } from '@/components/configurator/build-summary'
import { BuildPresets } from '@/components/configurator/build-presets'
import { PerformanceEstimator } from '@/components/configurator/performance-estimator'
import type { Product, SlotKey } from '@/types'
import { useEffect, useState } from 'react'

interface ConfiguratorClientProps {
  components: Record<SlotKey, Product[]>
  slots: Array<{ slug: SlotKey; name: string; help_text: string; is_required: boolean }>
}

export function ConfiguratorClient({ components, slots }: ConfiguratorClientProps) {
  const [mounted, setMounted] = useState(false)
  const useCase = useConfiguratorStore((s) => s.useCase)

  useEffect(() => { setMounted(true) }, [])

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1 mb-4">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Cargando configurador</span>
        </div>
      </div>
    )
  }

  if (!useCase) {
    return (
      <div className="container mx-auto px-4 pt-12 lg:pt-16 pb-24 max-w-5xl">
        <BuildPresets components={components} />
        <div className="my-12 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/[0.08]" />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-mpc-silver">O personaliza</span>
          <div className="flex-1 h-px bg-white/[0.08]" />
        </div>
        <UseCaseSelector />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 pt-8 lg:pt-12 pb-32">
      <div className="grid lg:grid-cols-[1fr_360px] gap-8 lg:gap-12">
        <div className="min-w-0">
          <SlotPicker components={components} slots={slots} />
          <PerformanceEstimator />
        </div>
        <BuildSummary />
      </div>
    </div>
  )
}
