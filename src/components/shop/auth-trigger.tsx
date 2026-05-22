'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { User, UserCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function AuthTrigger() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted) return
      // Only treat as "customer" if NOT admin role
      const isAdmin = user?.user_metadata?.role === 'admin'
      setSignedIn(Boolean(user) && !isAdmin)
    }
    load()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      load()
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const href = signedIn ? '/mi-cuenta' : '/cuenta'
  const Icon = signedIn ? UserCheck : User

  return (
    <Link
      href={href}
      className="h-9 w-9 flex items-center justify-center rounded-full text-white/60 hover:bg-white/5 hover:text-white transition-colors duration-300 ease-premium"
      aria-label={signedIn ? 'Mi cuenta' : 'Iniciar sesión'}
      title={signedIn ? 'Mi cuenta' : 'Iniciar sesión'}
    >
      <Icon className="h-4 w-4" strokeWidth={1.5} />
    </Link>
  )
}
