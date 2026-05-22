import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Eye } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatCOP } from '@/types'

export const dynamic = 'force-dynamic'

const STATUS_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_preparacion: 'En preparación',
  listo_para_retiro: 'Listo para retiro',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const STATUS_FILTERS = ['', 'pendiente', 'confirmado', 'en_preparacion', 'listo_para_retiro', 'enviado', 'entregado', 'cancelado']

const STATUS_PILL_CLASS: Record<string, string> = {
  pendiente: 'bg-amber-50 text-amber-700 border border-amber-200',
  confirmado: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  listo_para_retiro: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  entregado: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  en_preparacion: 'bg-blue-50 text-blue-700 border border-blue-200',
  enviado: 'bg-blue-50 text-blue-700 border border-blue-200',
  cancelado: 'bg-red-50 text-red-700 border border-red-200',
}

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams
  const supabase = createAdminClient()

  let query = supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100)
  if (sp.status) query = query.eq('status', sp.status)

  const { data: orders } = await query

  const totalRevenue = orders?.reduce((sum, o) => o.status !== 'cancelado' ? sum + Number(o.total) : sum, 0) ?? 0
  const pendingCount = orders?.filter((o) => o.status === 'pendiente').length ?? 0

  return (
    <div className="space-y-6 md:space-y-8">
      <header>
        <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-500 mb-2">Gestión</div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-display text-neutral-900">Pedidos</h1>
        <p className="text-sm text-neutral-500 mt-2">
          {orders?.length ?? 0} {(orders?.length ?? 0) === 1 ? 'pedido mostrado' : 'pedidos mostrados'}
        </p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <MiniKpi label="En lista" value={(orders?.length ?? 0).toString()} />
        <MiniKpi label="Pendientes" value={pendingCount.toString()} />
        <MiniKpi label="Ventas mostradas" value={formatCOP(totalRevenue)} />
      </div>

      {/* Filter chips */}
      <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm p-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <Link
              key={s || 'all'}
              href={s ? `?status=${s}` : '/admin/pedidos'}
              className={`text-sm font-medium px-3.5 py-1.5 rounded-full transition-colors ${
                (sp.status ?? '') === s
                  ? 'bg-neutral-900 text-white'
                  : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
              }`}
            >
              {s === '' ? 'Todos' : STATUS_LABEL[s]}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr className="text-left">
                <Th>Pedido</Th>
                <Th>Cliente</Th>
                <Th className="hidden md:table-cell">Estado</Th>
                <Th className="hidden lg:table-cell">Entrega</Th>
                <Th className="text-right">Total</Th>
                <Th className="text-right hidden md:table-cell">Fecha</Th>
                <Th>{''}</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {!orders || orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-16 text-neutral-500">
                    No hay pedidos
                  </td>
                </tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-neutral-500">{o.order_number}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-neutral-900">{o.customer_name}</div>
                    <div className="text-xs text-neutral-500">{o.customer_phone}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <StatusPill status={o.status} />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-neutral-600">
                    {o.delivery_type === 'retiro_en_tienda' ? 'Retiro tienda' : 'Domicilio'}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-neutral-900">
                    {formatCOP(Number(o.total))}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-neutral-600 hidden md:table-cell whitespace-nowrap">
                    {format(new Date(o.created_at), 'd MMM HH:mm', { locale: es })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/pedidos/${o.id}`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-neutral-100 text-neutral-700 transition-colors"
                      aria-label="Ver detalle"
                    >
                      <Eye className="h-4 w-4" strokeWidth={1.5} />
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

function MiniKpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm p-5 md:p-6">
      <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-1">{label}</div>
      <div className="text-3xl md:text-4xl font-bold tabular-nums text-neutral-900">{value}</div>
    </div>
  )
}

function Th({ children = null, className = '' }: { children?: React.ReactNode; className?: string }) {
  return (
    <th className={`px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-500 ${className}`}>
      {children}
    </th>
  )
}

function StatusPill({ status }: { status: string }) {
  const cls = STATUS_PILL_CLASS[status] ?? 'bg-neutral-100 text-neutral-600'
  return (
    <span className={`text-[11px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full ${cls}`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}
