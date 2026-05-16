import Link from 'next/link'
import { format, startOfDay, startOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import { ShoppingBag, DollarSign, Hammer, AlertTriangle, Clock, Package, ArrowRight } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatCOP } from '@/types'
import { SalesReportExport } from '@/components/admin/sales-report-export'

export const dynamic = 'force-dynamic'

async function getDashboardData() {
  const supabase = createAdminClient()
  const todayStart = startOfDay(new Date()).toISOString()
  const monthStart = startOfMonth(new Date()).toISOString()

  const [
    { data: ordersToday, count: ordersTodayCount },
    { data: pendingOrders },
    { data: pendingBuilds },
    { data: lowStock, count: lowStockCount },
    { data: monthOrders },
  ] = await Promise.all([
    supabase.from('orders').select('total', { count: 'exact' }).gte('created_at', todayStart),
    supabase.from('orders').select('id, order_number, customer_name, total, created_at').eq('status', 'pendiente').order('created_at', { ascending: false }).limit(5),
    supabase.from('pc_builds').select('id, customer_name, customer_phone, total_price, created_at').eq('status', 'requested').order('created_at', { ascending: false }).limit(5),
    supabase.from('products').select('id, name, stock, brand', { count: 'exact' }).lt('stock', 5).eq('is_active', true).order('stock'),
    supabase.from('orders').select('total').gte('created_at', monthStart).neq('status', 'cancelado'),
  ])

  return {
    ordersTodayCount: ordersTodayCount ?? 0,
    revenueToday: (ordersToday ?? []).reduce((sum, o) => sum + Number(o.total), 0),
    revenueMonth: (monthOrders ?? []).reduce((sum, o) => sum + Number(o.total), 0),
    pendingOrdersCount: pendingOrders?.length ?? 0,
    pendingBuildsCount: pendingBuilds?.length ?? 0,
    lowStockCount: lowStockCount ?? 0,
    pendingOrders: pendingOrders ?? [],
    pendingBuilds: pendingBuilds ?? [],
    lowStock: (lowStock ?? []).slice(0, 6),
  }
}

export default async function AdminDashboard() {
  const data = await getDashboardData()

  return (
    <div className="space-y-8">
      <header>
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400 mb-2">Panel general</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-display">Dashboard</h1>
      </header>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi title="Pedidos hoy" value={data.ordersTodayCount.toString()} sub={formatCOP(data.revenueToday)} icon={ShoppingBag} />
        <Kpi title="Pendientes" value={data.pendingOrdersCount.toString()} sub="Por confirmar" icon={Clock} href="/admin/pedidos?status=pendiente" />
        <Kpi title="Builds nuevos" value={data.pendingBuildsCount.toString()} sub="Solicitudes activas" icon={Hammer} href="/admin/builds" />
        <Kpi title="Stock bajo" value={data.lowStockCount.toString()} sub="Productos < 5" icon={AlertTriangle} href="/admin/productos?filter=bajo" />
      </div>

      <SalesReportExport />

      {/* Monthly revenue card */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-2">Ventas del mes</div>
            <div className="text-4xl md:text-5xl font-bold tracking-display tabular-nums">{formatCOP(data.revenueMonth)}</div>
            <div className="text-xs text-neutral-500 mt-2">
              {format(new Date(), "MMMM 'de' yyyy", { locale: es })} · Excluye cancelados
            </div>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid lg:grid-cols-2 gap-3">
        <Section title="Pedidos pendientes" linkHref="/admin/pedidos" linkLabel="Ver todos">
          {data.pendingOrders.length === 0 ? (
            <Empty text="No hay pedidos pendientes 🎉" />
          ) : (
            <ul className="divide-y divide-neutral-800">
              {data.pendingOrders.map((o) => (
                <li key={o.id} className="py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <Link href={`/admin/pedidos/${o.id}`} className="font-mono text-[11px] text-neutral-500 hover:text-white">{o.order_number}</Link>
                    <div className="text-sm font-medium truncate">{o.customer_name}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5">{format(new Date(o.created_at), 'd MMM HH:mm', { locale: es })}</div>
                  </div>
                  <div className="text-sm font-bold tabular-nums">{formatCOP(Number(o.total))}</div>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Builds solicitados" linkHref="/admin/builds" linkLabel="Ver todos">
          {data.pendingBuilds.length === 0 ? (
            <Empty text="Sin solicitudes pendientes" />
          ) : (
            <ul className="divide-y divide-neutral-800">
              {data.pendingBuilds.map((b) => (
                <li key={b.id} className="py-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{b.customer_name ?? 'Cliente anónimo'}</div>
                    <div className="text-[11px] text-neutral-500">{b.customer_phone ?? '—'}</div>
                  </div>
                  <div className="text-sm font-bold tabular-nums">{formatCOP(Number(b.total_price))}</div>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <Section title="Productos con stock bajo" linkHref="/admin/productos?filter=bajo" linkLabel="Ver productos">
        {data.lowStock.length === 0 ? (
          <Empty text="Todos los productos tienen stock adecuado ✓" />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.lowStock.map((p) => (
              <Link key={p.id} href={`/admin/productos/${p.id}`} className="rounded-2xl bg-neutral-900 hover:bg-neutral-800 px-4 py-3 transition-colors duration-300 ease-premium">
                <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">{p.brand}</div>
                <div className="text-sm font-medium line-clamp-1 mt-0.5">{p.name}</div>
                <div className={p.stock === 0 ? 'text-[11px] mt-1 font-bold' : 'text-[11px] mt-1 text-neutral-600 font-medium'}>
                  Stock: <span className={p.stock === 0 ? 'text-white' : ''}>{p.stock}</span> {p.stock === 0 && '· AGOTADO'}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Section>
    </div>
  )
}

function Kpi({ title, value, sub, icon: Icon, href }: { title: string; value: string; sub?: string; icon: typeof Package; href?: string }) {
  const inner = (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 hover:shadow-soft transition-shadow duration-500 ease-premium h-full">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400">{title}</div>
        <Icon className="h-3.5 w-3.5 text-neutral-400" strokeWidth={1.5} />
      </div>
      <div className="text-3xl font-bold tracking-display tabular-nums mt-3">{value}</div>
      {sub && <div className="text-[11px] text-neutral-500 mt-1 truncate">{sub}</div>}
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : <div>{inner}</div>
}

function Section({ title, children, linkHref, linkLabel }: { title: string; children: React.ReactNode; linkHref?: string; linkLabel?: string }) {
  return (
    <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-sm tracking-tight">{title}</h2>
        {linkHref && linkLabel && (
          <Link href={linkHref} className="text-xs font-medium text-neutral-500 hover:text-white inline-flex items-center gap-1 transition-colors">
            {linkLabel} <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
          </Link>
        )}
      </div>
      {children}
    </section>
  )
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-neutral-500 text-center py-6">{text}</p>
}
