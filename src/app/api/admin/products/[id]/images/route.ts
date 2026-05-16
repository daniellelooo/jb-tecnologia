import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/admin-auth'

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const MAX_BYTES = 5 * 1024 * 1024

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error: authError } = await requireAdmin()
  if (authError) return authError

  const { id: productId } = await params
  const form = await req.formData()
  const file = form.get('file')
  const setPrimary = form.get('setPrimary') === 'true'

  if (!(file instanceof File)) return NextResponse.json({ error: 'Archivo faltante' }, { status: 400 })
  if (!ALLOWED.includes(file.type)) return NextResponse.json({ error: 'Formato no permitido (jpg, png, webp, avif)' }, { status: 400 })
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'La imagen pesa más de 5MB' }, { status: 400 })

  const supabase = createAdminClient()

  const { data: product, error: prodErr } = await supabase.from('products').select('id').eq('id', productId).maybeSingle()
  if (prodErr || !product) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${productId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`
  const bytes = new Uint8Array(await file.arrayBuffer())

  const { error: upErr } = await supabase.storage.from('product-images').upload(path, bytes, {
    contentType: file.type,
    upsert: false,
  })
  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 })

  const { data: pub } = supabase.storage.from('product-images').getPublicUrl(path)
  const publicUrl = pub.publicUrl

  const { count } = await supabase.from('product_images').select('id', { count: 'exact', head: true }).eq('product_id', productId)
  const isFirst = (count ?? 0) === 0

  if (setPrimary || isFirst) {
    await supabase.from('product_images').update({ is_primary: false }).eq('product_id', productId)
  }

  const { data: row, error: insErr } = await supabase
    .from('product_images')
    .insert({
      product_id: productId,
      storage_url: publicUrl,
      is_primary: setPrimary || isFirst,
      display_order: count ?? 0,
    })
    .select()
    .single()

  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 })
  return NextResponse.json(row, { status: 201 })
}
