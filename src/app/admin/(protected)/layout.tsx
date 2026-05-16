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

  return <AdminShell>{children}</AdminShell>
}
