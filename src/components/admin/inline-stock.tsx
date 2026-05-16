'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function InlineStock({ productId, currentStock }: { productId: string; currentStock: number }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(currentStock.toString())
  const [pending, startTransition] = useTransition()

  function handleSave() {
    const newStock = parseInt(value, 10)
    if (isNaN(newStock) || newStock < 0) { toast.error('Stock inválido'); return }
    if (newStock === currentStock) { setEditing(false); return }
    startTransition(async () => {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock }),
      })
      if (res.ok) {
        toast.success(`Stock actualizado a ${newStock}`)
        setEditing(false)
        router.refresh()
      } else toast.error('Error al actualizar')
    })
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-sm font-bold tabular-nums hover:bg-neutral-800 rounded-md px-2 py-0.5 transition-colors duration-300 ease-premium"
      >
        {currentStock}
      </button>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="number"
        min="0"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSave()}
        autoFocus
        className="h-7 w-16 rounded-md border border-neutral-700 px-2 text-sm tabular-nums focus:outline-none focus:border-white"
      />
      <button onClick={handleSave} disabled={pending} className="h-6 w-6 rounded-md hover:bg-neutral-800 grid place-items-center">
        {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" strokeWidth={1.8} />}
      </button>
      <button onClick={() => { setEditing(false); setValue(currentStock.toString()) }} className="h-6 w-6 rounded-md hover:bg-neutral-800 grid place-items-center">
        <X className="h-3 w-3" strokeWidth={1.8} />
      </button>
    </div>
  )
}
