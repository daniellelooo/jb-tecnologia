import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return user
}

export async function POST(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const body = await req.json()
  const db = createAdminClient()
  const { data, error } = await db.from('sellers').insert({
    name: body.name,
    email: body.email || null,
    phone: body.phone || null,
    commission_rate: Number(body.commission_rate) || 3,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}

export async function PATCH(req: Request) {
  if (!await requireAdmin()) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  const body = await req.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 })

  const payload: Record<string, unknown> = {}
  if (updates.name !== undefined) payload.name = updates.name
  if (updates.email !== undefined) payload.email = updates.email || null
  if (updates.phone !== undefined) payload.phone = updates.phone || null
  if (updates.commission_rate !== undefined) payload.commission_rate = Number(updates.commission_rate)
  if (updates.is_active !== undefined) payload.is_active = updates.is_active

  const db = createAdminClient()
  const { data, error } = await db.from('sellers').update(payload).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json(data)
}
