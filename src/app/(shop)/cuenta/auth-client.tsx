'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Mail, Lock, User as UserIcon, Phone, ArrowRight, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

type Mode = 'login' | 'signup'

export function AccountAuthClient({ initialMode }: { initialMode: Mode }) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()

    try {
      if (mode === 'signup') {
        if (password.length < 6) {
          toast.error('La contraseña debe tener al menos 6 caracteres')
          return
        }
        if (!name.trim() || !phone.trim()) {
          toast.error('Nombre y teléfono son requeridos')
          return
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name.trim(),
              phone: phone.replace(/\D/g, ''),
              role: 'customer',
            },
          },
        })
        if (error) {
          toast.error(error.message)
          return
        }
        toast.success('¡Cuenta creada! Bienvenido')
        router.push('/mi-cuenta')
        router.refresh()
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) {
          toast.error('Credenciales incorrectas')
          return
        }
        if (data.user?.user_metadata?.role === 'admin') {
          toast.info('Cuenta de admin detectada — redirigiendo al panel')
          router.push('/admin')
        } else {
          toast.success('Bienvenido de vuelta')
          router.push('/mi-cuenta')
        }
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="container mx-auto px-4 py-16 md:py-24 relative">
      {/* Soft glow behind the card */}
      <div
        aria-hidden
        className="absolute pointer-events-none top-20 left-1/2 -translate-x-1/2 w-[480px] h-[280px] opacity-70"
        style={{
          background: 'radial-gradient(closest-side, rgba(255,180,120,0.12), transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="max-w-md mx-auto relative">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/45 mb-3">
            Mi cuenta
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-display text-white leading-[1.05]">
            {mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}
          </h1>
          <p className="text-sm md:text-base text-white/60 mt-4 leading-relaxed max-w-sm mx-auto">
            {mode === 'login'
              ? 'Inicia sesión para ver tus pedidos y agilizar tus próximas compras.'
              : 'Regístrate para hacer seguimiento a tus pedidos y guardar tus datos.'}
          </p>
        </div>

        {/* Card — double bezel like the rest of the site */}
        <div className="rounded-[1.75rem] p-1.5 bg-white/[0.04]">
          <div className="rounded-[1.4rem] bg-neutral-950/80 backdrop-blur-xl ring-1 ring-white/[0.08] p-6 md:p-8">
            {/* Mode tabs */}
            <div className="flex gap-1 p-1 rounded-full bg-white/[0.04] mb-6">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={cn(
                  'flex-1 text-sm font-medium px-4 py-2 rounded-full transition-all duration-300 ease-premium',
                  mode === 'login'
                    ? 'bg-white text-neutral-900 shadow-soft'
                    : 'text-white/55 hover:text-white'
                )}
              >
                Iniciar sesión
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={cn(
                  'flex-1 text-sm font-medium px-4 py-2 rounded-full transition-all duration-300 ease-premium',
                  mode === 'signup'
                    ? 'bg-white text-neutral-900 shadow-soft'
                    : 'text-white/55 hover:text-white'
                )}
              >
                Crear cuenta
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <>
                  <Field
                    icon={UserIcon}
                    label="Nombre completo"
                    type="text"
                    value={name}
                    onChange={setName}
                    placeholder="Tu nombre"
                    autoComplete="name"
                  />
                  <Field
                    icon={Phone}
                    label="Teléfono"
                    type="tel"
                    value={phone}
                    onChange={setPhone}
                    placeholder="3001234567"
                    autoComplete="tel"
                    hint="Incluí el código de país sin espacios — ej. 573001234567"
                  />
                </>
              )}
              <Field
                icon={Mail}
                label="Correo electrónico"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="tu@correo.com"
                autoComplete="email"
                required
              />
              <Field
                icon={Lock}
                label="Contraseña"
                type="password"
                value={password}
                onChange={setPassword}
                placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : '••••••••'}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
              />

              <button
                type="submit"
                disabled={loading}
                className="group w-full inline-flex items-center justify-between bg-white text-black rounded-full pl-6 pr-2 py-3 text-sm font-semibold hover:bg-neutral-100 transition-all duration-300 ease-premium active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed mt-3"
              >
                <span className="flex items-center gap-2">
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {mode === 'login'
                    ? loading ? 'Ingresando…' : 'Iniciar sesión'
                    : loading ? 'Creando cuenta…' : 'Crear cuenta'}
                </span>
                <span className="h-8 w-8 rounded-full bg-black/10 flex items-center justify-center transition-transform duration-500 ease-premium group-hover:translate-x-0.5">
                  <ArrowRight className="h-4 w-4" strokeWidth={1.8} />
                </span>
              </button>
            </form>

            {/* Reassurance strip — only on signup */}
            {mode === 'signup' && (
              <div className="mt-5 flex items-center gap-2 text-[12px] text-white/50">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                <span>
                  Tus datos quedan privados. Solo los usamos para procesar tus pedidos.
                </span>
              </div>
            )}
          </div>
        </div>

        <p className="text-sm text-white/55 text-center mt-7">
          {mode === 'login' ? (
            <>
              ¿No tenés cuenta?{' '}
              <button
                onClick={() => setMode('signup')}
                className="text-white font-semibold underline underline-offset-4 hover:no-underline"
              >
                Crear una
              </button>
            </>
          ) : (
            <>
              ¿Ya tenés cuenta?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-white font-semibold underline underline-offset-4 hover:no-underline"
              >
                Iniciar sesión
              </button>
            </>
          )}
        </p>
      </div>
    </section>
  )
}

function Field({
  icon: Icon,
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  hint,
}: {
  icon: typeof Mail
  label: string
  type: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  autoComplete?: string
  required?: boolean
  hint?: string
}) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-white/80 mb-2 tracking-tight">
        {label}
      </label>
      <div className="relative">
        <Icon
          className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
          strokeWidth={1.5}
        />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className={cn(
            'w-full h-12 rounded-2xl bg-white/[0.04] border border-white/[0.10] pl-11 pr-4',
            'text-sm text-white placeholder:text-white/30',
            'focus:outline-none focus:border-white/40 focus:bg-white/[0.06] focus:ring-2 focus:ring-white/[0.05]',
            'transition-colors duration-300 ease-premium'
          )}
        />
      </div>
      {hint && <p className="text-[11px] text-white/40 mt-1.5 ml-1">{hint}</p>}
    </div>
  )
}
