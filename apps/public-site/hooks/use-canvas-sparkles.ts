'use client'
import { useEffect, useRef } from 'react'
import { useReducedMotion } from './use-reduced-motion'

interface SparkleOptions {
  originX?: number // 0-1 fraction of container width
  originY?: number // 0-1 fraction of container height
}

export function useCanvasSparkles(containerRef: React.RefObject<HTMLElement | null>, options: SparkleOptions = {}) {
  const { originX = 0.6, originY = 0.46 } = options
  const reduce = useReducedMotion()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    if (reduce) return
    const container = containerRef.current
    if (!container) return

    const canvas = document.createElement('canvas')
    canvas.id = 'spark-canvas'
    canvas.setAttribute('aria-hidden', 'true')
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:3;pointer-events:none'
    container.style.position = container.style.position || 'relative'
    container.appendChild(canvas)
    canvasRef.current = canvas

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = 0, H = 0

    function resize() {
      const c = container!
      W = c.clientWidth
      H = c.clientHeight
      canvas.width = W * dpr
      canvas.height = H * dpr
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    const ro = new ResizeObserver(resize)
    ro.observe(container)
    resize()

    interface Particle {
      x: number; y: number; vx: number; vy: number
      life: number; decay: number; r: number
    }
    const parts: Particle[] = []

    function accentRGB(): [number, number, number] {
      const style = getComputedStyle(document.documentElement)
      return [
        parseInt(style.getPropertyValue('--spark-r')) || 255,
        parseInt(style.getPropertyValue('--spark-g')) || 196,
        parseInt(style.getPropertyValue('--spark-b')) || 92,
      ]
    }

    function spawn(n: number) {
      const ox = W * originX, oy = H * originY
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.4
        const sp = 0.6 + Math.random() * 2.6
        parts.push({
          x: ox + (Math.random() - 0.5) * 14,
          y: oy + (Math.random() - 0.5) * 10,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp - 0.5,
          life: 1,
          decay: 0.008 + Math.random() * 0.02,
          r: 0.6 + Math.random() * 1.8,
        })
      }
    }

    let visible = true
    let raf: number, acc = 0
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { visible = e.isIntersecting; if (visible) loop() }),
      { threshold: 0 }
    )
    io.observe(container)

    function loop() {
      if (!visible) return
      ctx!.clearRect(0, 0, W, H)
      acc += 1
      if (acc % 3 === 0) spawn(2 + Math.floor(Math.random() * 3))
      const [cr, cg, cb] = accentRGB()
      ctx!.globalCompositeOperation = 'lighter'
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]
        p.x += p.vx; p.y += p.vy; p.vy += 0.018; p.vx *= 0.99; p.life -= p.decay
        if (p.life <= 0) { parts.splice(i, 1); continue }
        const al = p.life * 0.9
        const g = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.2)
        g.addColorStop(0, `rgba(${cr},${cg},${cb},${al})`)
        g.addColorStop(1, `rgba(${cr},${cg},${cb},0)`)
        ctx!.fillStyle = g
        ctx!.beginPath(); ctx!.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2); ctx!.fill()
      }
      ctx!.globalCompositeOperation = 'source-over'
      raf = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      canvas.remove()
    }
  }, [reduce, containerRef, originX, originY])

  return canvasRef
}
