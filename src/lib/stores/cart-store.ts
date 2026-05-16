'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Product } from '@/types'

export interface CartItem {
  id: string
  productId: string
  name: string
  slug: string
  sku: string
  brand: string
  price: number
  quantity: number
  buildId?: string
  categorySlug?: string
}

interface CartState {
  items: CartItem[]
  isOpen: boolean
  addItem: (product: Product, opts?: { quantity?: number; buildId?: string; categorySlug?: string }) => void
  addBuild: (components: Array<{ product: Product; categorySlug?: string }>, buildId: string) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  setOpen: (open: boolean) => void
  toggle: () => void
  getSubtotal: () => number
  getItemCount: () => number
}

function makeId(productId: string, buildId?: string): string {
  return buildId ? `${productId}__build_${buildId}` : productId
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, opts) => {
        const id = makeId(product.id, opts?.buildId)
        const quantity = opts?.quantity ?? 1
        set((state) => {
          const existing = state.items.find((i) => i.id === id)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, quantity: i.quantity + quantity } : i
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                id,
                productId: product.id,
                name: product.name,
                slug: product.slug,
                sku: product.sku,
                brand: product.brand,
                price: Number(product.price),
                quantity,
                buildId: opts?.buildId,
                categorySlug: opts?.categorySlug,
              },
            ],
          }
        })
      },

      addBuild: (components, buildId) => {
        components.forEach(({ product, categorySlug }) => {
          get().addItem(product, { buildId, categorySlug })
        })
      },

      removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        })),

      clearCart: () => set({ items: [] }),
      setOpen: (open) => set({ isOpen: open }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),

      getSubtotal: () => get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      getItemCount: () => get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'jbtecnologia-cart',
      partialize: (state) => ({ items: state.items }),
    }
  )
)
