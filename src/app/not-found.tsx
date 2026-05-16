import Link from 'next/link'
import { ArrowRight, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-20">
      <div className="text-center max-w-lg">
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mpc-graphite mb-6">Error 404</div>
        <h1 className="text-[clamp(4rem,15vw,10rem)] font-bold tracking-display leading-[0.85]">
          Página<br /><span className="text-mpc-silver">perdida.</span>
        </h1>
        <p className="text-mpc-graphite mt-8 mb-10 max-w-md mx-auto leading-relaxed">
          Esta URL no existe o fue movida. Vuelve al inicio o explora el catálogo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 bg-neutral-900 text-white rounded-full pl-5 pr-2 py-2 text-sm font-medium hover:bg-white/95 hover:text-black transition-all duration-500 ease-premium active:scale-[0.98]"
          >
            <Home className="h-4 w-4" strokeWidth={1.5} />
            Ir al inicio
            <span className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-500 ease-premium group-hover:translate-x-0.5">
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </span>
          </Link>
          <Link
            href="/tienda"
            className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-medium hover:bg-white/5 transition-colors duration-300 ease-premium"
          >
            Explorar tienda
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </div>
  )
}
