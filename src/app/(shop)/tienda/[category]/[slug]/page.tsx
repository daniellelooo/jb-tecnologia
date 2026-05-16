import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { ArrowRight, ShieldCheck, Truck, Wrench } from 'lucide-react'
import { getProductBySlug, getRelatedProducts } from '@/lib/queries/products'
import { PriceDisplay } from '@/components/shop/price-display'
import { SpecsTable } from '@/components/shop/specs-table'
import { ProductCard } from '@/components/shop/product-card'
import { AddToCartButton } from '@/components/shop/add-to-cart-button'
import { WhatsAppButton } from '@/components/shop/whatsapp-button'
import { buildWhatsAppProductMessage } from '@/lib/whatsapp'
import { getAllImages, wixCdnUrl } from '@/lib/product-image'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ category: string; slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Producto no encontrado' }

  return {
    title: product.name,
    description: product.short_description || product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.short_description,
      type: 'website',
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { category, slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const supabase = await createClient()
  const { data: categoryData } = await supabase
    .from('categories')
    .select('name, slug, parent_id')
    .eq('id', product.category_id)
    .maybeSingle()

  const related = await getRelatedProducts(product, 4)
  const images = getAllImages(product)
  const hero = images[0]
  const heroUrl = wixCdnUrl(hero?.url, 1200, 1200)

  const stockLow = product.stock > 0 && product.stock < 5
  const soldOut = product.stock === 0

  return (
    <div className="container mx-auto px-4 pt-8 lg:pt-12 pb-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-mpc-graphite mb-10 flex-wrap">
        <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
        <span className="text-mpc-silver">/</span>
        <Link href="/tienda" className="hover:text-foreground transition-colors">Tienda</Link>
        {categoryData && (
          <>
            <span className="text-mpc-silver">/</span>
            <Link href={`/tienda?categoria=${categoryData.slug}`} className="hover:text-foreground transition-colors">{categoryData.name}</Link>
          </>
        )}
        <span className="text-mpc-silver">/</span>
        <span className="text-foreground line-clamp-1">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-16 mb-24">
        {/* ===== Gallery (Z-axis cascade) ===== */}
        <div className="space-y-3">
          <div className="rounded-[2rem] p-2 bg-white/[0.04]">
            <div className="rounded-[1.625rem] bg-mpc-fog overflow-hidden aspect-square relative">
              {heroUrl ? (
                <Image
                  src={heroUrl}
                  alt={hero?.alt ?? product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 600px"
                  className="object-contain p-10"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-mpc-fog via-mpc-mist to-mpc-fog">
                  <svg className="h-40 w-40 text-mpc-silver" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
                    <path d="M3 21V3l9 11L21 3v18" strokeLinecap="square" />
                  </svg>
                  <span className="mt-4 text-xs uppercase tracking-[0.25em] text-mpc-silver font-bold">JB Tecnología MED</span>
                </div>
              )}
              {product.is_featured && (
                <div className="absolute top-5 left-5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-neutral-900 text-white px-2.5 py-1 rounded-full">Destacado</span>
                </div>
              )}
            </div>
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.slice(0, 4).map((img, i) => (
                <div key={i} className="rounded-2xl p-1 bg-white/[0.04]">
                  <div className="rounded-xl bg-mpc-fog overflow-hidden aspect-square relative">
                    <Image
                      src={wixCdnUrl(img.url, 400, 400) ?? img.url}
                      alt={img.alt}
                      fill
                      sizes="160px"
                      className="object-contain p-3"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== Info panel ===== */}
        <div className="lg:sticky lg:top-24 lg:self-start space-y-7">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mpc-graphite mb-3">
              {product.brand}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-display leading-[1.05]">
              {product.name}
            </h1>
            <div className="text-[11px] text-mpc-graphite mt-3 font-mono">
              SKU: {product.sku}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {soldOut ? (
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-mpc-charcoal text-white px-2.5 py-1.5 rounded-full">Agotado</span>
            ) : stockLow ? (
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-neutral-900 ring-1 ring-black/15 text-foreground px-2.5 py-1.5 rounded-full">
                Últimas {product.stock} unidades
              </span>
            ) : (
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-neutral-900 text-white px-2.5 py-1.5 rounded-full">En stock</span>
            )}
            {product.is_featured && (
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-black/[0.05] text-foreground px-2.5 py-1.5 rounded-full">Destacado</span>
            )}
          </div>

          <PriceDisplay
            price={Number(product.price)}
            comparePrice={product.compare_price ? Number(product.compare_price) : null}
            size="xl"
          />

          {product.short_description && (
            <p className="text-mpc-graphite leading-relaxed text-base max-w-md">{product.short_description}</p>
          )}

          <div className="space-y-3 pt-2">
            <AddToCartButton product={product} categorySlug={category} />
            <WhatsAppButton
              message={buildWhatsAppProductMessage(product)}
              variant="outline"
              size="lg"
              className="w-full rounded-full border-white/15"
            />
          </div>

          {/* Trust strip */}
          <div className="grid grid-cols-3 gap-2 pt-4">
            {[
              { icon: ShieldCheck, label: 'Garantía MPC' },
              { icon: Truck, label: 'Domicilio Medellín' },
              { icon: Wrench, label: 'Soporte técnico' },
            ].map((t) => {
              const Icon = t.icon
              return (
                <div key={t.label} className="rounded-xl bg-white/[0.04] px-3 py-2.5 flex items-start gap-2">
                  <Icon className="h-3.5 w-3.5 mt-0.5 text-foreground" strokeWidth={1.5} />
                  <span className="text-[11px] font-medium leading-tight">{t.label}</span>
                </div>
              )
            })}
          </div>

          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-2">
              {product.tags.map((t) => (
                <Link
                  key={t}
                  href={`/tienda?tag=${t}`}
                  className="text-[11px] bg-white/[0.04] hover:bg-white/[0.08] px-2.5 py-1 rounded-full text-mpc-graphite transition-colors duration-300"
                >
                  #{t}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===== Description + Specs ===== */}
      <section className="grid lg:grid-cols-[1.4fr_1fr] gap-12 lg:gap-20 mb-24 pt-8 border-t border-white/[0.08]">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mpc-graphite mb-4">Descripción</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-display leading-tight mb-6">Sobre este producto</h2>
          <div className="space-y-4 text-foreground/85 leading-relaxed text-[15px] max-w-prose">
            {product.description.split('\n').filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mpc-graphite mb-4">Especificaciones</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-display leading-tight mb-6">Detalle técnico</h2>
          <SpecsTable product={product} />
        </div>
      </section>

      {/* ===== Related ===== */}
      {related.length > 0 && (
        <section className="pt-8 border-t border-white/[0.08]">
          <div className="flex items-end justify-between flex-wrap gap-4 mb-10">
            <h2 className="text-3xl md:text-5xl font-bold tracking-display">Productos relacionados</h2>
            {categoryData && (
              <Link href={`/tienda?categoria=${categoryData.slug}`} className="text-sm font-medium hover:underline underline-offset-4 inline-flex items-center gap-1.5">
                Ver más en {categoryData.name} <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} categorySlug={category} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
