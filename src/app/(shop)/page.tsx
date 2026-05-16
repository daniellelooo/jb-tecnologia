import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Cpu, Shield, Wrench, Truck, MessageCircle } from 'lucide-react'
import { getFeaturedProducts, getDealProducts } from '@/lib/queries/products'
import { ProductCard } from '@/components/shop/product-card'
import { getPrimaryImage, wixCdnUrl } from '@/lib/product-image'

export const revalidate = 3600

const BUILD_LINES = [
  { tier: 'Bronze', range: 'Entrada', priceFrom: '$2.800.000', accent: 'from-amber-700/30 to-stone-800' },
  { tier: 'Silver', range: 'Mid', priceFrom: '$4.200.000', accent: 'from-zinc-500/30 to-zinc-900' },
  { tier: 'Gold', range: 'Premium', priceFrom: '$6.800.000', accent: 'from-yellow-700/30 to-stone-900' },
  { tier: 'Ruby', range: 'Gaming', priceFrom: '$5.900.000', accent: 'from-red-900/40 to-stone-900' },
]

export default async function HomePage() {
  const [featured, deals] = await Promise.all([
    getFeaturedProducts(6),
    getDealProducts(4),
  ])

  const heroImage = wixCdnUrl(getPrimaryImage(featured[0] ?? deals[0] ?? { product_images: [] } as never), 1400, 1400)

  return (
    <>
      {/* ========= HERO — Editorial Split ========= */}
      <section className="container mx-auto px-4 pt-8 pb-24 lg:pt-16 lg:pb-32">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          <div className="lg:col-span-7 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1 mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em]">JB Tecnología MED® · Líderes en tecnología</span>
            </div>
            <h1 className="text-[clamp(2.75rem,8vw,7rem)] font-bold leading-[0.92] tracking-display">
              Líderes en<br />
              <span className="text-mpc-silver">tecnología.</span><br />
              +20 años de experiencia.
            </h1>
            <p className="mt-8 text-lg text-mpc-graphite max-w-xl leading-relaxed">
              Especialistas en las mejores marcas del mercado: portátiles, computadores de escritorio,
              monitores, componentes y periféricos — con asesoría experta y servicio técnico propio.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-10">
              <Link
                href="/tienda"
                className="group inline-flex items-center gap-2 bg-neutral-900 text-white rounded-full pl-6 pr-2 py-2 text-sm font-medium hover:bg-white/95 hover:text-black transition-all duration-500 ease-premium active:scale-[0.98]"
              >
                Ver catálogo
                <span className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-500 ease-premium group-hover:translate-x-1">
                  <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </span>
              </Link>
              <Link
                href="/configurador"
                className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white hover:bg-white/5 transition-colors duration-500 ease-premium"
              >
                Armar mi PC
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            {/* Hero showcase card with double bezel */}
            <div className="rounded-[2rem] p-2 bg-white/[0.04]">
              <div className="rounded-[1.625rem] bg-mpc-fog overflow-hidden aspect-[5/6] relative">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt="Producto destacado JB Tecnología"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-contain p-12"
                  />
                ) : (
                  <div className="absolute inset-0 grid place-items-center">
                    <Cpu className="h-32 w-32 text-mpc-silver" strokeWidth={0.6} />
                  </div>
                )}
                <div className="absolute top-5 left-5 flex flex-col gap-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-neutral-900 text-white px-2.5 py-1 rounded-full">Destacado</span>
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="rounded-2xl bg-black/85 backdrop-blur text-white p-4">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1">JB Builds</div>
                    <div className="font-semibold text-base leading-tight">{featured[0]?.name ?? 'Configurador disponible'}</div>
                    <div className="text-xs text-white/60 mt-1">{featured[0] ? 'Listo para enviar' : 'Arma tu propio build'}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========= TRUST STRIP — Marquee ========= */}
      <section className="border-y border-white/[0.08] py-5 overflow-hidden">
        <div className="flex gap-12 animate-marquee">
          {[...Array(2)].flatMap((_, dup) =>
            ['Lenovo', 'ASUS', 'HP', 'ACER', 'MSI', 'Redragon', 'AMD', 'Intel', 'NVIDIA', 'Samsung', 'Kingston', 'Logitech'].map((b) => (
              <span key={`${b}-${dup}`} className="text-2xl font-bold tracking-tightest text-mpc-silver whitespace-nowrap">
                {b}
              </span>
            ))
          )}
        </div>
      </section>

      {/* ========= MPC LINEUP — Bento ========= */}
      <section className="container mx-auto px-4 py-24 lg:py-32">
        <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mpc-graphite mb-4">PCs armadas</div>
            <h2 className="text-4xl md:text-6xl font-bold tracking-display leading-[0.95] max-w-2xl">
              Una línea para cada<br />nivel de exigencia.
            </h2>
          </div>
          <Link href="/escritorios" className="text-sm font-medium hover:underline underline-offset-4 inline-flex items-center gap-1.5">
            Ver todas las líneas <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {BUILD_LINES.map((line) => (
            <Link
              key={line.tier}
              href={`/escritorios`}
              className={`group relative rounded-[1.75rem] p-8 overflow-hidden aspect-[3/4] bg-gradient-to-br ${line.accent} bg-black flex flex-col justify-between text-white hover:scale-[0.99] transition-transform duration-700 ease-premium`}
            >
              <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.15),transparent_60%)] pointer-events-none" />
              <div className="relative">
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/50 mb-3">{line.range}</div>
                <div className="text-3xl font-bold tracking-display">JB {line.tier}</div>
                <div className="text-sm text-white/70 mt-1">Edition</div>
              </div>
              <div className="relative">
                <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">Desde</div>
                <div className="text-xl font-bold tracking-display tabular-nums mt-0.5">{line.priceFrom}</div>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-white/80 group-hover:text-white">
                  Explorar línea
                  <ArrowRight className="h-3 w-3 transition-transform duration-500 ease-premium group-hover:translate-x-0.5" strokeWidth={2} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ========= CONFIGURADOR CTA ========= */}
      <section className="container mx-auto px-4 pb-24">
        <div className="rounded-[2.5rem] p-2 bg-white/[0.04]">
          <div className="rounded-[2.25rem] bg-neutral-900 text-white p-10 md:p-16 lg:p-24 relative overflow-hidden">
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_30%_80%,rgba(255,255,255,0.12),transparent_60%)] pointer-events-none" />
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_70%_10%,rgba(255,255,255,0.08),transparent_50%)] pointer-events-none" />

            <div className="relative grid lg:grid-cols-[1.2fr_1fr] gap-12 items-end">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-6">Configurador en vivo</div>
                <h2 className="text-[clamp(2.25rem,5vw,4.5rem)] font-bold leading-[0.95] tracking-display max-w-2xl">
                  Arma el PC<br />que <span className="text-white/40">siempre quisiste.</span>
                </h2>
                <p className="text-lg text-white/60 max-w-xl mt-8 leading-relaxed">
                  Selecciona componentes paso a paso. Verificamos compatibilidad en tiempo real
                  (socket, RAM, watts, form factor). Total instantáneo. Envío directo al carrito o WhatsApp.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-10">
                  <Link
                    href="/configurador"
                    className="group inline-flex items-center gap-2 bg-neutral-900 text-white rounded-full pl-6 pr-2 py-2 text-sm font-medium hover:bg-white/90 transition-all duration-500 ease-premium active:scale-[0.98]"
                  >
                    Empezar a armar
                    <span className="h-9 w-9 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-500 ease-premium group-hover:translate-x-1">
                      <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                  </Link>
                  <a
                    href="https://wa.me/573182455186?text=Hola%20JB%20Tecnolog%C3%ADa%2C%20necesito%20asesor%C3%ADa%20para%20armar%20mi%20PC"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors duration-500 ease-premium"
                  >
                    <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Asesoría WhatsApp
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {['Procesador', 'Mobo', 'RAM', 'Storage', 'GPU', 'Fuente', 'Gabinete', 'Cooler'].map((step, i) => (
                  <div key={step} className="rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] transition-colors duration-500 ease-premium px-4 py-3 border border-white/10">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-white/30 mb-1">Paso {i + 1}</div>
                    <div className="text-sm font-medium">{step}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========= FEATURED PRODUCTS ========= */}
      {featured.length > 0 && (
        <section className="container mx-auto px-4 py-24 lg:py-32">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mpc-graphite mb-4">Lo más buscado</div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-display leading-[0.95]">
                Productos<br />destacados.
              </h2>
            </div>
            <Link href="/tienda" className="text-sm font-medium hover:underline underline-offset-4 inline-flex items-center gap-1.5">
              Ver catálogo completo <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {featured.slice(0, 6).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ========= TRUST FEATURES ========= */}
      <section className="container mx-auto px-4 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { icon: Shield, label: 'Garantía oficial', desc: 'Productos con respaldo y garantía del fabricante' },
            { icon: Wrench, label: 'Servicio técnico', desc: 'Diagnóstico, mantenimiento y reparación en nuestro laboratorio' },
            { icon: Truck, label: 'Envío gratis', desc: 'Despachos a domicilio y envíos a todo Colombia' },
            { icon: MessageCircle, label: 'Asesoría 1:1', desc: 'WhatsApp directo con personal capacitado' },
          ].map((f) => {
            const Icon = f.icon
            return (
              <div key={f.label} className="rounded-[1.75rem] p-1.5 bg-white/[0.04]">
                <div className="rounded-[1.4rem] bg-neutral-900 p-6 ring-1 ring-white/[0.08] h-full">
                  <div className="h-10 w-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-4">
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-semibold mb-1">{f.label}</h3>
                  <p className="text-sm text-mpc-graphite leading-relaxed">{f.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ========= DEALS ========= */}
      {deals.length > 0 && (
        <section className="container mx-auto px-4 pb-32">
          <div className="flex items-end justify-between flex-wrap gap-6 mb-12">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mpc-graphite mb-4">Ofertas activas</div>
              <h2 className="text-4xl md:text-6xl font-bold tracking-display leading-[0.95]">
                Precios<br />reducidos.
              </h2>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {deals.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  )
}
