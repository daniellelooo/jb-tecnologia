'use client'

import { useEffect, useState } from 'react'
import { ShoppingBag } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart-store'
import { cn } from '@/lib/utils'

export function CartTrigger() {
  const [mounted, setMounted] = useState(false)
  const setOpen = useCartStore((s) => s.setOpen)
  const itemCount = useCartStore((s) => s.getItemCount())

  useEffect(() => { setMounted(true) }, [])

  const hasItems = mounted && itemCount > 0

  return (
    <button
      onClick={() => setOpen(true)}
      aria-label="Abrir carrito"
      className={cn(
        'relative h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300 ease-premium',
        'hover:bg-white/5 active:scale-95'
      )}
    >
      <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />
      {hasItems && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-neutral-900 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
          {itemCount}
        </span>
      )}
    </button>
  )
}
