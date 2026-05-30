'use client'
import { useRef, useCallback } from 'react'
import { useMotionValue, useSpring, useTransform, type MotionStyle } from 'framer-motion'
import { useReducedMotion } from './use-reduced-motion'

interface Use3DTiltOptions {
  perspective?: number
  rotateRange?: number
  scale?: number
}

export function use3DTilt<T extends HTMLElement>(options: Use3DTiltOptions = {}) {
  const { perspective = 1100, rotateRange = 4, scale = 1.06 } = options
  const ref = useRef<T>(null)
  const reduce = useReducedMotion()

  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 180, damping: 28 })
  const springY = useSpring(y, { stiffness: 180, damping: 28 })
  const rotateX = useTransform(springY, [-0.5, 0.5], [rotateRange, -rotateRange])
  const rotateY = useTransform(springX, [-0.5, 0.5], [-rotateRange, rotateRange])

  const onMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    if (reduce) return
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    x.set((e.clientX - r.left) / r.width - 0.5)
    y.set((e.clientY - r.top) / r.height - 0.5)
  }, [reduce, x, y])

  const onLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  const style: MotionStyle = {
    rotateX,
    rotateY,
    transformStyle: 'preserve-3d',
    perspective,
  }

  const imgStyle: MotionStyle = {
    scale,
  }

  return { ref, style, imgStyle, onMove, onLeave }
}
