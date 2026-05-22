'use client'

import { useState } from 'react'
import { Loader2, Save, Globe, MessageCircle, Truck, BarChart3, Info } from 'lucide-react'
import { toast } from 'sonner'
import type { SettingsMap } from '@/lib/settings'

export function ConfigClient({ initial }: { initial: SettingsMap }) {
  const [form, setForm] = useState<SettingsMap>(initial)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)

  function update<K extends keyof SettingsMap>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    setDirty(true)
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        toast.error(j.error ?? 'Error al guardar')
        return
      }
      toast.success('Configuración guardada')
      setDirty(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <header>
        <div className="text-[11px] font-bold uppercase tracking-[0.25em] text-neutral-500 mb-2">Sistema</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-display text-neutral-900">Configuración</h1>
        <p className="text-sm text-neutral-500 mt-2">
          Estos valores se aplican en tiempo real al sitio público. Los cambios se guardan al pulsar &quot;Guardar&quot;.
        </p>
      </header>

      {/* Tracking */}
      <Section
        icon={BarChart3}
        title="Tracking y analítica"
        description="IDs de píxeles de seguimiento. Si se dejan en blanco, no se inyecta nada en el sitio."
      >
        <Field
          label="ID del Meta Pixel"
          hint="Lo encuentras en Meta Business Suite → Administrador de eventos. Formato: solo números, sin espacios."
          placeholder="Ej. 1234567890123456"
          value={form.meta_pixel_id}
          onChange={(v) => update('meta_pixel_id', v.replace(/[^\d]/g, ''))}
        />
        <Field
          label="ID de medición de Google Analytics 4"
          hint="Lo encuentras en GA4 → Administrar → Flujos de datos. Empieza con G-."
          placeholder="Ej. G-XXXXXXXXXX"
          value={form.ga4_measurement_id}
          onChange={(v) => update('ga4_measurement_id', v.toUpperCase().replace(/[^A-Z0-9-]/g, ''))}
        />
      </Section>

      {/* Contacto */}
      <Section
        icon={MessageCircle}
        title="Contacto y atención"
        description="Datos visibles en el sitio para que los clientes te contacten."
      >
        <Field
          label="Teléfono de WhatsApp"
          hint="Incluye código de país sin símbolos. Para Colombia: 57 + número. Ej. 573001234567."
          placeholder="Ej. 573001234567"
          value={form.whatsapp_phone}
          onChange={(v) => update('whatsapp_phone', v.replace(/[^\d]/g, ''))}
        />
      </Section>

      {/* Operaciones */}
      <Section
        icon={Truck}
        title="Operaciones"
        description="Valores operativos del e-commerce."
      >
        <Field
          label="Costo de domicilio por defecto (COP)"
          hint="Tarifa base de domicilio en Medellín. Se aplica automáticamente al checkout."
          placeholder="Ej. 15000"
          inputMode="numeric"
          value={form.default_delivery_fee}
          onChange={(v) => update('default_delivery_fee', v.replace(/[^\d]/g, ''))}
        />
      </Section>

      {/* Acciones */}
      <div className="sticky bottom-4 z-20">
        <div className="rounded-2xl border border-neutral-200 bg-white shadow-md px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-neutral-500">
            <Info className="h-3.5 w-3.5" strokeWidth={1.5} />
            {dirty ? 'Tienes cambios sin guardar' : 'Todos los cambios guardados'}
          </div>
          <button
            onClick={save}
            disabled={saving || !dirty}
            className="inline-flex items-center gap-2 rounded-full bg-neutral-900 text-white text-sm font-medium px-5 py-2.5 hover:bg-neutral-800 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" strokeWidth={1.5} />}
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  )
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Globe
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-3xl border border-neutral-200 bg-white shadow-sm p-7">
      <div className="flex items-start gap-3 mb-5">
        <div className="h-9 w-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </div>
        <div>
          <h2 className="font-bold text-base tracking-tight text-neutral-900">{title}</h2>
          <p className="text-xs text-neutral-500 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  )
}

function Field({
  label,
  hint,
  placeholder,
  value,
  onChange,
  inputMode,
}: {
  label: string
  hint?: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  inputMode?: 'text' | 'numeric'
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-neutral-700 mb-1.5">{label}</label>
      <input
        type="text"
        inputMode={inputMode ?? 'text'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 rounded-xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/5 transition-colors"
      />
      {hint && <p className="text-[11px] text-neutral-500 mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  )
}
