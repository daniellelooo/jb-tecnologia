import type { Product, ProductImage } from '@/types'

type ProductWithImagesLike = Product & {
  product_images?: Pick<ProductImage, 'storage_url' | 'is_primary' | 'display_order' | 'alt_text'>[] | null
}

// Wix CDN URLs work as-is. Authenticated transforms (`/v1/fill/...`) require
// a session token, so we serve the originals and let Next/Image handle resizing.
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function wixCdnUrl(url: string | undefined | null, w = 800, h = 800): string | undefined {
  if (!url) return undefined
  return url
}

export function getPrimaryImage(product: ProductWithImagesLike): string | undefined {
  const imgs = product.product_images ?? []
  if (imgs.length === 0) return undefined
  const sorted = [...imgs].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1
    if (!a.is_primary && b.is_primary) return 1
    return (a.display_order ?? 0) - (b.display_order ?? 0)
  })
  return sorted[0]?.storage_url
}

export function getAllImages(product: ProductWithImagesLike): Array<{ url: string; alt: string }> {
  const imgs = product.product_images ?? []
  return [...imgs]
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1
      if (!a.is_primary && b.is_primary) return 1
      return (a.display_order ?? 0) - (b.display_order ?? 0)
    })
    .map((img) => ({ url: img.storage_url, alt: img.alt_text ?? product.name }))
}
