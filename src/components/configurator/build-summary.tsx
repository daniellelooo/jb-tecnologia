'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Cpu, AlertTriangle, CheckCircle2, XCircle, X, Save, ShoppingBag, MessageCircle, Loader2, RefreshCw, ArrowRight, Zap } from 'lucide-react'
import { useConfiguratorStore, SLOT_ORDER } from '@/lib/stores/configurator-store'
import { useCartStore } from '@/lib/stores/cart-store'
import { formatCOP, type SlotKey, type CpuSpecs, type GpuSpecs, type PsuSpecs } from '@/types'
import { toast } from 'sonner'
import { checkCompatibility, isBuildCompatible, recommendedWattage } from '@/lib/configurator/compatibility'
import { cn } from '@/lib/utils'

const SLOT_LABELS: Record<SlotKey, string> = {
  cpu: 'Procesador',
  motherboard: 'Tarjeta Madre',
  ram: 'Memoria RAM',
  storage: 'Almacenamiento',
  gpu: 'Tarjeta de Video',
  psu: 'Fuente de Poder',
  case: 'Gabinete',
  cooling: 'Refrigeración',
}

export function BuildSummary() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)

  const slots = useConfiguratorStore((s) => s.slots)
  const goToSlot = useConfiguratorStore((s) => s.goToSlot)
  const clearSlot = useConfiguratorStore((s) => s.clearSlot)
  const resetBuild = useConfiguratorStore((s) => s.resetBuild)

  // Compute derived state with useMemo from raw slots — avoids infinite-loop
  // when selectors returned new array references each render.
  const total = useMemo(
    () => SLOT_ORDER.reduce((sum, k) => sum + Number(slots[k]?.price ?? 0), 0),
    [slots]
  )
  const issues = useMemo(() => checkCompatibility(slots), [slots])
  const isCompatible = useMemo(() => isBuildCompatible(issues), [issues])
  const completed = useMemo(
    () => SLOT_ORDER.reduce((n, k) => n + (slots[k] ? 1 : 0), 0),
    [slots]
  )

  const addBuildToCart = useCartStore((s) => s.addBuild)
  const setCartOpen = useCartStore((s) => s.setOpen)

  const errors = issues.filter((i) => i.severity === 'error')
  const warnings = issues.filter((i) => i.severity === 'warning')
  const recommendedW = recommendedWattage(slots)
  const canCheckout = completed >= 5 && isCompatible

  // Watts breakdown for the power widget
  const wattBreakdown = useMemo(() => {
    const cpuTdp = (slots.cpu?.specs as CpuSpecs | undefined)?.tdp ?? 0
    const gpuTdp = (slots.gpu?.specs as GpuSpecs | undefined)?.tdp ?? 0
    const baseTdp = (slots.cpu || slots.gpu) ? 80 : 0
    const total = cpuTdp + gpuTdp + baseTdp
    const psuW = (slots.psu?.specs as PsuSpecs | undefined)?.wattage ?? 0
    return { cpuTdp, gpuTdp, baseTdp, total, psuW }
  }, [slots])
  const progressPct = Math.round((completed / SLOT_ORDER.length) * 100)

  function handleAddToCart() {
    const buildId = `build_${Date.now()}`
    const components = SLOT_ORDER.flatMap((key) => (slots[key] ? [{ product: slots[key]!, categorySlug: key }] : []))
    addBuildToCart(components, buildId)
    toast.success(`Build agregado (${components.length} componentes)`, {
      action: { label: 'Ver carrito', onClick: () => setCartOpen(true) },
    })
  }

  function buildWhatsAppMessage(): string {
    const lines = SLOT_ORDER.filter((k) => slots[k]).map((k) => {
      const p = slots[k]!
      return `• ${SLOT_LABELS[k]}: ${p.name} — ${formatCOP(Number(p.price))}`
    })
    return `Hola JB Tecnología! Armé mi PC en su configurador:\n\n🖥️ *MI BUILD*\n${lines.join('\n')}\n\n💰 *Total estimado: ${formatCOP(total)}*\n\n¿Tienen disponibilidad de todos los componentes?`
  }

  function handleWhatsApp() {
    const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '573182455186'
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(buildWhatsAppMessage())}`, '_blank')
  }

  async function handleSave() {
    setSaving(true)
    try {
      const sessionId = typeof window !== 'undefined' ? (localStorage.getItem('mpc_session_id') ?? crypto.randomUUID()) : crypto.randomUUID()
      if (typeof window !== 'undefined') localStorage.setItem('mpc_session_id', sessionId)
      const res = await fetch('/api/builds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          slots: Object.fromEntries(SLOT_ORDER.map((k) => [`${k === 'case' ? 'case_id' : k + '_id'}`, slots[k]?.id ?? null])),
          total, issues, isCompatible,
        }),
      })
      const json = await res.json()
      if (res.ok) toast.success('Build guardado', { description: `ID: ${json.id.slice(0, 8)}` })
      else toast.error(json.error ?? 'Error guardando')
    } catch { toast.error('Error de conexión') } finally { setSaving(false) }
  }

  return (
    <aside className="lg:sticky lg:top-24 lg:self-start space-y-3">
      <div className="rounded-[1.75rem] p-2 bg-white/[0.04]">
        <div className="rounded-[1.4rem] bg-neutral-900 text-white p-6">
          <div className="flex items-baseline justify-between mb-2">
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/40 font-bold">Tu build</div>
            <div className="text-[10px] tabular-nums text-white/60 font-bold">{completed}/{SLOT_ORDER.length}</div>
          </div>
          <div className="text-[40px] leading-none font-bold tabular-nums tracking-tightest">{formatCOP(total)}</div>
          {/* Progress bar */}
          <div className="mt-5 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all duration-700 ease-premium"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <div className="text-[11px] text-white/50 mt-2.5 leading-relaxed">
            {completed === 0 && 'Empezá eligiendo un procesador.'}
            {completed > 0 && completed < 5 && `Faltan ${5 - completed} componentes mínimos para pedir el build.`}
            {completed >= 5 && completed < 8 && 'Build mínimo listo. Podés agregar refrigeración o gabinete.'}
            {completed === 8 && '¡Build completo!'}
          </div>
        </div>
      </div>

      {/* Watts widget */}
      {(slots.cpu || slots.gpu) && (
        <div className="rounded-[1.75rem] p-2 bg-white/[0.04]">
          <div className="rounded-[1.4rem] bg-neutral-900 ring-1 ring-white/[0.08] p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-white/[0.06] flex items-center justify-center">
                <Zap className="h-3.5 w-3.5" strokeWidth={1.8} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-mpc-graphite font-bold">Consumo estimado</div>
                <div className="text-sm font-bold tabular-nums">{wattBreakdown.total}W <span className="text-mpc-silver font-normal">en carga</span></div>
              </div>
            </div>
            <ul className="text-[11px] text-mpc-graphite space-y-1 leading-relaxed">
              {wattBreakdown.cpuTdp > 0 && <li className="flex justify-between"><span>Procesador</span><span className="tabular-nums text-foreground">{wattBreakdown.cpuTdp}W</span></li>}
              {wattBreakdown.gpuTdp > 0 && <li className="flex justify-between"><span>Tarjeta de video</span><span className="tabular-nums text-foreground">{wattBreakdown.gpuTdp}W</span></li>}
              {wattBreakdown.baseTdp > 0 && <li className="flex justify-between"><span>Resto del sistema</span><span className="tabular-nums text-foreground">{wattBreakdown.baseTdp}W</span></li>}
            </ul>
            {recommendedW && (
              <div className="mt-4 pt-3 border-t border-white/[0.08]">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-mpc-graphite">Fuente recomendada</span>
                  <span className="font-bold tabular-nums">{recommendedW}W mín.</span>
                </div>
                {wattBreakdown.psuW > 0 && (
                  <div className="mt-1.5 text-[10px] text-mpc-silver">
                    Tu fuente actual: {wattBreakdown.psuW}W {wattBreakdown.psuW >= recommendedW ? '· margen OK' : '· insuficiente'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compatibility */}
      <div className="rounded-[1.75rem] p-2 bg-white/[0.04]">
        <div className="rounded-[1.4rem] bg-neutral-900 ring-1 ring-white/[0.08] p-5">
          <CompatibilityPanel errors={errors} warnings={warnings} isCompatible={isCompatible} hasAny={completed > 0} />
        </div>
      </div>

      {/* Component list */}
      <div className="rounded-[1.75rem] p-2 bg-white/[0.04]">
        <div className="rounded-[1.4rem] bg-neutral-900 ring-1 ring-white/[0.08] p-2 space-y-0.5">
          {SLOT_ORDER.map((key) => {
            const product = slots[key]
            return (
              <div key={key} className="group flex items-stretch">
                <button
                  onClick={() => goToSlot(key)}
                  className="flex-1 flex items-start gap-3 p-3 rounded-2xl hover:bg-white/[0.04] text-left transition-colors duration-300 ease-premium"
                >
                  <div className="h-9 w-9 rounded-xl bg-mpc-fog flex items-center justify-center shrink-0">
                    <Cpu className="h-4 w-4 text-mpc-graphite" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] uppercase tracking-[0.2em] text-mpc-graphite font-bold">{SLOT_LABELS[key]}</div>
                    {product ? (
                      <>
                        <div className="text-xs font-medium line-clamp-1 mt-0.5">{product.name}</div>
                        <div className="text-[10px] text-mpc-graphite tabular-nums">{formatCOP(Number(product.price))}</div>
                      </>
                    ) : (
                      <div className="text-xs text-mpc-silver italic mt-0.5">Sin seleccionar</div>
                    )}
                  </div>
                </button>
                {product && (
                  <button
                    onClick={() => clearSlot(key)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-premium text-mpc-graphite hover:text-foreground p-2"
                    aria-label="Quitar"
                  >
                    <X className="h-3 w-3" strokeWidth={1.8} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-1">
        <button
          onClick={handleAddToCart}
          disabled={!canCheckout}
          title={!isCompatible ? 'Resuelve los errores de compatibilidad' : completed < 5 ? 'Selecciona al menos CPU, Mobo, RAM, Storage y PSU' : ''}
          className={cn(
            'group w-full inline-flex items-center justify-between bg-neutral-900 text-white rounded-full pl-5 pr-1.5 py-2.5 text-sm font-medium transition-all duration-500 ease-premium active:scale-[0.98]',
            !canCheckout ? 'opacity-30 cursor-not-allowed' : 'hover:bg-white hover:text-black'
          )}
        >
          <span className="inline-flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
            Agregar al carrito
          </span>
          <span className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-500 ease-premium group-hover:translate-x-0.5">
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleWhatsApp}
            disabled={completed === 0}
            className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-medium border border-white/15 hover:bg-white hover:text-black hover:border-white transition-all duration-300 ease-premium disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
            WhatsApp
          </button>
          <button
            onClick={handleSave}
            disabled={completed === 0 || saving}
            className="inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2.5 text-xs font-medium border border-white/15 hover:bg-white hover:text-black hover:border-white transition-all duration-300 ease-premium disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" strokeWidth={1.5} />}
            Guardar
          </button>
        </div>

        <button
          onClick={() => { if (confirm('¿Reiniciar el build completo?')) { resetBuild(); router.refresh() } }}
          className="w-full inline-flex items-center justify-center gap-1.5 text-[11px] text-mpc-graphite hover:text-foreground py-2 transition-colors"
        >
          <RefreshCw className="h-3 w-3" strokeWidth={1.5} /> Reiniciar build
        </button>
      </div>
    </aside>
  )
}

function CompatibilityPanel({ errors, warnings, isCompatible, hasAny }: {
  errors: Array<{ message: string; slot: string }>
  warnings: Array<{ message: string; slot: string }>
  isCompatible: boolean
  hasAny: boolean
}) {
  if (!hasAny) {
    return <p className="text-[11px] text-mpc-graphite text-center leading-relaxed">Empieza seleccionando un procesador para ver compatibilidad en vivo.</p>
  }
  if (errors.length === 0 && warnings.length === 0) {
    return (
      <div className="flex items-start gap-2">
        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={1.5} />
        <div>
          <div className="font-semibold text-sm">Compatibilidad verificada</div>
          <div className="text-[11px] text-mpc-graphite mt-0.5">Todos los componentes son compatibles entre sí.</div>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-3">
      {!isCompatible && (
        <div className="text-xs font-bold flex items-center gap-1.5">
          <XCircle className="h-4 w-4" strokeWidth={1.5} /> {errors.length} {errors.length === 1 ? 'error' : 'errores'}
        </div>
      )}
      {warnings.length > 0 && (
        <div className="text-xs font-bold flex items-center gap-1.5 text-mpc-graphite">
          <AlertTriangle className="h-4 w-4" strokeWidth={1.5} /> {warnings.length} {warnings.length === 1 ? 'advertencia' : 'advertencias'}
        </div>
      )}
      <ul className="space-y-2 text-[11px] leading-relaxed">
        {errors.map((e, i) => <li key={`e-${i}`} className="flex gap-1.5"><span className="font-bold">✗</span> {e.message}</li>)}
        {warnings.map((w, i) => <li key={`w-${i}`} className="flex gap-1.5 text-mpc-graphite"><span className="font-bold">⚠</span> {w.message}</li>)}
      </ul>
    </div>
  )
}
