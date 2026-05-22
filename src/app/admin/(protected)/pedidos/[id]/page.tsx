import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, User, Truck, Package, Settings, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatCOP } from '@/types'
import { OrderStatusControl } from '@/components/admin/order-status-control'

export const dynamic = 'force-dynamic'

const PAYMENT_LABELS: Record<string, string> = {
  efectivo_en_tienda: 'Efectivo al retirar',
  transferencia: 'Transferencia bancaria',
  nequi: 'Nequi',
  daviplata: 'Daviplata',
  contraentrega: 'Contraentrega',
}

const STATUS_TONE: Record<string, string> = {
  pendiente: 'bg-amber-50 text-amber-700 border border-amber-200',
  confirmado: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  en_preparacion: 'bg-blue-50 text-blue-700 border border-blue-200',
  listo_para_retiro: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  enviado: 'bg-blue-50 text-blue-700 border border-blue-200',
  entregado: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  cancelado: 'bg-red-50 text-red-700 border border-red-200',
}

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = createAdminClient()

  const { data: order } = await supabase.from('orders').select('*').eq('id', id).maybeSingle()
  if (!order) notFound()

  const [{ data: items }, { data: history }] = await Promise.all([
    supabase.from('order_items').select('*').eq('order_id', id),
    supabase.from('order_status_history').select('*').eq('order_id', id).order('changed_at', { ascending: false }),
  ])

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/pedidos"
            className="h-10 w-10 rounded-full bg-white border border-neutral-200 shadow-sm hover:bg-neutral-50 flex items-center justify-center text-neutral-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-500">Pedido</div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-display font-mono text-neutral-900">{order.order_number}</h1>
            <p className="text-sm text-neutral-500 mt-1">
              {format(new Date(order.created_at), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
            </p>
          </div>
        </div>
        <Link
          href={`/pedido/${order.order_number}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-white px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
        >
          Vista pública <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
        </Link>
      </header>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        {/* MAIN COLUMN */}
        <div className="space-y-4">
          {/* Cliente */}
          <Section title="Cliente" icon={User}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nombre" value={order.customer_name} />
              <Field label="Teléfono" value={order.customer_phone} />
              {order.customer_email && <Field label="Email" value={order.customer_email} />}
              {order.customer_id_number && <Field label="Cédula" value={order.customer_id_number} />}
            </div>
          </Section>

          {/* Entrega y pago */}
          <Section title="Entrega y pago" icon={Truck}>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="Tipo de entrega"
                value={order.delivery_type === 'retiro_en_tienda' ? 'Retiro en tienda' : 'Domicilio Medellín'}
              />
              <Field label="Método de pago" value={PAYMENT_LABELS[order.payment_method] ?? order.payment_method} />
              {order.delivery_address && (
                <div className="sm:col-span-2">
                  <Field
                    label="Dirección"
                    value={`${order.delivery_address}${order.delivery_neighborhood ? `, ${order.delivery_neighborhood}` : ''}`}
                    multiline
                  />
                </div>
              )}
            </div>
            {order.notes && (
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <Field label="Notas" value={order.notes} multiline />
              </div>
            )}
          </Section>

          {/* Productos */}
          <Section title={`Productos (${items?.length ?? 0})`} icon={Package}>
            <ul className="divide-y divide-neutral-100">
              {items?.map((item) => (
                <li key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3">
                  <div className="text-[11px] font-bold uppercase tracking-[0.15em] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded shrink-0 mt-0.5 tabular-nums">
                    ×{item.quantity}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral-900">{item.product_name}</div>
                    <div className="text-xs text-neutral-500 font-mono mt-0.5">{item.product_sku}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold tabular-nums text-neutral-900">{formatCOP(Number(item.subtotal))}</div>
                    <div className="text-[11px] text-neutral-500 tabular-nums">{formatCOP(Number(item.unit_price))} c/u</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-neutral-100 space-y-1.5">
              <Row label="Subtotal" value={formatCOP(Number(order.subtotal))} />
              <Row label="Domicilio" value={Number(order.delivery_fee) === 0 ? 'Gratis' : formatCOP(Number(order.delivery_fee))} />
              <div className="border-t border-neutral-100 pt-2 mt-2">
                <Row label="Total" value={formatCOP(Number(order.total))} bold />
              </div>
            </div>
          </Section>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-4">
          {/* Gestión del pedido */}
          <Section title="Gestión del pedido" icon={Settings}>
            <OrderStatusControl orderId={order.id} currentStatus={order.status} />
          </Section>

          {/* Historial */}
          <Section title="Historial" icon={Clock}>
            {history && history.length > 0 ? (
              <ul className="space-y-4">
                {history.map((h) => (
                  <li key={h.id}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[11px] font-bold uppercase tracking-[0.15em] px-2.5 py-1 rounded-full ${STATUS_TONE[h.status] ?? 'bg-neutral-100 text-neutral-700 border border-neutral-200'}`}
                      >
                        {h.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {format(new Date(h.changed_at), 'd MMM HH:mm', { locale: es })}
                      </span>
                    </div>
                    {h.note && <div className="text-sm text-neutral-700 mt-1.5">{h.note}</div>}
                    <div className="text-[11px] text-neutral-400 mt-0.5">por {h.changed_by}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-neutral-500 text-center py-4">Sin historial</p>
            )}
          </Section>
        </aside>
      </div>
    </div>
  )
}

// =========================================================
// Sub-components
// =========================================================

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string
  icon?: typeof User
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white shadow-sm p-6 md:p-7">
      <div className="flex items-center gap-3 mb-5">
        {Icon && (
          <div className="h-9 w-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
            <Icon className="h-4 w-4" strokeWidth={1.5} />
          </div>
        )}
        <h2 className="text-base font-bold text-neutral-900">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Field({
  label,
  value,
  multiline = false,
}: {
  label: string
  value: string
  multiline?: boolean
}) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500 mb-1">{label}</div>
      <div className={`text-sm font-medium text-neutral-900 ${multiline ? 'whitespace-pre-line font-normal text-neutral-700' : ''}`}>
        {value}
      </div>
    </div>
  )
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? 'text-base font-bold text-neutral-900' : 'text-sm text-neutral-600'}>{label}</span>
      <span className={bold ? 'text-base font-bold tabular-nums text-neutral-900' : 'text-sm font-medium tabular-nums text-neutral-900'}>
        {value}
      </span>
    </div>
  )
}
