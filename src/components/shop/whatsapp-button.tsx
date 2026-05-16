'use client'

import { MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WhatsAppButtonProps {
  message: string
  className?: string
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  children?: React.ReactNode
}

export function WhatsAppButton({ message, className, variant = 'outline', size = 'lg', children }: WhatsAppButtonProps) {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '573182455186'
  const href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`

  const variantClasses = {
    default: 'bg-neutral-900 text-white hover:bg-white/95 hover:text-black',
    outline: 'bg-neutral-900 text-white border border-white/15 hover:bg-black hover:text-white',
    secondary: 'bg-black/[0.05] text-foreground hover:bg-white/[0.1]',
    ghost: 'text-foreground hover:bg-black/[0.05]',
  }[variant]

  const sizeClasses = {
    default: 'h-10 px-5 text-sm',
    sm: 'h-9 px-4 text-xs',
    lg: 'h-12 px-6 text-sm',
    icon: 'h-10 w-10',
  }[size]

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium rounded-full transition-all duration-500 ease-premium active:scale-[0.98]',
        variantClasses,
        sizeClasses,
        className
      )}
    >
      <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
      {children ?? 'Cotizar por WhatsApp'}
    </a>
  )
}

// Re-export for backwards compatibility
export { buildWhatsAppProductMessage } from '@/lib/whatsapp'
