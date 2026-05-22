'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, X, Search } from 'lucide-react'
import { Logo } from './logo'
import { CartTrigger } from './cart-trigger'
import { AuthTrigger } from './auth-trigger'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/escritorios', label: 'Escritorios' },
  { href: '/portatiles', label: 'Portátiles' },
  { href: '/monitores', label: 'Monitores' },
  { href: '/perifericos', label: 'Periféricos' },
  { href: '/componentes', label: 'Componentes' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Lock body scroll while menu open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      {/* Floating island nav */}
      <header
        className={cn(
          'fixed top-0 inset-x-0 z-40 transition-all duration-500 ease-premium',
          scrolled ? 'pt-3' : 'pt-5'
        )}
      >
        <div className="container mx-auto px-4">
          <div
            className={cn(
              'flex items-center justify-between gap-4 transition-all duration-500 ease-premium',
              'rounded-full backdrop-blur-xl',
              scrolled
                ? 'bg-neutral-950/90 border border-white/[0.08] shadow-soft px-3 py-2'
                : 'bg-neutral-950/40 border border-transparent px-4 py-3'
            )}
          >
            <Link href="/" className="shrink-0">
              <Logo size="sm" showWordmark />
            </Link>

            <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
              {NAV_LINKS.map((link) => {
                const active = pathname === link.href
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'text-[13px] font-medium px-3.5 py-1.5 rounded-full transition-colors duration-300 ease-premium',
                      active ? 'bg-neutral-900 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href="/tienda"
                className="hidden md:flex h-9 w-9 items-center justify-center rounded-full text-white/60 hover:bg-white/5 hover:text-white transition-colors duration-300 ease-premium"
                aria-label="Buscar"
              >
                <Search className="h-4 w-4" strokeWidth={1.5} />
              </Link>

              <AuthTrigger />

              <CartTrigger />

              {/* Mobile menu trigger — hamburger morph */}
              <button
                onClick={() => setOpen((v) => !v)}
                className="lg:hidden relative h-9 w-9 rounded-full hover:bg-white/5 transition-colors duration-300 ease-premium"
                aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
              >
                <span className="absolute inset-0 flex items-center justify-center">
                  <Menu className={cn('h-4 w-4 transition-all duration-500 ease-premium', open ? 'rotate-45 opacity-0' : 'opacity-100')} strokeWidth={1.5} />
                </span>
                <span className="absolute inset-0 flex items-center justify-center">
                  <X className={cn('h-4 w-4 transition-all duration-500 ease-premium', open ? 'opacity-100' : '-rotate-45 opacity-0')} strokeWidth={1.5} />
                </span>
              </button>

              <Link
                href="/configurador"
                className="hidden sm:flex group items-center gap-2 bg-neutral-900 text-white rounded-full pl-4 pr-1.5 py-1.5 text-[13px] font-medium hover:bg-white/95 hover:text-black transition-all duration-300 ease-premium active:scale-[0.97]"
              >
                Configurar PC
                <span className="h-6 w-6 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-500 ease-premium group-hover:translate-x-0.5">
                  <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile overlay menu — staggered reveal */}
      <div
        className={cn(
          'fixed inset-0 z-30 lg:hidden bg-white/95 backdrop-blur-2xl transition-opacity duration-500 ease-premium',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        <div className="container mx-auto px-4 pt-24 pb-12 h-full overflow-y-auto">
          <nav className="flex flex-col gap-1 max-w-md">
            {NAV_LINKS.map((link, i) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'group flex items-center justify-between py-5 border-b border-white/10 transition-all duration-700 ease-premium',
                  open ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                )}
                style={{ transitionDelay: open ? `${120 + i * 60}ms` : '0ms' }}
              >
                <span className="text-3xl font-bold tracking-display">{link.label}</span>
                <span className="h-9 w-9 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-black group-hover:text-white group-hover:border-white transition-all duration-500 ease-premium">
                  <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            ))}
            <Link
              href="/configurador"
              className={cn(
                'mt-8 group bg-neutral-900 text-white rounded-full pl-6 pr-2 py-3 flex items-center justify-between text-base font-medium transition-all duration-700 ease-premium',
                open ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              )}
              style={{ transitionDelay: open ? '420ms' : '0ms' }}
            >
              Configurar mi PC
              <span className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-500 ease-premium group-hover:translate-x-1">
                <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </Link>
          </nav>
        </div>
      </div>

      {/* Spacer to push content below floating nav */}
      <div className="h-20" aria-hidden />
    </>
  )
}
