'use client'
import { useRef, useEffect } from 'react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

export default function VideoShowcase() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()

  useEffect(() => {
    const video = videoRef.current
    const section = sectionRef.current
    if (!video || !section || reduce) return

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { video.play().catch(() => {}) }
        else video.pause()
      },
      { threshold: 0.15 }
    )
    io.observe(section)
    return () => io.disconnect()
  }, [reduce])

  return (
    <section className="showcase" id="showcase" ref={sectionRef}>
      <video
        ref={videoRef}
        autoPlay={!reduce}
        muted
        loop
        playsInline
        preload="metadata"
        poster="/assets/card-reveal-poster.jpg"
        aria-hidden="true"
      >
        <source src="/assets/card-reveal.mp4" type="video/mp4" />
      </video>
      <div className="wrap">
        <div className="showcase-inner">
          <span className="eyebrow">Sana özel</span>
          <h2>Bir kart kadar<br/><span className="accent-text">kişisel.</span></h2>
          <p>Mat siyah gövde, altın kabartma isim. Q-Kart&apos;ı kendi kimliğinle tasarla — masaya koyduğun an fark edilsin.</p>
          <div className="hero-cta">
            <a href="#fiyat" className="btn btn-primary btn-lg" onClick={(e) => {
              e.preventDefault()
              document.querySelector('#fiyat')?.scrollIntoView({ behavior: 'smooth' })
            }}>
              Kartını tasarla
              <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
