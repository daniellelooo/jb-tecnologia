import { CheckoutForm } from '@/components/shop/checkout-form'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Completa tus datos y elige cómo recibir el pedido en JB Tecnología MED.',
}

export default function CheckoutPage() {
  return (
    <div className="container mx-auto px-4 pt-12 lg:pt-16 pb-24">
      <div className="max-w-3xl mb-12">
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mpc-graphite mb-4">Paso final</div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-display leading-[0.95]">
          Finaliza tu<br /><span className="text-mpc-silver">pedido.</span>
        </h1>
        <p className="text-mpc-graphite mt-4">Confirma tus datos. Te contactaremos por WhatsApp para coordinar entrega y pago.</p>
      </div>
      <CheckoutForm />
    </div>
  )
}
