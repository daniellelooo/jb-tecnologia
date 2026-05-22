import { redirect } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Package, ShoppingBag, User, Mail, Phone, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatCOP } from '@/types'
import { SignOutButton } from './sign-out-button'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Mi cuenta · JB Tecnología MED',
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

const STATUS_TONE: Record<string, string> = {
  pendiente: 'bg-amber-50 text-amber-700 border-amber-200',
  confirmado: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  en_preparacion: 'bg-blue-50 text-blue-700 border-blue-200',
  listo_para_retiro: 'bg-violet-50 text-violet-700 border-violet-200',
  enviado: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  entregado: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelado: 'bg-red-50 text-red-700 border-red-200',
}

export default async function MiCuentaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/cuenta')
  if (user.user_metadata?.role === 'admin') redirect('/admin')

  const fullName = (user.user_metadata?.full_name as string | undefined) ?? user.email ?? 'Cliente'
  const phone = (user.user_metadata?.phone as string | undefined) ?? ''
  const email = user.email ?? ''

  // Match orders solo por email: el teléfono puede repetirse entre clientes
  // (compartido en familia, número reciclado por la operadora) y traería pedidos ajenos.
  // El email del pedido se captura en el checkout, así que coincide con la cuenta del cliente.
  const adminDb = createAdminClient()
  const { data: orders } = email
    ? await adminDb
        .from('orders')
        .select('id, order_number, total, status, created_at, delivery_type, payment_method')
        .eq('customer_email', email)
        .order('created_at', { ascending: false })
    : { data: [] as Array<{ id: string; order_number: string; total: number; status: string; created_at: string; delivery_type: string; payment_method: string }> }

  const totalSpent = (orders ?? [])
    .filter((o) => o.status !== 'cancelado' && o.status !== 'pendiente')
    .reduce((s, o) => s + Number(o.total), 0)

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        <header className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-500 mb-2">Mi cuenta</div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-display text-neutral-900">Hola, {fullName.split(' ')[0]}</h1>
            <p className="text-sm text-neutral-500 mt-2">Aquí puedes ver tus pedidos y datos de contacto.</p>
          </div>
          <SignOutButton />
        </header>

        {/* Profile + summary */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-3xl border border-neutral-200 bg-white shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
                <User className="h-4 w-4" strokeWidth={1.5} />
              </div>
              <h2 className="font-bold text-base text-neutral-900">Datos personales</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Info icon={User} label="Nombre" value={fullName} />
              <Info icon={Mail} label="Correo" value={email} />
              {phone && <Info icon={Phone} label="Teléfono" value={phone} />}
              <Info icon={Calendar} label="Cliente desde" value={format(new Date(user.created_at), "d 'de' MMMM yyyy", { locale: es })} />
            </div>
          </div>

          <div className="rounded-3xl bg-neutral-900 text-white shadow-sm p-6 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60 mb-2">Total comprado</div>
              <div className="text-3xl md:text-4xl font-bold tracking-display tabular-nums">{formatCOP(totalSpent)}</div>
              <p className="text-xs text-white/60 mt-1.5">Pedidos no cancelados</p>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-white/60 mb-1">Pedidos</div>
              <div className="text-2xl font-bold tabular-nums">{orders?.length ?? 0}</div>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-200 flex items-center justify-between">
            <h2 className="font-bold text-base text-neutral-900 inline-flex items-center gap-2.5">
              <ShoppingBag className="h-4 w-4 text-neutral-400" strokeWidth={1.5} />
              Mis pedidos
            </h2>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">
              {orders?.length ?? 0} {orders?.length === 1 ? 'pedido' : 'pedidos'}
            </span>
          </div>

          {!orders || orders.length === 0 ? (
            <div className="text-center py-16 px-6">
              <Package className="h-10 w-10 mx-auto text-neutral-300 mb-4" strokeWidth={1.5} />
              <p className="text-sm text-neutral-600 font-medium">Aún no tienes pedidos</p>
              <p className="text-xs text-neutral-500 mt-1.5 mb-5">Explora nuestro catálogo y haz tu primera compra.</p>
              <Link
                href="/tienda"
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 text-white text-sm font-medium px-5 py-2.5 hover:bg-neutral-800 transition-colors"
              >
                Ir a la tienda
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-neutral-100">
              {orders.map((o) => (
                <li key={o.id} className="px-6 py-4 flex items-center gap-4 hover:bg-neutral-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-neutral-500">{o.order_number}</span>
                      <span className={`text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full border ${STATUS_TONE[o.status] ?? 'bg-neutral-100 text-neutral-700 border-neutral-200'}`}>
                        {STATUS_LABEL[o.status] ?? o.status}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500 mt-1">
                      {format(new Date(o.created_at), "d 'de' MMMM yyyy 'a las' HH:mm", { locale: es })} ·{' '}
                      {o.delivery_type === 'retiro_en_tienda' ? 'Retiro en tienda' : 'Domicilio'}
                    </div>
                  </div>
                  <div className="text-base font-bold tabular-nums text-neutral-900 shrink-0">
                    {formatCOP(Number(o.total))}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <p className="text-xs text-neutral-500 text-center">
          ¿Tienes alguna duda? Escríbenos a través del{' '}
          <Link href="/servicio-tecnico" className="underline underline-offset-2 hover:no-underline">centro de soporte</Link>.
        </p>
      </div>
    </section>
  )
}

function Info({ icon: Icon, label, value }: { icon: typeof User; label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500 mb-1 flex items-center gap-1.5">
        <Icon className="h-3 w-3" strokeWidth={1.5} />
        {label}
      </div>
      <div className="text-sm text-neutral-900 font-medium">{value || '—'}</div>
    </div>
  )
}

