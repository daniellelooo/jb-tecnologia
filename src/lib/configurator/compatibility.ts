import type { Product, BuildSlots, CompatibilityIssue, CpuSpecs, MotherboardSpecs, RamSpecs, GpuSpecs, PsuSpecs, CaseSpecs, CoolingSpecs, StorageSpecs } from '@/types'

function specs<T>(product: Product | null): T | null {
  if (!product) return null
  return (product.specs as unknown) as T
}

const BASE_SYSTEM_TDP = 80 // CPU + GPU don't account for everything

// Score relativo de CPU multi-thread (0-100). Calibrado contra Cinebench R23.
// Mantenemos esta tabla aparte de performance.ts para no acoplar módulos.
const CPU_MT_BY_NAME: Array<[RegExp, number]> = [
  [/i3[- ]?12100/i, 45],
  [/i5[- ]?12400/i, 60],
  [/i5[- ]?13600/i, 85],
  [/i7[- ]?14700/i, 95],
  [/ryzen ?5 ?5600/i, 58],
  [/ryzen ?5 ?7600/i, 72],
  [/ryzen ?7 ?7700/i, 88],
  [/ryzen ?9 ?7900/i, 100],
]

// Score relativo de GPU (0-120). Misma escala que performance.ts.
const GPU_POWER_BY_NAME: Array<[RegExp, number]> = [
  [/gtx ?1650/i, 30],
  [/rx ?7600/i, 70],
  [/rtx ?3060(?! ?ti)/i, 72],
  [/rtx ?4060(?! ?ti)/i, 80],
  [/(rx ?6700 ?xt|6700xt)/i, 85],
  [/rtx ?3070 ?ti/i, 105],
  [/rtx ?4070(?! ?ti| ?super)/i, 120],
]

function scoreFromName(name: string, table: Array<[RegExp, number]>, fallback: number): number {
  for (const [pat, val] of table) if (pat.test(name)) return val
  return fallback
}

export function checkCompatibility(build: BuildSlots): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = []

  const cpu = specs<CpuSpecs>(build.cpu)
  const mobo = specs<MotherboardSpecs>(build.motherboard)
  const ram = specs<RamSpecs>(build.ram)
  const gpu = specs<GpuSpecs>(build.gpu)
  const psu = specs<PsuSpecs>(build.psu)
  const caseSpecs = specs<CaseSpecs>(build.case)
  const cooling = specs<CoolingSpecs>(build.cooling)
  const storage = specs<StorageSpecs>(build.storage)

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

  // REGLA 7: Bottleneck CPU ↔ GPU
  //   El score multi-thread del CPU debe ser >= ~65% del power score de la GPU
  //   para evitar que la GPU quede ociosa en cargas mixtas (gaming, AAA, streaming).
  if (build.cpu && build.gpu) {
    const cpuMt = scoreFromName(build.cpu.name, CPU_MT_BY_NAME, Math.min(100, 30 + (cpu?.cores ?? 4) * 6))
    const gpuPower = scoreFromName(build.gpu.name, GPU_POWER_BY_NAME, 60)
    const cpuNeeded = Math.min(95, 30 + gpuPower * 0.55)
    if (cpuMt < cpuNeeded * 0.75) {
      const lossPct = Math.round((1 - cpuMt / cpuNeeded) * 60)
      issues.push({
        severity: 'warning',
        slot: 'cpu',
        message: `Tu CPU se queda corto frente a la ${build.gpu.name}: en juegos AAA y multitarea pesada vas a perder ~${lossPct}% de los FPS posibles. Considera un CPU más potente o una GPU acorde.`,
      })
    } else if (cpuMt < cpuNeeded) {
      issues.push({
        severity: 'warning',
        slot: 'cpu',
        message: `Combinación funcional, pero la ${build.gpu.name} pide un poco más de CPU para rendir al 100% en títulos exigentes.`,
      })
    }
  }

  // REGLA 8: RAM single-stick (1 sola memoria = single channel, hasta -40% en juegos)
  if (ram) {
    const sticks = ram.kit_pieces ?? 2
    if (sticks < 2) {
      issues.push({
        severity: 'warning',
        slot: 'ram',
        message: `Una sola memoria RAM corre en single-channel y puede reducir hasta 30-40% el rendimiento en juegos y aplicaciones intensivas. Recomendamos un kit de 2 módulos.`,
      })
    }
  }

  // REGLA 9: Sin SSD/NVMe (solo HDD = arranque y carga lentísimos)
  if (storage && storage.type === 'HDD') {
    issues.push({
      severity: 'warning',
      slot: 'storage',
      message: `Solo elegiste un HDD mecánico. Para una experiencia moderna se recomienda mínimo un SSD/NVMe como disco principal (Windows arranca en segundos vs. minutos).`,
    })
  }

  // REGLA 10: RAM muy poca para una GPU potente
  if (ram && build.gpu) {
    const gpuPower = scoreFromName(build.gpu.name, GPU_POWER_BY_NAME, 60)
    if (gpuPower >= 80 && ram.capacity_gb < 16) {
      issues.push({
        severity: 'warning',
        slot: 'ram',
        message: `Con una GPU de este nivel, 16GB de RAM es el mínimo recomendado. Vas a notar limitaciones en juegos modernos y multitarea.`,
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
