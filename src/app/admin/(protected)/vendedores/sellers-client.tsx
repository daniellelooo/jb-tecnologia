'use client'

import { useState } from 'react'
import { Users, Trophy, TrendingUp, Edit2, Plus, X, Check, Loader2 } from 'lucide-react'
import { formatCOP } from '@/types'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface Seller {
  id: string
  name: string
  email: string | null
  phone: string | null
  commission_rate: number
  is_active: boolean
  created_at: string
}

interface SellerStat {
  ventas: number
  total: number
  comision: number
}

interface Props {
  sellers: Seller[]
  sellerStats: Record<string, SellerStat>
}

export function SellersClient({ sellers: initialSellers, sellerStats }: Props) {
  const [sellers, setSellers] = useState(initialSellers)
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', commission_rate: '3.5' })

  // Ranking últimos 30 días
  const ranking = sellers
    .filter((s) => sellerStats[s.id])
    .map((s) => ({ seller: s, stats: sellerStats[s.id] }))
    .sort((a, b) => b.stats.total - a.stats.total)

  function openNew() {
    setForm({ name: '', email: '', phone: '', commission_rate: '3.5' })
    setEditId(null)
    setShowForm(true)
  }

  function openEdit(s: Seller) {
    setForm({ name: s.name, email: s.email ?? '', phone: s.phone ?? '', commission_rate: String(s.commission_rate) })
    setEditId(s.id)
    setShowForm(true)
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('El nombre es obligatorio'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/admin/sellers', {
        method: editId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editId, ...form, commission_rate: Number(form.commission_rate) }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error)
      if (editId) {
        setSellers((prev) => prev.map((s) => s.id === editId ? { ...s, ...json } : s))
        toast.success('Vendedor actualizado')
      } else {
        setSellers((prev) => [...prev, json])
        toast.success('Vendedor creado')
      }
      setShowForm(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error guardando')
    } finally { setSaving(false) }
  }

  async function toggleActive(s: Seller) {
    try {
      const res = await fetch('/api/admin/sellers', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: s.id, is_active: !s.is_active }),
      })
      if (!res.ok) throw new Error()
      setSellers((prev) => prev.map((x) => x.id === s.id ? { ...x, is_active: !s.is_active } : x))
      toast.success(s.is_active ? 'Vendedor desactivado' : 'Vendedor activado')
    } catch { toast.error('Error actualizando') }
  }

  const totalComisionMes = Object.values(sellerStats).reduce((s, v) => s + v.comision, 0)
  const totalVentasMes = Object.values(sellerStats).reduce((s, v) => s + v.total, 0)

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400 mb-2">Gestión</div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Vendedores</h1>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 bg-white text-black rounded-xl px-4 py-2.5 text-sm font-semibold hover:bg-neutral-100 transition-colors"
        >
          <Plus className="h-4 w-4" strokeWidth={2} /> Nuevo vendedor
        </button>
      </div>

      {/* KPIs mes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard title="Vendedores activos" value={sellers.filter((s) => s.is_active).length.toString()} icon={Users} />
        <KpiCard title="Ventas (30 días)" value={ranking.reduce((s, r) => s + r.stats.ventas, 0).toString()} icon={TrendingUp} />
        <KpiCard title="Total vendido" value={formatCOP(totalVentasMes)} icon={TrendingUp} />
        <KpiCard title="Comisiones a pagar" value={formatCOP(totalComisionMes)} icon={Trophy} highlight />
      </div>

      {/* Formulario crear/editar */}
      {showForm && (
        <div className="rounded-3xl border border-neutral-700 bg-neutral-900 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold">{editId ? 'Editar vendedor' : 'Nuevo vendedor'}</h2>
            <button onClick={() => setShowForm(false)} className="text-neutral-400 hover:text-white"><X className="h-4 w-4" strokeWidth={1.5} /></button>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mb-1.5 block">Nombre *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white transition-colors"
                placeholder="Carlos Ríos" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mb-1.5 block">Email</label>
              <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white transition-colors"
                placeholder="carlos@jbtecnologia.local" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mb-1.5 block">Teléfono</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white transition-colors"
                placeholder="3001234567" />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 font-bold mb-1.5 block">Comisión (%)</label>
              <input type="number" min="0" max="100" step="0.5" value={form.commission_rate}
                onChange={(e) => setForm({ ...form, commission_rate: e.target.value })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-white transition-colors" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <button onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm text-neutral-400 hover:text-white transition-colors">Cancelar</button>
            <button onClick={handleSave} disabled={saving}
              className="inline-flex items-center gap-2 bg-white text-black rounded-xl px-5 py-2 text-sm font-semibold hover:bg-neutral-100 disabled:opacity-50 transition-colors">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" strokeWidth={2} />}
              Guardar
            </button>
          </div>
        </div>
      )}

      {/* Ranking top 30 días */}
      {ranking.length > 0 && (
        <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
          <div className="flex items-center gap-2 mb-5">
            <Trophy className="h-4 w-4 text-yellow-400" strokeWidth={1.5} />
            <h2 className="font-bold text-sm">Top vendedores — últimos 30 días</h2>
          </div>
          <div className="space-y-3">
            {ranking.map((r, i) => (
              <div key={r.seller.id} className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-800/60">
                <div className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                  i === 0 ? 'bg-yellow-400 text-black' : i === 1 ? 'bg-neutral-400 text-black' : i === 2 ? 'bg-amber-700 text-white' : 'bg-neutral-700 text-white'
                )}>{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm">{r.seller.name}</div>
                  <div className="text-[11px] text-neutral-400">{r.stats.ventas} {r.stats.ventas === 1 ? 'venta' : 'ventas'} · {r.seller.commission_rate}% comisión</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-bold tabular-nums text-sm">{formatCOP(r.stats.total)}</div>
                  <div className="text-[11px] text-green-400 font-semibold tabular-nums">{formatCOP(r.stats.comision)} comisión</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lista de vendedores */}
      <section className="rounded-3xl border border-neutral-800 bg-neutral-900 p-6">
        <h2 className="font-bold text-sm mb-4">Todos los vendedores</h2>
        <div className="divide-y divide-neutral-800">
          {sellers.length === 0 && <p className="text-sm text-neutral-500 py-6 text-center">No hay vendedores registrados.</p>}
          {sellers.map((s) => {
            const stats = sellerStats[s.id]
            return (
              <div key={s.id} className="py-4 flex items-center gap-4">
                <div className="h-9 w-9 rounded-full bg-neutral-800 flex items-center justify-center shrink-0 text-sm font-bold">
                  {s.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{s.name}</span>
                    {!s.is_active && <span className="text-[10px] bg-neutral-700 text-neutral-400 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">Inactivo</span>}
                  </div>
                  <div className="text-[11px] text-neutral-500">{s.email ?? '—'} · {s.commission_rate}% comisión</div>
                </div>
                {stats && (
                  <div className="text-right hidden sm:block shrink-0">
                    <div className="text-[11px] text-neutral-400">{stats.ventas} ventas / 30d</div>
                    <div className="text-[11px] text-green-400 font-semibold">{formatCOP(stats.comision)}</div>
                  </div>
                )}
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => openEdit(s)} className="p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors">
                    <Edit2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                  <button onClick={() => toggleActive(s)}
                    className={cn('p-2 rounded-lg text-xs font-bold transition-colors', s.is_active ? 'text-neutral-400 hover:text-red-400 hover:bg-neutral-800' : 'text-green-400 hover:bg-neutral-800')}>
                    {s.is_active ? <X className="h-3.5 w-3.5" strokeWidth={1.5} /> : <Check className="h-3.5 w-3.5" strokeWidth={1.5} />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

function KpiCard({ title, value, icon: Icon, highlight }: { title: string; value: string; icon: typeof Users; highlight?: boolean }) {
  return (
    <div className={cn('rounded-3xl border p-5', highlight ? 'border-green-800 bg-green-950/40' : 'border-neutral-800 bg-neutral-900')}>
      <div className="flex items-start justify-between gap-2">
        <div className={cn('text-[10px] font-bold uppercase tracking-[0.2em]', highlight ? 'text-green-400' : 'text-neutral-400')}>{title}</div>
        <Icon className={cn('h-3.5 w-3.5', highlight ? 'text-green-400' : 'text-neutral-400')} strokeWidth={1.5} />
      </div>
      <div className={cn('text-2xl font-bold tracking-tight tabular-nums mt-3', highlight ? 'text-green-300' : '')}>{value}</div>
    </div>
  )
}
