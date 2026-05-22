'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Cpu } from 'lucide-react'

export interface HeroSlide {
  src: string
  name: string
  /** Sub-line shown below the product name */
  tagline?: string
}

interface HeroShowcaseProps {
  slides: HeroSlide[]
  /** Auto-rotation interval in ms. Default 5000. */
  intervalMs?: number
}

export function HeroShowcase({ slides, intervalMs = 5000 }: HeroShowcaseProps) {
  const [index, setIndex] = useState(0)
  // Slides "armed" (loaded once) — keeps crossfade smooth on subsequent cycles
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0]))

  useEffect(() => {
    if (slides.length <= 1) return
    const id = setInterval(() => {
      setIndex((prev) => {
        const next = (prev + 1) % slides.length
        setLoaded((s) => (s.has(next) ? s : new Set(s).add(next)))
        return next
      })
    }, intervalMs)
    return () => clearInterval(id)
  }, [slides.length, intervalMs])

  const current = slides[index]

  return (
    <div className="rounded-[2rem] p-2 bg-white/[0.04]">
      <div className="rounded-[1.625rem] bg-mpc-fog overflow-hidden aspect-[5/6] relative">
        {/* Crossfade layers */}
        {slides.length === 0 ? (
          <div className="absolute inset-0 grid place-items-center">
            <Cpu className="h-32 w-32 text-mpc-silver" strokeWidth={0.6} />
          </div>
        ) : (
          slides.map((slide, i) => (
            <div
              key={slide.src}
              className="absolute inset-0 transition-opacity duration-1000 ease-premium"
              style={{ opacity: i === index ? 1 : 0 }}
              aria-hidden={i !== index}
            >
              {loaded.has(i) && (
                <Image
                  src={slide.src}
                  alt={slide.name}
                  fill
                  priority={i === 0}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-12"
                  unoptimized={slide.src.startsWith('http')}
                />
              )}
            </div>
          ))
        )}

        {/* Top-left badge */}
        <div className="absolute top-5 left-5 flex flex-col gap-1.5 z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] bg-neutral-900 text-white px-2.5 py-1 rounded-full">
            Destacado
          </span>
        </div>

        {/* Bottom info pill with crossfade */}
        <div className="absolute bottom-5 left-5 right-5 z-10">
          <div className="rounded-2xl bg-black/85 backdrop-blur text-white p-4">
            <div className="text-[10px] uppercase tracking-[0.2em] text-white/50 mb-1">
              JB Builds
            </div>
            <div
              key={`name-${index}`}
              className="font-semibold text-base leading-tight transition-opacity duration-500 ease-premium"
            >
              {current?.name ?? 'Configurador disponible'}
            </div>
            <div
              key={`tag-${index}`}
              className="text-xs text-white/60 mt-1 transition-opacity duration-500 ease-premium"
            >
              {current?.tagline ?? 'Arma tu propio build'}
            </div>
          </div>
        </div>

        {/* Dots indicator */}
        {slides.length > 1 && (
          <div className="absolute bottom-[7.5rem] left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setIndex(i)
                  setLoaded((s) => (s.has(i) ? s : new Set(s).add(i)))
                }}
                aria-label={`Ver slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-500 ease-premium ${
                  i === index ? 'w-6 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
