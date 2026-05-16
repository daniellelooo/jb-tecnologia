import Link from 'next/link'
import Image from 'next/image'
import type { Product, ProductImage } from '@/types'
import { PriceDisplay } from './price-display'
import { getPrimaryImage, wixCdnUrl } from '@/lib/product-image'

interface ProductCardProps {
  product: Product & { product_images?: Pick<ProductImage, 'storage_url' | 'is_primary' | 'display_order' | 'alt_text'>[] | null }
  categorySlug?: string
}

export function ProductCard({ product, categorySlug = 'tienda' }: ProductCardProps) {
  const href = `/tienda/${categorySlug}/${product.slug}`
  const isNew = product.tags?.includes('nuevo')
  const isOffer = product.tags?.includes('oferta') || (product.compare_price && product.compare_price > product.price)
  const stockLow = product.stock > 0 && product.stock < 5
  const soldOut = product.stock === 0
  const primaryImage = wixCdnUrl(getPrimaryImage(product), 800, 800)

  return (
    <Link
      href={href}
      className="group relative block focus:outline-none"
    >
      {/* Double-bezel outer shell */}
      <div className="rounded-[1.75rem] p-1.5 bg-white/[0.04] hover:bg-white/[0.08] transition-colors duration-500 ease-premium">
        <article className="rounded-[1.4rem] bg-neutral-900 overflow-hidden ring-1 ring-white/[0.08]">
          {/* Image */}
          <div className="relative aspect-square bg-mpc-fog overflow-hidden">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                className="object-contain p-6 transition-transform duration-700 ease-premium group-hover:scale-[1.04]"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-mpc-fog via-mpc-mist to-mpc-fog">
                <svg className="h-20 w-20 text-mpc-silver" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                  <path d="M3 21V3l9 11L21 3v18" strokeLinecap="square" />
                </svg>
                <span className="mt-2 text-[9px] uppercase tracking-[0.25em] text-mpc-silver font-bold">JB Tecnología MED</span>
              </div>
            )}

            {/* Top-left badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
              {isNew && (
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] bg-neutral-900 text-white px-2 py-1 rounded-full">
                  Nuevo
                </span>
              )}
              {isOffer && (
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] bg-neutral-900 text-white px-2 py-1 rounded-full ring-1 ring-white/15">
                  Oferta
                </span>
              )}
            </div>

            {/* Top-right stock badge */}
            <div className="absolute top-3 right-3">
              {soldOut && (
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] bg-mpc-charcoal/90 backdrop-blur text-white px-2 py-1 rounded-full">
                  Agotado
                </span>
              )}
              {stockLow && (
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] bg-white/80 backdrop-blur text-white px-2 py-1 rounded-full ring-1 ring-white/15">
                  {product.stock} disp.
                </span>
              )}
            </div>
          </div>

          {/* Body */}
          <div className="px-5 pt-4 pb-5">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-mpc-graphite mb-1.5">
              {product.brand}
            </div>
            <h3 className="font-semibold text-[15px] leading-snug min-h-[2.5rem] line-clamp-2 group-hover:underline underline-offset-4 decoration-1">
              {product.name}
            </h3>
            {product.short_description && (
              <p className="text-xs text-mpc-graphite line-clamp-2 mt-2 min-h-[2rem]">
                {product.short_description}
              </p>
            )}
            <div className="flex items-end justify-between mt-4">
              <PriceDisplay
                price={Number(product.price)}
                comparePrice={product.compare_price ? Number(product.compare_price) : null}
                size="md"
              />
              <span className="h-9 w-9 rounded-full bg-neutral-900 text-white flex items-center justify-center transition-all duration-500 ease-premium group-hover:translate-x-0.5 group-hover:scale-105">
                <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </div>
        </article>
      </div>
    </Link>
  )
}
