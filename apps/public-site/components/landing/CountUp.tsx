'use client'
import { useEffect, useRef, useState } from 'react'

interface CountUpProps {
  to: number
  suffix?: string
  format?: 'short' | 'full'
  duration?: number
  label: string
}

function fmt(n: number, format?: string) {
  if (format === 'short') {
    if (n >= 1e6) return (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1) + 'M'
    if (n >= 1e3) return Math.round(n / 1e3) + 'K'
  }
  return Math.round(n).toLocaleString('tr-TR')
}

export default function CountUp({ to, suffix = '', format = 'full', duration = 1600, label }: CountUpProps) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const ran = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || ran.current) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setVal(to); ran.current = true; return }

    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      ran.current = true
      const t0 = performance.now()
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / duration)
        setVal(Math.floor(to * (1 - Math.pow(1 - k, 3))))
        if (k < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [to, duration])

  return (
    <div className="stat">
      <div className="num" ref={ref}>{fmt(val, format)}{suffix}</div>
      <div className="lbl">{label}</div>
    </div>
  )
}
