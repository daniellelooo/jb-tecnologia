import { notFound } from 'next/navigation'
import { ProductForm } from '@/components/admin/product-form'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCategories, getComponentSlots } from '@/lib/queries/products'

export const dynamic = 'force-dynamic'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()
  const { data: product } = await supabase.from('products').select('*').eq('id', id).maybeSingle()
  if (!product) notFound()

  const [categories, slots, { data: images }] = await Promise.all([
    getCategories(),
    getComponentSlots(),
    supabase.from('product_images').select('id, storage_url, is_primary, display_order').eq('product_id', id).order('display_order'),
  ])
  return <ProductForm product={product} categories={categories} componentSlots={slots} images={images ?? []} />
}
