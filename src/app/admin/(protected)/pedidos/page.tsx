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

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams
  const supabase = createAdminClient()

  let query = supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100)
  if (sp.status) query = query.eq('status', sp.status)

  const { data: orders } = await query

  const totalRevenue = orders?.reduce((sum, o) => o.status !== 'cancelado' ? sum + Number(o.total) : sum, 0) ?? 0
  const pendingCount = orders?.filter((o) => o.status === 'pendiente').length ?? 0

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400 mb-2">Gestión</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-display">Pedidos</h1>
      </header>

      <div className="grid grid-cols-3 gap-3">
        <MiniKpi label="En lista" value={(orders?.length ?? 0).toString()} />
        <MiniKpi label="Pendientes" value={pendingCount.toString()} />
        <MiniKpi label="Ventas mostradas" value={formatCOP(totalRevenue)} />
      </div>

      {/* Filter chips */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-3">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <Link
              key={s || 'all'}
              href={s ? `?status=${s}` : '/admin/pedidos'}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-300 ease-premium ${
                (sp.status ?? '') === s ? 'bg-neutral-900 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-700'
              }`}
            >
              {s === '' ? 'Todos' : STATUS_LABEL[s]}
            </Link>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-neutral-800 bg-neutral-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-900 border-b border-neutral-800">
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
            <tbody className="divide-y divide-neutral-800">
              {!orders || orders.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-neutral-500">No hay pedidos</td></tr>
              ) : orders.map((o) => (
                <tr key={o.id} className="hover:bg-neutral-900/50 transition-colors duration-300">
                  <td className="px-4 py-3 font-mono text-[11px] text-neutral-600">{o.order_number}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.customer_name}</div>
                    <div className="text-[11px] text-neutral-500">{o.customer_phone}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <StatusPill status={o.status} />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-xs text-neutral-600">
                    {o.delivery_type === 'retiro_en_tienda' ? 'Retiro tienda' : 'Domicilio'}
                  </td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums">{formatCOP(Number(o.total))}</td>
                  <td className="px-4 py-3 text-right text-xs text-neutral-500 hidden md:table-cell whitespace-nowrap">
                    {format(new Date(o.created_at), 'd MMM HH:mm', { locale: es })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/pedidos/${o.id}`} className="inline-flex h-7 w-7 items-center justify-center rounded-full hover:bg-neutral-800 transition-colors duration-300" aria-label="Ver detalle">
                      <Eye className="h-3.5 w-3.5" strokeWidth={1.5} />
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
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900 px-4 py-3.5">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1">{label}</div>
      <div className="text-xl font-bold tabular-nums">{value}</div>
    </div>
  )
}

function Th({ children = null, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500 ${className}`}>{children}</th>
}

function StatusPill({ status }: { status: string }) {
  const dark = ['pendiente', 'cancelado'].includes(status)
  return (
    <span className={`text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${
      dark ? 'bg-neutral-900 text-white' : 'bg-neutral-800 text-neutral-700'
    }`}>
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}
