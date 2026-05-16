export default function ShopLoading() {
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex flex-col items-center justify-center gap-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-[0.25em]">Cargando</span>
        </div>
        <div className="w-full max-w-3xl space-y-3">
          <div className="h-10 rounded-2xl bg-white/[0.04] animate-pulse" />
          <div className="h-6 w-2/3 rounded-2xl bg-white/[0.04] animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-5xl mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-[1.75rem] p-2 bg-white/[0.04]">
              <div className="rounded-[1.4rem] bg-neutral-900 ring-1 ring-white/[0.08] aspect-[5/6] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
