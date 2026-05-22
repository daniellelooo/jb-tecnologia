'use client'

import { useRef, type ReactNode, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'

interface SpotlightProps {
  children: ReactNode
  className?: string
  /** Border-radius matched to the wrapped element. Defaults to `inherit`. */
  radius?: string
  /** Intensity of the glow (0-1). Default 0.12. */
  intensity?: number
}

/**
 * Cursor-tracked spotlight glow. Lightweight: no React state, only ref + CSS vars.
 * Wrap any content; the glow is rendered as a `::before` overlay tied to mouse position.
 */
export function Spotlight({ children, className, intensity = 0.12 }: SpotlightProps) {
  const ref = useRef<HTMLDivElement>(null)

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--spot-x', `${e.clientX - rect.left}px`)
    el.style.setProperty('--spot-y', `${e.clientY - rect.top}px`)
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      className={cn(
        'group/spotlight relative isolate',
        // Spotlight overlay via pseudo-element; uses CSS vars from mouse move
        'before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:opacity-0',
        'before:transition-opacity before:duration-500 before:ease-premium',
        'hover:before:opacity-100',
        'before:bg-[radial-gradient(420px_circle_at_var(--spot-x,50%)_var(--spot-y,50%),rgba(255,210,160,var(--spot-intensity)),transparent_60%)]',
        className
      )}
      style={{ ['--spot-intensity' as string]: intensity }}
    >
      {children}
    </div>
  )
}
