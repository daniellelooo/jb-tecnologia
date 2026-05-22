'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { LayoutDashboard, Package, ShoppingBag, Hammer, LogOut, ExternalLink, Menu, X, ShoppingCart, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { Logo } from '@/components/shop/logo'

const NAV = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/ventas', label: 'Punto de Venta', icon: ShoppingCart },
  { href: '/admin/vendedores', label: 'Vendedores', icon: Users },
  { href: '/admin/productos', label: 'Productos', icon: Package, badgeKey: 'lowStock' as const },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingBag, badgeKey: 'pending' as const },
  { href: '/admin/builds', label: 'Builds', icon: Hammer, badgeKey: 'buildRequests' as const },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [badges, setBadges] = useState<{ lowStock: number; pending: number; buildRequests: number }>({ lowStock: 0, pending: 0, buildRequests: 0 })
  const [userEmail, setUserEmail] = useState<string>('admin')

  useEffect(() => { setMobileOpen(false) }, [pathname])

  useEffect(() => {
    const supabase = createClient()
    async function loadBadges() {
      const [{ count: lowStock }, { count: pending }, { count: buildRequests }, { data: { user } }] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).lt('stock', 5).eq('is_active', true),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pendiente'),
        supabase.from('pc_builds').select('id', { count: 'exact', head: true }).eq('status', 'requested'),
        supabase.auth.getUser(),
      ])
      setBadges({ lowStock: lowStock ?? 0, pending: pending ?? 0, buildRequests: buildRequests ?? 0 })
      if (user?.email) setUserEmail(user.email)
    }
    loadBadges()
    const interval = setInterval(loadBadges, 60000)
    return () => clearInterval(interval)
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Sesión cerrada')
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div className="min-h-screen flex bg-[#F5F5F7]">
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-64 flex-col bg-[#0C1014] text-white sticky top-0 h-screen shrink-0">
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <Link href="/admin" className="flex items-center gap-3">
            <Logo variant="light" size="sm" showWordmark={false} />
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-bold">JB Tecnología MED</div>
              <div className="text-sm font-semibold">Panel admin</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const Icon = item.icon
            const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/')
            const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ease-premium',
                  active
                    ? 'bg-neutral-900 text-white shadow-soft-dark'
                    : 'text-white/60 hover:bg-white/[0.06] hover:text-white'
                )}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                  {item.label}
                </span>
                {badgeCount > 0 && (
                  <span className={cn(
                    'text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full',
                    active ? 'bg-neutral-900 text-white' : 'bg-white/15 text-white'
                  )}>{badgeCount}</span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/[0.06] space-y-1">
          <div className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-white/30 font-bold truncate" title={userEmail}>
            {userEmail}
          </div>
          <Link href="/" target="_blank" className="flex items-center gap-2 px-3 py-2 text-xs text-white/50 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors duration-300 ease-premium">
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.5} /> Ver tienda pública
          </Link>
          <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-white/50 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors duration-300 ease-premium">
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 bg-[#0C1014] text-white px-4 py-3 flex items-center justify-between border-b border-white/[0.06]">
        <button onClick={() => setMobileOpen(true)} className="p-2 rounded-lg hover:bg-white/[0.06]">
          <Menu className="h-5 w-5" strokeWidth={1.5} />
        </button>
        <span className="font-bold text-sm">JB Tecnología MED · Admin</span>
        <button onClick={handleSignOut} className="p-2 rounded-lg hover:bg-white/[0.06]">
          <LogOut className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </header>

      {/* MOBILE DRAWER */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative w-72 bg-[#0C1014] text-white flex flex-col">
            <div className="px-5 py-5 border-b border-white/[0.06] flex items-center justify-between">
              <Logo variant="light" size="sm" />
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-white/[0.06]">
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-0.5">
              {NAV.map((item) => {
                const Icon = item.icon
                const active = item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/')
                const badgeCount = item.badgeKey ? badges[item.badgeKey] : 0
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium',
                      active ? 'bg-neutral-900 text-white' : 'text-white/70 hover:bg-white/[0.06]'
                    )}
                  >
                    <span className="flex items-center gap-2.5"><Icon className="h-4 w-4" strokeWidth={1.5} /> {item.label}</span>
                    {badgeCount > 0 && (
                      <span className={cn('text-[10px] font-bold tabular-nums px-1.5 py-0.5 rounded-full', active ? 'bg-neutral-900 text-white' : 'bg-white/15')}>{badgeCount}</span>
                    )}
                  </Link>
                )
              })}
            </nav>
          </aside>
        </div>
      )}

      <main className="flex-1 min-w-0 pt-14 md:pt-0">
        <div className="p-5 md:p-10 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  )
}
