import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { format, startOfWeek, startOfMonth, parseISO } from 'date-fns'

const REVENUE_STATUSES = ['confirmado', 'en_preparacion', 'listo_para_retiro', 'enviado', 'entregado']

type ReportType = 'ingresos' | 'pedidos' | 'productos'
type GroupBy = 'day' | 'week' | 'month'

function parseList(v: string | null): string[] | null {
  if (!v) return null
  const arr = v.split(',').map((s) => s.trim()).filter(Boolean)
  return arr.length > 0 ? arr : null
}

function groupKey(dateIso: string, groupBy: GroupBy): string {
  const d = parseISO(dateIso)
  if (groupBy === 'day') return format(d, 'yyyy-MM-dd')
  if (groupBy === 'week') return format(startOfWeek(d, { weekStartsOn: 1 }), 'yyyy-MM-dd')
  return format(startOfMonth(d), 'yyyy-MM-dd')
}

export async function GET(req: Request) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  const url = new URL(req.url)
  const type = (url.searchParams.get('type') ?? 'ingresos') as ReportType
  const from = url.searchParams.get('from')
  const to = url.searchParams.get('to')
  const statuses = parseList(url.searchParams.get('status'))
  const payments = parseList(url.searchParams.get('payment_method'))
  const deliveries = parseList(url.searchParams.get('delivery_type'))
  const categoryId = url.searchParams.get('category_id')
  const groupBy = (url.searchParams.get('group_by') ?? 'day') as GroupBy

  const supabase = createAdminClient()

  // Build base orders query with filters
  let ordersQuery = supabase
    .from('orders')
    .select('id, order_number, customer_name, customer_phone, delivery_type, payment_method, status, subtotal, delivery_fee, total, created_at')
    .order('created_at', { ascending: false })

  if (from) ordersQuery = ordersQuery.gte('created_at', from)
  if (to) ordersQuery = ordersQuery.lte('created_at', to)

  // Default for "ingresos" report = only revenue-counting statuses unless user overrides
  const effectiveStatuses = statuses ?? (type === 'ingresos' ? REVENUE_STATUSES : null)
  if (effectiveStatuses) ordersQuery = ordersQuery.in('status', effectiveStatuses)
  if (payments) ordersQuery = ordersQuery.in('payment_method', payments)
  if (deliveries) ordersQuery = ordersQuery.in('delivery_type', deliveries)

  const { data: orders, error: ordersError } = await ordersQuery
  if (ordersError) return NextResponse.json({ error: ordersError.message }, { status: 500 })

  const orderRows = orders ?? []

  // Summary (always computed)
  const totals = orderRows.reduce(
    (acc, o) => {
      const isCancel = o.status === 'cancelado'
      const isRev = REVENUE_STATUSES.includes(o.status)
      acc.count += 1
      acc.totalAll += Number(o.total)
      if (isRev) {
        acc.totalNet += Number(o.total)
        acc.subtotalNet += Number(o.subtotal)
        acc.deliveryNet += Number(o.delivery_fee)
        acc.countNet += 1
      } else if (isCancel) {
        acc.countCancel += 1
      }
      return acc
    },
    { count: 0, countNet: 0, countCancel: 0, totalAll: 0, totalNet: 0, subtotalNet: 0, deliveryNet: 0 }
  )

  const aov = totals.countNet > 0 ? totals.totalNet / totals.countNet : 0

  // Time series grouped
  const seriesMap = new Map<string, { revenue: number; count: number }>()
  for (const o of orderRows) {
    const k = groupKey(o.created_at, groupBy)
    const cur = seriesMap.get(k) ?? { revenue: 0, count: 0 }
    cur.count += 1
    if (REVENUE_STATUSES.includes(o.status)) cur.revenue += Number(o.total)
    seriesMap.set(k, cur)
  }
  const timeSeries = Array.from(seriesMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([bucket, v]) => ({ bucket, ...v }))

  // For "productos" type, aggregate order_items
  let products: Array<{ product_id: string; product_name: string; quantity: number; revenue: number }> = []
  if (type === 'productos' && orderRows.length > 0) {
    const orderIds = orderRows
      .filter((o) => REVENUE_STATUSES.includes(o.status))
      .map((o) => o.id)

    if (orderIds.length > 0) {
      let itemsQuery = supabase
        .from('order_items')
        .select('product_id, product_name, quantity, subtotal, products!inner(category_id)')
        .in('order_id', orderIds)

      if (categoryId) itemsQuery = itemsQuery.eq('products.category_id', categoryId)

      const { data: items, error: itemsError } = await itemsQuery
      if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 })

      const acc = new Map<string, { name: string; qty: number; revenue: number }>()
      for (const it of items ?? []) {
        const cur = acc.get(it.product_id) ?? { name: it.product_name, qty: 0, revenue: 0 }
        cur.qty += Number(it.quantity)
        cur.revenue += Number(it.subtotal)
        acc.set(it.product_id, cur)
      }
      products = Array.from(acc.entries())
        .map(([product_id, v]) => ({ product_id, product_name: v.name, quantity: v.qty, revenue: v.revenue }))
        .sort((a, b) => b.quantity - a.quantity)
    }
  }

  return NextResponse.json({
    type,
    range: { from, to },
    groupBy,
    summary: { ...totals, aov },
    timeSeries,
    orders: orderRows,
    products,
  })
}
