'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, MapPin, Store, MessageCircle, Banknote, Smartphone, CreditCard } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/lib/stores/cart-store'
import { formatCOP, STORE_LOCATIONS } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

const DELIVERY_FEE_MEDELLIN = 15000

const schema = z.object({
  customerName: z.string().min(2, 'Mínimo 2 caracteres'),
  customerPhone: z.string().min(7, 'Teléfono inválido').regex(/^[0-9+\s\-()]+$/, 'Solo números'),
  customerEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  customerIdNumber: z.string().optional().or(z.literal('')),
  deliveryType: z.enum(['retiro_en_tienda', 'domicilio_medellin']),
  storeLocation: z.string().optional(),
  deliveryAddress: z.string().optional(),
  deliveryNeighborhood: z.string().optional(),
  paymentMethod: z.enum(['efectivo_en_tienda', 'transferencia', 'nequi', 'daviplata', 'contraentrega']),
  notes: z.string().optional(),
})
  .refine((d) => d.deliveryType !== 'domicilio_medellin' || (d.deliveryAddress && d.deliveryAddress.length >= 5), {
    message: 'Dirección requerida para domicilio',
    path: ['deliveryAddress'],
  })
  .refine((d) => d.deliveryType !== 'retiro_en_tienda' || !!d.storeLocation, {
    message: 'Selecciona el local',
    path: ['storeLocation'],
  })

type FormValues = z.infer<typeof schema>

const PAYMENT_OPTIONS = [
  { id: 'efectivo_en_tienda', label: 'Efectivo en el local', icon: Banknote, hint: 'Pagas al retirar tu pedido' },
  { id: 'transferencia', label: 'Transferencia bancaria', icon: CreditCard, hint: 'Te enviamos los datos por WhatsApp' },
  { id: 'nequi', label: 'Nequi', icon: Smartphone, hint: 'Transferencia inmediata desde la app' },
  { id: 'daviplata', label: 'Daviplata', icon: Smartphone, hint: 'Transferencia inmediata desde la app' },
] as const

export function CheckoutForm() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const subtotal = useCartStore((s) => s.getSubtotal())
  const clearCart = useCartStore((s) => s.clearCart)

  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      deliveryType: 'retiro_en_tienda',
      paymentMethod: 'efectivo_en_tienda',
    },
  })

  const deliveryType = watch('deliveryType')
  const paymentMethod = watch('paymentMethod')
  const storeLocation = watch('storeLocation')

  const deliveryFee = useMemo(
    () => (deliveryType === 'domicilio_medellin' ? DELIVERY_FEE_MEDELLIN : 0),
    [deliveryType]
  )

  const total = subtotal + deliveryFee

  async function onSubmit(values: FormValues) {
    if (items.length === 0) {
      toast.error('Tu carrito está vacío')
      return
    }
    setSubmitting(true)
    try {
      const buildIds = Array.from(new Set(items.map((i) => i.buildId).filter(Boolean))) as string[]
      const buildId = buildIds.length === 1 ? buildIds[0] : null

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: values.customerName,
          customer_phone: values.customerPhone,
          customer_email: values.customerEmail,
          customer_id_number: values.customerIdNumber,
          delivery_type: values.deliveryType,
          delivery_address: values.deliveryAddress,
          delivery_neighborhood: values.deliveryNeighborhood,
          subtotal,
          delivery_fee: deliveryFee,
          total,
          payment_method: values.paymentMethod,
          notes: [
            values.notes,
            values.deliveryType === 'retiro_en_tienda' && values.storeLocation ? `Retiro en: ${values.storeLocation}` : '',
          ].filter(Boolean).join('\n'),
          build_id: buildId,
          items: items.map((i) => ({
            product_id: i.productId,
            quantity: i.quantity,
            unit_price: i.price,
          })),
        }),
      })

      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error ?? 'Error al crear el pedido')
      }

      toast.success(`Pedido ${json.order_number} creado`)
      clearCart()
      router.push(`/pedido/${json.order_number}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error desconocido'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed p-12 text-center">
        <p className="text-lg font-medium mb-2">Tu carrito está vacío</p>
        <p className="text-sm text-muted-foreground mb-6">Agrega productos para continuar con el pedido.</p>
        <Button asChild>
          <a href="/tienda">Ir a la tienda</a>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid lg:grid-cols-[1fr_400px] gap-8">
      <div className="space-y-8">
        {/* Personal info */}
        <section className="rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Tus datos</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customerName">Nombre completo *</Label>
              <Input id="customerName" {...register('customerName')} placeholder="Juan Pérez" />
              {errors.customerName && <p className="text-xs text-red-600 mt-1">{errors.customerName.message}</p>}
            </div>
            <div>
              <Label htmlFor="customerPhone">Teléfono / WhatsApp *</Label>
              <Input id="customerPhone" {...register('customerPhone')} placeholder="300 123 4567" />
              {errors.customerPhone && <p className="text-xs text-red-600 mt-1">{errors.customerPhone.message}</p>}
            </div>
            <div>
              <Label htmlFor="customerEmail">Email (opcional)</Label>
              <Input id="customerEmail" type="email" {...register('customerEmail')} placeholder="tucorreo@ejemplo.com" />
              {errors.customerEmail && <p className="text-xs text-red-600 mt-1">{errors.customerEmail.message}</p>}
            </div>
            <div>
              <Label htmlFor="customerIdNumber">Cédula (para factura, opcional)</Label>
              <Input id="customerIdNumber" {...register('customerIdNumber')} placeholder="1234567890" />
            </div>
          </div>
        </section>

        {/* Delivery */}
        <section className="rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Entrega</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setValue('deliveryType', 'retiro_en_tienda')}
              className={cn(
                'rounded-lg border-2 p-4 text-left transition-colors',
                deliveryType === 'retiro_en_tienda' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
              )}
            >
              <Store className="h-5 w-5 mb-2 text-primary" />
              <div className="font-medium">Retiro en tienda</div>
              <div className="text-xs text-muted-foreground">Centro Comercial Monterrey · Gratis</div>
            </button>
            <button
              type="button"
              onClick={() => setValue('deliveryType', 'domicilio_medellin')}
              className={cn(
                'rounded-lg border-2 p-4 text-left transition-colors',
                deliveryType === 'domicilio_medellin' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
              )}
            >
              <MapPin className="h-5 w-5 mb-2 text-primary" />
              <div className="font-medium">Domicilio Medellín</div>
              <div className="text-xs text-muted-foreground">{formatCOP(DELIVERY_FEE_MEDELLIN)} fijo</div>
            </button>
          </div>

          {deliveryType === 'retiro_en_tienda' && (
            <div>
              <Label>Local donde retirarás *</Label>
              <div className="grid sm:grid-cols-2 gap-2 mt-2">
                {STORE_LOCATIONS.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setValue('storeLocation', loc)}
                    className={cn(
                      'text-xs px-3 py-2 rounded-md border text-left transition-colors',
                      storeLocation === loc ? 'border-primary bg-primary/5' : 'border-border hover:bg-accent'
                    )}
                  >
                    {loc}
                  </button>
                ))}
              </div>
              {errors.storeLocation && <p className="text-xs text-red-600 mt-1">{errors.storeLocation.message}</p>}
            </div>
          )}

          {deliveryType === 'domicilio_medellin' && (
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="deliveryAddress">Dirección *</Label>
                <Input id="deliveryAddress" {...register('deliveryAddress')} placeholder="Calle 50 #45-30, apto 502" />
                {errors.deliveryAddress && <p className="text-xs text-red-600 mt-1">{errors.deliveryAddress.message}</p>}
              </div>
              <div>
                <Label htmlFor="deliveryNeighborhood">Barrio</Label>
                <Input id="deliveryNeighborhood" {...register('deliveryNeighborhood')} placeholder="El Poblado" />
              </div>
            </div>
          )}
        </section>

        {/* Payment */}
        <section className="rounded-xl border p-6 space-y-4">
          <h2 className="text-lg font-semibold">Método de pago</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {PAYMENT_OPTIONS.filter((p) => deliveryType === 'retiro_en_tienda' || p.id !== 'efectivo_en_tienda').map((opt) => {
              const Icon = opt.icon
              const active = paymentMethod === opt.id
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setValue('paymentMethod', opt.id)}
                  className={cn(
                    'rounded-lg border-2 p-4 text-left transition-colors',
                    active ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                  )}
                >
                  <Icon className="h-5 w-5 mb-2 text-primary" />
                  <div className="font-medium text-sm">{opt.label}</div>
                  <div className="text-xs text-muted-foreground">{opt.hint}</div>
                </button>
              )
            })}
          </div>

          {paymentMethod === 'transferencia' && (
            <div className="rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4 text-sm">
              <p className="font-medium mb-1">Datos bancarios para transferencia</p>
              <p className="text-xs text-muted-foreground">Después de confirmar el pedido recibirás los datos bancarios y referencia única por WhatsApp.</p>
            </div>
          )}
        </section>

        {/* Notes */}
        <section className="rounded-xl border p-6 space-y-2">
          <Label htmlFor="notes">Notas adicionales (opcional)</Label>
          <textarea
            id="notes"
            {...register('notes')}
            rows={3}
            placeholder="Indica algo adicional sobre tu pedido…"
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </section>
      </div>

      {/* SIDEBAR SUMMARY */}
      <aside className="space-y-4">
        <div className="rounded-xl border bg-card overflow-hidden sticky top-20">
          <div className="p-5 border-b">
            <h3 className="font-semibold mb-3">Resumen del pedido</h3>
            <ul className="space-y-2 max-h-72 overflow-y-auto pr-2 text-sm">
              {items.map((item) => (
                <li key={item.id} className="flex items-start gap-2">
                  <div className="text-xs bg-muted px-1.5 py-0.5 rounded shrink-0 mt-0.5">×{item.quantity}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground">{item.brand}</div>
                    <div className="text-sm line-clamp-1">{item.name}</div>
                  </div>
                  <div className="text-sm font-medium shrink-0">{formatCOP(item.price * item.quantity)}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCOP(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Domicilio</span>
              <span>{deliveryFee === 0 ? 'Gratis' : formatCOP(deliveryFee)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold pt-1">
              <span>Total</span>
              <span className="tabular-nums">{formatCOP(total)}</span>
            </div>
          </div>

          <div className="p-5 border-t">
            <Button type="submit" className="w-full" size="lg" disabled={submitting}>
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Procesando…</>
              ) : (
                <><MessageCircle className="h-4 w-4" /> Confirmar pedido</>
              )}
            </Button>
            <p className="text-[11px] text-muted-foreground mt-3 text-center">
              Recibirás confirmación por WhatsApp al teléfono que indicaste.
            </p>
          </div>
        </div>
      </aside>
    </form>
  )
}
