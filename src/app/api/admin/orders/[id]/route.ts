import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error: authError, user } = await requireAdmin()
  if (authError) return authError

  const { id } = await params
  const { status, note } = await req.json()

  const supabase = createAdminClient()

  // Verify order exists
  const { data: order } = await supabase.from('orders').select('id, status').eq('id', id).maybeSingle()
  if (!order) return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 })

  // Update order status if changed
  if (status && status !== order.status) {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Log history entry
  await supabase.from('order_status_history').insert({
    order_id: id,
    status: status ?? order.status,
    note: note || null,
    changed_by: user?.email ?? 'admin',
  })

  return NextResponse.json({ ok: true })
}
