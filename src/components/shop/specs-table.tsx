import type { Product } from '@/types'

const SPEC_LABELS: Record<string, string> = {
  socket: 'Socket', cores: 'Núcleos', threads: 'Hilos', base_clock: 'Frec. base', boost_clock: 'Frec. turbo', tdp: 'TDP',
  ram_type: 'Tipo de RAM', architecture: 'Arquitectura', cache_l3: 'Caché L3',
  form_factor: 'Formato', ram_slots: 'Slots RAM', max_ram: 'RAM máx.', chipset: 'Chipset',
  m2_slots: 'Ranuras M.2', pcie_version: 'PCIe', wifi: 'WiFi',
  capacity_gb: 'Capacidad', speed_mhz: 'Velocidad', kit_pieces: 'Módulos', cas_latency: 'CAS', voltage: 'Voltaje',
  xmp: 'XMP', expo: 'EXPO',
  type: 'Tipo', interface: 'Interfaz', read_speed: 'Lectura', write_speed: 'Escritura', rpm: 'RPM', tbw: 'TBW',
  vram: 'VRAM', shader_units: 'Shaders', memory_type: 'Memoria',
  wattage: 'Potencia', certification: 'Cert.', modular: 'Modular', fan_size: 'Ventilador', fan_count: 'Ventiladores', fan_less: 'Fanless', protections: 'Protecciones',
  max_gpu_length: 'GPU máx.', has_rgb: 'RGB', side_panel: 'Panel', fan_slots: 'Slots fan', drive_bays_35: 'Bahías 3.5"',
  socket_support: 'Sockets', tdp_support: 'TDP soportado', height_mm: 'Altura', radiator_size: 'Radiador', heatpipes: 'Heatpipes', rgb: 'RGB',
  cpu: 'Procesador', gpu: 'GPU', ram: 'RAM', storage: 'Almacenamiento', os: 'Sistema', case: 'Gabinete', psu: 'Fuente', cooler: 'Cooler',
  display: 'Pantalla', battery: 'Batería', weight_kg: 'Peso',
  resolution: 'Resolución', fps: 'FPS', fov: 'FOV', autofocus: 'Autofocus', mic: 'Micrófono', usb: 'USB', compatibility: 'Compatibilidad',
  dpi: 'DPI', buttons: 'Botones', weight_g: 'Peso', battery_hours: 'Batería', polling_rate: 'Polling', layout: 'Layout', switches: 'Switches', connection: 'Conexión',
  wrist_rest: 'Reposamuñecas', anti_ghosting: 'Anti-ghosting',
  surround: 'Surround', driver_size: 'Driver', frequency: 'Frecuencia', mic_detachable: 'Mic desmontable',
  size: 'Tamaño', thickness_mm: 'Grosor', surface: 'Superficie', base: 'Base', stitched_edges: 'Bordes cosidos',
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Sí' : 'No'
  if (Array.isArray(value)) return value.join(' · ')
  if (typeof value === 'number') return value.toLocaleString('es-CO')
  return String(value)
}

interface SpecsTableProps {
  product: Product
}

export function SpecsTable({ product }: SpecsTableProps) {
  const specs = (product.specs as Record<string, unknown>) ?? {}
  const entries = Object.entries(specs)

  if (entries.length === 0) {
    return <p className="text-sm text-mpc-graphite">Sin especificaciones detalladas.</p>
  }

  return (
    <div className="rounded-[1.5rem] p-1.5 bg-white/[0.04]">
      <div className="rounded-[1.25rem] bg-neutral-900 ring-1 ring-white/[0.08] overflow-hidden">
        <dl className="divide-y divide-black/[0.06]">
          {entries.map(([key, value]) => (
            <div key={key} className="grid grid-cols-[1fr_1.4fr] gap-4 py-3 px-5">
              <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-mpc-graphite">
                {SPEC_LABELS[key] ?? key.replace(/_/g, ' ')}
              </dt>
              <dd className="text-sm text-foreground">{formatValue(value)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
