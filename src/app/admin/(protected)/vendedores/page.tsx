import { createAdminClient } from '@/lib/supabase/admin'
import { SellersClient } from './sellers-client'

export const dynamic = 'force-dynamic'

export default async function VendedoresPage() {
  const supabase = createAdminClient()
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: sellers }, { data: salesLast30 }] = await Promise.all([
    supabase.from('sellers').select('*').order('name'),
    supabase
      .from('orders')
      .select('seller_id, total, created_at')
      .gte('created_at', thirtyDaysAgo)
      .neq('status', 'cancelado')
      .not('seller_id', 'is', null),
  ])

  // Calcular stats por vendedor
  const sellerStats: Record<string, { ventas: number; total: number; comision: number }> = {}
  for (const sale of salesLast30 ?? []) {
    if (!sale.seller_id) continue
    const seller = (sellers ?? []).find((s) => s.id === sale.seller_id)
    if (!seller) continue
    if (!sellerStats[sale.seller_id]) sellerStats[sale.seller_id] = { ventas: 0, total: 0, comision: 0 }
    sellerStats[sale.seller_id].ventas++
    sellerStats[sale.seller_id].total += Number(sale.total)
    sellerStats[sale.seller_id].comision += Number(sale.total) * (Number(seller.commission_rate) / 100)
  }

  return (
    <SellersClient
      sellers={sellers ?? []}
      sellerStats={sellerStats}
    />
  )
}
