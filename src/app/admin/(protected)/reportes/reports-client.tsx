'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BarChart3, FileDown, FileText, Loader2, Filter, RefreshCw, TrendingUp, Package,
  ShoppingBag, Receipt, X, Check,
} from 'lucide-react'
import { format, startOfDay, endOfDay, startOfMonth, startOfYear, subDays, endOfMonth, startOfWeek, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { toast } from 'sonner'
import { formatCOP } from '@/types'

type ReportType = 'ingresos' | 'pedidos' | 'productos'
type GroupBy = 'day' | 'week' | 'month'
type Preset = 'hoy' | 'ayer' | '7d' | '30d' | 'mes' | 'mes_anterior' | 'anio' | 'todo' | 'custom'

const REVENUE_STATUSES = ['confirmado', 'en_preparacion', 'listo_para_retiro', 'enviado', 'entregado']

const ALL_STATUSES = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmado', label: 'Confirmado' },
  { value: 'en_preparacion', label: 'En preparación' },
  { value: 'listo_para_retiro', label: 'Listo para retiro' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'entregado', label: 'Entregado' },
  { value: 'cancelado', label: 'Cancelado' },
]

const ALL_PAYMENTS = [
  { value: 'efectivo_en_tienda', label: 'Efectivo' },
  { value: 'transferencia', label: 'Transferencia' },
  { value: 'nequi', label: 'Nequi' },
  { value: 'daviplata', label: 'Daviplata' },
  { value: 'contraentrega', label: 'Contra entrega' },
]

const ALL_DELIVERIES = [
  { value: 'retiro_en_tienda', label: 'Retiro en tienda' },
  { value: 'domicilio_medellin', label: 'Domicilio Medellín' },
]

const PRESET_LABEL: Record<Preset, string> = {
  hoy: 'Hoy',
  ayer: 'Ayer',
  '7d': 'Últimos 7 días',
  '30d': 'Últimos 30 días',
  mes: 'Este mes',
  mes_anterior: 'Mes anterior',
  anio: 'Este año',
  todo: 'Todo',
  custom: 'Personalizado',
}

interface OrderRow {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  delivery_type: string
  payment_method: string
  status: string
  subtotal: number
  delivery_fee: number
  total: number
  created_at: string
}

interface ProductRow {
  product_id: string
  product_name: string
  quantity: number
  revenue: number
}

interface SeriesPoint {
  bucket: string
  revenue: number
  count: number
}

interface Summary {
  count: number
  countNet: number
  countCancel: number
  totalAll: number
  totalNet: number
  subtotalNet: number
  deliveryNet: number
  aov: number
}

interface ReportData {
  type: ReportType
  range: { from: string | null; to: string | null }
  groupBy: GroupBy
  summary: Summary
  timeSeries: SeriesPoint[]
  orders: OrderRow[]
  products: ProductRow[]
}

function presetRange(p: Preset): { from?: string; to?: string } {
  const now = new Date()
  if (p === 'todo') return {}
  if (p === 'hoy') return { from: startOfDay(now).toISOString(), to: endOfDay(now).toISOString() }
  if (p === 'ayer') {
    const y = subDays(now, 1)
    return { from: startOfDay(y).toISOString(), to: endOfDay(y).toISOString() }
  }
  if (p === '7d') return { from: startOfDay(subDays(now, 6)).toISOString(), to: endOfDay(now).toISOString() }
  if (p === '30d') return { from: startOfDay(subDays(now, 29)).toISOString(), to: endOfDay(now).toISOString() }
  if (p === 'mes') return { from: startOfMonth(now).toISOString(), to: endOfDay(now).toISOString() }
  if (p === 'mes_anterior') {
    const prev = subMonths(now, 1)
    return { from: startOfMonth(prev).toISOString(), to: endOfMonth(prev).toISOString() }
  }
  if (p === 'anio') return { from: startOfYear(now).toISOString(), to: endOfDay(now).toISOString() }
  return {}
}

function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v)
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function groupLabel(bucket: string, groupBy: GroupBy): string {
  const d = new Date(bucket)
  if (groupBy === 'day') return format(d, 'd MMM', { locale: es })
  if (groupBy === 'week') {
    const start = startOfWeek(d, { weekStartsOn: 1 })
    return `Sem. ${format(start, 'd MMM', { locale: es })}`
  }
  return format(d, 'MMM yyyy', { locale: es })
}

function statusLabel(s: string) { return ALL_STATUSES.find((x) => x.value === s)?.label ?? s }
function paymentLabel(s: string) { return ALL_PAYMENTS.find((x) => x.value === s)?.label ?? s }
function deliveryLabel(s: string) { return ALL_DELIVERIES.find((x) => x.value === s)?.label ?? s }

export function ReportsClient({ categories }: { categories: Array<{ id: string; name: string }> }) {
  const [preset, setPreset] = useState<Preset>('mes')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')
  const [type, setType] = useState<ReportType>('ingresos')
  const [groupBy, setGroupBy] = useState<GroupBy>('day')
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [selectedPayments, setSelectedPayments] = useState<string[]>([])
  const [selectedDeliveries, setSelectedDeliveries] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState<'csv' | 'pdf' | null>(null)

  useEffect(() => {
    if (preset === 'hoy' || preset === 'ayer') setGroupBy('day')
    else if (preset === 'anio' || preset === 'todo') setGroupBy('month')
    else if (preset === '7d' || preset === '30d' || preset === 'mes' || preset === 'mes_anterior') setGroupBy('day')
  }, [preset])

  const effectiveRange = useMemo(() => {
    if (preset === 'custom') {
      return {
        from: customFrom ? new Date(customFrom).toISOString() : undefined,
        to: customTo ? endOfDay(new Date(customTo)).toISOString() : undefined,
      }
    }
    return presetRange(preset)
  }, [preset, customFrom, customTo])

  async function runReport() {
    setLoading(true)
    try {
      const qs = new URLSearchParams()
      qs.set('type', type)
      qs.set('group_by', groupBy)
      if (effectiveRange.from) qs.set('from', effectiveRange.from)
      if (effectiveRange.to) qs.set('to', effectiveRange.to)
      if (selectedStatuses.length > 0) qs.set('status', selectedStatuses.join(','))
      if (selectedPayments.length > 0) qs.set('payment_method', selectedPayments.join(','))
      if (selectedDeliveries.length > 0) qs.set('delivery_type', selectedDeliveries.join(','))
      if (selectedCategory) qs.set('category_id', selectedCategory)
      const res = await fetch(`/api/admin/reports?${qs.toString()}`)
      if (!res.ok) {
        toast.error('Error al generar reporte')
        return
      }
      const json: ReportData = await res.json()
      setData(json)
    } catch {
      toast.error('Error al generar reporte')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function rangeLabel(): string {
    if (preset === 'custom' && (customFrom || customTo)) {
      return `${customFrom || '—'} a ${customTo || '—'}`
    }
    return PRESET_LABEL[preset]
  }

  function toggleArr(arr: string[], v: string): string[] {
    return arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]
  }

  function resetFilters() {
    setSelectedStatuses([])
    setSelectedPayments([])
    setSelectedDeliveries([])
    setSelectedCategory('')
  }

  function csvForCurrentReport(): { content: string; filename: string } {
    if (!data) return { content: '', filename: 'reporte.csv' }
    const stamp = format(new Date(), 'yyyyMMdd-HHmm')

    if (type === 'productos') {
      const headers = ['Producto', 'Unidades', 'Ingresos']
      const lines = [headers.join(',')]
      for (const p of data.products) lines.push([p.product_name, p.quantity, p.revenue].map(csvEscape).join(','))
      return { content: lines.join('\n'), filename: `productos-${preset}-${stamp}.csv` }
    }

    const headers = ['Pedido', 'Fecha', 'Cliente', 'Teléfono', 'Entrega', 'Pago', 'Estado', 'Subtotal', 'Envío', 'Total']
    const lines = [headers.join(',')]
    for (const o of data.orders) {
      lines.push([
        o.order_number,
        format(new Date(o.created_at), 'yyyy-MM-dd HH:mm'),
        o.customer_name,
        o.customer_phone,
        deliveryLabel(o.delivery_type),
        paymentLabel(o.payment_method),
        statusLabel(o.status),
        Number(o.subtotal),
        Number(o.delivery_fee),
        Number(o.total),
      ].map(csvEscape).join(','))
    }
    return { content: lines.join('\n'), filename: `${type}-${preset}-${stamp}.csv` }
  }

  async function handleCsv() {
    if (!data) return
    if ((type === 'productos' && data.products.length === 0) || (type !== 'productos' && data.orders.length === 0)) {
      toast.info('No hay datos para exportar en este rango')
      return
    }
    setExporting('csv')
    try {
      const { content, filename } = csvForCurrentReport()
      const blob = new Blob([`﻿${content}`], { type: 'text/csv;charset=utf-8;' })
      downloadBlob(blob, filename)
      toast.success('CSV descargado')
    } finally {
      setExporting(null)
    }
  }

  async function handlePdf() {
    if (!data) return
    if ((type === 'productos' && data.products.length === 0) || (type !== 'productos' && data.orders.length === 0)) {
      toast.info('No hay datos para exportar en este rango')
      return
    }
    setExporting('pdf')
    try {
      const { jsPDF } = await import('jspdf')
      const autoTable = (await import('jspdf-autotable')).default
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })

      const typeTitle = type === 'ingresos' ? 'Ingresos' : type === 'pedidos' ? 'Pedidos' : 'Productos'
      doc.setFontSize(16)
      doc.text(`Reporte de ${typeTitle} — JB Tecnología MED`, 40, 40)
      doc.setFontSize(10)
      doc.setTextColor(120)
      doc.text(`Período: ${rangeLabel()}  ·  Generado: ${format(new Date(), "d 'de' MMMM yyyy, HH:mm", { locale: es })}`, 40, 56)

      doc.setTextColor(0)
      doc.setFontSize(11)
      const { summary } = data
      doc.text(`Pedidos: ${summary.count}   ·   Confirmados+: ${summary.countNet}   ·   Cancelados: ${summary.countCancel}`, 40, 80)
      doc.setFont('helvetica', 'bold')
      doc.text(`Ingresos netos: ${formatCOP(summary.totalNet)}   ·   Ticket promedio: ${formatCOP(summary.aov)}`, 40, 96)
      doc.setFont('helvetica', 'normal')

      if (type === 'productos') {
        autoTable(doc, {
          startY: 116,
          head: [['#', 'Producto', 'Unidades', 'Ingresos']],
          body: data.products.map((p, i) => [String(i + 1), p.product_name, String(p.quantity), formatCOP(p.revenue)]),
          styles: { fontSize: 9, cellPadding: 5 },
          headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 245, 247] },
          columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } },
        })
      } else {
        autoTable(doc, {
          startY: 116,
          head: [['Pedido', 'Fecha', 'Cliente', 'Entrega', 'Pago', 'Estado', 'Total']],
          body: data.orders.map((o) => [
            o.order_number,
            format(new Date(o.created_at), 'dd/MM/yy HH:mm'),
            o.customer_name,
            deliveryLabel(o.delivery_type),
            paymentLabel(o.payment_method),
            statusLabel(o.status),
            formatCOP(Number(o.total)),
          ]),
          styles: { fontSize: 8, cellPadding: 5 },
          headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold' },
          alternateRowStyles: { fillColor: [245, 245, 247] },
          columnStyles: { 6: { halign: 'right' } },
        })
      }

      const stamp = format(new Date(), 'yyyyMMdd-HHmm')
      doc.save(`${type}-${preset}-${stamp}.pdf`)
      toast.success('PDF descargado')
    } finally {
      setExporting(null)
    }
  }

  const seriesMax = useMemo(() => Math.max(1, ...(data?.timeSeries ?? []).map((p) => (type === 'pedidos' ? p.count : p.revenue))), [data, type])
  const activeFilterCount =
    selectedStatuses.length + selectedPayments.length + selectedDeliveries.length + (selectedCategory ? 1 : 0)

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-500 mb-2">Análisis</div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-display text-neutral-900">Reportes</h1>
          <p className="text-sm text-neutral-500 mt-2">Genera y descarga reportes personalizados de ingresos, pedidos y productos.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={runReport}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white text-neutral-900 text-sm font-medium px-4 py-2.5 hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" strokeWidth={1.5} />}
            Actualizar
          </button>
          <button
            type="button"
            onClick={handleCsv}
            disabled={exporting !== null || !data}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white text-neutral-900 text-sm font-medium px-4 py-2.5 hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            {exporting === 'csv' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" strokeWidth={1.5} />}
            CSV
          </button>
          <button
            type="button"
            onClick={handlePdf}
            disabled={exporting !== null || !data}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 text-white text-sm font-medium px-4 py-2.5 hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {exporting === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" strokeWidth={1.5} />}
            PDF
          </button>
        </div>
      </header>

      {/* CONFIG CARD */}
      <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm p-6 md:p-7 space-y-6">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-500 mb-3">Tipo de reporte</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TypeChip active={type === 'ingresos'} onClick={() => setType('ingresos')} icon={TrendingUp} label="Ingresos" desc="Solo confirmados+" />
            <TypeChip active={type === 'pedidos'} onClick={() => setType('pedidos')} icon={ShoppingBag} label="Pedidos" desc="Todos los estados" />
            <TypeChip active={type === 'productos'} onClick={() => setType('productos')} icon={Package} label="Productos" desc="Más vendidos" />
          </div>
        </div>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-500 mb-3">Período</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {(Object.keys(PRESET_LABEL) as Preset[]).map((p) => (
              <button
                key={p}
                onClick={() => setPreset(p)}
                className={`text-sm font-medium px-3.5 py-1.5 rounded-full transition-colors duration-300 ease-premium ${
                  preset === p ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {PRESET_LABEL[p]}
              </button>
            ))}
          </div>
          {preset === 'custom' && (
            <div className="flex flex-wrap items-end gap-3 mt-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">Desde</label>
                <input
                  type="date"
                  value={customFrom}
                  onChange={(e) => setCustomFrom(e.target.value)}
                  className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500">Hasta</label>
                <input
                  type="date"
                  value={customTo}
                  onChange={(e) => setCustomTo(e.target.value)}
                  className="h-10 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-500 mb-3">Agrupar por</div>
          <div className="flex flex-wrap gap-2">
            {(['day', 'week', 'month'] as GroupBy[]).map((g) => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className={`text-sm font-medium px-3.5 py-1.5 rounded-full transition-colors duration-300 ease-premium ${
                  groupBy === g ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {g === 'day' ? 'Día' : g === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-5 border-t border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-2">
              <Filter className="h-4 w-4 text-neutral-500" strokeWidth={1.5} />
              <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-neutral-500">Filtros</span>
              {activeFilterCount > 0 && (
                <span className="bg-neutral-900 text-white text-[11px] font-bold rounded-full px-2 py-0.5">{activeFilterCount}</span>
              )}
            </div>
            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className="text-xs text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1">
                <X className="h-3 w-3" /> Limpiar
              </button>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FilterGroup label="Estado del pedido">
              <div className="flex flex-wrap gap-1.5 mb-2">
                <PresetButton onClick={() => setSelectedStatuses(REVENUE_STATUSES)} label="Confirmados+" />
                <PresetButton onClick={() => setSelectedStatuses(['entregado'])} label="Solo entregados" />
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ALL_STATUSES.map((s) => (
                  <FilterChip
                    key={s.value}
                    active={selectedStatuses.includes(s.value)}
                    onClick={() => setSelectedStatuses(toggleArr(selectedStatuses, s.value))}
                    label={s.label}
                  />
                ))}
              </div>
            </FilterGroup>

            <FilterGroup label="Método de pago">
              <div className="flex flex-wrap gap-1.5">
                {ALL_PAYMENTS.map((p) => (
                  <FilterChip
                    key={p.value}
                    active={selectedPayments.includes(p.value)}
                    onClick={() => setSelectedPayments(toggleArr(selectedPayments, p.value))}
                    label={p.label}
                  />
                ))}
              </div>
            </FilterGroup>

            <FilterGroup label="Tipo de entrega">
              <div className="flex flex-wrap gap-1.5">
                {ALL_DELIVERIES.map((d) => (
                  <FilterChip
                    key={d.value}
                    active={selectedDeliveries.includes(d.value)}
                    onClick={() => setSelectedDeliveries(toggleArr(selectedDeliveries, d.value))}
                    label={d.label}
                  />
                ))}
              </div>
            </FilterGroup>

            {type === 'productos' && (
              <FilterGroup label="Categoría">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-10 w-full rounded-xl border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-900 focus:outline-none focus:border-neutral-900"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </FilterGroup>
            )}
          </div>
        </div>
      </div>

      {/* RESULTS */}
      {loading && !data ? (
        <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm p-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-neutral-400" />
          <p className="text-sm text-neutral-500 mt-3">Generando reporte…</p>
        </div>
      ) : data ? (
        <>
          {/* Summary KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard label="Ingresos netos" value={formatCOP(data.summary.totalNet)} sub={`${data.summary.countNet} pedidos`} icon={TrendingUp} />
            <KpiCard label="Ticket promedio" value={formatCOP(data.summary.aov)} sub={rangeLabel()} icon={Receipt} />
            <KpiCard label="Pedidos totales" value={data.summary.count.toString()} sub={`${data.summary.countCancel} cancelados`} icon={ShoppingBag} />
            <KpiCard label="Envíos cobrados" value={formatCOP(data.summary.deliveryNet)} sub="Solo confirmados+" icon={Package} />
          </div>

          {/* Time series chart */}
          <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm p-6 md:p-7">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
                  <BarChart3 className="h-4 w-4" strokeWidth={1.5} />
                </div>
                <div>
                  <h2 className="font-bold text-base tracking-tight text-neutral-900">
                    {type === 'pedidos' ? 'Pedidos por ' : 'Ingresos por '}{groupBy === 'day' ? 'día' : groupBy === 'week' ? 'semana' : 'mes'}
                  </h2>
                  <div className="text-xs text-neutral-500 mt-0.5">{rangeLabel()}</div>
                </div>
              </div>
            </div>

            {data.timeSeries.length === 0 ? (
              <p className="text-sm text-neutral-500 text-center py-12">No hay datos en este período</p>
            ) : (
              <div className="space-y-3">
                <div className="flex items-end gap-1.5 h-48 px-1">
                  {data.timeSeries.map((p) => {
                    const v = type === 'pedidos' ? p.count : p.revenue
                    const pct = (v / seriesMax) * 100
                    return (
                      <div key={p.bucket} className="flex-1 group relative flex flex-col justify-end min-w-0">
                        <div
                          className={`w-full rounded-md transition-all duration-500 ease-premium ${v > 0 ? 'bg-neutral-900' : 'bg-neutral-200'}`}
                          style={{ height: `${Math.max(3, pct)}%` }}
                        />
                        <div className="absolute -top-14 left-1/2 -translate-x-1/2 hidden group-hover:flex flex-col items-center bg-neutral-900 text-white rounded-lg px-2.5 py-1.5 text-[11px] whitespace-nowrap z-10 shadow-md">
                          <span className="font-bold tabular-nums">{type === 'pedidos' ? `${p.count} pedidos` : formatCOP(p.revenue)}</span>
                          <span className="text-neutral-400">{groupLabel(p.bucket, groupBy)}</span>
                          {type !== 'pedidos' && <span className="text-neutral-500">{p.count} pedidos</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
                {data.timeSeries.length <= 31 && (
                  <div className="flex gap-1.5 px-1 text-[11px] text-neutral-400">
                    {data.timeSeries.map((p, i) => (
                      <div key={p.bucket} className="flex-1 text-center truncate min-w-0">
                        {i % Math.max(1, Math.ceil(data.timeSeries.length / 14)) === 0 ? groupLabel(p.bucket, groupBy) : ''}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {type === 'productos' ? <ProductTable products={data.products} /> : <OrdersTable orders={data.orders} />}
        </>
      ) : null}
    </div>
  )
}

// =========================================================
// Sub-components
// =========================================================

function TypeChip({ active, onClick, icon: Icon, label, desc }: { active: boolean; onClick: () => void; icon: typeof BarChart3; label: string; desc: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-2xl px-4 py-3.5 text-left transition-colors duration-300 ease-premium border ${
        active
          ? 'bg-neutral-900 text-white border-neutral-900'
          : 'bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50'
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" strokeWidth={1.5} />
      <div>
        <div className="text-sm font-bold">{label}</div>
        <div className={`text-xs ${active ? 'text-neutral-400' : 'text-neutral-500'}`}>{desc}</div>
      </div>
    </button>
  )
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500 mb-2">{label}</div>
      {children}
    </div>
  )
}

function FilterChip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors duration-300 ease-premium ${
        active ? 'bg-neutral-900 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
      }`}
    >
      {active && <Check className="h-3 w-3" strokeWidth={3} />}
      {label}
    </button>
  )
}

function PresetButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="text-[11px] font-bold uppercase tracking-[0.15em] text-emerald-700 hover:text-emerald-900 px-2.5 py-1"
    >
      {label}
    </button>
  )
}

function KpiCard({ label, value, sub, icon: Icon }: { label: string; value: string; sub: string; icon: typeof BarChart3 }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm p-5 md:p-6 hover:shadow-md transition-shadow duration-300">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">{label}</div>
        <Icon className="h-4 w-4 text-neutral-400" strokeWidth={1.5} />
      </div>
      <div className="text-2xl md:text-3xl font-bold tracking-display tabular-nums mt-3 text-neutral-900">{value}</div>
      <div className="text-xs text-neutral-500 mt-1 truncate">{sub}</div>
    </div>
  )
}

function OrdersTable({ orders }: { orders: OrderRow[] }) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
        <h2 className="font-bold text-base tracking-tight text-neutral-900">Detalle de pedidos</h2>
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">{orders.length} filas</span>
      </div>
      {orders.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-12">No hay pedidos en este período</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr className="text-left">
                <Th>Pedido</Th>
                <Th>Fecha</Th>
                <Th>Cliente</Th>
                <Th>Entrega</Th>
                <Th>Pago</Th>
                <Th>Estado</Th>
                <Th className="text-right">Total</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.slice(0, 200).map((o) => (
                <tr key={o.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs text-neutral-500">{o.order_number}</td>
                  <td className="px-4 py-3.5 text-xs text-neutral-600 whitespace-nowrap">
                    {format(new Date(o.created_at), 'd MMM yy HH:mm', { locale: es })}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="text-sm font-medium text-neutral-900">{o.customer_name}</div>
                    <div className="text-xs text-neutral-500">{o.customer_phone}</div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-neutral-700">{deliveryLabel(o.delivery_type)}</td>
                  <td className="px-4 py-3.5 text-xs text-neutral-700">{paymentLabel(o.payment_method)}</td>
                  <td className="px-4 py-3.5">
                    <span className="text-[11px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                      {statusLabel(o.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right text-sm font-bold tabular-nums text-neutral-900">{formatCOP(Number(o.total))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length > 200 && (
            <div className="text-xs text-neutral-500 text-center py-3 border-t border-neutral-200">
              Mostrando 200 de {orders.length} · descarga CSV/PDF para ver todo
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ProductTable({ products }: { products: ProductRow[] }) {
  const max = products[0]?.quantity ?? 1
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200">
        <h2 className="font-bold text-base tracking-tight text-neutral-900">Productos más vendidos</h2>
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-neutral-500">{products.length} productos</span>
      </div>
      {products.length === 0 ? (
        <p className="text-sm text-neutral-500 text-center py-12">No hay productos vendidos en este período</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr className="text-left">
                <Th>#</Th>
                <Th>Producto</Th>
                <Th className="text-right">Unidades</Th>
                <Th className="text-right">Ingresos</Th>
                <Th>Volumen relativo</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {products.map((p, i) => {
                const pct = (p.quantity / max) * 100
                return (
                  <tr key={p.product_id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3.5 text-sm font-bold text-neutral-500 tabular-nums">{i + 1}</td>
                    <td className="px-4 py-3.5 text-sm font-medium text-neutral-900">{p.product_name}</td>
                    <td className="px-4 py-3.5 text-right text-sm font-bold tabular-nums text-neutral-900">{p.quantity}</td>
                    <td className="px-4 py-3.5 text-right text-sm tabular-nums text-neutral-700">{formatCOP(p.revenue)}</td>
                    <td className="px-4 py-3.5 w-1/3">
                      <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
                        <div className="h-full bg-neutral-900 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Th({ children, className = '' }: { children?: React.ReactNode; className?: string }) {
  return <th className={`px-4 py-3 text-[11px] font-bold uppercase tracking-[0.15em] text-neutral-500 ${className}`}>{children}</th>
}
