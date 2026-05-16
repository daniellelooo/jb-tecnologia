import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const itemSchema = z.object({
  product_id: z.string().regex(UUID_RE, 'product_id debe ser UUID'),
  quantity: z.number().int().min(1),
  unit_price: z.number().min(0),
})

const orderSchema = z.object({
  customer_name: z.string().min(2),
  customer_phone: z.string().min(7),
  customer_email: z.string().email().optional().or(z.literal('')),
  customer_id_number: z.string().optional().or(z.literal('')),
  delivery_type: z.enum(['retiro_en_tienda', 'domicilio_medellin']),
  delivery_address: z.string().optional().or(z.literal('')),
  delivery_neighborhood: z.string().optional().or(z.literal('')),
  subtotal: z.number().min(0),
  delivery_fee: z.number().min(0),
  total: z.number().min(0),
  payment_method: z.enum(['efectivo_en_tienda', 'transferencia', 'nequi', 'daviplata', 'contraentrega']),
  notes: z.string().optional().or(z.literal('')),
  build_id: z.string().regex(UUID_RE).nullable().optional(),
  items: z.array(itemSchema).min(1),
})

export async function POST(req: Request) {
  try {
    const json = await req.json()
    const parsed = orderSchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsed.data
    const supabase = createAdminClient()

    const rpcArgs = {
      p_customer_name: data.customer_name,
      p_customer_phone: data.customer_phone,
      p_customer_email: data.customer_email || null,
      p_customer_id_number: data.customer_id_number || null,
      p_delivery_type: data.delivery_type,
      p_delivery_address: data.delivery_address || null,
      p_delivery_neighborhood: data.delivery_neighborhood || null,
      p_subtotal: data.subtotal,
      p_delivery_fee: data.delivery_fee,
      p_total: data.total,
      p_payment_method: data.payment_method,
      p_notes: data.notes || null,
      p_build_id: data.build_id || null,
      p_items: data.items,
    }
    // @ts-expect-error — RPC TypeScript generator marks text params as required, but Postgres function accepts NULL
    const { data: result, error } = await supabase.rpc('create_order_with_items', rpcArgs)

    if (error) {
      console.error('Order RPC error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const payload = result as { id: string; order_number: string }
    return NextResponse.json(payload, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
