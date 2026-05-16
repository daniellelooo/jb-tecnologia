import Image from 'next/image'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  variant?: 'dark' | 'light'
  size?: 'sm' | 'md' | 'lg'
  /**
   * Kept for backwards-compat. The new logo is already an integrated
   * wordmark+symbol lockup, so the prop is largely ignored — when false
   * we render at the same width but slightly smaller.
   */
  showWordmark?: boolean
}

const HEIGHTS = {
  sm: 28,
  md: 40,
  lg: 56,
}

export function Logo({ className, variant = 'light', size = 'md', showWordmark = true }: LogoProps) {
  const h = HEIGHTS[size]
  const w = Math.round(h * (548 / 274)) // preserve aspect ratio
  const isLight = variant === 'light'
  return (
    <div className={cn('inline-flex items-center', className)}>
      <Image
        src="/logo.png"
        alt="JB Tecnología MED"
        width={w * (showWordmark ? 1 : 0.55)}
        height={h}
        priority
        className={cn(
          'h-auto w-auto select-none',
          isLight && 'invert brightness-0 [filter:invert(1)]',
        )}
        style={{ height: h }}
      />
    </div>
  )
}
