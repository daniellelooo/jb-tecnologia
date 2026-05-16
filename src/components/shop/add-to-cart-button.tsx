'use client'

import { useState } from 'react'
import { ShoppingBag, Minus, Plus, Check, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useCartStore } from '@/lib/stores/cart-store'
import type { Product } from '@/types'
import { cn } from '@/lib/utils'

interface AddToCartButtonProps {
  product: Product
  categorySlug?: string
}

export function AddToCartButton({ product, categorySlug }: AddToCartButtonProps) {
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)
  const setCartOpen = useCartStore((s) => s.setOpen)

  const inStock = product.stock > 0
  const maxQty = Math.max(1, product.stock)

  function handleAdd() {
    addItem(product, { quantity: qty, categorySlug })
    toast.success(`${product.name} agregado`, {
      action: { label: 'Ver carrito', onClick: () => setCartOpen(true) },
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  if (!inStock) {
    return (
      <button
        disabled
        className="w-full h-12 rounded-full bg-mpc-charcoal text-white text-sm font-medium opacity-60 cursor-not-allowed"
      >
        Agotado
      </button>
    )
  }

  return (
    <div className="flex items-stretch gap-2">
      {/* Quantity stepper */}
      <div className="flex items-center rounded-full border border-white/15 overflow-hidden">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="h-12 w-12 hover:bg-black/[0.05] transition-colors duration-300 ease-premium active:scale-95"
          aria-label="Reducir cantidad"
        >
          <Minus className="h-3.5 w-3.5 mx-auto" strokeWidth={1.5} />
        </button>
        <div className="w-10 text-center text-sm font-semibold tabular-nums">{qty}</div>
        <button
          onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
          className="h-12 w-12 hover:bg-black/[0.05] transition-colors duration-300 ease-premium active:scale-95"
          aria-label="Aumentar cantidad"
        >
          <Plus className="h-3.5 w-3.5 mx-auto" strokeWidth={1.5} />
        </button>
      </div>

      {/* CTA */}
      <button
        onClick={handleAdd}
        className={cn(
          'group flex-1 h-12 inline-flex items-center justify-between gap-2 rounded-full pl-6 pr-2 text-sm font-medium transition-all duration-500 ease-premium active:scale-[0.98]',
          added ? 'bg-neutral-900 text-white ring-1 ring-black' : 'bg-neutral-900 text-white hover:bg-white/95 hover:text-black'
        )}
      >
        <span className="flex items-center gap-2">
          {added ? <Check className="h-4 w-4" strokeWidth={1.8} /> : <ShoppingBag className="h-4 w-4" strokeWidth={1.5} />}
          {added ? 'Agregado al carrito' : 'Agregar al carrito'}
        </span>
        <span
          className={cn(
            'h-9 w-9 rounded-full flex items-center justify-center transition-all duration-500 ease-premium group-hover:translate-x-0.5',
            added ? 'bg-white/[0.06]' : 'bg-white/15'
          )}
        >
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
        </span>
      </button>
    </div>
  )
}
