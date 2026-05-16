'use client'

import { useMemo } from 'react'
import { Gauge, Gamepad2, Briefcase, Palette, Radio, CheckCircle2, AlertTriangle, XCircle, Sparkles } from 'lucide-react'
import { useConfiguratorStore } from '@/lib/stores/configurator-store'
import {
  estimateGaming, estimateWork, estimateDesign, estimateStreaming,
  fpsLabel, ratingTone, ratingLabel,
  type GamingFpsRow, type AppRow,
} from '@/lib/configurator/performance'
import { cn } from '@/lib/utils'

export function PerformanceEstimator() {
  const slots = useConfiguratorStore((s) => s.slots)
  const useCase = useConfiguratorStore((s) => s.useCase)

  const gaming = useMemo(() => estimateGaming(slots), [slots])
  const work = useMemo(() => estimateWork(slots), [slots])
  const design = useMemo(() => estimateDesign(slots), [slots])
  const streaming = useMemo(() => estimateStreaming(slots), [slots])

  // Choose panel based on useCase
  if (!useCase || useCase === 'custom' || useCase === 'preset') {
    // Show a teaser only if we have CPU+GPU
    if (!slots.cpu) return null
    return (
      <Wrapper title="Rendimiento estimado" subtitle="Elige un caso de uso para ver el desglose">
        <p className="text-[12px] text-mpc-graphite leading-relaxed">
          Volvé al inicio del configurador y seleccioná Gaming, Trabajo, Diseño o Streaming
          para ver qué juegos correrá, qué programas soportará y a qué nivel.
        </p>
      </Wrapper>
    )
  }

  if (useCase === 'gaming') {
    return <GamingPanel report={gaming} />
  }
  if (useCase === 'trabajo') {
    return <WorkPanel rows={work} />
  }
  if (useCase === 'diseno_grafico') {
    return <DesignPanel rows={design} />
  }
  if (useCase === 'streaming') {
    return <StreamingPanel report={streaming} />
  }

  return null
}

// ============================================================
// Wrapper styles — match the editorial monochrome aesthetic
// ============================================================
function Wrapper({ title, subtitle, icon: Icon = Gauge, children }: {
  title: string
  subtitle?: string
  icon?: typeof Gauge
  children: React.ReactNode
}) {
  return (
    <section className="mt-10">
      <div className="rounded-[1.75rem] p-2 bg-white/[0.04]">
        <div className="rounded-[1.4rem] bg-neutral-900 ring-1 ring-white/[0.08] p-6 md:p-8">
          <div className="flex items-start gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-white/[0.06] flex items-center justify-center shrink-0">
              <Icon className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mpc-graphite">Estimación de rendimiento</div>
              <h3 className="text-xl md:text-2xl font-bold tracking-display leading-tight mt-1">{title}</h3>
              {subtitle && <p className="text-xs text-mpc-graphite mt-1.5">{subtitle}</p>}
            </div>
          </div>
          {children}
        </div>
      </div>
    </section>
  )
}

function Pill({ tone, children }: { tone: 'good' | 'ok' | 'bad'; children: React.ReactNode }) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tabular-nums tracking-wide',
      tone === 'good' && 'bg-white text-black',
      tone === 'ok' && 'bg-white/[0.08] text-white',
      tone === 'bad' && 'bg-white/[0.04] text-mpc-silver',
    )}>{children}</span>
  )
}

function RatingIcon({ tone }: { tone: 'good' | 'ok' | 'bad' }) {
  if (tone === 'good') return <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.8} />
  if (tone === 'ok') return <AlertTriangle className="h-3.5 w-3.5" strokeWidth={1.8} />
  return <XCircle className="h-3.5 w-3.5" strokeWidth={1.8} />
}

// ============================================================
// Gaming panel — FPS table
// ============================================================
function GamingPanel({ report }: { report: ReturnType<typeof estimateGaming> }) {
  if (!report.hasData) {
    return (
      <Wrapper title="Calculadora de FPS" icon={Gamepad2}>
        <p className="text-[12px] text-mpc-graphite leading-relaxed">{report.note}</p>
      </Wrapper>
    )
  }

  return (
    <Wrapper
      title="Calculadora de FPS"
      icon={Gamepad2}
      subtitle={`Con ${report.cpu} + ${gpuLabel(report.gpu)} · Resolución recomendada: ${report.recommendedRes.toUpperCase()}`}
    >
      <div className="rounded-2xl ring-1 ring-white/[0.08] overflow-hidden">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-white/[0.03] text-[10px] uppercase tracking-[0.18em] font-bold text-mpc-graphite">
              <th className="text-left p-3">Juego</th>
              <th className="text-right p-3 hidden sm:table-cell">1080p</th>
              <th className="text-right p-3">1440p</th>
              <th className="text-right p-3 hidden md:table-cell">4K</th>
            </tr>
          </thead>
          <tbody>
            {report.rows.map((row, i) => (
              <tr key={row.game.id} className={cn('border-t border-white/[0.04]', i % 2 === 1 && 'bg-white/[0.015]')}>
                <td className="p-3 font-medium">{row.game.name}</td>
                <td className="p-3 text-right hidden sm:table-cell"><Pill {...fpsToProps(row.fps1080)}>{row.fps1080}</Pill></td>
                <td className="p-3 text-right"><Pill {...fpsToProps(row.fps1440)}>{row.fps1440}</Pill></td>
                <td className="p-3 text-right hidden md:table-cell"><Pill {...fpsToProps(row.fps4k)}>{row.fps4k}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex items-start gap-2 text-[11px] text-mpc-graphite leading-relaxed">
        <Sparkles className="h-3.5 w-3.5 mt-0.5 shrink-0" strokeWidth={1.5} />
        <span>{report.note} · Ultra preset, sin upscaling. Activar DLSS/FSR puede dar +30-60% más FPS.</span>
      </div>
    </Wrapper>
  )
}

function fpsToProps(fps: number) {
  const { tone } = fpsLabel(fps)
  return { tone, children: fps }
}

function gpuLabel(key: string | null) {
  return key ? key.replace(/_/g, ' ').toUpperCase() : '—'
}

// ============================================================
// Work panel — lista de apps
// ============================================================
function WorkPanel({ rows }: { rows: AppRow[] | null }) {
  if (!rows) {
    return (
      <Wrapper title="Rendimiento en programas de oficina" icon={Briefcase}>
        <p className="text-[12px] text-mpc-graphite">Selecciona al menos un procesador.</p>
      </Wrapper>
    )
  }
  return (
    <Wrapper
      title="Rendimiento en programas de oficina"
      icon={Briefcase}
      subtitle="Cómo correrán los programas más usados en trabajo y productividad"
    >
      <AppList rows={rows} />
    </Wrapper>
  )
}

// ============================================================
// Design panel
// ============================================================
function DesignPanel({ rows }: { rows: AppRow[] | null }) {
  if (!rows) {
    return (
      <Wrapper title="Rendimiento en software de diseño" icon={Palette}>
        <p className="text-[12px] text-mpc-graphite">Selecciona al menos un procesador.</p>
      </Wrapper>
    )
  }
  return (
    <Wrapper
      title="Rendimiento en software de diseño"
      icon={Palette}
      subtitle="Adobe, edición de video, 3D, CAD y herramientas creativas"
    >
      <AppList rows={rows} />
    </Wrapper>
  )
}

// ============================================================
// Streaming panel
// ============================================================
function StreamingPanel({ report }: { report: ReturnType<typeof estimateStreaming> }) {
  if (!report.hasData) {
    return (
      <Wrapper title="Capacidad de streaming" icon={Radio}>
        <p className="text-[12px] text-mpc-graphite">{report.encoderNote}</p>
      </Wrapper>
    )
  }
  const encoderToneVal = ratingTone(report.encoderQuality)
  return (
    <Wrapper
      title="Capacidad de streaming"
      icon={Radio}
      subtitle="Encoder, programas de streaming y FPS jugando + streameando al tiempo"
    >
      {/* Encoder card */}
      <div className="rounded-2xl ring-1 ring-white/[0.08] p-4 mb-5">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-mpc-graphite font-bold">Encoder principal</div>
            <div className="text-sm font-bold mt-0.5">{report.encoder}</div>
          </div>
          <Pill tone={encoderToneVal}>{ratingLabel(report.encoderQuality)}</Pill>
        </div>
        <p className="text-[11px] text-mpc-graphite leading-relaxed">{report.encoderNote}</p>
      </div>

      <div className="text-[10px] uppercase tracking-[0.18em] text-mpc-graphite font-bold mb-2">Programas de streaming</div>
      <AppList rows={report.apps} />

      {report.gamingWhileStreaming && (
        <>
          <div className="text-[10px] uppercase tracking-[0.18em] text-mpc-graphite font-bold mt-6 mb-2">
            FPS jugando y streameando al tiempo
          </div>
          <div className="rounded-2xl ring-1 ring-white/[0.08] overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-white/[0.03] text-[10px] uppercase tracking-[0.18em] font-bold text-mpc-graphite">
                  <th className="text-left p-3">Juego</th>
                  <th className="text-right p-3 hidden sm:table-cell">1080p</th>
                  <th className="text-right p-3">1440p</th>
                </tr>
              </thead>
              <tbody>
                {report.gamingWhileStreaming.map((row: GamingFpsRow, i: number) => (
                  <tr key={row.game.id} className={cn('border-t border-white/[0.04]', i % 2 === 1 && 'bg-white/[0.015]')}>
                    <td className="p-3 font-medium">{row.game.name}</td>
                    <td className="p-3 text-right hidden sm:table-cell"><Pill {...fpsToProps(row.fps1080)}>{row.fps1080}</Pill></td>
                    <td className="p-3 text-right"><Pill {...fpsToProps(row.fps1440)}>{row.fps1440}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-[11px] text-mpc-graphite leading-relaxed">
            Considera el overhead de streamear al mismo tiempo (encoder + OBS). NVENC moderno casi no afecta;
            x264 puede quitarte 20-30% de FPS.
          </p>
        </>
      )}
    </Wrapper>
  )
}

// ============================================================
// Shared app list
// ============================================================
function AppList({ rows }: { rows: AppRow[] }) {
  return (
    <ul className="space-y-1.5">
      {rows.map((r) => {
        const tone = ratingTone(r.rating)
        return (
          <li
            key={r.name}
            className="flex items-start gap-3 p-3 rounded-2xl ring-1 ring-white/[0.06] bg-white/[0.015]"
          >
            <div className={cn(
              'h-7 w-7 rounded-lg flex items-center justify-center shrink-0',
              tone === 'good' ? 'bg-white text-black' : tone === 'ok' ? 'bg-white/[0.08]' : 'bg-white/[0.04] text-mpc-silver'
            )}>
              <RatingIcon tone={tone} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-medium">{r.name}</span>
                <Pill tone={tone}>{ratingLabel(r.rating)}</Pill>
              </div>
              <p className="text-[11px] text-mpc-graphite leading-relaxed mt-1">{r.detail}</p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
