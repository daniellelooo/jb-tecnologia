import { ShieldCheck, Wrench, Clock, FileText, AlertCircle, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Garantía MPC',
  description: 'Conoce las políticas de garantía de JB Tecnología MED para PCs ensambladas, componentes y periféricos.',
}

const COVERAGE = [
  { period: '6 meses', label: 'Mano de obra', desc: 'Cubrimos cualquier defecto de ensamble o instalación realizada en nuestra sede.' },
  { period: '1 año', label: 'Componentes individuales', desc: 'Cada componente conserva su garantía oficial de fábrica respaldada por JB Tecnología MED.' },
  { period: '2 años', label: 'PCs MPC ensambladas', desc: 'Garantía extendida exclusiva en todas nuestras líneas Bronze, Silver, Gold y superiores.' },
  { period: 'Diagnóstico gratis', label: 'Servicio técnico', desc: 'Trae tu equipo a nuestra sede del Centro Comercial Monterrey sin costo de revisión.' },
]

const COVERED = [
  'Defectos de fábrica de cualquier componente',
  'Fallas en el ensamble o cableado interno',
  'Problemas de compatibilidad detectados después de la compra',
  'Asesoría técnica continua durante toda la garantía',
  'Reemplazo o cambio según política del fabricante',
]

const NOT_COVERED = [
  'Daños por mal uso, golpes o caídas',
  'Daños por sobretensión sin estabilizador o UPS',
  'Modificaciones no autorizadas (overclock manual extremo, etc)',
  'Daños por software malicioso o virus',
  'Componentes con sellos de garantía rotos por terceros',
]

export default function GarantiaPage() {
  return (
    <div className="container mx-auto px-4 pt-12 lg:pt-20 pb-32">
      <section className="max-w-4xl mb-20">
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mpc-graphite mb-4">Políticas de garantía</div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-display leading-[0.92] mb-8">
          Te <span className="text-mpc-silver">respaldamos.</span>
        </h1>
        <p className="text-lg md:text-xl text-mpc-graphite max-w-2xl leading-relaxed">
          Cada producto y cada ensamble en JB Tecnología MED tiene garantía formal. Aquí están los detalles para que sepas exactamente qué cubrimos y cómo hacer válida tu garantía.
        </p>
      </section>

      <section className="mb-20">
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mpc-graphite mb-4">Cobertura</div>
        <h2 className="text-3xl md:text-5xl font-bold tracking-display leading-tight mb-12 max-w-2xl">
          Qué incluye nuestra garantía.
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {COVERAGE.map((c) => (
            <div key={c.label} className="rounded-[1.75rem] p-1.5 bg-white/[0.04]">
              <div className="rounded-[1.4rem] bg-neutral-900 ring-1 ring-white/[0.08] p-8 h-full">
                <div className="flex items-start gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
                    <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-mpc-graphite font-bold">{c.period}</div>
                    <h3 className="text-xl font-bold tracking-tight">{c.label}</h3>
                  </div>
                </div>
                <p className="text-sm text-mpc-graphite leading-relaxed">{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-3 mb-20">
        <div className="rounded-[2rem] p-1.5 bg-white/[0.04]">
          <div className="rounded-[1.625rem] bg-neutral-900 ring-1 ring-white/[0.08] p-8 h-full">
            <div className="h-10 w-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center mb-5">
              <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold tracking-display mb-5">Sí cubrimos</h3>
            <ul className="space-y-3 text-sm">
              {COVERED.map((item) => (
                <li key={item} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-foreground font-bold mt-0.5">✓</span>
                  <span className="text-foreground/85">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rounded-[2rem] p-1.5 bg-white/[0.04]">
          <div className="rounded-[1.625rem] bg-neutral-900 ring-1 ring-white/[0.08] p-8 h-full">
            <div className="h-10 w-10 rounded-xl bg-mpc-fog text-mpc-graphite flex items-center justify-center mb-5">
              <AlertCircle className="h-5 w-5" strokeWidth={1.5} />
            </div>
            <h3 className="text-2xl font-bold tracking-display mb-5">No cubrimos</h3>
            <ul className="space-y-3 text-sm">
              {NOT_COVERED.map((item) => (
                <li key={item} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-mpc-silver font-bold mt-0.5">×</span>
                  <span className="text-mpc-graphite">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-[2.5rem] bg-neutral-900 text-white p-10 md:p-16">
        <div className="grid md:grid-cols-[1.5fr_1fr] gap-10 items-center">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-4">¿Necesitas hacer válida tu garantía?</div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-display leading-tight mb-5">
              Escríbenos por WhatsApp.
            </h2>
            <p className="text-white/60 mb-8 leading-relaxed">
              Te atendemos en horario comercial. Solo necesitas tener a mano el número de orden o la factura de compra.
            </p>
            <a href="https://wa.me/573182455186?text=Hola%20JB%20Tecnolog%C3%ADa%2C%20quiero%20revisar%20mi%20garant%C3%ADa" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center gap-2 bg-neutral-900 text-white rounded-full pl-6 pr-2 py-2 text-sm font-medium hover:bg-white/95 transition-all duration-500 ease-premium active:scale-[0.98]">
              <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
              Iniciar trámite
              <span className="h-8 w-8 rounded-full bg-white/[0.06] flex items-center justify-center transition-transform duration-500 ease-premium group-hover:translate-x-0.5">
                →
              </span>
            </a>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: FileText, label: 'Factura o N° de orden' },
              { icon: Wrench, label: 'Descripción del problema' },
              { icon: Clock, label: 'Horario L–S 10:00–20:00' },
              { icon: ShieldCheck, label: 'Diagnóstico gratis' },
            ].map((step) => {
              const Icon = step.icon
              return (
                <div key={step.label} className="bg-white/[0.05] rounded-2xl p-4">
                  <Icon className="h-4 w-4 text-white/60 mb-2" strokeWidth={1.5} />
                  <div className="text-xs text-white/80">{step.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
