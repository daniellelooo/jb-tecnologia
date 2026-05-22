import Link from 'next/link'
import { MapPin, Phone, Clock, Instagram } from 'lucide-react'
import { Logo } from './logo'

const COLUMNS = [
  {
    title: 'Catálogo',
    links: [
      { href: '/escritorios', label: 'Escritorios JB' },
      { href: '/portatiles', label: 'Portátiles' },
      { href: '/monitores', label: 'Monitores' },
      { href: '/perifericos', label: 'Periféricos' },
      { href: '/componentes', label: 'Componentes' },
      { href: '/sillas-gaming', label: 'Sillas Gaming' },
    ],
  },
  {
    title: 'Servicios',
    links: [
      { href: '/configurador', label: 'Configurador de PC' },
      { href: '/servicio-tecnico', label: 'Servicio técnico' },
      { href: '/garantia', label: 'Garantía y soporte' },
      { href: 'https://wa.me/573182455186', label: 'Asesoría WhatsApp' },
    ],
  },
  {
    title: 'Nosotros',
    links: [
      { href: '/nosotros', label: 'Sobre JB Tecnología' },
      { href: '/sedes', label: 'Visítanos en Monterrey' },
      { href: '/garantia', label: 'Políticas de garantía' },
      { href: '/tienda', label: 'Catálogo completo' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="bg-neutral-900 text-white mt-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.04),transparent_50%)] pointer-events-none" />

      <div className="container mx-auto px-4 relative">
        {/* MASSIVE WORDMARK */}
        <div className="pt-20 pb-12 border-b border-white/10">
          <div className="text-[12vw] sm:text-[10vw] lg:text-[140px] font-bold tracking-display leading-[0.9] text-white/95">
            JB<span className="text-white/30">Tecnología</span>
            <span className="text-white/30 align-top text-[0.4em] ml-2">®</span>
          </div>
          <p className="text-white/50 text-sm mt-6 max-w-2xl">
            Líderes en tecnología en Medellín hace más de 20 años. Especialistas en las mejores
            marcas del mercado, con asesoría experta y servicio técnico propio.
          </p>
        </div>

        {/* GRID */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 py-16">
          <div className="col-span-2">
            <Logo variant="light" size="sm" showWordmark />
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-2.5 text-white/70">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-white/40" strokeWidth={1.5} />
                <span>Cra. 48 #10-45 · Local 148<br />C.C. Monterrey, El Poblado<br />Medellín, Colombia</span>
              </li>
              <li>
                <a
                  href="https://wa.me/573182455186"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 text-white/70 hover:text-white transition-colors duration-300 ease-premium"
                >
                  <Phone className="h-4 w-4 shrink-0 text-white/40" strokeWidth={1.5} />
                  <span>+57 318 245 5186</span>
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-white/70">
                <Clock className="h-4 w-4 shrink-0 text-white/40" strokeWidth={1.5} />
                <span>Lun–Sáb · 10:00 a 20:00</span>
              </li>
            </ul>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-5">{col.title}</h4>
              <ul className="space-y-3 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-white/70 hover:text-white transition-colors duration-300 ease-premium">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* BOTTOM */}
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between py-8 border-t border-white/10 text-xs text-white/40">
          <div className="flex items-center gap-6">
            <span>© {new Date().getFullYear()} JB Tecnología MED® · Todos los derechos reservados</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white transition-colors" aria-label="Instagram">
              <Instagram className="h-4 w-4" strokeWidth={1.5} />
            </a>
            <span className="opacity-50">·</span>
            <span>Tienda en Medellín, Colombia</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
