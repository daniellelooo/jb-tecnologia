import { createAdminClient } from '@/lib/supabase/admin'
import { PosClient } from './pos-client'

export const dynamic = 'force-dynamic'

export default async function VentasPage() {
  const supabase = createAdminClient()
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [
    { data: sellers },
    { data: products },
    { data: todaySales },
  ] = await Promise.all([
    supabase.from('sellers').select('id, name, commission_rate').eq('is_active', true).order('name'),
    supabase.from('products').select('id, name, price, sku, stock, brand')
      .eq('is_active', true).gt('stock', 0).order('name').limit(200),
    supabase.from('orders')
      .select('id, order_number, customer_name, total, payment_method, sale_channel, created_at, sellers(name)')
      .gte('created_at', todayStart.toISOString())
      .neq('status', 'cancelado')
      .order('created_at', { ascending: false }),
  ])

  // Caja por método de pago (hoy)
  const cajaHoy: Record<string, number> = {}
  for (const sale of todaySales ?? []) {
    const m = sale.payment_method
    cajaHoy[m] = (cajaHoy[m] ?? 0) + Number(sale.total)
  }

  return (
    <PosClient
      sellers={sellers ?? []}
      products={products ?? []}
      todaySales={todaySales ?? []}
      cajaHoy={cajaHoy}
    />
  )
}
