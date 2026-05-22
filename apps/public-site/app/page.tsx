'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import {
  motion, useMotionValue, useTransform, useSpring,
  AnimatePresence, useInView,
} from 'framer-motion'
import {
  Wifi, QrCode, BarChart2, Layers, Shield,
  ChevronRight, Star, Check, ArrowRight,
  Zap, Smartphone, Share2, TrendingUp, MessageSquare, Menu, X,
} from 'lucide-react'

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000'

/* ─── Variants ──────────────────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SPRING: any = [0.16, 1, 0.3, 1]
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease: SPRING } },
} as const
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.10 } },
} as const
const staggerFast = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
} as const
const cardVariant = {
  hidden: { opacity: 0, y: 48, scale: 0.96 },
  show:   { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: SPRING } },
} as const

/* ─── Counter ───────────────────────────────────────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return; io.disconnect()
      let n = 0; const step = to / 60
      const t = setInterval(() => {
        n = Math.min(n + step, to); setVal(Math.floor(n))
        if (n >= to) clearInterval(t)
      }, 20)
    }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [to])
  return <span ref={ref}>{val.toLocaleString('tr-TR')}{suffix}</span>
}

/* ─── 3D Tilt Card ──────────────────────────────────────────────────────── */
function MockCard() {
  const cardRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { stiffness: 200, damping: 30 })
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { stiffness: 200, damping: 30 })
  const glowX   = useTransform(x, [-0.5, 0.5], [0, 100])
  const glowY   = useTransform(y, [-0.5, 0.5], [0, 100])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current; if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    x.set((e.clientX - left) / width - 0.5)
    y.set((e.clientY - top)  / height - 0.5)
  }, [x, y])

  const handleMouseLeave = useCallback(() => {
    x.set(0); y.set(0)
  }, [x, y])

  const glowStyle = {
    background: useTransform(
      [glowX, glowY],
      ([gx, gy]) =>
        `radial-gradient(circle at ${gx}% ${gy}%, rgba(26,58,58,0.15) 0%, transparent 65%)`
    ),
  }

  return (
    <motion.div
      ref={cardRef}
      style={{ rotateX, rotateY, transformStyle: 'preserve-3d', perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 40, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.9, delay: 0.45, ease: SPRING }}
      className="relative"
    >
      <div
        className="relative w-[300px] bg-[#fffaf0] rounded-3xl p-6 overflow-hidden clay-hairline card-glow cursor-pointer select-none"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Dynamic glow overlay */}
        <motion.div className="absolute inset-0 rounded-3xl pointer-events-none" style={glowStyle} />

        {/* Color stripe */}
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-[#ff4d8b] via-[#b8a4ed] to-[#1a3a3a]" />

        <div className="flex items-center gap-3 mb-5 pt-2 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#1a3a3a] flex items-center justify-center text-white font-black text-lg">A</div>
          <div>
            <p className="text-[#0a0a0a] font-bold text-base leading-tight clay-display">Ahmet Yılmaz</p>
            <p className="text-[#6a6a6a] text-xs">Senior Product Manager</p>
            <p className="text-[#9a9a9a] text-xs">TechCorp A.Ş.</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4 relative z-10">
          {['📞 +90 555 000 00 00', '✉️ ahmet@techcorp.com'].map(c => (
            <span key={c} className="px-2.5 py-1 bg-[#f5f0e0] rounded-full text-xs text-[#3a3a3a] clay-hairline">{c}</span>
          ))}
        </div>

        <div className="flex items-center gap-2 mb-4 relative z-10">
          {['in','tw','gh','ig'].map(s => (
            <div key={s} className="w-8 h-8 rounded-xl bg-[#f5f0e0] clay-hairline flex items-center justify-center hover:bg-[#ebe6d6] transition-colors">
              <span className="text-xs text-[#3a3a3a] font-bold">{s}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-[#e5e5e5] pt-3 relative z-10">
          <div className="flex items-center gap-1.5">
            <Wifi size={13} className="text-[#1a3a3a]" />
            <span className="text-xs text-[#6a6a6a]">NFC aktif</span>
          </div>
          <span className="text-xs text-[#9a9a9a] font-mono">qkrt.co/ahmet</span>
        </div>
      </div>

      {/* Floating badges */}
      <motion.div
        className="badge-float absolute -top-4 -right-10 bg-[#ff4d8b] rounded-2xl px-3 py-2 text-xs text-white font-semibold flex items-center gap-1.5 shadow-lg"
        style={{ translateZ: 30 }}
        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.1, duration: 0.5 }}
      >
        <BarChart2 size={11} /> +248 görüntülenme
      </motion.div>
      <motion.div
        className="badge-float-delayed absolute -bottom-4 -left-10 bg-[#1a3a3a] rounded-2xl px-3 py-2 text-xs text-white font-semibold flex items-center gap-1.5 shadow-lg"
        style={{ translateZ: 30 }}
        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.3, duration: 0.5 }}
      >
        <MessageSquare size={11} /> 12 yeni mesaj
      </motion.div>
    </motion.div>
  )
}

/* ─── Feature Card ──────────────────────────────────────────────────────── */
type CardColor = 'pink'|'teal'|'lavender'|'peach'|'ochre'|'cream'
const colorMap: Record<CardColor, { bg: string; text: string; icon: string; border: string }> = {
  pink:     { bg: '#ff4d8b', text: '#ffffff', icon: 'rgba(255,255,255,0.2)', border: 'rgba(255,255,255,0.15)' },
  teal:     { bg: '#1a3a3a', text: '#ffffff', icon: 'rgba(255,255,255,0.2)', border: 'rgba(255,255,255,0.10)' },
  lavender: { bg: '#b8a4ed', text: '#0a0a0a', icon: 'rgba(255,255,255,0.35)', border: 'rgba(255,255,255,0.30)' },
  peach:    { bg: '#ffb084', text: '#0a0a0a', icon: 'rgba(255,255,255,0.35)', border: 'rgba(255,255,255,0.30)' },
  ochre:    { bg: '#e8b94a', text: '#0a0a0a', icon: 'rgba(255,255,255,0.35)', border: 'rgba(255,255,255,0.30)' },
  cream:    { bg: '#f5f0e0', text: '#0a0a0a', icon: 'rgba(255,255,255,0.60)', border: '#e5e5e5' },
}

function FeatureCard({ icon, title, desc, color }: {
  icon: React.ReactNode; title: string; desc: string; color: CardColor
}) {
  const s = colorMap[color]
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      variants={cardVariant}
      initial="hidden"
      animate={isInView ? 'show' : 'hidden'}
      whileHover={{ scale: 1.035, transition: { duration: 0.25, ease: 'easeOut' } }}
      className="rounded-3xl p-8 group cursor-default"
      style={{ backgroundColor: s.bg, border: `1px solid ${s.border}` }}
    >
      <motion.div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
        style={{ backgroundColor: s.icon, color: s.text }}
        whileHover={{ scale: 1.15, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {icon}
      </motion.div>
      <h3 className="font-semibold text-lg mb-2 clay-display" style={{ color: s.text }}>{title}</h3>
      <p className="text-sm leading-relaxed" style={{ color: s.text, opacity: 0.75 }}>{desc}</p>
    </motion.div>
  )
}

/* ─── Showcase Card ─────────────────────────────────────────────────────── */
function ShowcaseCard({ color, icon, title, desc, children, delay = 0 }: {
  color: CardColor; icon: React.ReactNode; title: string; desc: string
  children?: React.ReactNode; delay?: number
}) {
  const s = colorMap[color]
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 56 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: SPRING }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="rounded-3xl p-8 group"
      style={{ backgroundColor: s.bg, border: `1px solid ${s.border}` }}
    >
      <motion.div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
        style={{ backgroundColor: s.icon, color: s.text }}
        whileHover={{ rotate: -8, scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-2xl font-medium mb-3 clay-display" style={{ color: s.text, letterSpacing: '-0.5px' }}>{title}</h3>
      <p className="mb-6 leading-relaxed text-sm" style={{ color: s.text, opacity: 0.7 }}>{desc}</p>
      {children}
    </motion.div>
  )
}

/* ─── Pricing Card ──────────────────────────────────────────────────────── */
function PricingCard({ name, price, features, comingSoon = [], popular, accentBg, accentText, delay = 0 }: {
  name: string; price: string; features: string[]; comingSoon?: string[]
  popular?: boolean; accentBg: string; accentText: string; delay?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: SPRING }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="rounded-2xl p-7 flex flex-col clay-hairline"
      style={{ backgroundColor: popular ? '#1a3a3a' : '#fffaf0' }}
    >
      {popular && (
        <div className="flex items-center gap-1.5 text-[#a4d4c5] text-xs font-bold uppercase tracking-widest mb-4">
          <Star size={11} fill="currentColor" /> En Popüler
        </div>
      )}
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${accentBg} ${accentText} w-fit mb-4`}>{name}</span>
      <div className="mb-6">
        <span className="text-4xl font-black clay-display" style={{ color: popular ? '#fff' : '#0a0a0a' }}>{price}</span>
        {price !== 'Ücretsiz' && <span className="text-sm ml-1" style={{ color: popular ? 'rgba(255,255,255,0.5)' : '#6a6a6a' }}>/ay</span>}
      </div>
      <ul className="space-y-3 flex-1 mb-6">
        {features.map(f => (
          <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: popular ? 'rgba(255,255,255,0.85)' : '#3a3a3a' }}>
            <Check size={14} className="mt-0.5 shrink-0" style={{ color: popular ? '#a4d4c5' : '#1a3a3a' }} />{f}
          </li>
        ))}
        {comingSoon.map(f => (
          <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: popular ? 'rgba(255,255,255,0.35)' : '#9a9a9a' }}>
            <span className="mt-0.5 shrink-0">◷</span>
            <span>{f} <span className="text-[10px] font-semibold uppercase tracking-wider ml-1">yakında</span></span>
          </li>
        ))}
      </ul>
      <motion.a
        href={`${DASHBOARD_URL}/login`}
        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
        className="block text-center py-3 rounded-xl text-sm font-bold transition-colors"
        style={popular
          ? { backgroundColor: '#fffaf0', color: '#1a3a3a' }
          : { backgroundColor: '#0a0a0a', color: '#fff' }
        }
      >
        Hemen Başla
      </motion.a>
    </motion.div>
  )
}

/* ─── Main Page ─────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const heroRef = useRef<HTMLElement>(null)

  /* Spotlight mouse tracking */
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = heroRef.current; if (!el) return
    const { left, top, width, height } = el.getBoundingClientRect()
    const mx = ((e.clientX - left) / width)  * 100
    const my = ((e.clientY - top)  / height) * 100
    el.style.setProperty('--mx', `${mx}%`)
    el.style.setProperty('--my', `${my}%`)
  }, [])

  /* Navbar scroll */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const words = ['Dijital', 'kimliğiniz']
  const words2 = ['tek', 'bir', 'kartta.']

  return (
    <main className="min-h-screen clay-canvas text-[#0a0a0a] overflow-x-hidden">

      {/* ── NAVBAR ───────────────────────────────────────────────────────── */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 clay-canvas border-b"
        style={{ borderColor: scrolled ? '#e5e5e5' : 'transparent' }}
        animate={{ backdropFilter: scrolled ? 'blur(12px)' : 'blur(0px)' }}
        transition={{ duration: 0.3 }}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-2.5"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="w-8 h-8 rounded-xl bg-[#0a0a0a] flex items-center justify-center font-black text-sm text-white">Q</div>
            <span className="font-black text-xl text-[#0a0a0a] clay-display tracking-tight">Q-Kart</span>
          </motion.div>

          <motion.div
            className="hidden md:flex items-center gap-8 text-sm text-[#6a6a6a]"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {[['Özellikler','#features'],['Nasıl Çalışır','#how'],['Fiyatlar','#pricing']].map(([l,h]) => (
              <a key={h} href={h} className="hover:text-[#0a0a0a] transition-colors font-medium">{l}</a>
            ))}
          </motion.div>

          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <a href={`${DASHBOARD_URL}/login`} className="hidden md:block text-sm text-[#6a6a6a] hover:text-[#0a0a0a] transition-colors px-4 py-2 font-medium">
              Giriş Yap
            </a>
            <motion.a
              href={`${DASHBOARD_URL}/login`}
              className="shimmer-btn px-5 py-2.5"
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            >
              Ücretsiz Başla <ChevronRight size={15} />
            </motion.a>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl hover:bg-[#f5f0e0] transition-colors">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </motion.div>
        </div>

        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden clay-canvas border-b border-[#e5e5e5] px-6 py-4 space-y-3"
            >
              {[['Özellikler','#features'],['Nasıl Çalışır','#how'],['Fiyatlar','#pricing']].map(([l,h]) => (
                <a key={h} href={h} onClick={() => setMobileMenuOpen(false)} className="block text-sm text-[#3a3a3a] font-medium py-1">{l}</a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        onMouseMove={handleMouseMove}
        className="spotlight-hero relative min-h-screen flex items-center pt-16"
        style={{ background: '#fffaf0' }}
      >
        {/* Subtle dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle, #1a3a3a18 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-24 w-full grid lg:grid-cols-2 gap-16 items-center">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.div variants={fadeUp}>
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5f0e0] rounded-full text-sm text-[#1a3a3a] border border-[#e5e5e5] mb-7 font-medium"
                whileHover={{ scale: 1.04 }}
              >
                <Zap size={13} className="text-[#e8b94a]" />
                QR · NFC · Analitik · Kurumsal
              </motion.div>
            </motion.div>

            {/* Animated headline word by word */}
            <h1 className="text-5xl md:text-6xl clay-display leading-[1.05] mb-6 text-[#0a0a0a]" style={{ letterSpacing: '-2.5px' }}>
              <motion.span className="block" variants={staggerFast} initial="hidden" animate="show">
                {words.map((w, i) => (
                  <motion.span key={i} variants={fadeUp} className="inline-block mr-3">{w}</motion.span>
                ))}
              </motion.span>
              <motion.span className="block text-[#1a3a3a]" variants={staggerFast} initial="hidden" animate="show" transition={{ delayChildren: 0.25 }}>
                {words2.map((w, i) => (
                  <motion.span key={i} variants={fadeUp} className="inline-block mr-3">{w}</motion.span>
                ))}
              </motion.span>
            </h1>

            <motion.p variants={fadeUp} className="text-[#3a3a3a] text-lg leading-relaxed mb-9 max-w-lg">
              QR kod ve NFC teknolojisiyle anlık paylaşılan, kişiselleştirilebilir dijital kartvizit platformu.
              Bağlantılarınızı, analitiklerinizi ve marka imajınızı tek noktadan yönetin.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 mb-10">
              <motion.a
                href={`${DASHBOARD_URL}/login`}
                className="shimmer-btn px-8 py-4 text-base rounded-2xl"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              >
                Ücretsiz Başla <ArrowRight size={17} />
              </motion.a>
              <motion.a
                href="/u/ahmetdemir"
                className="btn-clay-secondary text-base rounded-2xl px-8 py-4"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              >
                Demo Kartı Gör
              </motion.a>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-6 text-xs text-[#6a6a6a]">
              {['Kredi kartı gerekmez','2 dakikada kurulum','KVKK uyumlu'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check size={13} className="text-[#1a3a3a]" /> {t}
                </span>
              ))}
            </motion.div>
          </motion.div>

          <div className="relative flex items-center justify-center py-12">
            <MockCard />
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────────────────── */}
      <section className="py-16 border-y border-[#e5e5e5] bg-[#faf5e8]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center"
            variants={stagger} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
          >
            {[
              { value: 5000,    suffix: '+', label: 'Aktif Kullanıcı' },
              { value: 2500000, suffix: '+', label: 'Profil Görüntülenme' },
              { value: 98,      suffix: '%', label: 'Müşteri Memnuniyeti' },
              { value: 150,     suffix: '+', label: 'Kurumsal Müşteri' },
            ].map(({ value, suffix, label }) => (
              <motion.div key={label} variants={fadeUp}>
                <p className="text-4xl font-black text-[#1a3a3a] mb-2 clay-display" style={{ letterSpacing: '-1px' }}>
                  <Counter to={value} suffix={suffix} />
                </p>
                <p className="text-[#6a6a6a] text-sm">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 clay-canvas">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            variants={stagger} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5f0e0] rounded-full text-sm text-[#1a3a3a] border border-[#e5e5e5] mb-5 font-medium">
                <Layers size={13} /> Platform Özellikleri
              </div>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl clay-display font-medium mb-4 text-[#0a0a0a]" style={{ letterSpacing: '-1px' }}>
              Profesyoneller için<br />her şey dahil
            </motion.h2>
            <motion.p variants={fadeUp} className="text-[#6a6a6a] max-w-xl mx-auto leading-relaxed">
              İletişim bilgilerinden sosyal medya linklerine, QR koddan NFC karttaki fiziksel erişime kadar eksiksiz dijital kimlik yönetimi.
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard color="pink"     icon={<QrCode       size={22} />} title="Akıllı QR Kod"       desc="Markanıza özel renk ve arka plan seçenekleriyle QR kod oluşturun. PNG ve SVG formatlarında indirin." />
            <FeatureCard color="teal"     icon={<Wifi         size={22} />} title="NFC Dokunmalı Kart"  desc="Fiziksel NFC kartta profil bilgilerinize dokunuşla erişim sağlayın. Siparişi platformdan verin." />
            <FeatureCard color="lavender" icon={<BarChart2    size={22} />} title="Derin Analitik"      desc="Kim baktı, nereden geldi, hangi butona tıkladı? Cihaz, tarayıcı ve saatlik dağılım grafikleri." />
            <FeatureCard color="peach"    icon={<Layers       size={22} />} title="Şirket & CV Profili" desc="Şirket logosu, sektör, web sitesi bilgilerini ekleyin; kişisel CV bölümüyle becerilerinizi sergileyin." />
            <FeatureCard color="ochre"    icon={<MessageSquare size={22} />} title="Lead Formu"         desc="Profilinizde iletişim formu. Mesajları panelden takip edin, CSV olarak dışa aktarın." />
            <FeatureCard color="cream"    icon={<Shield       size={22} />} title="KVKK Uyumlu"        desc="IP adresleri SHA-256 ile anonimleştirilir, veriler Türkiye'de saklanır. Tam KVKK ve GDPR uyumu." />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how" className="py-24 bg-[#faf5e8]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            variants={stagger} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#fffaf0] rounded-full text-sm text-[#1a3a3a] border border-[#e5e5e5] mb-5 font-medium">
                <Zap size={13} /> Hızlı Kurulum
              </div>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl clay-display font-medium mb-4 text-[#0a0a0a]" style={{ letterSpacing: '-1px' }}>2 dakikada hazır</motion.h2>
            <motion.p variants={fadeUp} className="text-[#6a6a6a] max-w-lg mx-auto">Teknik bilgi gerektirmez. Hesap oluşturun, profilinizi doldurun, linkinizi paylaşın.</motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {([
              { num:'1', title:'Hesap Aç',          desc:'E-posta ve şifrenizle ücretsiz hesap oluşturun. Kredi kartı gerekmez.', color:'pink'     as CardColor },
              { num:'2', title:'Profilini Düzenle', desc:'Fotoğraf, iletişim bilgileri, sosyal medya ve şirket bilgilerini girin.',  color:'lavender' as CardColor },
              { num:'3', title:'Paylaş',            desc:'QR kodunuzu veya kısa linkinizi paylaşın. NFC kart siparişi verin.',      color:'teal'     as CardColor },
            ] as const).map(({ num, title, desc, color }, i) => {
              const s = colorMap[color]
              return (
                <ShowcaseCard key={num} color={color} icon={
                  <span className="text-2xl font-black" style={{ color: s.text }}>{num}</span>
                } title={title} desc={desc} delay={i * 0.1} />
              )
            })}
          </div>
        </div>
      </section>

      {/* ── SHOWCASE ─────────────────────────────────────────────────────── */}
      <section className="py-24 clay-canvas">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-4">
            <ShowcaseCard color="teal" icon={<Wifi size={26} />} title="NFC Fiziksel Kart" delay={0}
              desc="Profesyonel baskı kalitesinde, programlanmış NFC çipli kartvizitiniz kapınıza gelsin. Telefonunuzu yaklaştıran herkes profilinize anında ulaşsın.">
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-2 text-[#a4d4c5]"><Check size={14} /> Kart programlama dahil</span>
                <span className="flex items-center gap-2 text-[#a4d4c5]"><Check size={14} /> 3–5 iş günü teslimat</span>
              </div>
            </ShowcaseCard>

            <ShowcaseCard color="peach" icon={<TrendingUp size={26} />} title="Derin Analitik" delay={0.08}
              desc="Kim baktı, hangi şehirden geldi? Saatlik dağılım, kaynak analizi ve trend grafikleriyle her şeyi görün.">
              <div className="flex items-end gap-1 h-14">
                {[40,65,45,80,55,90,70,85,60,95,75,100,80,110].map((h, i) => (
                  <motion.div
                    key={i}
                    className="flex-1 rounded-t"
                    style={{ backgroundColor: 'rgba(10,10,10,0.25)' }}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h * 0.55}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.04, ease: 'easeOut' }}
                  />
                ))}
              </div>
            </ShowcaseCard>

            <ShowcaseCard color="lavender" icon={<Layers size={26} />} title="Tam Kişiselleştirme" delay={0.04}
              desc="Tema rengi, arka plan, font, buton şekli — her şeyi özelleştirin. Şirket logosu ve CV bölümüyle kurumsal imaj.">
              <div className="flex gap-3">
                {['#ff4d8b','#1a3a3a','#b8a4ed','#ffb084','#e8b94a','#a4d4c5'].map((c, i) => (
                  <motion.div
                    key={c}
                    className="w-8 h-8 rounded-full border-2 border-white/40"
                    style={{ backgroundColor: c }}
                    whileHover={{ scale: 1.25, y: -4 }}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.06, type: 'spring', stiffness: 300 }}
                  />
                ))}
              </div>
            </ShowcaseCard>

            <ShowcaseCard color="ochre" icon={<Share2 size={26} />} title="vCard & QR Paylaşım" delay={0.12}
              desc="Rehbere Ekle butonu ile tek tıkta kişi kaydı. Renkli QR kodunuzu PNG/SVG indirin, yazdırın, paylaşın.">
              <div className="flex gap-3">
                {['PNG','SVG','.vcf'].map((label, i) => (
                  <motion.div
                    key={label}
                    className="px-4 py-2 rounded-xl text-sm font-bold text-[#0a0a0a]"
                    style={{ backgroundColor: 'rgba(10,10,10,0.15)', border: '1px solid rgba(10,10,10,0.2)' }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                  >
                    {label}
                  </motion.div>
                ))}
              </div>
            </ShowcaseCard>
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-[#faf5e8]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            variants={stagger} initial="hidden" whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
          >
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#fffaf0] rounded-full text-sm text-[#1a3a3a] border border-[#e5e5e5] mb-5 font-medium">
                <Star size={13} /> Fiyatlandırma
              </div>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-4xl clay-display font-medium mb-4 text-[#0a0a0a]" style={{ letterSpacing: '-1px' }}>Her ölçeğe uygun plan</motion.h2>
            <motion.p variants={fadeUp} className="text-[#6a6a6a] max-w-lg mx-auto">Ücretsiz başlayın, büyüdükçe yükseltin. Tüm planlarda temel özellikler dahil.</motion.p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-4 items-start">
            <PricingCard delay={0}    name="FREE"       price="Ücretsiz" accentBg="bg-[#f5f0e0]"    accentText="text-[#3a3a3a]" features={['1 sayfa','7 günlük analitik','QR kod','İletişim formu','Sosyal linkler']} />
            <PricingCard delay={0.08} name="STARTER"    price="₺199"     accentBg="bg-[#b8a4ed]/20" accentText="text-[#1a3a3a]" features={['3 sayfa','30 günlük analitik','QR kod indirme','CSV dışa aktarım','Öncelikli destek']} />
            <PricingCard delay={0.16} name="PRO"        price="₺499"     accentBg="bg-[#a4d4c5]/30" accentText="text-[#1a3a3a]" popular features={['10 sayfa','90 günlük analitik','NFC kart desteği','Gelişmiş temalar','Şirket & CV bölümü','PNG/SVG QR indirme']} comingSoon={['Özel domain']} />
            <PricingCard delay={0.24} name="ENTERPRISE" price="₺999"     accentBg="bg-[#e8b94a]/20" accentText="text-[#0a0a0a]" features={['Sınırsız sayfa','365 günlük analitik','NFC kart','Şirket & CV bölümü','vCard indirme']} comingSoon={['Özel domain','Ekip yönetimi','API erişimi']} />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-24 clay-canvas">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            className="clay-card-teal rounded-3xl p-14"
            initial={{ opacity: 0, y: 48, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, ease: SPRING }}
          >
            <motion.div
              className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white clay-display"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              Q
            </motion.div>
            <h2 className="text-4xl clay-display font-medium mb-4 text-white" style={{ letterSpacing: '-1px' }}>
              Dijital kimliğinizi<br />bugün oluşturun
            </h2>
            <p className="text-white/70 mb-8 text-lg">İlk kartvizitinizi ücretsiz oluşturun. Kredi kartı gerekmez.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.a
                href={`${DASHBOARD_URL}/login`}
                className="bg-[#fffaf0] text-[#1a3a3a] font-bold px-10 py-4 rounded-2xl text-base flex items-center justify-center gap-3 hover:bg-white transition-colors"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              >
                Ücretsiz Hesap Aç <ArrowRight size={18} />
              </motion.a>
              <motion.a
                href={`${DASHBOARD_URL}/login`}
                className="border border-white/25 text-white font-semibold px-10 py-4 rounded-2xl text-base hover:bg-white/10 transition-colors flex items-center justify-center gap-3"
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              >
                <Share2 size={17} /> Giriş Yap
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#e5e5e5] py-14 bg-[#faf5e8]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-[#0a0a0a] flex items-center justify-center font-black text-xs text-white">Q</div>
                <span className="font-black text-lg text-[#0a0a0a] clay-display tracking-tight">Q-Kart</span>
              </div>
              <p className="text-[#6a6a6a] text-sm leading-relaxed">QR ve NFC teknolojisiyle profesyonel dijital kimlik platformu.</p>
            </div>
            {[
              { title: 'Platform', links: ['Özellikler','Fiyatlar','Entegrasyonlar','Güvenlik'] },
              { title: 'Şirket',   links: ['Hakkımızda','Blog','Kariyer','İletişim'] },
              { title: 'Destek',   links: ['Yardım Merkezi','API Dokümantasyonu','Gizlilik Politikası','Kullanım Şartları'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-[#0a0a0a] font-semibold text-sm mb-4">{title}</h4>
                <ul className="space-y-2.5 text-sm text-[#6a6a6a]">
                  {links.map(l => <li key={l}><a href="#" className="hover:text-[#0a0a0a] transition-colors">{l}</a></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-[#e5e5e5] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#9a9a9a]">
            <p>© 2025 Q-Kart. Tüm hakları saklıdır.</p>
            <div className="flex items-center gap-2"><Smartphone size={11} /><span>Türkiye'de geliştirildi ve barındırıldı.</span></div>
          </div>
        </div>
      </footer>
    </main>
  )
}
