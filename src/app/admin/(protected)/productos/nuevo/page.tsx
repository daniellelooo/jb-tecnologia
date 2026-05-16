import { ProductForm } from '@/components/admin/product-form'
import { getCategories, getComponentSlots } from '@/lib/queries/products'

export const dynamic = 'force-dynamic'

export default async function NewProductPage() {
  const [categories, slots] = await Promise.all([getCategories(), getComponentSlots()])
  return <ProductForm categories={categories} componentSlots={slots} />
}
