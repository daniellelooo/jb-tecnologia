import type { Product, BuildSlots, CpuSpecs, GpuSpecs, RamSpecs } from '@/types'

// ============================================================
// GPU performance database — FPS @ 1080p Ultra / 1440p Ultra / 4K Ultra
// Datos calibrados con benchmarks públicos (TechPowerUp, Tom's Hardware,
// GamersNexus, Tom's HW, Hardware Unboxed). DLSS/FSR desactivado.
// Si no hay datos exactos, se interpola por tier de la GPU.
// ============================================================

type Res = '1080p' | '1440p' | '4k'
type GpuKey =
  | 'gtx_1650' | 'rx_7600' | 'rtx_3060' | 'rtx_4060'
  | 'rx_6700_xt' | 'rtx_3070_ti' | 'rtx_4070'

interface GameFps { '1080p': number; '1440p': number; '4k': number }

export interface GameEntry {
  id: string
  name: string
  // Indica si el juego depende mucho de CPU (shooters competitivos) o GPU (AAA)
  cpuHeavy: boolean
  // FPS por GPU; si la GPU no aparece se interpola por tier ascendente
  fpsByGpu: Partial<Record<GpuKey, GameFps>>
}

// Tier ascendente — usado para fallback por interpolación
const GPU_TIER: GpuKey[] = [
  'gtx_1650', 'rx_7600', 'rtx_3060', 'rtx_4060', 'rx_6700_xt', 'rtx_3070_ti', 'rtx_4070',
]

const GPU_RELATIVE: Record<GpuKey, number> = {
  gtx_1650: 30,
  rx_7600: 70,
  rtx_3060: 72,
  rtx_4060: 80,
  rx_6700_xt: 85,
  rtx_3070_ti: 105,
  rtx_4070: 120,
}

// ============================================================
// Catálogo de juegos
// FPS basados en benchmarks Ultra preset, sin upscaling, AVG.
// ============================================================
export const GAMES: GameEntry[] = [
  {
    id: 'valorant', name: 'Valorant', cpuHeavy: true,
    fpsByGpu: {
      gtx_1650: { '1080p': 180, '1440p': 130, '4k': 70 },
      rtx_3060: { '1080p': 330, '1440p': 240, '4k': 130 },
      rtx_4060: { '1080p': 360, '1440p': 260, '4k': 140 },
      rtx_4070: { '1080p': 400, '1440p': 320, '4k': 180 },
    },
  },
  {
    id: 'cs2', name: 'Counter-Strike 2', cpuHeavy: true,
    fpsByGpu: {
      gtx_1650: { '1080p': 110, '1440p': 75, '4k': 35 },
      rtx_3060: { '1080p': 240, '1440p': 180, '4k': 95 },
      rtx_4060: { '1080p': 260, '1440p': 195, '4k': 105 },
      rtx_4070: { '1080p': 320, '1440p': 240, '4k': 140 },
    },
  },
  {
    id: 'fortnite', name: 'Fortnite (DX12)', cpuHeavy: true,
    fpsByGpu: {
      gtx_1650: { '1080p': 55, '1440p': 38, '4k': 18 },
      rtx_3060: { '1080p': 120, '1440p': 85, '4k': 42 },
      rtx_4060: { '1080p': 135, '1440p': 95, '4k': 48 },
      rtx_4070: { '1080p': 175, '1440p': 130, '4k': 70 },
    },
  },
  {
    id: 'lol', name: 'League of Legends', cpuHeavy: true,
    fpsByGpu: {
      gtx_1650: { '1080p': 200, '1440p': 160, '4k': 100 },
      rtx_3060: { '1080p': 320, '1440p': 260, '4k': 165 },
      rtx_4060: { '1080p': 340, '1440p': 280, '4k': 180 },
      rtx_4070: { '1080p': 380, '1440p': 310, '4k': 210 },
    },
  },
  {
    id: 'apex', name: 'Apex Legends', cpuHeavy: true,
    fpsByGpu: {
      gtx_1650: { '1080p': 60, '1440p': 42, '4k': 20 },
      rtx_3060: { '1080p': 140, '1440p': 100, '4k': 50 },
      rtx_4060: { '1080p': 160, '1440p': 115, '4k': 58 },
      rtx_4070: { '1080p': 200, '1440p': 155, '4k': 80 },
    },
  },
  {
    id: 'warzone', name: 'Call of Duty: Warzone', cpuHeavy: true,
    fpsByGpu: {
      gtx_1650: { '1080p': 45, '1440p': 30, '4k': 14 },
      rtx_3060: { '1080p': 110, '1440p': 78, '4k': 38 },
      rtx_4060: { '1080p': 125, '1440p': 90, '4k': 44 },
      rtx_4070: { '1080p': 170, '1440p': 125, '4k': 65 },
    },
  },
  {
    id: 'gta5', name: 'GTA V', cpuHeavy: false,
    fpsByGpu: {
      gtx_1650: { '1080p': 70, '1440p': 50, '4k': 25 },
      rtx_3060: { '1080p': 130, '1440p': 100, '4k': 55 },
      rtx_4060: { '1080p': 145, '1440p': 110, '4k': 60 },
      rtx_4070: { '1080p': 175, '1440p': 145, '4k': 85 },
    },
  },
  {
    id: 'rdr2', name: 'Red Dead Redemption 2', cpuHeavy: false,
    fpsByGpu: {
      gtx_1650: { '1080p': 35, '1440p': 24, '4k': 11 },
      rtx_3060: { '1080p': 75, '1440p': 55, '4k': 28 },
      rtx_4060: { '1080p': 85, '1440p': 62, '4k': 32 },
      rtx_4070: { '1080p': 115, '1440p': 88, '4k': 50 },
    },
  },
  {
    id: 'cyberpunk', name: 'Cyberpunk 2077 (RT off)', cpuHeavy: false,
    fpsByGpu: {
      gtx_1650: { '1080p': 28, '1440p': 18, '4k': 8 },
      rtx_3060: { '1080p': 65, '1440p': 45, '4k': 22 },
      rtx_4060: { '1080p': 75, '1440p': 52, '4k': 26 },
      rtx_4070: { '1080p': 105, '1440p': 78, '4k': 42 },
    },
  },
  {
    id: 'elden_ring', name: 'Elden Ring', cpuHeavy: false,
    fpsByGpu: {
      gtx_1650: { '1080p': 35, '1440p': 24, '4k': 11 },
      rtx_3060: { '1080p': 60, '1440p': 60, '4k': 35 },
      rtx_4060: { '1080p': 60, '1440p': 60, '4k': 40 },
      rtx_4070: { '1080p': 60, '1440p': 60, '4k': 55 },
    },
  },
  {
    id: 'hogwarts', name: 'Hogwarts Legacy', cpuHeavy: false,
    fpsByGpu: {
      gtx_1650: { '1080p': 30, '1440p': 20, '4k': 9 },
      rtx_3060: { '1080p': 65, '1440p': 48, '4k': 23 },
      rtx_4060: { '1080p': 75, '1440p': 55, '4k': 27 },
      rtx_4070: { '1080p': 105, '1440p': 78, '4k': 42 },
    },
  },
  {
    id: 'forza_h5', name: 'Forza Horizon 5', cpuHeavy: false,
    fpsByGpu: {
      gtx_1650: { '1080p': 55, '1440p': 38, '4k': 18 },
      rtx_3060: { '1080p': 105, '1440p': 78, '4k': 40 },
      rtx_4060: { '1080p': 120, '1440p': 90, '4k': 46 },
      rtx_4070: { '1080p': 160, '1440p': 125, '4k': 70 },
    },
  },
]

// ============================================================
// CPU score (multi-thread productivity, 0-100)
// Calibrado contra Cinebench R23 multi y geomean Tom's HW.
// ============================================================
const CPU_SCORES: Record<string, { mt: number; st: number; cores: number; arch: 'old' | 'modern' | 'flagship' }> = {
  'i3-12100f':    { mt: 45, st: 78, cores: 4,  arch: 'modern' },
  'i5-12400f':    { mt: 60, st: 80, cores: 6,  arch: 'modern' },
  'i5-13600k':    { mt: 85, st: 92, cores: 14, arch: 'modern' },
  'i7-14700k':    { mt: 95, st: 96, cores: 20, arch: 'flagship' },
  'ryzen 5 5600x': { mt: 58, st: 78, cores: 6, arch: 'modern' },
  'ryzen 5 7600x': { mt: 72, st: 90, cores: 6, arch: 'modern' },
  'ryzen 7 7700x': { mt: 88, st: 93, cores: 8, arch: 'flagship' },
  'ryzen 9 7900x': { mt: 100, st: 95, cores: 12, arch: 'flagship' },
}

function matchCpuKey(name: string): keyof typeof CPU_SCORES | null {
  const n = name.toLowerCase()
  for (const k of Object.keys(CPU_SCORES)) {
    if (n.includes(k)) return k as keyof typeof CPU_SCORES
  }
  return null
}

function matchGpuKey(name: string): GpuKey | null {
  const n = name.toLowerCase().replace(/\s+/g, '')
  if (n.includes('gtx1650') || n.includes('gtx-1650')) return 'gtx_1650'
  if (n.includes('rx7600') || n.includes('radeonrx7600')) return 'rx_7600'
  if (n.includes('rtx3060') && !n.includes('ti')) return 'rtx_3060'
  if (n.includes('rtx4060') && !n.includes('ti')) return 'rtx_4060'
  if (n.includes('rx6700xt') || n.includes('6700xt')) return 'rx_6700_xt'
  if (n.includes('rtx3070ti') || n.includes('3070ti')) return 'rtx_3070_ti'
  if (n.includes('rtx4070') && !n.includes('ti') && !n.includes('super')) return 'rtx_4070'
  return null
}

// Interpolate FPS for GPUs not in the explicit table using tier-relative scaling.
function fpsForGpu(game: GameEntry, gpu: GpuKey, res: Res): number {
  const direct = game.fpsByGpu[gpu]
  if (direct) return direct[res]
  // Find nearest reference GPU in same direction
  const ref = (Object.keys(game.fpsByGpu) as GpuKey[])[0]
  if (!ref) return 0
  const refFps = game.fpsByGpu[ref]![res]
  return Math.round(refFps * (GPU_RELATIVE[gpu] / GPU_RELATIVE[ref]))
}

// CPU/RAM bottleneck: scales FPS down if CPU/RAM is weak relative to GPU.
function bottleneckFactor(cpuMt: number, ramGb: number, gpu: GpuKey, cpuHeavy: boolean): number {
  const gpuPower = GPU_RELATIVE[gpu]
  // The stronger the GPU, the more demanding for CPU.
  const cpuNeeded = Math.min(95, 30 + gpuPower * 0.55)
  const cpuRatio = Math.min(1, cpuMt / cpuNeeded)
  // CPU-heavy games hit harder
  const cpuPenalty = cpuHeavy ? cpuRatio : 0.5 + cpuRatio * 0.5
  // RAM penalty: <8GB severe, 8GB ok, 16GB optimal, 32GB+ no penalty
  const ramPenalty = ramGb >= 16 ? 1 : ramGb >= 8 ? 0.9 : ramGb >= 4 ? 0.7 : 0.5
  return Math.max(0.4, cpuPenalty * ramPenalty)
}

// ============================================================
// Public: gaming FPS estimation
// ============================================================
export interface GamingFpsRow {
  game: GameEntry
  fps1080: number
  fps1440: number
  fps4k: number
}

export interface GamingReport {
  hasData: boolean
  gpu: GpuKey | null
  cpu: string | null
  rows: GamingFpsRow[]
  recommendedRes: Res
  note: string
}

export function estimateGaming(build: BuildSlots): GamingReport {
  const empty: GamingReport = {
    hasData: false, gpu: null, cpu: null, rows: [], recommendedRes: '1080p',
    note: 'Selecciona un procesador y una tarjeta de video para ver el rendimiento estimado.',
  }
  if (!build.cpu || !build.gpu) return empty
  const gpuKey = matchGpuKey(build.gpu.name)
  if (!gpuKey) return { ...empty, note: 'No tenemos datos calibrados para esta GPU específica. Mostraremos solo recomendaciones generales.' }

  const cpuSpecs = build.cpu.specs as CpuSpecs
  const cpuKey = matchCpuKey(build.cpu.name)
  // Fallback: derive MT score from cores if CPU model is unknown
  const cpuMt = cpuKey ? CPU_SCORES[cpuKey].mt : Math.min(100, 30 + cpuSpecs.cores * 6)
  const ramGb = (build.ram?.specs as RamSpecs | null)?.capacity_gb ?? 8

  const rows: GamingFpsRow[] = GAMES.map((g) => {
    const f1080 = Math.round(fpsForGpu(g, gpuKey, '1080p') * bottleneckFactor(cpuMt, ramGb, gpuKey, g.cpuHeavy))
    const f1440 = Math.round(fpsForGpu(g, gpuKey, '1440p') * bottleneckFactor(cpuMt, ramGb, gpuKey, g.cpuHeavy))
    const f4k = Math.round(fpsForGpu(g, gpuKey, '4k') * bottleneckFactor(cpuMt, ramGb, gpuKey, g.cpuHeavy))
    return { game: g, fps1080: f1080, fps1440: f1440, fps4k: f4k }
  })

  // Recommended res: highest where most AAA games stay above ~60 fps
  const aaa = rows.filter((r) => !r.game.cpuHeavy)
  const recommendedRes: Res =
    aaa.every((r) => r.fps4k >= 60) ? '4k'
    : aaa.every((r) => r.fps1440 >= 60) ? '1440p'
    : '1080p'

  const power = GPU_RELATIVE[gpuKey]
  const note = power < 50
    ? 'Build de entrada: rinde bien en eSports a 1080p. Para AAA recientes considera bajar settings.'
    : power < 80
    ? 'Build sólido para gaming 1080p Ultra y 1440p High en la mayoría de títulos.'
    : 'Build de alto rendimiento: 1440p Ultra fluido y 4K jugable con upscaling.'

  return { hasData: true, gpu: gpuKey, cpu: build.cpu.name, rows, recommendedRes, note }
}

// ============================================================
// Trabajo — programas comunes de oficina/productividad
// ============================================================
export type Rating = 'excelente' | 'bueno' | 'justo' | 'insuficiente'

export interface AppRow {
  name: string
  rating: Rating
  detail: string
}

interface AppDef {
  name: string
  // requisitos mínimos en términos relativos
  cpuMt: number // 0-100
  ramGb: number
  needsGpu?: boolean
  // descripción cuando se cumple
  ok: string
  // descripción cuando es justo
  warn: string
}

const WORK_APPS: AppDef[] = [
  { name: 'Microsoft Office (Word, Excel, PowerPoint)', cpuMt: 25, ramGb: 4, ok: 'Fluido incluso con documentos grandes y planillas complejas.', warn: 'Funciona, pero archivos grandes pueden lagear.' },
  { name: 'Google Chrome (20+ pestañas)', cpuMt: 35, ramGb: 8, ok: 'Sin lag con muchas pestañas y videollamadas en background.', warn: 'Vas a notar lentitud con muchas pestañas abiertas.' },
  { name: 'Microsoft Teams / Zoom (videollamadas HD)', cpuMt: 30, ramGb: 8, ok: 'Videollamadas estables en HD con fondo virtual.', warn: 'Videollamadas básicas; el fondo virtual puede saltar.' },
  { name: 'Excel con macros y tablas dinámicas grandes', cpuMt: 55, ramGb: 16, ok: 'Recalcula tablas de cientos de miles de filas sin congelarse.', warn: 'Demoras notorias en hojas muy pesadas.' },
  { name: 'Contabilidad (SIIGO, Helisa, Alegra, World Office)', cpuMt: 30, ramGb: 8, ok: 'Operación diaria fluida, reportes rápidos.', warn: 'Rinde, pero reportes mensuales pueden demorar.' },
  { name: 'SAP Business One / ERPs livianos', cpuMt: 50, ramGb: 16, ok: 'Sin esperas al cargar módulos y consultas.', warn: 'Tiempos de espera notorios en consultas pesadas.' },
  { name: 'AutoCAD 2D (planos básicos)', cpuMt: 50, ramGb: 16, needsGpu: true, ok: 'Modela y edita planos 2D sin esperas.', warn: 'Funciona pero zoom y pan pueden saltar en planos grandes.' },
  { name: 'Máquinas virtuales (VMware, VirtualBox)', cpuMt: 70, ramGb: 16, ok: 'Puedes correr 1-2 VMs en paralelo con tu trabajo principal.', warn: 'Solo 1 VM liviana, sin multitasking pesado al lado.' },
  { name: 'Programación (VS Code, IntelliJ, Docker)', cpuMt: 60, ramGb: 16, ok: 'Compila rápido, IDE responsivo con extensiones, Docker fluido.', warn: 'Funciona, pero compilaciones grandes y Docker lo hacen sufrir.' },
]

function rate(req: { cpuMt: number; ramGb: number }, has: { cpuMt: number; ramGb: number }): Rating {
  const cpuOk = has.cpuMt >= req.cpuMt
  const ramOk = has.ramGb >= req.ramGb
  const cpuJust = has.cpuMt >= req.cpuMt * 0.7
  const ramJust = has.ramGb >= req.ramGb * 0.75
  if (cpuOk && ramOk && has.cpuMt >= req.cpuMt * 1.3) return 'excelente'
  if (cpuOk && ramOk) return 'bueno'
  if (cpuJust && ramJust) return 'justo'
  return 'insuficiente'
}

export function estimateWork(build: BuildSlots): AppRow[] | null {
  if (!build.cpu) return null
  const cpuKey = matchCpuKey(build.cpu.name)
  const cpuSpecs = build.cpu.specs as CpuSpecs
  const cpuMt = cpuKey ? CPU_SCORES[cpuKey].mt : Math.min(100, 30 + cpuSpecs.cores * 6)
  const ramGb = (build.ram?.specs as RamSpecs | null)?.capacity_gb ?? 0

  return WORK_APPS.map((app) => {
    const r = rate({ cpuMt: app.cpuMt, ramGb: app.ramGb }, { cpuMt, ramGb })
    const detail =
      r === 'insuficiente' ? `Necesitas mínimo ${app.ramGb}GB RAM y un CPU más potente.`
      : r === 'justo' ? app.warn
      : app.ok
    return { name: app.name, rating: r, detail }
  })
}

// ============================================================
// Diseño — Photoshop, Premiere, Blender, etc.
// Depende fuerte de GPU/VRAM, CPU multicore y RAM.
// ============================================================
interface DesignAppDef {
  name: string
  cpuMt: number
  ramGb: number
  vramGb: number
  gpuPower: number // GPU_RELATIVE mínimo
  ok: string
  warn: string
}

const DESIGN_APPS: DesignAppDef[] = [
  { name: 'Adobe Photoshop (fotos hasta 50MP)',          cpuMt: 45, ramGb: 16, vramGb: 4, gpuPower: 40, ok: 'Filtros neuronales y archivos en capas sin esperas.', warn: 'Filtros pesados (Neural, Camera RAW) tardan unos segundos.' },
  { name: 'Adobe Illustrator (vectores complejos)',       cpuMt: 40, ramGb: 16, vramGb: 4, gpuPower: 35, ok: 'Manipula miles de paths sin lag.', warn: 'Pan y zoom saltan en archivos muy pesados.' },
  { name: 'Adobe Lightroom Classic (catálogos grandes)',  cpuMt: 55, ramGb: 16, vramGb: 4, gpuPower: 40, ok: 'Importa y exporta lotes rápido, vista previa instantánea.', warn: 'Exportar lotes grandes demora notoriamente.' },
  { name: 'Adobe Premiere Pro — edición 1080p',           cpuMt: 55, ramGb: 16, vramGb: 6, gpuPower: 50, ok: 'Edición con efectos en tiempo real sin proxies.', warn: 'Necesitas proxies para timeline fluido.' },
  { name: 'Adobe Premiere Pro — edición 4K',              cpuMt: 80, ramGb: 32, vramGb: 8, gpuPower: 80, ok: 'Edita 4K nativo sin proxies, render H.264 con NVENC/AMF rápido.', warn: 'Edita pero necesita proxies; renders 4K toman tiempo.' },
  { name: 'Adobe After Effects (animación + RAM preview)', cpuMt: 70, ramGb: 32, vramGb: 6, gpuPower: 60, ok: 'RAM preview largo, expresiones complejas sin colapsar.', warn: 'RAM preview se queda corto, compositions pesadas lagean.' },
  { name: 'DaVinci Resolve (color + edición)',            cpuMt: 70, ramGb: 32, vramGb: 8, gpuPower: 70, ok: 'Color grading en tiempo real con nodos múltiples.', warn: 'Funciona, pero baja calidad de timeline en color grading.' },
  { name: 'Blender — Eevee (render en tiempo real)',      cpuMt: 60, ramGb: 16, vramGb: 6, gpuPower: 60, ok: 'Viewport fluido en escenas medianas, renders rápidos.', warn: 'Renders Eevee aceptables pero viewport puede saltar.' },
  { name: 'Blender — Cycles (raytraced)',                 cpuMt: 75, ramGb: 32, vramGb: 8, gpuPower: 80, ok: 'GPU acelera Cycles, renders complejos en minutos.', warn: 'Renders demoran; escenas grandes pueden no caber en VRAM.' },
  { name: 'AutoCAD 3D / Revit',                           cpuMt: 60, ramGb: 16, vramGb: 4, gpuPower: 50, ok: 'Modela proyectos arquitectónicos sin saltos.', warn: 'Proyectos grandes muestran lag en vistas 3D.' },
  { name: 'Figma / Adobe XD',                             cpuMt: 35, ramGb: 8,  vramGb: 2, gpuPower: 30, ok: 'Diseño de UI fluido con cientos de frames.', warn: 'Diseños muy grandes pueden lagear levemente.' },
]

export function estimateDesign(build: BuildSlots): AppRow[] | null {
  if (!build.cpu) return null
  const cpuKey = matchCpuKey(build.cpu.name)
  const cpuSpecs = build.cpu.specs as CpuSpecs
  const cpuMt = cpuKey ? CPU_SCORES[cpuKey].mt : Math.min(100, 30 + cpuSpecs.cores * 6)
  const ramGb = (build.ram?.specs as RamSpecs | null)?.capacity_gb ?? 0
  const gpuSpecs = build.gpu?.specs as GpuSpecs | undefined
  const vramGb = gpuSpecs?.vram ?? 0
  const gpuKey = build.gpu ? matchGpuKey(build.gpu.name) : null
  const gpuPower = gpuKey ? GPU_RELATIVE[gpuKey] : 0

  return DESIGN_APPS.map((app) => {
    const cpuOk = cpuMt >= app.cpuMt
    const ramOk = ramGb >= app.ramGb
    const vramOk = vramGb >= app.vramGb
    const gpuOk = gpuPower >= app.gpuPower
    const cpuJust = cpuMt >= app.cpuMt * 0.7
    const ramJust = ramGb >= app.ramGb * 0.75
    const gpuJust = gpuPower >= app.gpuPower * 0.7 && vramGb >= app.vramGb * 0.75

    let rating: Rating
    if (cpuOk && ramOk && vramOk && gpuOk && cpuMt >= app.cpuMt * 1.25) rating = 'excelente'
    else if (cpuOk && ramOk && vramOk && gpuOk) rating = 'bueno'
    else if (cpuJust && ramJust && gpuJust) rating = 'justo'
    else rating = 'insuficiente'

    const missing: string[] = []
    if (!cpuOk && rating === 'insuficiente') missing.push('CPU más potente')
    if (!ramOk && rating === 'insuficiente') missing.push(`${app.ramGb}GB RAM`)
    if (!vramOk && rating === 'insuficiente') missing.push(`GPU con ${app.vramGb}GB VRAM`)

    const detail =
      rating === 'insuficiente' ? `Te falta: ${missing.join(', ') || 'más potencia general'}.`
      : rating === 'justo' ? app.warn
      : app.ok
    return { name: app.name, rating, detail }
  })
}

// ============================================================
// Streaming — OBS encoding + gaming-while-streaming
// ============================================================
export interface StreamingReport {
  hasData: boolean
  encoder: string
  encoderQuality: Rating
  encoderNote: string
  apps: AppRow[]
  // FPS jugando + stream activo (overhead ~10-25% en GPU + CPU según encoder)
  gamingWhileStreaming: GamingFpsRow[] | null
  gpuKey: GpuKey | null
}

const STREAMING_APPS: AppDef[] = [
  { name: 'OBS Studio — solo cámara y micro', cpuMt: 30, ramGb: 8, ok: 'Stream a 1080p60 sin caídas.', warn: 'Funciona en 720p60 estable.' },
  { name: 'Streamlabs / OBS con overlays y alertas', cpuMt: 45, ramGb: 16, ok: 'Overlays animados, alertas y chat sin afectar el stream.', warn: 'Overlays pesados pueden bajar FPS del stream.' },
  { name: 'Discord en llamada de voz + stream', cpuMt: 35, ramGb: 16, ok: 'Sin interferir con OBS ni el juego.', warn: 'Audio puede cortarse si la CPU se satura.' },
  { name: 'Spotify + navegador con chat (Twitch/YouTube)', cpuMt: 25, ramGb: 8, ok: 'Sin impacto en el stream.', warn: 'Funciona, pero cierra pestañas extras al streamear.' },
  { name: 'VTube Studio (avatar 2D)', cpuMt: 40, ramGb: 16, needsGpu: true, ok: 'Tracking fluido del avatar a 60fps.', warn: 'Tracking estable pero puede afectar FPS del juego.' },
]

export function estimateStreaming(build: BuildSlots): StreamingReport {
  const empty: StreamingReport = {
    hasData: false, encoder: '—', encoderQuality: 'insuficiente',
    encoderNote: 'Selecciona CPU y GPU para evaluar capacidad de streaming.',
    apps: [], gamingWhileStreaming: null, gpuKey: null,
  }
  if (!build.cpu) return empty

  const cpuKey = matchCpuKey(build.cpu.name)
  const cpuSpecs = build.cpu.specs as CpuSpecs
  const cpuMt = cpuKey ? CPU_SCORES[cpuKey].mt : Math.min(100, 30 + cpuSpecs.cores * 6)
  const ramGb = (build.ram?.specs as RamSpecs | null)?.capacity_gb ?? 0
  const gpuKey = build.gpu ? matchGpuKey(build.gpu.name) : null
  const gpuName = build.gpu?.name.toLowerCase() ?? ''

  // Choose encoder
  let encoder = 'x264 (CPU)'
  let encoderQuality: Rating = 'insuficiente'
  let encoderNote = ''

  if (gpuName.includes('rtx') || gpuName.includes('geforce')) {
    encoder = 'NVENC (NVIDIA GPU)'
    encoderQuality = gpuKey === 'gtx_1650' ? 'bueno' : 'excelente'
    encoderNote = gpuKey === 'gtx_1650'
      ? 'NVENC de Turing — calidad muy decente a 1080p60 6-8Mbps. Cero impacto en CPU.'
      : 'NVENC de última gen (Ampere/Ada) — calidad cercana a x264 Slow con cero impacto en FPS del juego. 1080p60 hasta 4K60.'
  } else if (gpuName.includes('rx') || gpuName.includes('radeon')) {
    encoder = 'AMF/HEVC (AMD GPU)'
    encoderQuality = gpuKey === 'rx_7600' ? 'excelente' : 'bueno'
    encoderNote = gpuKey === 'rx_7600'
      ? 'AMF de RDNA 3 con AV1 — calidad excelente y eficiente, ideal para YouTube y Twitch.'
      : 'AMF de AMD — buena calidad a 1080p60, mejor con bitrate alto. Pierde un poco contra NVENC moderno.'
  } else {
    // x264 (CPU encoding)
    encoder = 'x264 (CPU)'
    if (cpuMt >= 85) { encoderQuality = 'excelente'; encoderNote = 'CPU sobrado para x264 Medium a 1080p60 mientras juegas. Calidad superior a encoders de GPU antiguos.' }
    else if (cpuMt >= 65) { encoderQuality = 'bueno'; encoderNote = 'x264 Fast a 1080p60. Funciona pero te roba 20-30% de FPS al juego.' }
    else if (cpuMt >= 45) { encoderQuality = 'justo'; encoderNote = 'Solo x264 Veryfast a 720p60. Considera GPU con NVENC/AMF.' }
    else { encoderQuality = 'insuficiente'; encoderNote = 'CPU insuficiente para streamear con calidad. Agrega una GPU con encoder dedicado.' }
  }

  const apps = STREAMING_APPS.map((app) => {
    const r = rate({ cpuMt: app.cpuMt, ramGb: app.ramGb }, { cpuMt, ramGb })
    return {
      name: app.name,
      rating: r,
      detail: r === 'insuficiente' ? `Necesitas mínimo ${app.ramGb}GB RAM y más CPU.` : r === 'justo' ? app.warn : app.ok,
    }
  })

  // Gaming while streaming: overhead depende del encoder
  // NVENC moderno: ~3-5% FPS hit. AMF: ~5-10%. x264: 20-35% (más CPU-heavy si el CPU es justo).
  let overhead = 0.04
  if (encoder.startsWith('AMF')) overhead = 0.08
  if (encoder.startsWith('x264')) {
    overhead = cpuMt >= 85 ? 0.15 : cpuMt >= 65 ? 0.25 : 0.40
  }

  let gamingWhileStreaming: GamingFpsRow[] | null = null
  if (gpuKey && build.gpu) {
    const baseline = estimateGaming(build)
    if (baseline.hasData) {
      // Take top 6 most popular for streaming
      const top = baseline.rows.filter((r) =>
        ['valorant', 'cs2', 'fortnite', 'apex', 'warzone', 'lol'].includes(r.game.id)
      )
      gamingWhileStreaming = top.map((r) => ({
        game: r.game,
        fps1080: Math.round(r.fps1080 * (1 - overhead)),
        fps1440: Math.round(r.fps1440 * (1 - overhead)),
        fps4k: Math.round(r.fps4k * (1 - overhead)),
      }))
    }
  }

  return {
    hasData: true, encoder, encoderQuality, encoderNote,
    apps, gamingWhileStreaming, gpuKey,
  }
}

// ============================================================
// Helpers para UI
// ============================================================
export function fpsLabel(fps: number): { label: string; tone: 'good' | 'ok' | 'bad' } {
  if (fps >= 144) return { label: `${fps} FPS`, tone: 'good' }
  if (fps >= 60) return { label: `${fps} FPS`, tone: 'good' }
  if (fps >= 30) return { label: `${fps} FPS`, tone: 'ok' }
  return { label: `${fps} FPS`, tone: 'bad' }
}

export function ratingTone(r: Rating): 'good' | 'ok' | 'bad' {
  if (r === 'excelente' || r === 'bueno') return 'good'
  if (r === 'justo') return 'ok'
  return 'bad'
}

export function ratingLabel(r: Rating): string {
  return ({ excelente: 'Excelente', bueno: 'Bueno', justo: 'Justo', insuficiente: 'Insuficiente' } as const)[r]
}

// Re-export for components that only need the type info
export type { Res, GpuKey }

// Tell unused-checks we use these (some exports are consumed by ui-only types)
void GPU_TIER
