import { createClient } from '@/lib/supabase/server'
import type { Product, Category, ComponentSlot } from '@/types'

export interface CatalogFilters {
  category?: string
  componentSlot?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  tags?: string[]
  search?: string
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'featured'
  page?: number
  pageSize?: number
}

export interface CatalogResult {
  products: Product[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export async function getProducts(filters: CatalogFilters = {}): Promise<CatalogResult> {
  const supabase = await createClient()
  const page = filters.page ?? 1
  const pageSize = filters.pageSize ?? 24
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('products')
    .select('*, product_images(storage_url, is_primary, display_order, alt_text)', { count: 'exact' })
    .eq('is_active', true)

  if (filters.category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', filters.category)
      .maybeSingle()
    if (cat) {
      // Include products in subcategories when filtering by a parent category
      const { data: children } = await supabase
        .from('categories')
        .select('id')
        .eq('parent_id', cat.id)
      const ids = [cat.id, ...(children ?? []).map((c) => c.id)]
      query = query.in('category_id', ids)
    }
  }

  if (filters.componentSlot) {
    const { data: slot } = await supabase
      .from('component_slots')
      .select('id')
      .eq('slug', filters.componentSlot)
      .maybeSingle()
    if (slot) query = query.eq('component_slot_id', slot.id)
  }

  if (filters.brand) query = query.eq('brand', filters.brand)
  if (filters.minPrice !== undefined) query = query.gte('price', filters.minPrice)
  if (filters.maxPrice !== undefined) query = query.lte('price', filters.maxPrice)
  if (filters.tags?.length) query = query.overlaps('tags', filters.tags)
  if (filters.search) {
    const term = filters.search.replace(/[%_]/g, '\\$&')
    query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%,brand.ilike.%${term}%`)
  }

  switch (filters.sort) {
    case 'price_asc': query = query.order('price', { ascending: true }); break
    case 'price_desc': query = query.order('price', { ascending: false }); break
    case 'newest': query = query.order('created_at', { ascending: false }); break
    case 'featured': query = query.order('is_featured', { ascending: false }).order('created_at', { ascending: false }); break
    default: query = query.order('is_featured', { ascending: false }).order('stock', { ascending: false })
  }

  const { data, count } = await query.range(from, to)

  return {
    products: data ?? [],
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, product_images(storage_url, is_primary, display_order, alt_text)')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()
  return data
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, product_images(storage_url, is_primary, display_order, alt_text)')
    .eq('is_active', true)
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .limit(limit)
  return data ?? []
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, product_images(storage_url, is_primary, display_order, alt_text)')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('stock', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getDealProducts(limit = 8): Promise<Product[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('products')
    .select('*, product_images(storage_url, is_primary, display_order, alt_text)')
    .eq('is_active', true)
    .not('compare_price', 'is', null)
    .order('created_at', { ascending: false })
    .limit(limit)
  return data ?? []
}

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')
  return data ?? []
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle()
  return data
}

export async function getComponentSlots(): Promise<ComponentSlot[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('component_slots')
    .select('*')
    .order('display_order')
  return data ?? []
}

async function resolveCategoryIds(supabase: Awaited<ReturnType<typeof createClient>>, slug: string): Promise<string[] | null> {
  const { data: cat } = await supabase.from('categories').select('id').eq('slug', slug).maybeSingle()
  if (!cat) return null
  const { data: children } = await supabase.from('categories').select('id').eq('parent_id', cat.id)
  return [cat.id, ...(children ?? []).map((c) => c.id)]
}

export async function getBrandsForCategory(categorySlug?: string): Promise<string[]> {
  const supabase = await createClient()
  let query = supabase.from('products').select('brand').eq('is_active', true)
  if (categorySlug) {
    const ids = await resolveCategoryIds(supabase, categorySlug)
    if (ids) query = query.in('category_id', ids)
  }
  const { data } = await query
  return Array.from(new Set((data ?? []).map((r) => r.brand))).sort()
}

export async function getPriceRangeForCategory(categorySlug?: string): Promise<{ min: number; max: number }> {
  const supabase = await createClient()
  let query = supabase.from('products').select('price').eq('is_active', true)
  if (categorySlug) {
    const ids = await resolveCategoryIds(supabase, categorySlug)
    if (ids) query = query.in('category_id', ids)
  }
  const { data } = await query
  if (!data?.length) return { min: 0, max: 0 }
  const prices = data.map((d) => Number(d.price))
  return { min: Math.min(...prices), max: Math.max(...prices) }
}
