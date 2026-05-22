import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'
import { SETTING_KEYS, type SettingKey } from '@/lib/settings'

export async function GET() {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  const supabase = createAdminClient()
  const { data, error } = await supabase.from('settings').select('key, value')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const out: Record<string, string> = {}
  for (const k of SETTING_KEYS) out[k] = ''
  for (const row of data ?? []) {
    if (SETTING_KEYS.includes(row.key as SettingKey)) out[row.key] = row.value ?? ''
  }
  return NextResponse.json(out)
}

export async function PATCH(req: Request) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  const body = (await req.json()) as Partial<Record<SettingKey, string>>
  const updates = Object.entries(body)
    .filter(([k]) => SETTING_KEYS.includes(k as SettingKey))
    .map(([key, value]) => ({ key, value: String(value ?? '') }))

  if (updates.length === 0) {
    return NextResponse.json({ error: 'Nada que actualizar' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase.from('settings').upsert(updates, { onConflict: 'key' })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
