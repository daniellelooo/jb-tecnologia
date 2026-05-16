'use client'

import { Gamepad2, Briefcase, Palette, Radio, ArrowRight, Sparkles } from 'lucide-react'
import { useConfiguratorStore } from '@/lib/stores/configurator-store'
import { cn } from '@/lib/utils'

const USE_CASES = [
  { id: 'gaming', label: 'Gaming', description: 'Jugar a máxima calidad', icon: Gamepad2 },
  { id: 'trabajo', label: 'Trabajo', description: 'Productividad y negocio', icon: Briefcase },
  { id: 'diseno_grafico', label: 'Diseño', description: 'Adobe, 3D, video, foto', icon: Palette },
  { id: 'streaming', label: 'Streaming', description: 'Transmitir mientras juegas', icon: Radio },
] as const

export function UseCaseSelector() {
  const useCase = useConfiguratorStore((s) => s.useCase)
  const setUseCase = useConfiguratorStore((s) => s.setUseCase)
  const goToSlot = useConfiguratorStore((s) => s.goToSlot)

  return (
    <section>
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1 mb-6">
          <Sparkles className="h-3 w-3" strokeWidth={1.5} />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Paso 0 · Selecciona tu uso</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-display leading-[0.95] mb-5">
          ¿Para qué vas a usar tu <span className="text-mpc-silver">PC?</span>
        </h1>
        <p className="text-base md:text-lg text-mpc-graphite max-w-2xl mx-auto leading-relaxed">
          Esto nos ayuda a recomendarte componentes optimizados. Puedes saltar este paso si prefieres armar desde cero.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {USE_CASES.map((opt) => {
          const Icon = opt.icon
          const active = useCase === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => setUseCase(opt.id)}
              className={cn(
                'group relative rounded-[1.75rem] p-1.5 transition-all duration-500 ease-premium text-left',
                active ? 'bg-white' : 'bg-white/[0.04] hover:bg-white/[0.08]'
              )}
            >
              <div className={cn(
                'rounded-[1.4rem] p-7 aspect-square flex flex-col justify-between',
                active ? 'bg-neutral-900 text-white ring-2 ring-white' : 'bg-neutral-900 ring-1 ring-white/[0.08]'
              )}>
                <div className={cn(
                  'h-12 w-12 rounded-2xl flex items-center justify-center transition-colors duration-500 ease-premium',
                  active ? 'bg-white text-black' : 'bg-white/[0.06] text-white'
                )}>
                  <Icon className="h-5 w-5" strokeWidth={1.5} />
                </div>
                <div>
                  <div className="text-xl font-bold tracking-display">{opt.label}</div>
                  <div className={cn('text-xs mt-1.5', active ? 'text-white/60' : 'text-mpc-graphite')}>{opt.description}</div>
                </div>
                {active && (
                  <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-white text-black text-[11px] font-bold flex items-center justify-center">✓</div>
                )}
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        <button
          onClick={() => useCase && goToSlot('cpu')}
          disabled={!useCase}
          className="group inline-flex items-center gap-2 bg-neutral-900 text-white rounded-full pl-6 pr-2 py-2 text-sm font-medium hover:bg-white/95 hover:text-black transition-all duration-500 ease-premium active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Continuar
          <span className="h-9 w-9 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-500 ease-premium group-hover:translate-x-0.5">
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </span>
        </button>
        <button
          onClick={() => { setUseCase('custom'); goToSlot('cpu') }}
          className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium text-mpc-graphite hover:text-foreground hover:bg-white/[0.04] transition-all duration-300 ease-premium"
        >
          Armar desde cero
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </section>
  )
}
