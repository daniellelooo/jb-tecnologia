import type { Product, BuildSlots, CompatibilityIssue, CpuSpecs, MotherboardSpecs, RamSpecs, GpuSpecs, PsuSpecs, CaseSpecs, CoolingSpecs } from '@/types'

function specs<T>(product: Product | null): T | null {
  if (!product) return null
  return (product.specs as unknown) as T
}

const BASE_SYSTEM_TDP = 80 // CPU + GPU don't account for everything

export function checkCompatibility(build: BuildSlots): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = []

  const cpu = specs<CpuSpecs>(build.cpu)
  const mobo = specs<MotherboardSpecs>(build.motherboard)
  const ram = specs<RamSpecs>(build.ram)
  const gpu = specs<GpuSpecs>(build.gpu)
  const psu = specs<PsuSpecs>(build.psu)
  const caseSpecs = specs<CaseSpecs>(build.case)
  const cooling = specs<CoolingSpecs>(build.cooling)

  // REGLA 1: CPU socket ↔ Motherboard socket
  if (cpu && mobo && cpu.socket !== mobo.socket) {
    issues.push({
      severity: 'error',
      slot: 'motherboard',
      message: `El procesador ${build.cpu!.name} requiere socket ${cpu.socket}, pero la tarjeta madre seleccionada es ${mobo.socket}. Cambia la mobo o el CPU.`,
    })
  }

  // REGLA 2: RAM type ↔ Motherboard RAM support
  if (ram && mobo) {
    const moboTypes = Array.isArray(mobo.ram_type) ? mobo.ram_type : [mobo.ram_type as unknown as string]
    if (!moboTypes.includes(ram.ram_type)) {
      issues.push({
        severity: 'error',
        slot: 'ram',
        message: `La RAM ${ram.ram_type} no es compatible con esta tarjeta madre que soporta ${moboTypes.join(' o ')}.`,
      })
    }
  }

  // REGLA 3: PSU wattage vs total TDP (CPU + GPU + base)
  if (psu) {
    const cpuTdp = cpu?.tdp ?? 0
    const gpuTdp = gpu?.tdp ?? 0
    const required = cpuTdp + gpuTdp + BASE_SYSTEM_TDP

    if (cpuTdp || gpuTdp) {
      const minimum = Math.ceil(required * 1.2)
      const recommended = Math.ceil(required * 1.5)

      if (psu.wattage < minimum) {
        issues.push({
          severity: 'error',
          slot: 'psu',
          message: `La fuente de ${psu.wattage}W es insuficiente para este build. Mínimo recomendado: ${minimum}W (TDP del sistema: ${required}W).`,
        })
      } else if (psu.wattage < recommended) {
        issues.push({
          severity: 'warning',
          slot: 'psu',
          message: `La fuente de ${psu.wattage}W tiene poco margen. Para mayor estabilidad y futuras actualizaciones considera ${recommended}W o más.`,
        })
      }
    }
  }

  // REGLA 4: Case form factor ↔ Motherboard form factor
  if (caseSpecs && mobo) {
    const formOrder: Record<string, number> = { 'Mini-ITX': 1, 'Micro-ATX': 2, 'ATX': 3, 'E-ATX': 4 }
    const caseRank = formOrder[caseSpecs.form_factor] ?? 3
    const moboRank = formOrder[mobo.form_factor] ?? 3
    if (caseRank < moboRank) {
      issues.push({
        severity: 'error',
        slot: 'case',
        message: `El gabinete ${caseSpecs.form_factor} es demasiado pequeño para una placa ${mobo.form_factor}. Elige un gabinete más grande.`,
      })
    }
  }

  // REGLA 5: GPU length vs case max GPU length
  if (gpu && caseSpecs && caseSpecs.max_gpu_length && 'length_mm' in gpu && typeof (gpu as Record<string, unknown>).length_mm === 'number') {
    const gpuLength = (gpu as unknown as { length_mm: number }).length_mm
    if (gpuLength > caseSpecs.max_gpu_length) {
      issues.push({
        severity: 'error',
        slot: 'case',
        message: `La GPU mide ${gpuLength}mm pero el gabinete acepta máximo ${caseSpecs.max_gpu_length}mm.`,
      })
    }
  }

  // REGLA 6: Cooling TDP support vs CPU TDP
  if (cooling && cpu) {
    if (cooling.tdp_support < cpu.tdp) {
      issues.push({
        severity: 'warning',
        slot: 'cooling',
        message: `La refrigeración soporta hasta ${cooling.tdp_support}W TDP pero tu CPU consume ${cpu.tdp}W. Podría haber thermal throttling bajo carga.`,
      })
    }
    if (!cooling.socket_support.includes(cpu.socket)) {
      issues.push({
        severity: 'error',
        slot: 'cooling',
        message: `Esta refrigeración no es compatible con el socket ${cpu.socket} de tu procesador.`,
      })
    }
  }

  return issues
}

export function isBuildCompatible(issues: CompatibilityIssue[]): boolean {
  return !issues.some((i) => i.severity === 'error')
}

export function recommendedWattage(build: BuildSlots): number | null {
  const cpu = specs<CpuSpecs>(build.cpu)
  const gpu = specs<GpuSpecs>(build.gpu)
  if (!cpu && !gpu) return null
  const tdp = (cpu?.tdp ?? 0) + (gpu?.tdp ?? 0) + BASE_SYSTEM_TDP
  return Math.ceil(tdp * 1.5)
}

// Filter helpers — used to query Supabase for compatible products in each slot
export interface SlotFilter {
  socket?: string
  ramTypes?: string[]
  formFactor?: 'ATX' | 'Micro-ATX' | 'Mini-ITX'
  socketSupport?: string
}

export function getFilterForSlot(slot: keyof BuildSlots, build: BuildSlots): SlotFilter {
  const cpu = specs<CpuSpecs>(build.cpu)
  const mobo = specs<MotherboardSpecs>(build.motherboard)

  switch (slot) {
    case 'motherboard':
      return cpu ? { socket: cpu.socket } : {}
    case 'ram':
      return mobo ? { ramTypes: mobo.ram_type } : {}
    case 'case':
      return mobo ? { formFactor: mobo.form_factor } : {}
    case 'cooling':
      return cpu ? { socketSupport: cpu.socket } : {}
    default:
      return {}
  }
}
