import { createAdminClient } from '@/lib/supabase/admin'
import { ReportsClient } from './reports-client'

export const dynamic = 'force-dynamic'

export default async function ReportesPage() {
  const supabase = createAdminClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  return <ReportsClient categories={categories ?? []} />
}
