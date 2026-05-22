import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user ?? null
}

function generateOrderNumber() {
  const date = new Date()
  const ymd = date.getFullYear().toString().slice(2) +
    String(date.getMonth() + 1).padStart(2, '0') +
    String(date.getDate()).padStart(2, '0')
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `POS-${ymd}-${rand}`
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const body = await req.json()
  const { customerName, customerPhone, sellerId, paymentMethod, paymentReference, items } = body

  if (!customerName || !customerPhone || !items?.length) {
    return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
  }

  const db = createAdminClient()

  // Verificar stock
  for (const item of items) {
    const { data: p } = await db.from('products').select('stock, name').eq('id', item.productId).single()
    if (!p) return NextResponse.json({ error: `Producto no encontrado` }, { status: 400 })
    if (p.stock < item.qty) return NextResponse.json({ error: `Stock insuficiente para ${p.name}` }, { status: 400 })
  }

  const subtotal = items.reduce((s: number, i: { price: number; qty: number }) => s + Number(i.price) * i.qty, 0)
  const orderNumber = generateOrderNumber()

  // Crear orden
  const { data: order, error: orderErr } = await db.from('orders').insert({
    order_number: orderNumber,
    customer_name: customerName,
    customer_phone: customerPhone,
    delivery_type: 'retiro_en_tienda',
    subtotal,
    delivery_fee: 0,
    total: subtotal,
    payment_method: paymentMethod,
    payment_reference: paymentReference ?? null,
    status: 'entregado',
    sale_channel: 'pos',
    seller_id: sellerId ?? null,
    notes: 'Venta registrada desde POS admin',
  }).select('id, order_number, customer_name, total, payment_method, sale_channel, created_at, sellers(name)').single()

  if (orderErr || !order) return NextResponse.json({ error: orderErr?.message ?? 'Error creando orden' }, { status: 500 })

  // Crear items y descontar stock
  for (const item of items) {
    const { data: p } = await db.from('products').select('name, sku').eq('id', item.productId).single()
    if (!p) continue

    await db.from('order_items').insert({
      order_id: order.id,
      product_id: item.productId,
      product_name: p.name,
      product_sku: p.sku,
      quantity: item.qty,
      unit_price: item.price,
      total_price: item.price * item.qty,
    })

    const { data: curr } = await db.from('products').select('stock').eq('id', item.productId).single()
    if (curr) {
      await db.from('products').update({ stock: Math.max(0, curr.stock - item.qty) }).eq('id', item.productId)
    }
  }

  return NextResponse.json(order)
}
