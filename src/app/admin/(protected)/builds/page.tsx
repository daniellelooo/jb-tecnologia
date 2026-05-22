import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Hammer, CheckCircle2, AlertCircle } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'
import { formatCOP } from '@/types'

export const dynamic = 'force-dynamic'

export default async function AdminBuildsPage() {
  const supabase = createAdminClient()
  const { data: buildsRaw } = await supabase
    .from('pc_builds')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const allIds = Array.from(
    new Set(
      (buildsRaw ?? []).flatMap((b) => [b.cpu_id, b.motherboard_id, b.ram_id, b.storage_id, b.gpu_id, b.psu_id, b.case_id, b.cooling_id].filter((id): id is string => !!id))
    )
  )

  const { data: productsList } = allIds.length > 0
    ? await supabase.from('products').select('id, name, brand').in('id', allIds)
    : { data: [] as Array<{ id: string; name: string; brand: string }> }

  const productMap = new Map((productsList ?? []).map((p) => [p.id, p]))

  const builds = (buildsRaw ?? []).map((b) => ({
    ...b,
    cpu: b.cpu_id ? productMap.get(b.cpu_id) : null,
    motherboard: b.motherboard_id ? productMap.get(b.motherboard_id) : null,
    ram: b.ram_id ? productMap.get(b.ram_id) : null,
    storage: b.storage_id ? productMap.get(b.storage_id) : null,
    gpu: b.gpu_id ? productMap.get(b.gpu_id) : null,
    psu: b.psu_id ? productMap.get(b.psu_id) : null,
    case: b.case_id ? productMap.get(b.case_id) : null,
    cooling: b.cooling_id ? productMap.get(b.cooling_id) : null,
  }))

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-400 mb-2">Configurador</div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-display text-neutral-900">Builds</h1>
        <p className="text-sm text-neutral-600 mt-2">Configuraciones de PC armadas por los clientes en el configurador.</p>
      </header>

      {builds.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-neutral-700 bg-neutral-900 p-16 text-center">
          <Hammer className="h-12 w-12 mx-auto text-neutral-400 mb-4" strokeWidth={1.2} />
          <p className="font-bold text-lg tracking-display mb-1">Sin builds aún</p>
          <p className="text-sm text-neutral-500">Cuando los clientes usen el configurador, los builds aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {builds.map((b) => {
            const components = [b.cpu, b.motherboard, b.ram, b.storage, b.gpu, b.psu, b.case, b.cooling].filter(Boolean) as Array<{ name: string; brand: string }>
            return (
              <article key={b.id} className="rounded-3xl border border-neutral-800 bg-neutral-900 p-5">
                <header className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                  <div>
                    <div className="font-semibold text-sm">{b.customer_name ?? 'Cliente anónimo'}</div>
                    <div className="text-[11px] text-neutral-500">
                      {b.customer_phone ?? 'Sin teléfono'} · {format(new Date(b.created_at), "d 'de' MMMM HH:mm", { locale: es })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-[0.15em] px-2 py-0.5 rounded-full ${
                      b.status === 'requested' ? 'bg-neutral-900 text-white' : b.status === 'ordered' ? 'bg-neutral-200 text-neutral-700' : 'bg-neutral-800 text-neutral-600'
                    }`}>
                      {b.status === 'draft' ? 'Borrador' : b.status === 'requested' ? 'Solicitado' : 'Convertido'}
                    </span>
                    {b.is_compatible ? (
                      <span className="text-[11px] flex items-center gap-1 text-neutral-600">
                        <CheckCircle2 className="h-3 w-3" strokeWidth={1.5} /> Compatible
                      </span>
                    ) : (
                      <span className="text-[11px] flex items-center gap-1 text-white font-medium">
                        <AlertCircle className="h-3 w-3" strokeWidth={1.5} /> Con problemas
                      </span>
                    )}
                  </div>
                </header>

                <ul className="text-[11px] text-neutral-600 space-y-0.5">
                  {components.map((c, i) => <li key={i}>· {c.brand} {c.name}</li>)}
                </ul>

                {b.notes && (
                  <div className="mt-3 pt-3 border-t border-neutral-800 text-xs">
                    <div className="text-neutral-500 mb-0.5 font-medium">Notas:</div>
                    <div className="whitespace-pre-line">{b.notes}</div>
                  </div>
                )}

                <footer className="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between">
                  <div className="text-[10px] text-neutral-400 font-mono">#{b.id.slice(0, 8)}</div>
                  <div className="text-lg font-bold tabular-nums">{formatCOP(Number(b.total_price))}</div>
                </footer>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
