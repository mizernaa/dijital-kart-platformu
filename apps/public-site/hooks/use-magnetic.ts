'use client'
import { useRef, useCallback } from 'react'
import { useMotionValue, useSpring, type MotionStyle } from 'framer-motion'
import { useReducedMotion } from './use-reduced-motion'

interface UseMagneticOptions {
  strength?: number
  maxDistance?: number
}

export function useMagnetic<T extends HTMLElement>(options: UseMagneticOptions = {}) {
  const { strength = 0.32, maxDistance = 16 } = options
  const ref = useRef<T>(null)
  const reduce = useReducedMotion()

  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const springX = useSpring(mx, { stiffness: 180, damping: 28 })
  const springY = useSpring(my, { stiffness: 180, damping: 28 })

  const onMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (reduce) return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const dx = e.clientX - (r.left + r.width / 2)
    const dy = e.clientY - (r.top + r.height / 2)
    const dist = Math.sqrt(dx * dx + dy * dy)
    const factor = Math.min(dist, maxDistance) / (maxDistance || 1)
    mx.set(dx * strength * (1 - factor / 2))
    my.set(dy * strength * (1 - factor / 2))
  }, [reduce, mx, my, strength, maxDistance])

  const onLeave = useCallback(() => {
    mx.set(0)
    my.set(0)
  }, [mx, my])

  const style: MotionStyle = {
    x: springX,
    y: springY,
  }

  return { ref, style, onMove, onLeave }
}
