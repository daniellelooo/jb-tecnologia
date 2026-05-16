'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product, BuildSlots, SlotKey, CompatibilityIssue } from '@/types'
import { checkCompatibility, isBuildCompatible } from '@/lib/configurator/compatibility'

export const SLOT_ORDER: SlotKey[] = ['cpu', 'motherboard', 'ram', 'storage', 'gpu', 'psu', 'case', 'cooling']

const EMPTY_BUILD: BuildSlots = {
  cpu: null,
  motherboard: null,
  ram: null,
  storage: null,
  gpu: null,
  psu: null,
  case: null,
  cooling: null,
}

interface ConfiguratorState {
  useCase: string | null
  budgetHint: string | null
  slots: BuildSlots
  currentSlot: SlotKey
  setUseCase: (useCase: string | null) => void
  setBudgetHint: (hint: string | null) => void
  selectComponent: (slot: SlotKey, product: Product) => void
  clearSlot: (slot: SlotKey) => void
  goToSlot: (slot: SlotKey) => void
  nextSlot: () => void
  prevSlot: () => void
  resetBuild: () => void
  loadPreset: (slots: Partial<BuildSlots>, useCase?: string | null) => void
  // computed
  getTotalPrice: () => number
  getIssues: () => CompatibilityIssue[]
  getIsCompatible: () => boolean
  getCompletedCount: () => number
}

export const useConfiguratorStore = create<ConfiguratorState>()(
  persist(
    (set, get) => ({
      useCase: null,
      budgetHint: null,
      slots: EMPTY_BUILD,
      currentSlot: 'cpu',

      setUseCase: (useCase) => set({ useCase }),
      setBudgetHint: (budgetHint) => set({ budgetHint }),

      selectComponent: (slot, product) =>
        set((state) => {
          const next = { ...state.slots, [slot]: product }
          // CPU change invalidates motherboard/ram/cooling if incompatible
          if (slot === 'cpu') {
            const cpuSocket = (product.specs as Record<string, unknown>).socket as string | undefined
            const mobo = next.motherboard
            if (mobo && (mobo.specs as Record<string, unknown>).socket !== cpuSocket) next.motherboard = null
            const cooling = next.cooling
            if (cooling) {
              const supported = (cooling.specs as Record<string, unknown>).socket_support as string[] | undefined
              if (cpuSocket && supported && !supported.includes(cpuSocket)) next.cooling = null
            }
          }
          // Motherboard change may invalidate RAM and Case
          if (slot === 'motherboard') {
            const moboSpecs = product.specs as Record<string, unknown>
            const ramTypes = moboSpecs.ram_type as string[] | undefined
            const formFactor = moboSpecs.form_factor as string | undefined
            const ram = next.ram
            if (ram && ramTypes) {
              const ramType = (ram.specs as Record<string, unknown>).ram_type as string | undefined
              if (ramType && !ramTypes.includes(ramType)) next.ram = null
            }
            const caseSpec = next.case
            if (caseSpec && formFactor) {
              const caseForm = (caseSpec.specs as Record<string, unknown>).form_factor as string | undefined
              const order: Record<string, number> = { 'Mini-ITX': 1, 'Micro-ATX': 2, 'ATX': 3, 'E-ATX': 4 }
              if (caseForm && order[caseForm] < order[formFactor]) next.case = null
            }
          }
          return { slots: next }
        }),

      clearSlot: (slot) => set((state) => ({ slots: { ...state.slots, [slot]: null } })),

      goToSlot: (slot) => set({ currentSlot: slot }),

      nextSlot: () =>
        set((state) => {
          const i = SLOT_ORDER.indexOf(state.currentSlot)
          return { currentSlot: SLOT_ORDER[Math.min(i + 1, SLOT_ORDER.length - 1)] }
        }),

      prevSlot: () =>
        set((state) => {
          const i = SLOT_ORDER.indexOf(state.currentSlot)
          return { currentSlot: SLOT_ORDER[Math.max(i - 1, 0)] }
        }),

      resetBuild: () => set({ slots: EMPTY_BUILD, currentSlot: 'cpu', useCase: null, budgetHint: null }),

      loadPreset: (preset, useCase) =>
        set({
          slots: { ...EMPTY_BUILD, ...preset },
          currentSlot: 'cpu',
          useCase: useCase ?? 'preset',
        }),

      getTotalPrice: () => {
        const slots = get().slots
        return SLOT_ORDER.reduce((sum, key) => sum + Number(slots[key]?.price ?? 0), 0)
      },

      getIssues: () => checkCompatibility(get().slots),

      getIsCompatible: () => isBuildCompatible(checkCompatibility(get().slots)),

      getCompletedCount: () =>
        SLOT_ORDER.reduce((count, key) => count + (get().slots[key] ? 1 : 0), 0),
    }),
    {
      name: 'jbtecnologia-build',
      partialize: (state) => ({
        useCase: state.useCase,
        budgetHint: state.budgetHint,
        slots: state.slots,
      }),
    }
  )
)
