import { notFound } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Clock, Package, Truck, Home, XCircle, MessageCircle, FileText, MapPin, Phone, Mail, IdCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { formatCOP } from '@/types'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ order_number: string }>
}

const STATUS_FLOW = [
  { key: 'pendiente', label: 'Pendiente', icon: Clock, description: 'Estamos confirmando tu pedido' },
  { key: 'confirmado', label: 'Confirmado', icon: CheckCircle2, description: 'Pago confirmado, preparando tu pedido' },
  { key: 'en_preparacion', label: 'En preparación', icon: Package, description: 'Ensamblando o empacando' },
  { key: 'listo_para_retiro', label: 'Listo para retirar', icon: Home, description: 'Puedes pasar por tu pedido al local' },
  { key: 'enviado', label: 'En camino', icon: Truck, description: 'Tu pedido está en ruta' },
  { key: 'entregado', label: 'Entregado', icon: CheckCircle2, description: 'Pedido completado' },
]

const PAYMENT_LABELS: Record<string, string> = {
  efectivo_en_tienda: 'Efectivo al retirar',
  transferencia: 'Transferencia bancaria',
  nequi: 'Nequi',
  daviplata: 'Daviplata',
  contraentrega: 'Contraentrega',
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { order_number } = await params
  return {
    title: `Pedido ${order_number}`,
    description: 'Detalles y estado de tu pedido en JB Tecnología',
    robots: { index: false, follow: false },
  }
}

export default async function OrderStatusPage({ params }: PageProps) {
  const { order_number } = await params
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', order_number)
    .maybeSingle()

  if (!order) notFound()

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id)
    .order('subtotal', { ascending: false })

  const { data: history } = await supabase
    .from('order_status_history')
    .select('*')
    .eq('order_id', order.id)
    .order('changed_at', { ascending: false })

  const isCancelled = order.status === 'cancelado'
  const currentStepIndex = STATUS_FLOW.findIndex((s) => s.key === order.status)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="text-center mb-8">
        {isCancelled ? (
          <>
            <div className="inline-flex h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 items-center justify-center mb-4">
              <XCircle className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold">Pedido cancelado</h1>
          </>
        ) : (
          <>
            <div className="inline-flex h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold">¡Pedido recibido!</h1>
          </>
        )}
        <p className="text-muted-foreground mt-2">
          Número de orden: <span className="font-mono font-semibold text-foreground">{order.order_number}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Creado el {format(new Date(order.created_at), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es })}
        </p>
      </div>

      {/* Status timeline */}
      {!isCancelled && (
        <section className="rounded-xl border p-6 mb-6">
          <h2 className="font-semibold mb-4">Estado del pedido</h2>
          <ol className="space-y-3">
            {STATUS_FLOW.map((step, idx) => {
              const Icon = step.icon
              const isReached = idx <= currentStepIndex
              const isCurrent = idx === currentStepIndex
              return (
                <li key={step.key} className="flex items-start gap-3">
                  <div className={
                    isReached
                      ? `h-9 w-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0 ${isCurrent ? 'ring-4 ring-primary/20' : ''}`
                      : 'h-9 w-9 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0'
                  }>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 pt-1.5">
                    <div className={isReached ? 'font-medium' : 'text-muted-foreground'}>{step.label}</div>
                    <div className="text-xs text-muted-foreground">{step.description}</div>
                  </div>
                </li>
              )
            })}
          </ol>
        </section>
      )}

      {/* Order details */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <section className="rounded-xl border p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><MapPin className="h-4 w-4" /> Entrega</h3>
          <div className="text-sm space-y-1">
            <div>{order.delivery_type === 'retiro_en_tienda' ? 'Retiro en tienda' : 'Domicilio en Medellín'}</div>
            {order.delivery_address && <div className="text-muted-foreground">{order.delivery_address}</div>}
            {order.delivery_neighborhood && <div className="text-muted-foreground">{order.delivery_neighborhood}</div>}
            {order.notes && <div className="text-xs text-muted-foreground mt-2 pt-2 border-t whitespace-pre-line">{order.notes}</div>}
          </div>
        </section>

        <section className="rounded-xl border p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2"><FileText className="h-4 w-4" /> Pago</h3>
          <div className="text-sm">
            <div>{PAYMENT_LABELS[order.payment_method] ?? order.payment_method}</div>
            {order.payment_reference && (
              <div className="text-xs text-muted-foreground mt-1">Referencia: {order.payment_reference}</div>
            )}
          </div>
        </section>

        <section className="rounded-xl border p-6 md:col-span-2">
          <h3 className="font-semibold mb-3">Datos del cliente</h3>
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span>{order.customer_phone}</span>
            </div>
            {order.customer_email && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span>{order.customer_email}</span>
              </div>
            )}
            {order.customer_id_number && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <IdCard className="h-3.5 w-3.5 shrink-0" />
                <span>CC {order.customer_id_number}</span>
              </div>
            )}
            <div className="text-sm font-medium">{order.customer_name}</div>
          </div>
        </section>
      </div>

      {/* Items */}
      <section className="rounded-xl border p-6 mb-6">
        <h3 className="font-semibold mb-4">Productos ({items?.length ?? 0})</h3>
        <ul className="space-y-3 divide-y">
          {items?.map((item) => (
            <li key={item.id} className="flex items-start gap-4 pt-3 first:pt-0">
              <div className="text-xs bg-muted px-2 py-1 rounded shrink-0 tabular-nums">×{item.quantity}</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{item.product_name}</div>
                <div className="text-xs text-muted-foreground font-mono">{item.product_sku}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{formatCOP(Number(item.subtotal))}</div>
                <div className="text-xs text-muted-foreground">{formatCOP(Number(item.unit_price))} c/u</div>
              </div>
            </li>
          ))}
        </ul>
        <div className="border-t mt-4 pt-4 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCOP(Number(order.subtotal))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Domicilio</span>
            <span>{Number(order.delivery_fee) === 0 ? 'Gratis' : formatCOP(Number(order.delivery_fee))}</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t pt-2 mt-2">
            <span>Total</span>
            <span className="tabular-nums">{formatCOP(Number(order.total))}</span>
          </div>
        </div>
      </section>

      {/* History */}
      {history && history.length > 0 && (
        <section className="rounded-xl border p-6 mb-6">
          <h3 className="font-semibold mb-3">Historial</h3>
          <ul className="space-y-2 text-sm">
            {history.map((h) => (
              <li key={h.id} className="flex items-start gap-3">
                <div className="text-xs text-muted-foreground tabular-nums whitespace-nowrap pt-0.5">
                  {format(new Date(h.changed_at), 'd MMM HH:mm', { locale: es })}
                </div>
                <div>
                  <div className="capitalize font-medium">{h.status.replace(/_/g, ' ')}</div>
                  {h.note && <div className="text-xs text-muted-foreground">{h.note}</div>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild variant="outline">
          <Link href="/tienda">Seguir comprando</Link>
        </Button>
        <Button asChild>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '573001234567'}?text=${encodeURIComponent(`Hola, soy ${order.customer_name}. Te escribo por mi pedido ${order.order_number}.`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="h-4 w-4" /> Hablar con JB Tecnología
          </a>
        </Button>
      </div>
    </div>
  )
}
