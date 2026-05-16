import { formatCOP } from '@/types'
import { cn } from '@/lib/utils'

interface PriceDisplayProps {
  price: number
  comparePrice?: number | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: { price: 'text-sm font-semibold tabular-nums', compare: 'text-xs' },
  md: { price: 'text-lg font-bold tabular-nums tracking-tight', compare: 'text-xs' },
  lg: { price: 'text-2xl font-bold tabular-nums tracking-tight', compare: 'text-sm' },
  xl: { price: 'text-[40px] leading-none font-bold tabular-nums tracking-tightest', compare: 'text-base' },
}

export function PriceDisplay({ price, comparePrice, size = 'md', className }: PriceDisplayProps) {
  const styles = sizes[size]
  const hasDiscount = comparePrice && comparePrice > price

  return (
    <div className={cn('flex items-baseline gap-2 flex-wrap', className)}>
      <span className={cn(styles.price, 'text-foreground')}>
        {formatCOP(price)}
      </span>
      {hasDiscount && (
        <span className={cn(styles.compare, 'text-mpc-silver line-through font-medium')}>
          {formatCOP(comparePrice!)}
        </span>
      )}
    </div>
  )
}
