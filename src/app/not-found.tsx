import Link from 'next/link'
import { ArrowRight, Home, Search, Hammer, Headphones, MessageCircle } from 'lucide-react'

const SUGGESTIONS = [
  { href: '/escritorios', label: 'Escritorios JB', desc: 'PCs ensamblados Bronze a Premium', icon: Hammer },
  { href: '/configurador', label: 'Configurador', desc: 'Armá tu propio PC', icon: Hammer },
  { href: '/tienda', label: 'Catálogo completo', desc: 'Componentes y periféricos', icon: Search },
  { href: '/servicio-tecnico', label: 'Servicio técnico', desc: 'Diagnóstico y reparación', icon: Headphones },
]

export default function NotFound() {
  return (
    <main className="relative min-h-[88vh] flex items-center px-4 py-20 overflow-hidden">
      {/* Giant decorative 404 — outlined, sits behind content */}
      <div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
      >
        <span
          className="font-bold tracking-display leading-none text-[clamp(18rem,42vw,46rem)]"
          style={{
            WebkitTextStroke: '1px rgba(255,255,255,0.07)',
            color: 'transparent',
            transform: 'translateY(-2vh)',
          }}
        >
          404
        </span>
      </div>

      {/* Soft amber glow behind the heading — anchors the page */}
      <div
        aria-hidden
        className="absolute pointer-events-none"
        style={{
          top: '30%', left: '50%', width: '60vw', height: '40vh',
          transform: 'translateX(-50%)',
          background: 'radial-gradient(closest-side, rgba(255,180,120,0.10), transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      <div className="container mx-auto relative">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1 mb-8">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400/80 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/80">
              Error 404 · Página no encontrada
            </span>
          </div>

          <h1 className="text-[clamp(2.75rem,7vw,5.5rem)] font-bold tracking-display leading-[0.95]">
            Esta página<br />
            <span className="text-white/45">se desconectó.</span>
          </h1>

          <p className="text-base md:text-lg text-mpc-graphite mt-8 max-w-lg leading-relaxed">
            La URL que buscás no existe, fue movida o nunca llegó a publicarse.
            Acá hay algunas rutas para volver al recorrido.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-10">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 bg-white text-black rounded-full pl-5 pr-2 py-2 text-sm font-semibold hover:bg-neutral-100 transition-all duration-500 ease-premium active:scale-[0.98]"
            >
              <Home className="h-4 w-4" strokeWidth={1.8} />
              Ir al inicio
              <span className="h-8 w-8 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-500 ease-premium group-hover:translate-x-0.5">
                <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.8} />
              </span>
            </Link>
            <a
              href="https://wa.me/573182455186?text=Hola%20JB%2C%20no%20encuentro%20una%20p%C3%A1gina%20en%20el%20sitio"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 transition-colors duration-300 ease-premium"
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
              Escribir por WhatsApp
            </a>
          </div>

          {/* Quick links */}
          <div className="mt-14">
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/35 mb-4">
              O explorá esto
            </div>
            <ul className="grid sm:grid-cols-2 gap-2.5 max-w-xl">
              {SUGGESTIONS.map((s) => {
                const Icon = s.icon
                return (
                  <li key={s.href}>
                    <Link
                      href={s.href}
                      className="group flex items-center gap-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/15 px-4 py-3 transition-all duration-300 ease-premium"
                    >
                      <span className="h-9 w-9 rounded-xl bg-white/[0.06] grid place-items-center shrink-0">
                        <Icon className="h-4 w-4 text-white/70" strokeWidth={1.5} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium leading-tight">{s.label}</span>
                        <span className="block text-[11px] text-white/45 truncate">{s.desc}</span>
                      </span>
                      <ArrowRight
                        className="h-3.5 w-3.5 text-white/40 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-300"
                        strokeWidth={1.8}
                      />
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
