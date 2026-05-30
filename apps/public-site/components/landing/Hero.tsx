'use client'
import { useRef, useCallback } from 'react'
import { useCanvasSparkles } from '@/hooks/use-canvas-sparkles'
import { use3DTilt } from '@/hooks/use-3d-tilt'
import { motion } from 'framer-motion'

export default function Hero() {
  const heroVisualRef = useRef<HTMLDivElement | null>(null)
  useCanvasSparkles(heroVisualRef)
  const { ref: tiltRef, style: tiltStyle, onMove, onLeave } = use3DTilt<HTMLDivElement>()

  const setRefs = useCallback((node: HTMLDivElement | null) => {
    heroVisualRef.current = node
    ;(tiltRef as React.RefObject<HTMLDivElement | null> & { current: HTMLDivElement | null }).current = node
  }, [tiltRef])

  return (
    <section className="hero" id="hero">
      {/* Ether effect */}
      <div className="ether" aria-hidden="true">
        <div className="ether-layer"><div className="ether-shape"/></div>
        <div className="ether-noise"/>
        <svg className="ether-svg" width="0" height="0" aria-hidden="true">
          <defs>
            <filter id="etherFilter" x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
              <feTurbulence result="undulation" numOctaves="2" baseFrequency="0.0009,0.0032" seed="0" type="turbulence"/>
              <feColorMatrix in="undulation" type="hueRotate" values="180">
                <animate attributeName="values" from="0" to="360" dur="18s" repeatCount="indefinite"/>
              </feColorMatrix>
              <feColorMatrix in="dist" result="circulation" type="matrix" values="4 0 0 0 1  4 0 0 0 1  4 0 0 0 1  1 0 0 0 0"/>
              <feDisplacementMap in="SourceGraphic" in2="circulation" scale="78" result="dist"/>
              <feDisplacementMap in="dist" in2="undulation" scale="78" result="output"/>
            </filter>
          </defs>
        </svg>
      </div>

      <div className="wrap hero-grid">
        {/* Hero copy */}
        <motion.div
          className="hero-copy"
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
        >
          <motion.span className="eyebrow" variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }}>
            NFC Dijital Kimlik
          </motion.span>
          <motion.h1 variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }}>
            Tek dokunuşla,<br/><span className="accent-text">tüm dünyan.</span>
          </motion.h1>
          <motion.p className="hero-sub" variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }}>
            Q-Kart&apos;ı telefonuna dokundurman yeterli — kartvizitin, sosyal medyan, CV&apos;n ve tüm ekibin anında karşındakinde.
          </motion.p>
          <motion.div className="hero-cta" variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }}>
            <a href="#siparis" className="btn btn-primary btn-lg" onClick={(e) => {
              e.preventDefault()
              document.querySelector('#siparis')?.scrollIntoView({ behavior: 'smooth' })
            }}>
              Hemen Sipariş Ver
              <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            <a href="#nasil" className="btn btn-ghost btn-lg" onClick={(e) => {
              e.preventDefault()
              document.querySelector('#nasil')?.scrollIntoView({ behavior: 'smooth' })
            }}>
              Nasıl çalışır?
            </a>
          </motion.div>
          <motion.div className="hero-trust" variants={{ hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } } }}>
            <span><b>10.000+</b> profesyonel</span>
            <i className="dot"/>
            <span><span className="stars">★★★★★</span> 4.9 / 5</span>
            <i className="dot"/>
            <span>Türkiye&apos;de tasarlandı</span>
          </motion.div>
        </motion.div>

        {/* Hero visual */}
        <motion.div
          className="hero-visual"
          id="heroVisual"
          ref={setRefs}
          style={tiltStyle}
          onMouseMove={onMove}
          onMouseLeave={onLeave}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <div className="hero-photo-frame">
            <img src="/assets/hero-tap.jpg" alt="Q-Kart NFC kartının telefona dokundurulması" id="heroImg" />
          </div>
          <div className="nfc-rings"><i/><i/><i/></div>
          <div className="float-card">
            <div className="fc-top">
              <span className="fc-chip"/>
              <span className="fc-nfc">NFC ·)))</span>
            </div>
            <div>
              <div className="fc-name">Deniz Aydın</div>
              <div className="fc-role">Kurucu · Atlas Studio</div>
            </div>
            <div className="fc-bar"><i/></div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
