'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Upload, Trash2, Star, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export interface ImageRow {
  id: string
  storage_url: string
  is_primary: boolean
  display_order: number
}

export function ProductImagesEditor({ productId, initial }: { productId: string; initial: ImageRow[] }) {
  const router = useRouter()
  const [images, setImages] = useState<ImageRow[]>(initial)
  const [uploading, setUploading] = useState(false)
  const [pending, startTransition] = useTransition()

  async function handleUpload(file: File) {
    if (file.size > 5 * 1024 * 1024) { toast.error('La imagen no debe pesar más de 5MB'); return }
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch(`/api/admin/products/${productId}/images`, { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) { toast.error(json.error ?? 'Error al subir imagen'); return }
      setImages((prev) => {
        const next = [...prev, json as ImageRow]
        if (json.is_primary) return next.map((i) => i.id === json.id ? i : { ...i, is_primary: false })
        return next
      })
      toast.success('Imagen agregada')
      router.refresh()
    } finally {
      setUploading(false)
    }
  }

  function handleDelete(imageId: string) {
    if (!confirm('¿Eliminar esta imagen?')) return
    startTransition(async () => {
      const res = await fetch(`/api/admin/products/${productId}/images/${imageId}`, { method: 'DELETE' })
      if (!res.ok) { toast.error('Error al eliminar'); return }
      setImages((prev) => prev.filter((i) => i.id !== imageId))
      toast.success('Imagen eliminada')
      router.refresh()
    })
  }

  function handleSetPrimary(imageId: string) {
    startTransition(async () => {
      const res = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ setPrimary: true }),
      })
      if (!res.ok) { toast.error('Error'); return }
      setImages((prev) => prev.map((i) => ({ ...i, is_primary: i.id === imageId })))
      toast.success('Imagen principal actualizada')
      router.refresh()
    })
  }

  const sorted = [...images].sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0) || a.display_order - b.display_order)

  return (
    <div className="space-y-3">
      {sorted.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {sorted.map((img) => (
            <div key={img.id} className={`relative group rounded-xl overflow-hidden border ${img.is_primary ? 'border-white ring-2 ring-white/15' : 'border-neutral-800'} aspect-square bg-neutral-900`}>
              <Image src={img.storage_url} alt="" fill sizes="160px" className="object-contain p-2" />
              {img.is_primary && (
                <span className="absolute top-1.5 left-1.5 bg-neutral-900 text-white text-[9px] font-bold uppercase tracking-[0.15em] px-1.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <Star className="h-2.5 w-2.5 fill-white" strokeWidth={0} /> Principal
                </span>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100">
                {!img.is_primary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(img.id)}
                    disabled={pending}
                    className="h-7 px-2 rounded-full bg-neutral-900 text-white text-[10px] font-bold uppercase tracking-[0.15em] inline-flex items-center gap-1 hover:bg-neutral-800"
                  >
                    <Star className="h-3 w-3" strokeWidth={1.8} /> Hacer principal
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  disabled={pending}
                  className="h-7 w-7 rounded-full bg-neutral-900 text-white grid place-items-center hover:bg-neutral-800"
                  aria-label="Eliminar"
                >
                  <Trash2 className="h-3 w-3" strokeWidth={1.8} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <label className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed cursor-pointer transition-colors duration-300 py-6 px-4 text-center ${uploading ? 'border-neutral-700 bg-neutral-900' : 'border-neutral-700 hover:border-white hover:bg-neutral-900'}`}>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          disabled={uploading}
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleUpload(f)
            e.target.value = ''
          }}
        />
        {uploading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm text-neutral-500">Subiendo…</span>
          </>
        ) : (
          <>
            <Upload className="h-5 w-5 text-neutral-400" strokeWidth={1.5} />
            <span className="text-sm font-medium">Subir imagen</span>
            <span className="text-[11px] text-neutral-500">JPG, PNG, WebP o AVIF — máx 5MB</span>
          </>
        )}
      </label>

      {sorted.length === 0 && (
        <p className="text-[11px] text-neutral-500">Este producto aún no tiene imágenes. La primera que subas será la principal.</p>
      )}
    </div>
  )
}
