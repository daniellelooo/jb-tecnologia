import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'

function pathFromPublicUrl(url: string): string | null {
  const marker = '/object/public/product-images/'
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length)
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string; imageId: string }> }) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  const { id: productId, imageId } = await params
  const supabase = createAdminClient()

  const { data: img } = await supabase.from('product_images').select('id, storage_url, is_primary').eq('id', imageId).eq('product_id', productId).maybeSingle()
  if (!img) return NextResponse.json({ error: 'Imagen no encontrada' }, { status: 404 })

  const path = pathFromPublicUrl(img.storage_url)
  if (path) await supabase.storage.from('product-images').remove([path])

  await supabase.from('product_images').delete().eq('id', imageId)

  if (img.is_primary) {
    const { data: next } = await supabase.from('product_images').select('id').eq('product_id', productId).order('display_order', { ascending: true }).limit(1).maybeSingle()
    if (next) await supabase.from('product_images').update({ is_primary: true }).eq('id', next.id)
  }

  return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string; imageId: string }> }) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  const { id: productId, imageId } = await params
  const body = await req.json()
  const supabase = createAdminClient()

  if (body.setPrimary === true) {
    await supabase.from('product_images').update({ is_primary: false }).eq('product_id', productId)
    const { error } = await supabase.from('product_images').update({ is_primary: true }).eq('id', imageId).eq('product_id', productId)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
