import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink } from 'lucide-react'
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
      <header className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/pedidos" className="h-9 w-9 rounded-full bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 flex items-center justify-center transition-colors duration-300">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400">Pedido</div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-display font-mono">{order.order_number}</h1>
            <p className="text-xs text-neutral-500 mt-1">
              {format(new Date(order.created_at), "d 'de' MMMM 'a las' HH:mm", { locale: es })}
            </p>
          </div>
        </div>
        <Link
          href={`/pedido/${order.order_number}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-medium hover:bg-neutral-900 transition-colors"
        >
          Vista pública <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
        </Link>
      </header>

      <div className="grid lg:grid-cols-[1fr_380px] gap-6">
        <div className="space-y-3">
          <Section title="Cliente">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Nombre" value={order.customer_name} />
              <Field label="Teléfono" value={order.customer_phone} />
              {order.customer_email && <Field label="Email" value={order.customer_email} />}
              {order.customer_id_number && <Field label="Cédula" value={order.customer_id_number} />}
            </div>
          </Section>

          <Section title="Entrega y pago">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Tipo de entrega" value={order.delivery_type === 'retiro_en_tienda' ? 'Retiro en tienda' : 'Domicilio Medellín'} />
              <Field label="Método de pago" value={PAYMENT_LABELS[order.payment_method] ?? order.payment_method} />
              {order.delivery_address && (
                <div className="sm:col-span-2">
                  <Field label="Dirección" value={`${order.delivery_address}${order.delivery_neighborhood ? `, ${order.delivery_neighborhood}` : ''}`} />
                </div>
              )}
            </div>
            {order.notes && (
              <div className="mt-3 pt-3 border-t border-neutral-800">
                <Field label="Notas" value={order.notes} multiline />
              </div>
            )}
          </Section>

          <Section title={`Productos (${items?.length ?? 0})`}>
            <ul className="divide-y divide-neutral-800">
              {items?.map((item) => (
                <li key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-start gap-3 text-sm">
                  <div className="text-[10px] font-bold uppercase tracking-[0.15em] bg-neutral-800 px-1.5 py-0.5 rounded shrink-0 mt-0.5 tabular-nums">×{item.quantity}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{item.product_name}</div>
                    <div className="text-[11px] text-neutral-500 font-mono">{item.product_sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold tabular-nums">{formatCOP(Number(item.subtotal))}</div>
                    <div className="text-[10px] text-neutral-500">{formatCOP(Number(item.unit_price))} c/u</div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-neutral-800 space-y-1.5 text-sm">
              <Row label="Subtotal" value={formatCOP(Number(order.subtotal))} />
              <Row label="Domicilio" value={Number(order.delivery_fee) === 0 ? 'Gratis' : formatCOP(Number(order.delivery_fee))} />
              <div className="border-t border-neutral-800 pt-2 mt-2">
                <Row label="Total" value={formatCOP(Number(order.total))} bold />
              </div>
            </div>
          </Section>
        </div>

        <aside className="space-y-3">
          <Section title="Gestión del pedido">
            <OrderStatusControl orderId={order.id} currentStatus={order.status} />
          </Section>

          <Section title="Historial">
            {history && history.length > 0 ? (
              <ul className="space-y-3 text-sm">
                {history.map((h) => (
                  <li key={h.id}>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-[0.15em] bg-neutral-800 px-2 py-0.5 rounded-full">
                        {h.status.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] text-neutral-500">{format(new Date(h.changed_at), 'd MMM HH:mm', { locale: es })}</span>
                    </div>
                    {h.note && <div className="text-xs text-neutral-600 mt-1">{h.note}</div>}
                    <div className="text-[10px] text-neutral-400 mt-0.5">por {h.changed_by}</div>
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
      <h2 className="text-sm font-bold mb-4">{title}</h2>
      {children}
    </section>
  )
}

function Field({ label, value, multiline = false }: { label: string; value: string; multiline?: boolean }) {
  return (
    <div>
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1">{label}</div>
      <div className={`text-sm font-medium ${multiline ? 'whitespace-pre-line' : ''}`}>{value}</div>
    </div>
  )
}

function Row({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={bold ? 'text-base font-bold' : 'text-neutral-500'}>{label}</span>
      <span className={bold ? 'text-base font-bold tabular-nums' : 'tabular-nums'}>{value}</span>
    </div>
  )
}
