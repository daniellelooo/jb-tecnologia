import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Users, Phone, Mail, ShoppingBag } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatCOP } from '@/types'

export const dynamic = 'force-dynamic'

const REVENUE_STATUSES = ['confirmado', 'en_preparacion', 'listo_para_retiro', 'enviado', 'entregado']

interface Customer {
  phone: string
  name: string
  email: string | null
  orders: number
  revenueOrders: number
  totalSpent: number
  firstOrder: string
  lastOrder: string
  hasCancelled: boolean
}

async function getCustomers(): Promise<{ list: Customer[]; totalCustomers: number; newThisMonth: number }> {
  const supabase = createAdminClient()
  const { data: orders } = await supabase
    .from('orders')
    .select('id, customer_name, customer_phone, customer_email, status, total, created_at')
    .order('created_at', { ascending: false })

  const map = new Map<string, Customer>()
  for (const o of orders ?? []) {
    if (!o.customer_phone) continue
    const key = o.customer_phone
    const cur = map.get(key)
    const isRevenue = REVENUE_STATUSES.includes(o.status)
    const isCancel = o.status === 'cancelado'

    if (!cur) {
      map.set(key, {
        phone: key,
        name: o.customer_name,
        email: o.customer_email,
        orders: 1,
        revenueOrders: isRevenue ? 1 : 0,
        totalSpent: isRevenue ? Number(o.total) : 0,
        firstOrder: o.created_at,
        lastOrder: o.created_at,
        hasCancelled: isCancel,
      })
    } else {
      cur.orders += 1
      if (isRevenue) {
        cur.revenueOrders += 1
        cur.totalSpent += Number(o.total)
      }
      if (isCancel) cur.hasCancelled = true
      if (o.created_at < cur.firstOrder) cur.firstOrder = o.created_at
      if (o.created_at > cur.lastOrder) {
        cur.lastOrder = o.created_at
      }
      if (!cur.email && o.customer_email) cur.email = o.customer_email
    }
  }

  const list = Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent || b.orders - a.orders)
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  const newThisMonth = list.filter((c) => new Date(c.firstOrder) >= monthStart).length

  return { list, totalCustomers: list.length, newThisMonth }
}

export default async function ClientesPage() {
  const { list, totalCustomers, newThisMonth } = await getCustomers()
  const totalRevenue = list.reduce((s, c) => s + c.totalSpent, 0)
  const avgPerCustomer = totalCustomers > 0 ? totalRevenue / totalCustomers : 0
  const recurringCount = list.filter((c) => c.orders > 1).length

  return (
    <div className="space-y-8">
      <header>
        <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-500 mb-2">CRM</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-display text-neutral-900">Clientes</h1>
        <p className="text-sm text-neutral-500 mt-2">
          Lista construida a partir de pedidos (agrupados por teléfono).
          {totalCustomers === 0 ? ' Aún no hay clientes.' : ` ${totalCustomers} clientes únicos.`}
        </p>
      </header>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiLight label="Clientes totales" value={totalCustomers.toString()} icon={Users} />
        <KpiLight label="Nuevos este mes" value={newThisMonth.toString()} icon={Users} accent="emerald" />
        <KpiLight label="Recurrentes" value={recurringCount.toString()} sub={totalCustomers > 0 ? `${((recurringCount / totalCustomers) * 100).toFixed(0)}% del total` : undefined} icon={ShoppingBag} />
        <KpiLight label="Gasto promedio" value={formatCOP(avgPerCustomer)} icon={ShoppingBag} />
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
          <h2 className="font-bold text-sm tracking-tight text-neutral-900">Listado de clientes</h2>
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
            {list.length} {list.length === 1 ? 'cliente' : 'clientes'}
          </span>
        </div>
        {list.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center py-12">No hay clientes registrados aún.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr className="text-left">
                  <Th>Cliente</Th>
                  <Th>Contacto</Th>
                  <Th className="text-right">Pedidos</Th>
                  <Th className="text-right">Gastado</Th>
                  <Th>Último pedido</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {list.slice(0, 200).map((c) => (
                  <tr key={c.phone} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="text-sm font-medium text-neutral-900">{c.name}</div>
                      {c.orders > 1 && (
                        <span className="inline-block text-[10px] font-bold uppercase tracking-[0.15em] text-emerald-700 mt-0.5">Recurrente</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="text-xs text-neutral-700 inline-flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-neutral-400" strokeWidth={1.5} />
                        {c.phone}
                      </div>
                      {c.email && (
                        <div className="text-xs text-neutral-500 inline-flex items-center gap-1.5 mt-0.5">
                          <Mail className="h-3 w-3 text-neutral-400" strokeWidth={1.5} />
                          {c.email}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="text-sm font-bold tabular-nums text-neutral-900">{c.orders}</div>
                      {c.revenueOrders < c.orders && (
                        <div className="text-[10px] text-neutral-500 tabular-nums">{c.revenueOrders} confirmados</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right text-sm font-bold tabular-nums text-neutral-900">
                      {formatCOP(c.totalSpent)}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-neutral-600 whitespace-nowrap">
                      {format(new Date(c.lastOrder), "d MMM yy", { locale: es })}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/admin/clientes/${encodeURIComponent(c.phone)}`}
                        className="text-xs font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
                      >
                        Ver cliente →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {list.length > 200 && (
              <div className="text-[11px] text-neutral-500 text-center py-3 border-t border-neutral-200">
                Mostrando 200 de {list.length}
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-xs text-neutral-500">
        💡 Próximamente: podrás permitir que tus clientes creen una cuenta y consulten sus pedidos por su cuenta.
      </p>
    </div>
  )
}

function KpiLight({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string
  value: string
  sub?: string
  icon: typeof Users
  accent?: 'emerald'
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm p-5 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">{label}</div>
        <Icon className={`h-3.5 w-3.5 ${accent === 'emerald' ? 'text-emerald-600' : 'text-neutral-400'}`} strokeWidth={1.5} />
      </div>
      <div className="text-3xl font-bold tracking-display tabular-nums mt-3 text-neutral-900">{value}</div>
      {sub && <div className="text-xs text-neutral-500 mt-1 truncate">{sub}</div>}
    </div>
  )
}

function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-500 ${className}`}>{children}</th>
}
