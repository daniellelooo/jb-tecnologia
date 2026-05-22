import { AdminShell } from '@/components/admin/admin-shell'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'JB Tecnología Admin',
  robots: { index: false, follow: false },
}

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/login')

  const role = user.user_metadata?.role
  if (role !== 'admin') {
    await supabase.auth.signOut()
    redirect('/admin/login?error=no-permission')
  }

  return <AdminShell>{children}</AdminShell>
}
