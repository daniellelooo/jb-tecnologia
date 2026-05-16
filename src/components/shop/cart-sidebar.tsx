'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/lib/stores/cart-store'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatCOP } from '@/types'
import { cn } from '@/lib/utils'

export function CartSidebar() {
  const [mounted, setMounted] = useState(false)
  const items = useCartStore((s) => s.items)
  const isOpen = useCartStore((s) => s.isOpen)
  const setOpen = useCartStore((s) => s.setOpen)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)
  const subtotal = useCartStore((s) => s.getSubtotal())

  useEffect(() => { setMounted(true) }, [])

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 bg-neutral-900 border-l border-white/10">
        <SheetHeader className="px-6 py-5 border-b border-white/[0.08]">
          <SheetTitle className="flex items-center justify-between text-lg font-bold tracking-display">
            <span>Tu carrito</span>
            {mounted && items.length > 0 && (
              <span className="text-xs font-normal bg-neutral-900 text-white px-2.5 py-0.5 rounded-full">{items.length} items</span>
            )}
          </SheetTitle>
        </SheetHeader>

        {!mounted || items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-12">
            <div className="h-20 w-20 rounded-full bg-white/[0.04] flex items-center justify-center mb-5">
              <ShoppingBag className="h-8 w-8 text-mpc-graphite" strokeWidth={1.2} />
            </div>
            <p className="text-xl font-bold tracking-display mb-1">Carrito vacío</p>
            <p className="text-sm text-mpc-graphite mb-8 max-w-xs">Agrega productos o configura un PC para llenar tu carrito.</p>
            <Link
              href="/tienda"
              onClick={() => setOpen(false)}
              className="group inline-flex items-center gap-2 bg-neutral-900 text-white rounded-full pl-5 pr-2 py-2 text-sm font-medium hover:bg-white/95 hover:text-black transition-all duration-500 ease-premium active:scale-[0.98]"
            >
              Explorar tienda
              <span className="h-7 w-7 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-500 ease-premium group-hover:translate-x-0.5">
                <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
              </span>
            </Link>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1">
              <ul className="px-6 py-4 space-y-1">
                {items.map((item) => (
                  <li key={item.id} className="py-4 first:pt-0 border-b border-white/[0.06] last:border-0">
                    <div className="flex gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] uppercase tracking-[0.18em] text-mpc-graphite font-bold">{item.brand}</div>
                        <div className="font-medium text-sm leading-snug line-clamp-2 mt-0.5">{item.name}</div>
                        {item.buildId && (
                          <div className="text-[9px] uppercase tracking-[0.15em] mt-1.5 inline-block bg-white/[0.06] px-1.5 py-0.5 rounded text-mpc-graphite font-bold">
                            Parte de build
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <div className="flex items-center rounded-full border border-white/[0.12]">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="h-7 w-7 hover:bg-white/[0.04] transition-colors duration-300 ease-premium rounded-l-full"
                              aria-label="Reducir"
                            >
                              <Minus className="h-3 w-3 mx-auto" strokeWidth={1.5} />
                            </button>
                            <span className="w-6 text-center text-xs font-semibold tabular-nums">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="h-7 w-7 hover:bg-white/[0.04] transition-colors duration-300 ease-premium rounded-r-full"
                              aria-label="Aumentar"
                            >
                              <Plus className="h-3 w-3 mx-auto" strokeWidth={1.5} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="ml-auto text-mpc-graphite hover:text-foreground transition-colors duration-300 ease-premium p-1"
                            aria-label="Eliminar"
                          >
                            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-sm font-bold tabular-nums">{formatCOP(item.price * item.quantity)}</div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </ScrollArea>

            <div className="border-t border-white/[0.08] px-6 py-5 space-y-3 bg-neutral-900">
              <div className="flex items-center justify-between text-sm">
                <span className="text-mpc-graphite">Subtotal</span>
                <span className="font-bold tabular-nums">{formatCOP(subtotal)}</span>
              </div>
              <p className="text-[11px] text-mpc-graphite leading-relaxed">El costo de envío se calcula en el checkout. Retiro en tienda gratis.</p>
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className={cn(
                  'group flex items-center justify-between bg-neutral-900 text-white rounded-full pl-6 pr-2 py-3 text-sm font-medium hover:bg-white/95 hover:text-black transition-all duration-500 ease-premium active:scale-[0.98]'
                )}
              >
                Ir al checkout
                <span className="h-8 w-8 rounded-full bg-white/15 flex items-center justify-center transition-transform duration-500 ease-premium group-hover:translate-x-1">
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </span>
              </Link>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
