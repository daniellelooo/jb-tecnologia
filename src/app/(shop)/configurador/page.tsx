import { getComponentsForAllSlots } from '@/lib/queries/configurator'
import { getComponentSlots } from '@/lib/queries/products'
import { ConfiguratorClient } from './configurator-client'
import type { Metadata } from 'next'
import type { SlotKey } from '@/types'

export const metadata: Metadata = {
  title: 'Configurador de PC — Arma tu computador a medida',
  description: 'Configura tu PC paso a paso con verificación de compatibilidad en tiempo real. Selecciona componentes, ve el precio total y agrega al carrito o consulta por WhatsApp.',
}

export const revalidate = 3600

export default async function ConfiguratorPage() {
  const [components, slotsRaw] = await Promise.all([
    getComponentsForAllSlots(),
    getComponentSlots(),
  ])

  const slots = slotsRaw.map((s) => ({
    slug: s.slug as SlotKey,
    name: s.name,
    help_text: s.help_text,
    is_required: s.is_required,
  }))

  return <ConfiguratorClient components={components} slots={slots} />
}
