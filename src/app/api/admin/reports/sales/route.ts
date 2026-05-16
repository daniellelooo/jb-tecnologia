import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'

export async function GET(req: Request) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  const url = new URL(req.url)
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')

  const supabase = createAdminClient()
  let query = supabase
    .from('orders')
    .select('order_number, customer_name, customer_phone, delivery_type, payment_method, status, subtotal, delivery_fee, total, created_at')
    .order('created_at', { ascending: false })

  if (from) query = query.gte('created_at', from)
  if (to) query = query.lte('created_at', to)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const orders = data ?? []
  const totals = orders.reduce(
    (acc, o) => {
      const isCancel = o.status === 'cancelado'
      acc.count += 1
      acc.totalAll += Number(o.total)
      if (!isCancel) {
        acc.totalNet += Number(o.total)
        acc.subtotalNet += Number(o.subtotal)
        acc.deliveryNet += Number(o.delivery_fee)
        acc.countNet += 1
      } else acc.countCancel += 1
      return acc
    },
    { count: 0, countNet: 0, countCancel: 0, totalAll: 0, totalNet: 0, subtotalNet: 0, deliveryNet: 0 }
  )

  return NextResponse.json({ orders, totals })
}
