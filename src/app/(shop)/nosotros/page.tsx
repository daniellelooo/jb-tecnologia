import Link from 'next/link'
import { ArrowRight, Cpu, Users, Award, Heart } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sobre JB Tecnología MED',
  description: 'Conoce la historia de JB Tecnología MED, especialistas en las mejores marcas del mercado con más de 20 años de experiencia en El Poblado, Medellín.',
}

const VALUES = [
  { icon: Award, label: 'Las mejores marcas', desc: 'Lenovo, ASUS, HP, ACER, MSI, Redragon, AMD, Intel, NVIDIA — solo distribuimos productos oficiales con garantía.' },
  { icon: Users, label: 'Asesoría personalizada', desc: 'Personal capacitado para identificar tus necesidades y recomendarte el equipo correcto.' },
  { icon: Heart, label: 'Servicio técnico propio', desc: 'Reparación, mantenimiento y actualizaciones realizadas en nuestro laboratorio de Medellín.' },
]

const STATS = [
  { label: 'Años de experiencia', value: '+20' },
  { label: 'Marcas oficiales', value: '9+' },
  { label: 'Categorías', value: '20+' },
  { label: 'Sede en', value: 'El Poblado' },
]

export default function NosotrosPage() {
  return (
    <div className="container mx-auto px-4 pt-12 lg:pt-20 pb-32">
      {/* HERO */}
      <section className="max-w-4xl mb-24">
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mpc-graphite mb-4">Sobre nosotros</div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-display leading-[0.92] mb-8">
          Líderes en<br />tecnología<br /><span className="text-mpc-silver">hace +20 años.</span>
        </h1>
        <p className="text-lg md:text-xl text-mpc-graphite max-w-2xl leading-relaxed">
          JB Tecnología MED es una empresa con más de 20 años de experiencia ofreciendo una amplia selección
          de productos para todo tipo de necesidades. Especialistas en las mejores marcas del mercado,
          con personal capacitado para identificar exactamente lo que cada cliente necesita.
        </p>
      </section>

      {/* STATS */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-24">
        {STATS.map((s) => (
          <div key={s.label} className="rounded-[1.75rem] p-1.5 bg-white/[0.04]">
            <div className="rounded-[1.4rem] bg-neutral-900 ring-1 ring-white/[0.08] p-6">
              <div className="text-3xl md:text-4xl font-bold tracking-display">{s.value}</div>
              <div className="text-xs text-mpc-graphite mt-1.5 font-medium">{s.label}</div>
            </div>
          </div>
        ))}
      </section>

      {/* MISSION + VISION */}
      <section className="grid lg:grid-cols-2 gap-3 mb-24">
        <div className="rounded-[2rem] bg-neutral-900 text-white p-10 md:p-12">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-5">Misión</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-display leading-tight mb-5">
            Tecnología para cada necesidad, en cualquier presupuesto.
          </h2>
          <p className="text-white/70 leading-relaxed">
            Acercar a hogares, estudiantes, profesionales y empresas la mejor tecnología disponible
            con productos oficiales, asesoría experta y respaldo de garantía sobre cada compra.
          </p>
        </div>
        <div className="rounded-[2rem] bg-mpc-fog p-10 md:p-12">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mpc-graphite mb-5">Visión</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-display leading-tight mb-5">
            Ser referencia nacional en distribución de tecnología.
          </h2>
          <p className="text-mpc-graphite leading-relaxed">
            Consolidarnos como la tienda de confianza para portátiles, equipos de escritorio, periféricos
            y accesorios — con servicio técnico propio, envíos a todo el país y los mejores precios.
          </p>
        </div>
      </section>

      {/* VALUES */}
      <section className="mb-24">
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mpc-graphite mb-4">Lo que nos define</div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-display leading-tight mb-12 max-w-2xl">
          Tres principios que aplicamos en cada venta.
        </h2>
        <div className="grid md:grid-cols-3 gap-3">
          {VALUES.map((v) => {
            const Icon = v.icon
            return (
              <div key={v.label} className="rounded-[1.75rem] p-1.5 bg-white/[0.04]">
                <div className="rounded-[1.4rem] bg-neutral-900 ring-1 ring-white/[0.08] p-8">
                  <div className="h-11 w-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-6">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight mb-2">{v.label}</h3>
                  <p className="text-sm text-mpc-graphite leading-relaxed">{v.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-[2.5rem] bg-neutral-900 text-white p-10 md:p-16 text-center">
        <div className="max-w-2xl mx-auto">
          <Cpu className="h-12 w-12 mx-auto text-white/40 mb-6" strokeWidth={1} />
          <h2 className="text-4xl md:text-5xl font-bold tracking-display mb-6">
            ¿Buscas un equipo nuevo?
          </h2>
          <p className="text-white/60 mb-10 max-w-xl mx-auto leading-relaxed">
            Explora nuestro catálogo o escríbenos por WhatsApp para asesoría personalizada — te ayudamos a encontrar el equipo correcto para tu necesidad.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/tienda" className="group inline-flex items-center justify-center gap-2 bg-neutral-900 text-white rounded-full pl-6 pr-2 py-2 text-sm font-medium hover:bg-white/95 transition-all duration-500 ease-premium active:scale-[0.98]">
              Ver catálogo
              <span className="h-8 w-8 rounded-full bg-white/[0.06] flex items-center justify-center transition-transform duration-500 ease-premium group-hover:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </span>
            </Link>
            <Link href="/sedes" className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors duration-300 ease-premium">
              Visitar nuestra sede
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
