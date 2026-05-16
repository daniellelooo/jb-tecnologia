import { createClient } from '@/lib/supabase/server'
import type { Product, SlotKey } from '@/types'
import { getComponentSlots } from './products'

export async function getComponentsForAllSlots(): Promise<Record<SlotKey, Product[]>> {
  const supabase = await createClient()
  const slots = await getComponentSlots()
  const slotIdToSlug = new Map(slots.map((s) => [s.id, s.slug as SlotKey]))

  const { data } = await supabase
    .from('products')
    .select('*, product_images(storage_url, is_primary, display_order, alt_text)')
    .eq('is_active', true)
    .not('component_slot_id', 'is', null)
    .order('price', { ascending: true })

  const result: Record<SlotKey, Product[]> = {
    cpu: [],
    motherboard: [],
    ram: [],
    storage: [],
    gpu: [],
    psu: [],
    case: [],
    cooling: [],
  }

  for (const product of data ?? []) {
    if (!product.component_slot_id) continue
    const key = slotIdToSlug.get(product.component_slot_id)
    if (key && key in result) result[key].push(product)
  }

  return result
}
