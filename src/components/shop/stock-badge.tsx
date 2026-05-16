import { cn } from '@/lib/utils'

interface StockBadgeProps {
  stock: number
  size?: 'sm' | 'md'
  className?: string
}

export function StockBadge({ stock, size = 'md', className }: StockBadgeProps) {
  const sizeClass = size === 'sm' ? 'text-[9px] px-2 py-0.5 tracking-[0.15em]' : 'text-[10px] px-2.5 py-1 tracking-[0.18em]'

  if (stock === 0) {
    return (
      <span className={cn(sizeClass, 'rounded-full font-bold uppercase bg-mpc-charcoal text-white', className)}>
        Agotado
      </span>
    )
  }

  if (stock < 5) {
    return (
      <span className={cn(sizeClass, 'rounded-full font-bold uppercase bg-neutral-900 text-foreground ring-1 ring-black/15', className)}>
        {stock} disp.
      </span>
    )
  }

  return (
    <span className={cn(sizeClass, 'rounded-full font-bold uppercase bg-neutral-900 text-white', className)}>
      En stock
    </span>
  )
}
