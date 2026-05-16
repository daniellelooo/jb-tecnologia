'use client'

import { useState } from 'react'
import { FileDown, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { format, startOfDay, startOfMonth, subDays, startOfYear } from 'date-fns'
import { es } from 'date-fns/locale'
import { formatCOP } from '@/types'

type Period = 'hoy' | '7d' | '30d' | 'mes' | 'anio' | 'todo'

const PERIOD_LABEL: Record<Period, string> = {
  hoy: 'Hoy',
  '7d': 'Últimos 7 días',
  '30d': 'Últimos 30 días',
  mes: 'Este mes',
  anio: 'Este año',
  todo: 'Todo',
}

interface OrderRow {
  order_number: string
  customer_name: string
  customer_phone: string
  delivery_type: string
  payment_method: string
  status: string
  subtotal: number | string
  delivery_fee: number | string
  total: number | string
  created_at: string
}
interface Totals { count: number; countNet: number; countCancel: number; totalNet: number; subtotalNet: number; deliveryNet: number }

function periodToRange(p: Period): { from?: string; to?: string } {
  const now = new Date()
  if (p === 'todo') return {}
  if (p === 'hoy') return { from: startOfDay(now).toISOString() }
  if (p === '7d') return { from: startOfDay(subDays(now, 7)).toISOString() }
  if (p === '30d') return { from: startOfDay(subDays(now, 30)).toISOString() }
  if (p === 'mes') return { from: startOfMonth(now).toISOString() }
  if (p === 'anio') return { from: startOfYear(now).toISOString() }
  return {}
}

async function fetchReport(period: Period): Promise<{ orders: OrderRow[]; totals: Totals } | null> {
  const range = periodToRange(period)
  const qs = new URLSearchParams()
  if (range.from) qs.set('from', range.from)
  if (range.to) qs.set('to', range.to)
  const res = await fetch(`/api/admin/reports/sales?${qs.toString()}`)
  if (!res.ok) return null
  return res.json()
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

function csvEscape(v: unknown): string {
  const s = v === null || v === undefined ? '' : String(v)
  if (/[",\n;]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function toCsv(orders: OrderRow[]): string {
  const headers = ['Pedido', 'Fecha', 'Cliente', 'Teléfono', 'Entrega', 'Pago', 'Estado', 'Subtotal', 'Envío', 'Total']
  const lines = [headers.join(',')]
  for (const o of orders) {
    lines.push([
      o.order_number,
      format(new Date(o.created_at), 'yyyy-MM-dd HH:mm'),
      o.customer_name,
      o.customer_phone,
      o.delivery_type,
      o.payment_method,
      o.status,
      Number(o.subtotal),
      Number(o.delivery_fee),
      Number(o.total),
    ].map(csvEscape).join(','))
  }
  return lines.join('\n')
}

export function SalesReportExport() {
  const [period, setPeriod] = useState<Period>('mes')
  const [loading, setLoading] = useState<'csv' | 'pdf' | null>(null)

  async function handleCsv() {
    setLoading('csv')
    try {
      const data = await fetchReport(period)
      if (!data) { toast.error('Error al generar reporte'); return }
      if (data.orders.length === 0) { toast.info('No hay pedidos en el período seleccionado'); return }
      const csv = toCsv(data.orders)
      const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' })
      downloadBlob(blob, `ventas-${period}-${format(new Date(), 'yyyyMMdd')}.csv`)
      toast.success('CSV descargado')
    } finally { setLoading(null) }
  }

  async function handlePdf() {
    setLoading('pdf')
    try {
      const data = await fetchReport(period)
      if (!data) { toast.error('Error al generar reporte'); return }
      if (data.orders.length === 0) { toast.info('No hay pedidos en el período seleccionado'); return }

      const { jsPDF } = await import('jspdf')
      const autoTable = (await import('jspdf-autotable')).default
      const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' })

      doc.setFontSize(16)
      doc.text('Reporte de ventas — JB Tecnología MED', 40, 40)
      doc.setFontSize(10)
      doc.setTextColor(120)
      doc.text(`Período: ${PERIOD_LABEL[period]}  ·  Generado: ${format(new Date(), "d 'de' MMMM yyyy, HH:mm", { locale: es })}`, 40, 56)

      const { totals } = data
      doc.setTextColor(0)
      doc.setFontSize(11)
      doc.text(`Pedidos: ${totals.count}   ·   Confirmados/entregados: ${totals.countNet}   ·   Cancelados: ${totals.countCancel}`, 40, 80)
      doc.setFont('helvetica', 'bold')
      doc.text(`Total neto (excluye cancelados): ${formatCOP(totals.totalNet)}`, 40, 96)
      doc.setFont('helvetica', 'normal')

      autoTable(doc, {
        startY: 116,
        head: [['Pedido', 'Fecha', 'Cliente', 'Entrega', 'Pago', 'Estado', 'Total']],
        body: data.orders.map((o) => [
          o.order_number,
          format(new Date(o.created_at), 'dd/MM/yy HH:mm'),
          o.customer_name,
          o.delivery_type === 'retiro_en_tienda' ? 'Retiro' : 'Domicilio',
          o.payment_method,
          o.status,
          formatCOP(Number(o.total)),
        ]),
        styles: { fontSize: 8, cellPadding: 5 },
        headStyles: { fillColor: [0, 0, 0], textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 245, 247] },
        columnStyles: { 6: { halign: 'right' } },
      })

      doc.save(`ventas-${period}-${format(new Date(), 'yyyyMMdd')}.pdf`)
      toast.success('PDF descargado')
    } finally { setLoading(null) }
  }

  return (
    <div className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 mb-1">Reporte de ventas</div>
          <h2 className="text-base font-bold">Descargar pedidos</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className="h-9 rounded-full border border-neutral-800 bg-neutral-900 px-3 text-xs font-medium focus:outline-none focus:border-white transition-colors"
          >
            {(Object.keys(PERIOD_LABEL) as Period[]).map((p) => (
              <option key={p} value={p}>{PERIOD_LABEL[p]}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleCsv}
            disabled={loading !== null}
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-800 bg-neutral-900 text-xs font-medium px-3.5 py-2 hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {loading === 'csv' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileDown className="h-3.5 w-3.5" strokeWidth={1.5} />}
            CSV
          </button>
          <button
            type="button"
            onClick={handlePdf}
            disabled={loading !== null}
            className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 text-white text-xs font-medium px-3.5 py-2 hover:bg-white/95 hover:text-black transition-colors disabled:opacity-50"
          >
            {loading === 'pdf' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />}
            PDF
          </button>
        </div>
      </div>
    </div>
  )
}
