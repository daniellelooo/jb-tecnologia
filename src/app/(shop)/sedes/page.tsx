import { MapPin, Phone, Clock, MessageCircle, ArrowRight, Mail, Truck, Wrench, ShieldCheck } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Visítanos en Monterrey',
  description: 'Visítanos en el Centro Comercial Monterrey, El Poblado, Medellín. Local 148. Especialistas en las mejores marcas del mercado.',
}

const HIGHLIGHTS = [
  { icon: Truck, label: 'Envío gratis', desc: 'Despachos a domicilio sin costo dentro de Medellín y envíos a todo Colombia.' },
  { icon: Wrench, label: 'Servicio técnico', desc: 'Diagnóstico, mantenimiento, reparación y actualización de equipos en nuestro laboratorio.' },
  { icon: ShieldCheck, label: 'Garantía oficial', desc: 'Todos nuestros productos cuentan con respaldo y garantía del fabricante.' },
]

export default function SedesPage() {
  return (
    <div className="container mx-auto px-4 pt-12 lg:pt-20 pb-32">
      <section className="max-w-4xl mb-20">
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mpc-graphite mb-4">Visítanos</div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-display leading-[0.92] mb-8">
          En el corazón<br />de <span className="text-mpc-silver">El Poblado.</span>
        </h1>
        <p className="text-lg md:text-xl text-mpc-graphite max-w-2xl leading-relaxed">
          Atendemos en el Centro Comercial Monterrey con asesoría especializada para particulares, profesionales y empresas — pasa cuando quieras a conocer los productos en vivo.
        </p>
      </section>

      <section className="grid lg:grid-cols-[1.2fr_1fr] gap-3 mb-20">
        <div className="rounded-[2rem] bg-neutral-900 text-white p-10 md:p-12">
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-5">Sede principal</div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-display leading-tight mb-6">
            Centro Comercial<br />Monterrey · Local 148
          </h2>
          <div className="space-y-4 text-base">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 mt-0.5 shrink-0 text-white/50" strokeWidth={1.5} />
              <div>
                <div className="text-white">Cra. 48 #10-45 · Local 148</div>
                <div className="text-white/60 text-sm">El Poblado · Medellín · Antioquia</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 mt-0.5 shrink-0 text-white/50" strokeWidth={1.5} />
              <div>
                <a href="https://wa.me/573182455186" target="_blank" rel="noopener noreferrer" className="text-white hover:underline">+57 318 245 5186</a>
                <div className="text-white/60 text-sm">WhatsApp · Llamadas comerciales</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 mt-0.5 shrink-0 text-white/50" strokeWidth={1.5} />
              <div>
                <a href="mailto:ventas@jbtecnologiamed.com" className="text-white hover:underline">ventas@jbtecnologiamed.com</a>
                <div className="text-white/60 text-sm">Cotizaciones y soporte</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 mt-0.5 shrink-0 text-white/50" strokeWidth={1.5} />
              <div>
                <div className="text-white">Lunes — Sábado · 10:00 a 20:00</div>
                <div className="text-white/60 text-sm">Domingos cerrado</div>
              </div>
            </div>
          </div>
          <a href="https://wa.me/573182455186?text=Hola%20JB%20Tecnolog%C3%ADa%2C%20quiero%20visitar%20su%20sede" target="_blank" rel="noopener noreferrer" className="group mt-8 inline-flex items-center gap-2 bg-neutral-900 text-white rounded-full pl-5 pr-2 py-2 text-sm font-medium hover:bg-white/95 transition-all duration-500 ease-premium active:scale-[0.98]">
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            Coordinar visita
            <span className="h-8 w-8 rounded-full bg-white/[0.06] flex items-center justify-center transition-transform duration-500 ease-premium group-hover:translate-x-0.5">
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
          </a>
        </div>

        <div className="rounded-[2rem] overflow-hidden aspect-square lg:aspect-auto relative bg-mpc-fog">
          <iframe
            src="https://www.openstreetmap.org/export/embed.html?bbox=-75.5750%2C6.2050%2C-75.5650%2C6.2150&layer=mapnik&marker=6.2100%2C-75.5700"
            className="absolute inset-0 w-full h-full border-0 grayscale"
            title="Mapa C.C. Monterrey"
            loading="lazy"
          />
        </div>
      </section>

      <section className="mb-20">
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mpc-graphite mb-4">Beneficios</div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-display leading-tight mb-12 max-w-2xl">
          Todo lo que necesitas, en un solo lugar.
        </h2>
        <div className="grid sm:grid-cols-3 gap-3">
          {HIGHLIGHTS.map((h) => {
            const Icon = h.icon
            return (
              <div key={h.label} className="rounded-[1.75rem] p-1.5 bg-white/[0.04]">
                <div className="rounded-[1.4rem] bg-neutral-900 ring-1 ring-white/[0.08] p-7 h-full">
                  <div className="h-11 w-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-6">
                    <Icon className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight mb-2">{h.label}</h3>
                  <p className="text-sm text-mpc-graphite leading-relaxed">{h.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="rounded-[2.5rem] bg-mpc-fog p-10 md:p-16 text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-display mb-4 max-w-2xl mx-auto leading-tight">
          ¿No puedes venir? Te ayudamos online.
        </h2>
        <p className="text-mpc-graphite max-w-xl mx-auto mb-8 leading-relaxed">
          Coordina envío a domicilio o pide asesoría por WhatsApp con uno de nuestros expertos.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/tienda" className="group inline-flex items-center justify-center gap-2 bg-neutral-900 text-white rounded-full pl-5 pr-2 py-2 text-sm font-medium hover:bg-white/95 hover:text-black transition-all duration-500 ease-premium active:scale-[0.98]">
            Ver catálogo
            <span className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-500 ease-premium group-hover:translate-x-0.5">
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
          </Link>
          <a href="https://wa.me/573182455186?text=Hola%20JB%20Tecnolog%C3%ADa%2C%20necesito%20asesor%C3%ADa" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium hover:bg-white/5 transition-colors duration-300 ease-premium">
            Escribir por WhatsApp
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </a>
        </div>
      </section>
    </div>
  )
}
