import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, ShoppingBag, Receipt, Calendar, TrendingUp } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatCOP } from '@/types'

export const dynamic = 'force-dynamic'

const REVENUE_STATUSES = ['confirmado', 'en_preparacion', 'listo_para_retiro', 'enviado', 'entregado']

const STATUS_TONE: Record<string, string> = {
  pendiente: 'bg-amber-50 text-amber-700 border border-amber-200',
  confirmado: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  en_preparacion: 'bg-blue-50 text-blue-700 border border-blue-200',
  listo_para_retiro: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  enviado: 'bg-blue-50 text-blue-700 border border-blue-200',
  entregado: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelado: 'bg-red-50 text-red-700 border border-red-200',
}

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

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ phone: string }>
}) {
  const { phone: rawPhone } = await params
  const phone = decodeURIComponent(rawPhone)

  const supabase = createAdminClient()
  const { data: orders } = await supabase
    .from('orders')
    .select(
      'id, order_number, customer_name, customer_email, customer_phone, status, total, created_at, payment_method, delivery_type'
    )
    .eq('customer_phone', phone)
    .order('created_at', { ascending: false })

  if (!orders || orders.length === 0) notFound()

  // Derive customer summary
  const customerName = orders[0].customer_name
  const customerEmail = orders.find((o) => o.customer_email)?.customer_email ?? null

  const firstOrderDate = orders.reduce((earliest, o) =>
    o.created_at < earliest ? o.created_at : earliest,
    orders[0].created_at
  )
  const revenueOrders = orders.filter((o) => REVENUE_STATUSES.includes(o.status))
  const totalSpent = revenueOrders.reduce((s, o) => s + Number(o.total), 0)
  const cancelledCount = orders.filter((o) => o.status === 'cancelado').length
  const avgTicket = revenueOrders.length > 0 ? totalSpent / revenueOrders.length : 0
  const daysSinceFirst = differenceInDays(new Date(), new Date(firstOrderDate))
  const isRecurring = orders.length > 1

  return (
    <div className="space-y-6 md:space-y-8">
      {/* HEADER */}
      <header className="flex flex-wrap items-start gap-4">
        <Link
          href="/admin/clientes"
          className="h-10 w-10 rounded-full bg-white border border-neutral-200 shadow-sm hover:bg-neutral-50 flex items-center justify-center text-neutral-700 shrink-0 mt-1 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-500 mb-2">Cliente</div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-neutral-900">{customerName}</h1>
          <p className="text-sm text-neutral-500 mt-2">
            {phone}
            {customerEmail && <> · {customerEmail}</>}
            {' · cliente desde '}
            {format(new Date(firstOrderDate), "d 'de' MMMM yyyy", { locale: es })}
          </p>
        </div>
        {isRecurring && (
          <span className="text-[11px] font-bold uppercase tracking-[0.15em] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0 mt-2">
            Recurrente
          </span>
        )}
      </header>

      {/* KPI GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dark accent card — Total comprado */}
        <div className="rounded-3xl bg-neutral-900 shadow-sm p-5 md:p-6">
          <div className="flex items-start justify-between gap-2">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/60">Total comprado</div>
            <TrendingUp className="h-3.5 w-3.5 text-white/40" strokeWidth={1.5} />
          </div>
          <div className="text-2xl md:text-3xl font-bold tracking-tight tabular-nums mt-3 text-white">
            {formatCOP(totalSpent)}
          </div>
          <div className="text-xs text-white/60 mt-1 truncate">
            {revenueOrders.length} pedido{revenueOrders.length !== 1 ? 's' : ''} confirmado{revenueOrders.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Pedidos totales */}
        <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm p-5 md:p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">Pedidos totales</div>
            <ShoppingBag className="h-3.5 w-3.5 text-neutral-400" strokeWidth={1.5} />
          </div>
          <div className="text-2xl md:text-3xl font-bold tracking-tight tabular-nums mt-3 text-neutral-900">
            {orders.length}
          </div>
          <div className="text-xs text-neutral-500 mt-1 truncate">
            {revenueOrders.length} confirmados+{cancelledCount > 0 ? ` · ${cancelledCount} cancelados` : ''}
          </div>
        </div>

        {/* Ticket promedio */}
        <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm p-5 md:p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">Ticket promedio</div>
            <Receipt className="h-3.5 w-3.5 text-neutral-400" strokeWidth={1.5} />
          </div>
          <div className="text-2xl md:text-3xl font-bold tracking-tight tabular-nums mt-3 text-neutral-900">
            {formatCOP(avgTicket)}
          </div>
          <div className="text-xs text-neutral-500 mt-1 truncate">
            Sobre pedidos confirmados
          </div>
        </div>

        {/* Cliente desde */}
        <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm p-5 md:p-6 hover:shadow-md transition-shadow duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">Cliente desde</div>
            <Calendar className="h-3.5 w-3.5 text-neutral-400" strokeWidth={1.5} />
          </div>
          <div className="text-2xl md:text-3xl font-bold tracking-tight tabular-nums mt-3 text-neutral-900">
            {format(new Date(firstOrderDate), "d MMM yy", { locale: es })}
          </div>
          <div className="text-xs text-neutral-500 mt-1 truncate">
            hace {daysSinceFirst} {daysSinceFirst === 1 ? 'día' : 'días'}
          </div>
        </div>
      </div>

      {/* ORDERS TABLE */}
      <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 className="text-base font-bold text-neutral-900">Historial de pedidos</h2>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
            {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <Th>Pedido</Th>
                <Th>Fecha</Th>
                <Th>Estado</Th>
                <Th>Entrega</Th>
                <Th>Pago</Th>
                <Th className="text-right">Total</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="font-mono text-xs text-neutral-500">{o.order_number}</span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-neutral-600 whitespace-nowrap">
                    {format(new Date(o.created_at), "d MMM yy", { locale: es })}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full ${
                        STATUS_TONE[o.status] ?? 'bg-neutral-100 text-neutral-700 border border-neutral-200'
                      }`}
                    >
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-neutral-700 whitespace-nowrap">
                    {o.delivery_type === 'retiro_en_tienda' ? 'Retiro tienda' : 'Domicilio'}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-neutral-700 whitespace-nowrap">
                    {PAYMENT_LABEL[o.payment_method] ?? o.payment_method}
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm font-bold tabular-nums text-neutral-900 whitespace-nowrap">
                    {formatCOP(Number(o.total))}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Link
                      href={`/admin/pedidos/${o.id}`}
                      className="text-xs font-medium text-neutral-700 hover:text-neutral-900 transition-colors whitespace-nowrap"
                    >
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-500 text-left ${className}`}>
      {children}
    </th>
  )
}
