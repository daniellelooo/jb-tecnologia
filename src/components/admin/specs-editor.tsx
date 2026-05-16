'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'

export type SpecsMap = Record<string, string | number | boolean>

interface Row { key: string; value: string }

function mapToRows(specs: SpecsMap | undefined): Row[] {
  if (!specs) return []
  return Object.entries(specs).map(([k, v]) => ({ key: k, value: typeof v === 'object' ? JSON.stringify(v) : String(v) }))
}

function rowsToMap(rows: Row[]): SpecsMap {
  const out: SpecsMap = {}
  for (const { key, value } of rows) {
    const k = key.trim()
    if (!k) continue
    const v = value.trim()
    if (v === '') continue
    if (v === 'true') out[k] = true
    else if (v === 'false') out[k] = false
    else if (/^-?\d+(\.\d+)?$/.test(v)) out[k] = Number(v)
    else out[k] = v
  }
  return out
}

export function SpecsEditor({ initial, onChange }: { initial: SpecsMap | undefined; onChange: (specs: SpecsMap) => void }) {
  const [rows, setRows] = useState<Row[]>(() => {
    const r = mapToRows(initial)
    return r.length > 0 ? r : [{ key: '', value: '' }]
  })

  function update(next: Row[]) {
    setRows(next)
    onChange(rowsToMap(next))
  }

  function setRow(i: number, patch: Partial<Row>) {
    update(rows.map((r, idx) => idx === i ? { ...r, ...patch } : r))
  }

  function addRow() { update([...rows, { key: '', value: '' }]) }
  function removeRow(i: number) { update(rows.filter((_, idx) => idx !== i)) }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[1fr_1fr_auto] gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-400 px-1">
        <div>Característica</div>
        <div>Valor</div>
        <div className="w-7" />
      </div>
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
          <input
            value={row.key}
            onChange={(e) => setRow(i, { key: e.target.value })}
            placeholder="Ej: Socket"
            className="h-10 rounded-xl border border-neutral-800 bg-neutral-900 px-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-white transition-colors duration-300"
          />
          <input
            value={row.value}
            onChange={(e) => setRow(i, { value: e.target.value })}
            placeholder="Ej: LGA1700"
            className="h-10 rounded-xl border border-neutral-800 bg-neutral-900 px-3 text-sm placeholder:text-neutral-400 focus:outline-none focus:border-white transition-colors duration-300"
          />
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="h-7 w-7 rounded-full hover:bg-neutral-800 grid place-items-center text-neutral-500 hover:text-white transition-colors"
            aria-label="Eliminar fila"
          >
            <X className="h-3.5 w-3.5" strokeWidth={1.8} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-white hover:bg-neutral-800 px-3 py-1.5 rounded-full transition-colors duration-300"
      >
        <Plus className="h-3 w-3" strokeWidth={1.8} /> Agregar característica
      </button>
      <p className="text-[10px] text-neutral-500 mt-1">Los valores numéricos se guardan como números, &ldquo;true&rdquo;/&ldquo;false&rdquo; como booleanos.</p>
    </div>
  )
}
