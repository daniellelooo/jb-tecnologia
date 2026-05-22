'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Check } from 'lucide-react'
import { toast } from 'sonner'

const STATUSES = ['pendiente', 'confirmado', 'en_preparacion', 'listo_para_retiro', 'enviado', 'entregado', 'cancelado'] as const

const STATUS_LABEL: Record<string, string> = {
  pendiente: 'Pendiente',
  confirmado: 'Confirmado',
  en_preparacion: 'En preparación',
  listo_para_retiro: 'Listo para retiro',
  enviado: 'Enviado',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

export function OrderStatusControl({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [status, setStatus] = useState(currentStatus)
  const [note, setNote] = useState('')

  async function handleUpdate() {
    if (status === currentStatus && !note) { toast.info('No hay cambios'); return }
    startTransition(async () => {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
      })
      if (!res.ok) {
        const json = await res.json()
        toast.error(json.error ?? 'Error al actualizar')
        return
      }
      toast.success('Estado actualizado')
      setNote('')
      router.refresh()
    })
  }

  return (
    <div className="space-y-3">
      <div>
        <label htmlFor="status" className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-1.5">Cambiar estado</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full h-10 rounded-xl border border-neutral-200 bg-white text-neutral-900 px-3 text-sm font-medium focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 transition-colors"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="note" className="block text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500 mb-1.5">Nota (opcional)</label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Información para el cliente o el equipo"
          className="w-full rounded-xl border border-neutral-200 bg-white text-neutral-900 px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 transition-colors resize-none"
        />
      </div>
      <button
        onClick={handleUpdate}
        disabled={pending}
        className="group w-full inline-flex items-center justify-center gap-2 bg-neutral-900 text-white rounded-full py-2.5 text-sm font-medium hover:bg-neutral-800 transition-colors duration-300 disabled:opacity-50"
      >
        {pending ? <><Loader2 className="h-4 w-4 animate-spin" /> Guardando…</> : <><Check className="h-4 w-4" strokeWidth={1.8} /> Actualizar estado</>}
      </button>
    </div>
  )
}
