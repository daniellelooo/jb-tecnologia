import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { sessionId, slots, total, issues, isCompatible, useCase, customerName, customerPhone, notes } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId requerido' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('pc_builds')
      .insert({
        session_id: sessionId,
        use_case: useCase ?? null,
        cpu_id: slots?.cpu_id ?? null,
        motherboard_id: slots?.motherboard_id ?? null,
        ram_id: slots?.ram_id ?? null,
        storage_id: slots?.storage_id ?? null,
        gpu_id: slots?.gpu_id ?? null,
        psu_id: slots?.psu_id ?? null,
        case_id: slots?.case_id ?? null,
        cooling_id: slots?.cooling_id ?? null,
        total_price: total ?? 0,
        compatibility_issues: issues ?? [],
        is_compatible: isCompatible ?? true,
        status: customerName ? 'requested' : 'draft',
        customer_name: customerName ?? null,
        customer_phone: customerPhone ?? null,
        notes: notes ?? null,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error saving build:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ id: data.id }, { status: 201 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
