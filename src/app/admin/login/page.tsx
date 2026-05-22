'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Logo } from '@/components/shop/logo'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/admin'
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      toast.error(error.message)
      setLoading(false)
      return
    }
    toast.success('Bienvenido')
    router.push(next)
    router.refresh()
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-md space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-8">
          <Logo variant="light" size="lg" showWordmark />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-3">Panel administrativo</div>
        <h1 className="text-4xl font-bold tracking-display text-white">Acceso restringido</h1>
        <p className="text-sm text-white/40 mt-3">Solo personal autorizado de JB Tecnología MED.</p>
        {errorParam === 'no-permission' && (
          <div className="mt-5 rounded-2xl bg-red-500/10 border border-red-500/30 px-4 py-2.5 text-xs text-red-300">
            Tu cuenta no tiene permisos de administrador. Para clientes, usa <a href="/cuenta" className="underline font-medium">/cuenta</a>.
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="admin@jbtecnologia.local"
            className="w-full h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors duration-300 ease-premium"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full h-12 rounded-2xl bg-white/[0.05] border border-white/10 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 transition-colors duration-300 ease-premium"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="group w-full inline-flex items-center justify-between bg-neutral-900 text-white rounded-full pl-6 pr-2 py-3 text-sm font-medium hover:bg-white/95 transition-all duration-500 ease-premium active:scale-[0.98] disabled:opacity-50"
      >
        <span className="flex items-center gap-2">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Ingresando…</> : 'Ingresar'}
        </span>
        <span className="h-8 w-8 rounded-full bg-white/[0.06] flex items-center justify-center transition-transform duration-500 ease-premium group-hover:translate-x-0.5">
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </span>
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0C1014] p-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.05),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_70%_80%,rgba(255,255,255,0.04),transparent_50%)] pointer-events-none" />
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
