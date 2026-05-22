#!/usr/bin/env tsx
/**
 * Seeds the local Supabase database with realistic test data so the admin
 * dashboard, reports, and clientes pages show meaningful metrics.
 *
 * Idempotent-ish: creates ~35 orders for ~12 customers spread across the last
 * 60 days. Re-running adds another batch (orders are not deleted).
 *
 * Usage: npx tsx scripts/seed-test-orders.ts
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const envPath = resolve(process.cwd(), '.env.local')
const envText = readFileSync(envPath, 'utf-8')
const env: Record<string, string> = {}
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) env[m[1]] = m[2]
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// =====================================================================
// Fake but realistic customers (Medellín)
// =====================================================================
const CUSTOMERS = [
  { name: 'Sebastián Restrepo', phone: '573001234001', email: 'sebastian.restrepo@gmail.com', neighborhood: 'El Poblado' },
  { name: 'María Fernanda Gómez', phone: '573001234002', email: 'mfgomez@hotmail.com', neighborhood: 'Laureles' },
  { name: 'Andrés Felipe Vélez', phone: '573001234003', email: 'andres.velez@outlook.com', neighborhood: 'Envigado' },
  { name: 'Valentina Holguín', phone: '573001234004', email: 'vale.holguin@gmail.com', neighborhood: 'Belén' },
  { name: 'Juan Pablo Mejía', phone: '573001234005', email: 'jpmejia@gmail.com', neighborhood: 'Sabaneta' },
  { name: 'Laura Catalina Ríos', phone: '573001234006', email: 'laurarios@yahoo.com', neighborhood: 'El Poblado' },
  { name: 'Carlos Andrés Marín', phone: '573001234007', email: 'cmarin@gmail.com', neighborhood: 'Itagüí' },
  { name: 'Daniela Quintero', phone: '573001234008', email: 'dquintero@gmail.com', neighborhood: 'Laureles' },
  { name: 'Esteban Cardona', phone: '573001234009', email: 'esteban.c@hotmail.com', neighborhood: 'Estadio' },
  { name: 'Sara López', phone: '573001234010', email: 'slopez@gmail.com', neighborhood: 'Envigado' },
  { name: 'Mateo Arango', phone: '573001234011', email: 'mateo.arango@gmail.com', neighborhood: 'Robledo' },
  { name: 'Camila Vargas', phone: '573001234012', email: 'camilav@outlook.com', neighborhood: 'El Poblado' },
]

const STATUSES = [
  { value: 'entregado', weight: 35 },
  { value: 'confirmado', weight: 20 },
  { value: 'en_preparacion', weight: 12 },
  { value: 'listo_para_retiro', weight: 8 },
  { value: 'enviado', weight: 5 },
  { value: 'pendiente', weight: 12 },
  { value: 'cancelado', weight: 8 },
] as const

const PAYMENT_METHODS = ['transferencia', 'nequi', 'efectivo_en_tienda', 'daviplata', 'contraentrega'] as const
const DELIVERY_TYPES = ['domicilio_medellin', 'retiro_en_tienda'] as const

function pickWeighted<T extends { value: string; weight: number }>(items: readonly T[]): T['value'] {
  const total = items.reduce((s, i) => s + i.weight, 0)
  let r = Math.random() * total
  for (const it of items) {
    r -= it.weight
    if (r <= 0) return it.value
  }
  return items[items.length - 1].value
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pad(n: number, width: number) {
  return n.toString().padStart(width, '0')
}

interface Product {
  id: string
  name: string
  sku: string
  price: number
}

async function main() {
  console.log('Loading existing products…')
  const { data: products, error: prodErr } = await supabase
    .from('products')
    .select('id, name, sku, price')
    .eq('is_active', true)
    .gt('stock', 0)
    .limit(80)
  if (prodErr || !products || products.length === 0) {
    console.error('No products available to seed orders')
    process.exit(1)
  }
  console.log(`Found ${products.length} active products with stock.`)

  const productList: Product[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    price: Number(p.price),
  }))

  const now = new Date()
  const NUM_ORDERS = 36
  const ordersToInsert: Array<{
    rowOrder: Record<string, unknown>
    items: Array<Record<string, unknown>>
  }> = []

  for (let i = 0; i < NUM_ORDERS; i++) {
    // Distribute across last 60 days with heavier weight on recent days
    const bias = Math.random() < 0.55 ? 30 : 60
    const daysAgo = randomInt(0, bias)
    const hoursAgo = randomInt(8, 22)
    const createdAt = new Date(now)
    createdAt.setDate(createdAt.getDate() - daysAgo)
    createdAt.setHours(hoursAgo, randomInt(0, 59), randomInt(0, 59))

    const customer = pick(CUSTOMERS)
    const status = pickWeighted(STATUSES)
    const deliveryType = pick(DELIVERY_TYPES)
    const paymentMethod = pick(PAYMENT_METHODS)
    const numItems = randomInt(1, 3)

    // Pick items
    const chosenIdx = new Set<number>()
    while (chosenIdx.size < numItems && chosenIdx.size < productList.length) {
      chosenIdx.add(randomInt(0, productList.length - 1))
    }
    const items = Array.from(chosenIdx).map((idx) => {
      const p = productList[idx]
      const qty = randomInt(1, 2)
      return {
        product_id: p.id,
        product_name: p.name,
        product_sku: p.sku,
        quantity: qty,
        unit_price: p.price,
        subtotal: p.price * qty,
      }
    })
    const subtotal = items.reduce((s, it) => s + Number(it.subtotal), 0)
    const deliveryFee = deliveryType === 'domicilio_medellin' ? 15000 : 0
    const total = subtotal + deliveryFee

    const stamp = createdAt.toISOString().slice(0, 10).replace(/-/g, '')
    const orderNumber = `JB-${stamp}-${pad(i + 1, 3)}`

    ordersToInsert.push({
      rowOrder: {
        order_number: orderNumber,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_email: customer.email,
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'domicilio_medellin' ? `Cra ${randomInt(20, 80)} #${randomInt(10, 60)}-${randomInt(1, 99)}` : null,
        delivery_neighborhood: deliveryType === 'domicilio_medellin' ? customer.neighborhood : null,
        subtotal,
        delivery_fee: deliveryFee,
        total,
        payment_method: paymentMethod,
        status,
        created_at: createdAt.toISOString(),
        updated_at: createdAt.toISOString(),
        notes: null,
      },
      items,
    })
  }

  console.log(`Inserting ${ordersToInsert.length} orders…`)

  let inserted = 0
  for (const { rowOrder, items } of ordersToInsert) {
    const { data: ord, error: ordErr } = await supabase
      .from('orders')
      .insert(rowOrder)
      .select('id')
      .single()
    if (ordErr || !ord) {
      console.error('Failed to insert order', rowOrder.order_number, ordErr?.message)
      continue
    }
    const itemsWithOrder = items.map((it) => ({ ...it, order_id: ord.id }))
    const { error: itemsErr } = await supabase.from('order_items').insert(itemsWithOrder)
    if (itemsErr) {
      console.error('Failed to insert items for', rowOrder.order_number, itemsErr.message)
      continue
    }
    inserted++
  }

  console.log(`\n✓ Inserted ${inserted}/${ordersToInsert.length} orders successfully.`)
  console.log(`  Customers: ${CUSTOMERS.length}`)
  console.log(`  Spread across last 60 days`)
  console.log('\nRefresh the admin dashboard to see the metrics 📊')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
