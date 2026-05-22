'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handle() {
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Sesión cerrada')
    router.push('/')
    router.refresh()
  }

  return (
    <button
      onClick={handle}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white text-neutral-700 text-sm font-medium px-4 py-2 hover:bg-neutral-50 transition-colors disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />}
      Cerrar sesión
    </button>
  )
}
