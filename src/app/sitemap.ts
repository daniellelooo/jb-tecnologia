import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://jbtecnologiamed.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createAdminClient()

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from('products').select('slug, updated_at, category_id, categories(slug)').eq('is_active', true),
    supabase.from('categories').select('slug').eq('is_active', true).is('parent_id', null),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/tienda`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/configurador`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
  ]

  const categoryRoutes: MetadataRoute.Sitemap = (categories ?? []).map((c) => ({
    url: `${SITE_URL}/${c.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const productRoutes: MetadataRoute.Sitemap = (products ?? []).map((p) => {
    const catSlug = (p.categories as unknown as { slug: string } | null)?.slug ?? 'tienda'
    return {
      url: `${SITE_URL}/tienda/${catSlug}/${p.slug}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: 'weekly',
      priority: 0.6,
    }
  })

  return [...staticRoutes, ...categoryRoutes, ...productRoutes]
}
