import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AccountAuthClient } from './auth-client'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Mi cuenta · JB Tecnología MED',
}

export default async function CuentaPage({ searchParams }: { searchParams: Promise<{ mode?: 'login' | 'signup' }> }) {
  const sp = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user && user.user_metadata?.role !== 'admin') {
    redirect('/mi-cuenta')
  }

  return <AccountAuthClient initialMode={sp.mode === 'signup' ? 'signup' : 'login'} />
}
