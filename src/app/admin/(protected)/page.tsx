import Link from 'next/link'
import { format, startOfDay, startOfMonth, subDays, subMonths, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  DollarSign, Hammer, AlertTriangle, Clock, Package, ArrowRight,
  TrendingUp, TrendingDown, CheckCircle2, XCircle, CreditCard, Truck, Receipt, BarChart3,
  Users, ShoppingBag, Tag,
} from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatCOP } from '@/types'

export const dynamic = 'force-dynamic'

const REVENUE_STATUSES = ['confirmado', 'en_preparacion', 'listo_para_retiro', 'enviado', 'entregado']

const STATUS_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_preparacion: 'En preparación',
  listo_para_retiro: 'Listo para retiro',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const PAYMENT_LABEL: Record<string, string> = {
  efectivo_en_tienda: 'Efectivo',
  transferencia: 'Transferencia',
  nequi: 'Nequi',
  daviplata: 'Daviplata',
  contraentrega: 'Contra entrega',
}

async function getDashboardData() {
  const supabase = createAdminClient()
  const now = new Date()
  const todayStart = startOfDay(now).toISOString()
  const monthStart = startOfMonth(now).toISOString()
  const prevMonth = subMonths(now, 1)
  const prevMonthStart = startOfMonth(prevMonth).toISOString()
  const prevMonthEnd = endOfMonth(prevMonth).toISOString()
  const last14Start = startOfDay(subDays(now, 13)).toISOString()

  const [
    { data: todayOrders, count: ordersTodayCount },
    { data: pendingOrders, count: pendingOrdersCount },
    { data: pendingBuilds, count: pendingBuildsCount },
    { data: lowStock, count: lowStockCount },
    { data: monthOrders },
    { data: prevMonthOrders },
    { data: last14Orders },
    { data: bestSellers },
    { data: categories },
    { data: monthCustomers },
  ] = await Promise.all([
    supabase.from('orders').select('total, status, payment_method', { count: 'exact' }).gte('created_at', todayStart),
    supabase.from('orders').select('id, order_number, customer_name, total, created_at', { count: 'exact' }).eq('status', 'pendiente').order('created_at', { ascending: false }).limit(5),
    supabase.from('pc_builds').select('id, customer_name, customer_phone, total_price, created_at', { count: 'exact' }).eq('status', 'requested').order('created_at', { ascending: false }).limit(5),
    supabase.from('products').select('id, name, stock, brand', { count: 'exact' }).lt('stock', 5).eq('is_active', true).order('stock').limit(6),
    supabase.from('orders').select('total, status, payment_method, delivery_type').gte('created_at', monthStart),
    supabase.from('orders').select('total, status').gte('created_at', prevMonthStart).lt('created_at', prevMonthEnd),
    supabase.from('orders').select('total, status, created_at').gte('created_at', last14Start),
    supabase
      .from('order_items')
      .select('product_id, product_name, quantity, subtotal, products!inner(category_id), orders!inner(status, created_at)')
      .in('orders.status', REVENUE_STATUSES)
      .gte('orders.created_at', monthStart)
      .limit(1000),
    supabase.from('categories').select('id, name'),
    supabase.from('orders').select('customer_phone, created_at').gte('created_at', monthStart),
  ])

  const revenueToday = (todayOrders ?? []).filter((o) => REVENUE_STATUSES.includes(o.status)).reduce((s, o) => s + Number(o.total), 0)
  const revenueMonth = (monthOrders ?? []).filter((o) => REVENUE_STATUSES.includes(o.status)).reduce((s, o) => s + Number(o.total), 0)
  const revenuePrevMonth = (prevMonthOrders ?? []).filter((o) => REVENUE_STATUSES.includes(o.status)).reduce((s, o) => s + Number(o.total), 0)

  const monthRevenueOrders = (monthOrders ?? []).filter((o) => REVENUE_STATUSES.includes(o.status))
  const ticketPromedio = monthRevenueOrders.length > 0 ? revenueMonth / monthRevenueOrders.length : 0
  const totalMonthOrders = monthOrders?.length ?? 0
  const cancelledMonth = (monthOrders ?? []).filter((o) => o.status === 'cancelado').length
  const conversionRate = totalMonthOrders > 0 ? (monthRevenueOrders.length / totalMonthOrders) * 100 : 0

  // Status breakdown
  const statusBreakdown: Record<string, { count: number; total: number }> = {}
  for (const o of monthOrders ?? []) {
    statusBreakdown[o.status] = statusBreakdown[o.status] ?? { count: 0, total: 0 }
    statusBreakdown[o.status].count += 1
    statusBreakdown[o.status].total += Number(o.total)
  }

  // Payment + delivery breakdown (revenue this month)
  const paymentBreakdown: Record<string, number> = {}
  const deliveryBreakdown: Record<string, number> = { retiro_en_tienda: 0, domicilio_medellin: 0 }
  for (const o of monthOrders ?? []) {
    if (!REVENUE_STATUSES.includes(o.status)) continue
    paymentBreakdown[o.payment_method] = (paymentBreakdown[o.payment_method] ?? 0) + Number(o.total)
    deliveryBreakdown[o.delivery_type] = (deliveryBreakdown[o.delivery_type] ?? 0) + Number(o.total)
  }

  // Daily revenue last 14 days
  const dailyMap = new Map<string, number>()
  for (let i = 13; i >= 0; i--) dailyMap.set(format(subDays(now, i), 'yyyy-MM-dd'), 0)
  for (const o of last14Orders ?? []) {
    if (!REVENUE_STATUSES.includes(o.status)) continue
    const k = format(new Date(o.created_at), 'yyyy-MM-dd')
    dailyMap.set(k, (dailyMap.get(k) ?? 0) + Number(o.total))
  }
  const dailyRevenue = Array.from(dailyMap.entries()).map(([date, total]) => ({ date, total }))

  // Top products
  type RawItem = { product_id: string; product_name: string; quantity: number; subtotal: number; products: { category_id: string } }
  const productMap = new Map<string, { name: string; qty: number; revenue: number; categoryId: string }>()
  const categoryMap = new Map<string, { qty: number; revenue: number }>()
  for (const it of (bestSellers ?? []) as RawItem[]) {
    const pCur = productMap.get(it.product_id) ?? { name: it.product_name, qty: 0, revenue: 0, categoryId: it.products.category_id }
    pCur.qty += Number(it.quantity)
    pCur.revenue += Number(it.subtotal)
    productMap.set(it.product_id, pCur)

    const cCur = categoryMap.get(it.products.category_id) ?? { qty: 0, revenue: 0 }
    cCur.qty += Number(it.quantity)
    cCur.revenue += Number(it.subtotal)
    categoryMap.set(it.products.category_id, cCur)
  }
  const topProducts = Array.from(productMap.entries())
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 6)

  const catNameById = new Map<string, string>((categories ?? []).map((c) => [c.id, c.name]))
  const topCategories = Array.from(categoryMap.entries())
    .map(([id, v]) => ({ id, name: catNameById.get(id) ?? 'Sin categoría', ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  // New customers this month (unique phones whose first order is in this month)
  const phoneFirst = new Map<string, string>()
  for (const o of monthCustomers ?? []) {
    if (!o.customer_phone) continue
    const cur = phoneFirst.get(o.customer_phone)
    if (!cur || o.created_at < cur) phoneFirst.set(o.customer_phone, o.created_at)
  }
  const newCustomersMonth = Array.from(phoneFirst.values()).filter((d) => d >= monthStart).length

  const momDelta = revenuePrevMonth > 0 ? ((revenueMonth - revenuePrevMonth) / revenuePrevMonth) * 100 : null

  return {
    ordersTodayCount: ordersTodayCount ?? 0,
    revenueToday,
    revenueMonth,
    revenuePrevMonth,
    momDelta,
    ticketPromedio,
    conversionRate,
    cancelledMonth,
    totalMonthOrders,
    revenueOrdersMonth: monthRevenueOrders.length,
    pendingOrdersCount: pendingOrdersCount ?? 0,
    pendingBuildsCount: pendingBuildsCount ?? 0,
    lowStockCount: lowStockCount ?? 0,
    newCustomersMonth,
    pendingOrders: pendingOrders ?? [],
    pendingBuilds: pendingBuilds ?? [],
    lowStock: lowStock ?? [],
    statusBreakdown,
    paymentBreakdown,
    deliveryBreakdown,
    dailyRevenue,
    topProducts,
    topCategories,
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData()
  const maxDaily = Math.max(1, ...data.dailyRevenue.map((d) => d.total))

  return (
    <div className="space-y-6 md:space-y-8">
      {/* HEADER */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-500 mb-2">Panel general</div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-display text-neutral-900">Dashboard</h1>
          <p className="text-sm text-neutral-500 mt-2 first-letter:uppercase">
            {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>
        <Link
          href="/admin/reportes"
          className="inline-flex items-center gap-2 rounded-full bg-neutral-900 text-white text-sm font-medium px-5 py-2.5 hover:bg-neutral-800 transition-colors duration-300 ease-premium"
        >
          <BarChart3 className="h-4 w-4" strokeWidth={1.5} />
          Ir a reportes
        </Link>
      </header>

      {/* HERO REVENUE CARD */}
      <section className="rounded-3xl bg-white border border-neutral-200 shadow-sm overflow-hidden">
        <div className="grid lg:grid-cols-[1.2fr_1fr]">
          {/* Left: Big number */}
          <div className="p-7 md:p-9 border-b lg:border-b-0 lg:border-r border-neutral-200">
            <div className="flex items-start gap-3 mb-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-500">Ingresos del mes</div>
              {data.momDelta !== null && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                  data.momDelta >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {data.momDelta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {data.momDelta >= 0 ? '+' : ''}{data.momDelta.toFixed(1)}%
                </span>
              )}
            </div>
            <div className="text-5xl md:text-6xl font-bold tracking-display tabular-nums text-neutral-900">
              {formatCOP(data.revenueMonth)}
            </div>
            <div className="text-sm text-neutral-600 mt-3 first-letter:uppercase">
              {format(new Date(), "MMMM 'de' yyyy", { locale: es })}
              {data.revenuePrevMonth > 0 && (
                <span className="text-neutral-400"> · mes anterior {formatCOP(data.revenuePrevMonth)}</span>
              )}
            </div>
            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 pt-5 border-t border-neutral-100">
              <Stat label="Pedidos confirmados" value={data.revenueOrdersMonth.toString()} />
              <Stat label="Ticket promedio" value={formatCOP(data.ticketPromedio)} />
              <Stat label="Tasa conversión" value={`${data.conversionRate.toFixed(1)}%`} />
              <Stat label="Cancelados" value={data.cancelledMonth.toString()} />
            </div>
          </div>

          {/* Right: Chart */}
          <div className="p-7 md:p-9 bg-neutral-50/50">
            <div className="flex items-center justify-between mb-5">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-500">Últimos 14 días</div>
              <div className="text-[11px] text-neutral-500 tabular-nums">
                máx {formatCOP(maxDaily)}
              </div>
            </div>
            <div className="flex items-end gap-1.5 h-32">
              {data.dailyRevenue.map((d) => {
                const pct = (d.total / maxDaily) * 100
                return (
                  <div key={d.date} className="flex-1 group relative flex flex-col justify-end">
                    <div
                      className={`w-full rounded-md transition-all duration-500 ease-premium ${
                        d.total > 0 ? 'bg-neutral-900' : 'bg-neutral-200'
                      }`}
                      style={{ height: `${Math.max(3, pct)}%` }}
                    />
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-neutral-900 text-white rounded-lg px-2.5 py-1.5 text-[11px] whitespace-nowrap z-10 shadow-md">
                      <span className="font-bold tabular-nums">{formatCOP(d.total)}</span>
                      <span className="text-neutral-400">{format(new Date(d.date), 'd MMM', { locale: es })}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between mt-3 text-[11px] text-neutral-400 tabular-nums">
              <span>{format(new Date(data.dailyRevenue[0]?.date ?? new Date()), 'd MMM', { locale: es })}</span>
              <span>Hoy</span>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK KPI ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi
          title="Ingresos hoy"
          value={formatCOP(data.revenueToday)}
          sub={`${data.ordersTodayCount} ${data.ordersTodayCount === 1 ? 'pedido creado' : 'pedidos creados'}`}
          icon={DollarSign}
        />
        <Kpi
          title="Pendientes"
          value={data.pendingOrdersCount.toString()}
          sub="Por confirmar"
          icon={Clock}
          accent={data.pendingOrdersCount > 0 ? 'amber' : undefined}
          href="/admin/pedidos?status=pendiente"
        />
        <Kpi
          title="Stock bajo"
          value={data.lowStockCount.toString()}
          sub="Productos < 5 unid."
          icon={AlertTriangle}
          accent={data.lowStockCount > 0 ? 'red' : undefined}
          href="/admin/productos?filter=bajo"
        />
        <Kpi
          title="Nuevos clientes"
          value={data.newCustomersMonth.toString()}
          sub="Este mes"
          icon={Users}
          accent={data.newCustomersMonth > 0 ? 'emerald' : undefined}
          href="/admin/clientes"
        />
      </div>

      {/* TOP PRODUCTS + TOP CATEGORIES */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Section title="Productos más vendidos" subtitle="Mes en curso" icon={Package}>
          {data.topProducts.length === 0 ? (
            <Empty text="Aún no hay ventas confirmadas en el mes" />
          ) : (
            <ul className="space-y-3">
              {data.topProducts.map((p, i) => {
                const maxQty = data.topProducts[0]?.qty ?? 1
                const pct = (p.qty / maxQty) * 100
                return (
                  <li key={p.id} className="flex items-center gap-4">
                    <div className="w-7 h-7 rounded-full bg-neutral-100 text-xs font-bold flex items-center justify-center shrink-0 text-neutral-700">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-900 truncate">{p.name}</div>
                      <div className="h-1.5 rounded-full bg-neutral-100 mt-2 overflow-hidden">
                        <div className="h-full bg-neutral-900 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0 min-w-[80px]">
                      <div className="text-sm font-bold tabular-nums text-neutral-900">{p.qty} und</div>
                      <div className="text-[11px] text-neutral-500 tabular-nums">{formatCOP(p.revenue)}</div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Section>

        <Section title="Categorías top" subtitle="Mes en curso" icon={Tag}>
          {data.topCategories.length === 0 ? (
            <Empty text="Aún no hay categorías con ventas en el mes" />
          ) : (
            <ul className="space-y-3">
              {data.topCategories.map((c, i) => {
                const maxRev = data.topCategories[0]?.revenue ?? 1
                const pct = (c.revenue / maxRev) * 100
                return (
                  <li key={c.id} className="flex items-center gap-4">
                    <div className="w-7 h-7 rounded-full bg-neutral-100 text-xs font-bold flex items-center justify-center shrink-0 text-neutral-700">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-neutral-900 truncate">{c.name}</div>
                      <div className="h-1.5 rounded-full bg-neutral-100 mt-2 overflow-hidden">
                        <div className="h-full bg-neutral-700 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0 min-w-[100px]">
                      <div className="text-sm font-bold tabular-nums text-neutral-900">{formatCOP(c.revenue)}</div>
                      <div className="text-[11px] text-neutral-500 tabular-nums">{c.qty} unidades</div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Section>
      </div>

      {/* STATUS + PAYMENT */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Section title="Estados del mes" subtitle={`${data.totalMonthOrders} pedidos totales`} icon={ShoppingBag}>
          {data.totalMonthOrders === 0 ? (
            <Empty text="Sin pedidos en el mes" />
          ) : (
            <ul className="space-y-3">
              {Object.entries(data.statusBreakdown)
                .sort(([, a], [, b]) => b.count - a.count)
                .map(([status, v]) => {
                  const pct = (v.count / data.totalMonthOrders) * 100
                  const isCancel = status === 'cancelado'
                  const isPending = status === 'pendiente'
                  return (
                    <li key={status}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="inline-flex items-center gap-2 text-neutral-700">
                          {isCancel ? <XCircle className="h-3.5 w-3.5 text-red-500" /> : isPending ? <Clock className="h-3.5 w-3.5 text-amber-500" /> : <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                          <span className="font-medium">{STATUS_LABEL[status] ?? status}</span>
                        </span>
                        <span className="tabular-nums text-neutral-900 font-bold">{v.count} <span className="text-neutral-400 font-normal">· {pct.toFixed(0)}%</span></span>
                      </div>
                      <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${isCancel ? 'bg-red-400' : isPending ? 'bg-amber-400' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  )
                })}
            </ul>
          )}
        </Section>

        <Section title="Métodos de pago" subtitle="Ingresos del mes" icon={CreditCard}>
          {Object.keys(data.paymentBreakdown).length === 0 ? (
            <Empty text="Sin ingresos en el mes" />
          ) : (
            <ul className="space-y-3">
              {Object.entries(data.paymentBreakdown)
                .sort(([, a], [, b]) => b - a)
                .map(([m, v]) => {
                  const pct = (v / data.revenueMonth) * 100
                  return (
                    <li key={m}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="font-medium text-neutral-700">{PAYMENT_LABEL[m] ?? m}</span>
                        <span className="tabular-nums">
                          <span className="font-bold text-neutral-900">{formatCOP(v)}</span>
                          <span className="ml-2 text-neutral-400">{pct.toFixed(0)}%</span>
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                        <div className="h-full bg-neutral-900 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </li>
                  )
                })}
            </ul>
          )}
        </Section>
      </div>

      {/* DELIVERY + BUILDS PENDING */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Section title="Tipo de entrega" subtitle="Ingresos del mes" icon={Truck}>
          {data.revenueMonth === 0 ? (
            <Empty text="Sin ingresos en el mes" />
          ) : (
            <ul className="space-y-3">
              {(['retiro_en_tienda', 'domicilio_medellin'] as const).map((k) => {
                const v = data.deliveryBreakdown[k] ?? 0
                const pct = data.revenueMonth > 0 ? (v / data.revenueMonth) * 100 : 0
                return (
                  <li key={k}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="font-medium text-neutral-700">{k === 'retiro_en_tienda' ? 'Retiro en tienda' : 'Domicilio Medellín'}</span>
                      <span className="tabular-nums">
                        <span className="font-bold text-neutral-900">{formatCOP(v)}</span>
                        <span className="ml-2 text-neutral-400">{pct.toFixed(0)}%</span>
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-neutral-100 overflow-hidden">
                      <div className="h-full bg-neutral-900 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </Section>

        <Section title="Builds solicitados" subtitle={`${data.pendingBuildsCount} ${data.pendingBuildsCount === 1 ? 'solicitud activa' : 'solicitudes activas'}`} icon={Hammer} linkHref="/admin/builds" linkLabel="Ver todos">
          {data.pendingBuilds.length === 0 ? (
            <Empty text="Sin solicitudes pendientes" />
          ) : (
            <ul className="divide-y divide-neutral-100">
              {data.pendingBuilds.map((b) => (
                <li key={b.id} className="py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral-900 truncate">{b.customer_name ?? 'Cliente anónimo'}</div>
                    <div className="text-xs text-neutral-500">{b.customer_phone ?? '—'}</div>
                  </div>
                  <div className="text-sm font-bold tabular-nums text-neutral-900">{formatCOP(Number(b.total_price))}</div>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      {/* PENDING ORDERS — full width slim list */}
      <Section title="Pedidos pendientes" subtitle={`${data.pendingOrdersCount} ${data.pendingOrdersCount === 1 ? 'pedido por confirmar' : 'pedidos por confirmar'}`} icon={Receipt} linkHref="/admin/pedidos?status=pendiente" linkLabel="Ver todos">
        {data.pendingOrders.length === 0 ? (
          <Empty text="No hay pedidos pendientes 🎉" />
        ) : (
          <ul className="divide-y divide-neutral-100">
            {data.pendingOrders.map((o) => (
              <li key={o.id} className="py-3 flex items-center gap-4">
                <Link href={`/admin/pedidos/${o.id}`} className="font-mono text-xs text-neutral-500 hover:text-neutral-900 shrink-0 w-32">
                  {o.order_number}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-neutral-900 truncate">{o.customer_name}</div>
                  <div className="text-xs text-neutral-500">{format(new Date(o.created_at), "d MMM 'a las' HH:mm", { locale: es })}</div>
                </div>
                <div className="text-sm font-bold tabular-nums text-neutral-900">{formatCOP(Number(o.total))}</div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* LOW STOCK */}
      <Section title="Productos con stock bajo" subtitle={`${data.lowStockCount} ${data.lowStockCount === 1 ? 'producto bajo el umbral' : 'productos bajo el umbral'}`} icon={AlertTriangle} linkHref="/admin/productos?filter=bajo" linkLabel="Ver productos">
        {data.lowStock.length === 0 ? (
          <Empty text="Todos los productos tienen stock adecuado ✓" />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.lowStock.map((p) => (
              <Link
                key={p.id}
                href={`/admin/productos/${p.id}`}
                className="rounded-2xl bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/60 px-4 py-3.5 transition-colors duration-300 ease-premium"
              >
                <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">{p.brand}</div>
                <div className="text-sm font-medium text-neutral-900 line-clamp-1 mt-1">{p.name}</div>
                <div className="text-xs mt-1.5 tabular-nums">
                  <span className="text-neutral-500">Stock:</span>{' '}
                  <span className={p.stock === 0 ? 'font-bold text-red-600' : 'font-medium text-neutral-700'}>
                    {p.stock}
                  </span>
                  {p.stock === 0 && <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.15em] text-red-600">Agotado</span>}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

// =========================================================
// Sub-components
// =========================================================

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">{label}</div>
      <div className="text-lg font-bold tabular-nums mt-0.5 text-neutral-900">{value}</div>
    </div>
  )
}

const ACCENTS = {
  amber: 'border-amber-200 bg-amber-50/40',
  red: 'border-red-200 bg-red-50/40',
  emerald: 'border-emerald-200 bg-emerald-50/40',
} as const

const ACCENT_TEXT = {
  amber: 'text-amber-700',
  red: 'text-red-700',
  emerald: 'text-emerald-700',
} as const

function Kpi({
  title,
  value,
  sub,
  icon: Icon,
  href,
  accent,
}: {
  title: string
  value: string
  sub?: string
  icon: typeof Package
  href?: string
  accent?: keyof typeof ACCENTS
}) {
  const inner = (
    <div className={`rounded-3xl border bg-white shadow-sm p-5 md:p-6 hover:shadow-md transition-shadow duration-300 h-full ${accent ? ACCENTS[accent] : 'border-neutral-200'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">{title}</div>
        <Icon className={`h-4 w-4 ${accent ? ACCENT_TEXT[accent] : 'text-neutral-400'}`} strokeWidth={1.5} />
      </div>
      <div className="text-3xl md:text-4xl font-bold tracking-display tabular-nums mt-3 text-neutral-900">{value}</div>
      {sub && <div className="text-xs text-neutral-500 mt-1.5 truncate">{sub}</div>}
    </div>
  )
  return href ? <Link href={href} className="block">{inner}</Link> : <div>{inner}</div>
}

function Section({
  title,
  subtitle,
  children,
  linkHref,
  linkLabel,
  icon: Icon,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
  linkHref?: string
  linkLabel?: string
  icon?: typeof Package
}) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white shadow-sm p-6 md:p-7">
      <div className="flex items-start justify-between mb-5 gap-3">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="h-9 w-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4" strokeWidth={1.5} />
            </div>
          )}
          <div>
            <h2 className="font-bold text-base tracking-tight text-neutral-900">{title}</h2>
            {subtitle && <div className="text-xs text-neutral-500 mt-0.5">{subtitle}</div>}
          </div>
        </div>
        {linkHref && linkLabel && (
          <Link href={linkHref} className="text-xs font-medium text-neutral-700 hover:text-neutral-900 inline-flex items-center gap-1 transition-colors shrink-0">
            {linkLabel} <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-neutral-500 text-center py-8">{text}</p>
}
