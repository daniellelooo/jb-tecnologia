import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendAdminNewOrderEmail, sendCustomerConfirmationEmail } from '@/lib/email'

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

    // Recupera nombres reales de los productos para incluirlos en los correos
    // (el RPC ya los guardó en order_items, pero los traemos en una sola query)
    const { data: itemsWithNames } = await supabase
      .from('order_items')
      .select('product_name, quantity, unit_price, subtotal')
      .eq('order_id', payload.id)

    const emailItems = (itemsWithNames ?? data.items.map((i) => ({
      product_name: 'Producto',
      quantity: i.quantity,
      unit_price: i.unit_price,
      subtotal: i.unit_price * i.quantity,
    }))).map((i) => ({
      product_name: i.product_name,
      quantity: i.quantity,
      unit_price: Number(i.unit_price),
      total_price: Number(i.subtotal),
    }))

    // Enviar correos en background (no bloquea la respuesta al cliente)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3001'
    Promise.all([
      sendAdminNewOrderEmail({
        orderNumber: payload.order_number,
        customerName: data.customer_name,
        customerPhone: data.customer_phone,
        customerEmail: data.customer_email || null,
        deliveryType: data.delivery_type,
        deliveryAddress: data.delivery_address || null,
        paymentMethod: data.payment_method,
        total: data.total,
        items: emailItems,
        notes: data.notes || null,
        adminUrl: `${siteUrl}/admin/pedidos/${payload.id}`,
      }),
      data.customer_email
        ? sendCustomerConfirmationEmail({
            orderNumber: payload.order_number,
            customerName: data.customer_name,
            customerEmail: data.customer_email,
            deliveryType: data.delivery_type,
            paymentMethod: data.payment_method,
            total: data.total,
            items: emailItems.map((i) => ({ product_name: i.product_name, quantity: i.quantity, total_price: i.total_price })),
          })
        : Promise.resolve(),
    ]).catch((e) => console.error('[email] Error enviando correos:', e))

    return NextResponse.json(payload, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
