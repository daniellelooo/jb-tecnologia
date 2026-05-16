import type { Database } from './database'

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Core entity types
export type Product = Tables<'products'>
export type Category = Tables<'categories'>
export type ComponentSlot = Tables<'component_slots'>
export type ProductImage = Tables<'product_images'>
export type PcBuild = Tables<'pc_builds'>
export type Cart = Tables<'carts'>
export type CartItem = Tables<'cart_items'>
export type Order = Tables<'orders'>
export type OrderItem = Tables<'order_items'>
export type OrderStatusHistory = Tables<'order_status_history'>

// ============================================================
// Typed specs for each component slot
// ============================================================
export interface CpuSpecs {
  socket: string
  cores: number
  threads: number
  base_clock: string
  boost_clock: string
  tdp: number
  ram_type: string[]
  architecture?: string
  cache_l3?: string
}

export interface MotherboardSpecs {
  socket: string
  form_factor: 'ATX' | 'Micro-ATX' | 'Mini-ITX'
  ram_slots: number
  ram_type: string[]
  max_ram: number
  chipset: string
  m2_slots?: number
  pcie_version?: string
  wifi?: string
}

export interface RamSpecs {
  capacity_gb: number
  speed_mhz: number
  ram_type: string
  kit_pieces: number
  cas_latency?: string
  voltage?: number
  xmp?: string
  expo?: boolean
}

export interface StorageSpecs {
  capacity_gb: number
  type: 'NVMe' | 'SSD' | 'HDD'
  interface: string
  read_speed?: number
  write_speed?: number
  form_factor?: string
  tbw?: number | null
  rpm?: number
}

export interface GpuSpecs {
  vram: number
  tdp: number
  pcie_version: string
  architecture?: string
  shader_units?: number
  memory_type?: string
  boost_clock?: string
}

export interface PsuSpecs {
  wattage: number
  certification: string
  modular: boolean | 'semi'
  form_factor?: string
  fan_size?: number
  fan_less?: boolean
  protections?: string[]
}

export interface CaseSpecs {
  form_factor: 'ATX' | 'Micro-ATX' | 'Mini-ITX'
  max_gpu_length?: number
  has_rgb: boolean
  side_panel?: string
  fan_slots?: number
  drive_bays_35?: number
}

export interface CoolingSpecs {
  type: 'air' | 'aio'
  socket_support: string[]
  tdp_support: number
  height_mm?: number
  fan_size?: number
  radiator_size?: string
  fan_count?: number
  rgb?: boolean
  heatpipes?: number
}

// ============================================================
// Compatibility engine types
// ============================================================
export interface CompatibilityIssue {
  severity: 'error' | 'warning'
  slot: string
  message: string
}

// ============================================================
// Configurator store types
// ============================================================
export type SlotKey = 'cpu' | 'motherboard' | 'ram' | 'storage' | 'gpu' | 'psu' | 'case' | 'cooling'

export interface BuildSlots {
  cpu: Product | null
  motherboard: Product | null
  ram: Product | null
  storage: Product | null
  gpu: Product | null
  psu: Product | null
  case: Product | null
  cooling: Product | null
}

// ============================================================
// Enriched types (joins)
// ============================================================
export type ProductWithImages = Product & {
  product_images: Pick<ProductImage, 'storage_url' | 'is_primary' | 'alt_text' | 'display_order'>[]
}

export type ProductWithCategory = Product & {
  categories: Pick<Category, 'name' | 'slug'>
}

export type OrderWithItems = Order & {
  order_items: (OrderItem & { products: Pick<Product, 'name' | 'slug'> | null })[]
}

// ============================================================
// Cart store types
// ============================================================
export interface CartLineItem {
  id: string
  product: Product
  quantity: number
  priceAtAdd: number
  buildId?: string
}

// ============================================================
// Checkout form types
// ============================================================
export type DeliveryType = 'retiro_en_tienda' | 'domicilio_medellin'
export type PaymentMethod = 'efectivo_en_tienda' | 'transferencia' | 'nequi' | 'daviplata' | 'contraentrega'
export type OrderStatus = 'pendiente' | 'confirmado' | 'en_preparacion' | 'listo_para_retiro' | 'enviado' | 'entregado' | 'cancelado'

export interface CheckoutFormData {
  customerName: string
  customerPhone: string
  customerEmail?: string
  customerIdNumber?: string
  deliveryType: DeliveryType
  deliveryAddress?: string
  deliveryNeighborhood?: string
  storeLocation?: string
  paymentMethod: PaymentMethod
  notes?: string
}

// ============================================================
// Store locations
// ============================================================
export const STORE_LOCATIONS = [
  'Local 1 — Centro Comercial Monterrey, Piso 1',
  'Local 2 — Centro Comercial Monterrey, Piso 1',
  'Local 3 — Centro Comercial Monterrey, Piso 2',
  'Local 4 — Centro Comercial Monterrey, Piso 2',
] as const

export type StoreLocation = typeof STORE_LOCATIONS[number]

// ============================================================
// COP price formatting
// ============================================================
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}
