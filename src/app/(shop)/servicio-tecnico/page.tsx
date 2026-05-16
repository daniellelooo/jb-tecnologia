import Link from 'next/link'
import { Wrench, Stethoscope, Cpu, HardDrive, Thermometer, Zap, MessageCircle, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Servicio técnico',
  description: 'Servicio técnico especializado para PCs, portátiles y componentes en JB Tecnología MED Medellín. Diagnóstico gratis y mantenimiento profesional.',
}

const SERVICES = [
  { icon: Stethoscope, label: 'Diagnóstico técnico', desc: 'Revisamos tu equipo y te entregamos un informe detallado sin costo de revisión.', price: 'Gratis' },
  { icon: Wrench, label: 'Mantenimiento preventivo', desc: 'Limpieza interna, cambio de pasta térmica y revisión de cableado.', price: 'Desde $80.000' },
  { icon: Cpu, label: 'Upgrade de componentes', desc: 'Cambio de CPU, GPU, RAM o storage incluyendo asesoría de compatibilidad.', price: 'Desde $50.000' },
  { icon: HardDrive, label: 'Recuperación de datos', desc: 'Diagnóstico de discos con problemas y recuperación cuando es posible.', price: 'Cotización' },
  { icon: Thermometer, label: 'Solución de calentamiento', desc: 'Cambio de coolers, AIO, mejora de airflow y diagnóstico térmico.', price: 'Desde $120.000' },
  { icon: Zap, label: 'Reparación de fallas eléctricas', desc: 'Diagnóstico de fuentes, cortos y daños por sobretensión.', price: 'Cotización' },
]

const PROCESS = [
  { step: '01', label: 'Recibimos tu equipo', desc: 'Trae el PC o portátil a nuestra sede del C.C. Monterrey, sin cita previa.' },
  { step: '02', label: 'Diagnóstico gratis', desc: 'Nuestros técnicos revisan el equipo y te enviamos un informe por WhatsApp en 24-48 horas.' },
  { step: '03', label: 'Cotización clara', desc: 'Si aceptas, procedemos. Si no, no se cobra nada por la revisión.' },
  { step: '04', label: 'Reparación y entrega', desc: 'Trabajamos con piezas originales. Te avisamos cuando tu equipo está listo.' },
]

export default function ServicioTecnicoPage() {
  return (
    <div className="container mx-auto px-4 pt-12 lg:pt-20 pb-32">
      <section className="max-w-4xl mb-20">
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mpc-graphite mb-4">Servicio técnico</div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-display leading-[0.92] mb-8">
          Diagnóstico<br /><span className="text-mpc-silver">sin costo.</span>
        </h1>
        <p className="text-lg md:text-xl text-mpc-graphite max-w-2xl leading-relaxed">
          Mantenemos, reparamos y mejoramos cualquier PC o portátil. Si tu equipo no enciende, calienta o va lento, lo revisamos sin compromiso.
        </p>
      </section>

      <section className="mb-20">
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mpc-graphite mb-4">Servicios</div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-display leading-tight mb-12 max-w-2xl">
          Lo que podemos hacer por ti.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {SERVICES.map((s) => {
            const Icon = s.icon
            return (
              <div key={s.label} className="rounded-[1.75rem] p-1.5 bg-white/[0.04]">
                <div className="rounded-[1.4rem] bg-neutral-900 ring-1 ring-white/[0.08] p-7 h-full flex flex-col">
                  <div className="flex items-start justify-between gap-2 mb-5">
                    <div className="h-11 w-11 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
                      <Icon className="h-5 w-5" strokeWidth={1.5} />
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] bg-mpc-fog px-2.5 py-1 rounded-full">
                      {s.price}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold tracking-tight mb-2">{s.label}</h3>
                  <p className="text-sm text-mpc-graphite leading-relaxed flex-1">{s.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mb-20">
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mpc-graphite mb-4">Proceso</div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-display leading-tight mb-12 max-w-2xl">
          4 pasos para dejar tu equipo listo.
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PROCESS.map((p) => (
            <div key={p.step} className="rounded-[1.75rem] p-1.5 bg-white/[0.04]">
              <div className="rounded-[1.4rem] bg-neutral-900 ring-1 ring-white/[0.08] p-7 h-full">
                <div className="text-6xl font-bold tracking-display text-mpc-silver leading-none mb-5">{p.step}</div>
                <h3 className="text-base font-bold tracking-tight mb-2">{p.label}</h3>
                <p className="text-sm text-mpc-graphite leading-relaxed">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2.5rem] bg-neutral-900 text-white p-10 md:p-16">
        <div className="max-w-3xl">
          <h2 className="text-3xl md:text-5xl font-bold tracking-display leading-tight mb-6">
            ¿Tu PC tiene un problema?<br />
            <span className="text-white/40">Escríbenos ya.</span>
          </h2>
          <p className="text-white/60 mb-10 max-w-2xl leading-relaxed">
            Describe el problema por WhatsApp y te decimos si hace falta traerlo o si lo podemos resolver remotamente.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href="https://wa.me/573182455186?text=Hola%20JB%20Tecnolog%C3%ADa%2C%20necesito%20servicio%20t%C3%A9cnico" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 bg-neutral-900 text-white rounded-full pl-6 pr-2 py-2 text-sm font-medium hover:bg-white/95 transition-all duration-500 ease-premium active:scale-[0.98]">
              <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
              Solicitar diagnóstico
              <span className="h-8 w-8 rounded-full bg-white/[0.06] flex items-center justify-center transition-transform duration-500 ease-premium group-hover:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
              </span>
            </a>
            <Link href="/sedes" className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-white hover:bg-white/10 transition-colors duration-300 ease-premium">
              Ver dirección de sede
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
