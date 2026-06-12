'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { trackEvent } from '@/lib/api'
import { getPalette, resolveAccent, accentInk, rgba, hexToRgb } from '@/lib/themes'

interface ContactItem { id: string; type: string; value: string; label: string | null; order: number }
interface SocialLink  { id: string; platform: string; url: string; order: number }
interface Profile {
  slug: string; displayName: string; title: string | null; bio: string | null; avatarUrl: string | null
  theme: string; bgColor: string; accentColor: string | null; fontFamily: string; buttonStyle: string; profileShape: string
  cardStyle: string; typographyDensity: string; isPublished: boolean
  companyName: string | null; companyLogoUrl: string | null; companyDescription: string | null
  companyWebsite: string | null; companyIndustry: string | null; showCompanySection: boolean
  companyPhone?: string | null; companyAddress?: string | null; companySocials?: string | null
  cvSkills: string | null; cvLanguages: string | null; showCvSection: boolean
  location: string | null; tagline: string | null; available: boolean; calendarUrl: string | null
  stats: string | null; services: string | null; projects: string | null
  testimonials: string | null; experience: string | null; education: string | null
  showStatsSection: boolean; showServicesSection: boolean; showProjectsSection: boolean
  showTestimonialsSection: boolean; showCareerSection: boolean; showContactForm: boolean; showQrSection: boolean
  contacts: ContactItem[]; socials: SocialLink[]
}

type StatItem   = { value: string; label: string }
type SvcItem    = { icon: string; title: string; desc: string }
type ProjItem   = { title: string; category: string; desc: string; tags: string | string[]; color: string }
type TestiItem  = { quote: string; name: string; role: string; company: string; initials: string }
type ExpItem    = { year: string; role: string; company: string; desc: string }
type EduItem    = { year: string; degree: string; school: string }

function parseJ<T>(s: string | null, fb: T): T {
  if (!s) return fb
  try { return JSON.parse(s) } catch { return fb }
}

function contactHref(type: string, value: string) {
  if (type === 'PHONE')    return `tel:${value.replace(/\s/g, '')}`
  if (type === 'EMAIL')    return `mailto:${value}`
  if (type === 'WHATSAPP') return `https://wa.me/${value.replace(/\D/g, '')}`
  if (type === 'TELEGRAM') return `https://t.me/${value.replace('@', '')}`
  return value.startsWith('http') ? value : `https://${value}`
}

function contactLabel(type: string, label: string | null) {
  if (label) return label
  return ({ PHONE:'Ara', EMAIL:'E-posta', WHATSAPP:'WhatsApp', TELEGRAM:'Telegram',
            WEBSITE:'Web Sitesi', CALENDAR:'Toplantı Ayarla', CUSTOM:'Link' } as any)[type] || type
}

const SC_COLORS: Record<string, string> = {
  LINKEDIN: '#0A66C2', INSTAGRAM: '#E1306C', TWITTER: '#1DA1F2',
  GITHUB: '#e6e6e6',  YOUTUBE: '#FF0000',   BEHANCE: '#1769FF',
  TIKTOK: '#e6e6e6',  FACEBOOK: '#1877F2',  DRIBBBLE: '#EA4C89',
}

function shade(h: string, p: number) {
  const [r, g, b] = hexToRgb(h)
  const f = 1 + p
  const c = (x: number) => Math.max(0, Math.min(255, Math.round(x * f)))
  return '#' + [c(r), c(g), c(b)].map(x => x.toString(16).padStart(2, '0')).join('')
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

/* ── SVG icons ── */
const IC = {
  download: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  msg:      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
  arrow:    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  copy:     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>,
  check:    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  ext:      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>,
  chevron:  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>,
}

function ContactIcon({ type }: { type: string }) {
  const t = type.toLowerCase()
  if (t === 'phone')    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 12a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1.34h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 9.27a16 16 0 006.29 6.29l1.29-1.29a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
  if (t === 'email')    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
  if (t === 'whatsapp') return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  if (t === 'telegram') return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
  if (t === 'calendar') return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
}

function SocialIcon({ platform }: { platform: string }) {
  const p = platform.toUpperCase()
  if (p === 'LINKEDIN')  return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  if (p === 'INSTAGRAM') return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
  if (p === 'TWITTER')   return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  if (p === 'GITHUB')    return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
  if (p === 'YOUTUBE')   return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  if (p === 'BEHANCE')   return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.49-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-.17 1.35-.5.36-1.08.62-1.76.78-.68.16-1.39.25-2.16.25H0V4.51h6.938zm-.408 5.97c.58 0 1.07-.14 1.44-.42.38-.28.57-.72.57-1.32 0-.34-.06-.62-.18-.84-.12-.22-.29-.4-.5-.53-.21-.13-.45-.22-.72-.27-.27-.06-.56-.08-.88-.08H3.24v3.46h3.29zm.187 6.11c.34 0 .66-.03.97-.09.31-.06.58-.17.82-.33.24-.16.43-.38.57-.66.14-.28.21-.64.21-1.08 0-.86-.23-1.47-.7-1.83-.47-.36-1.1-.55-1.89-.55H3.24v4.56h3.48zm13.148 0c.36.36.882.54 1.566.54.487 0 .91-.12 1.27-.36.35-.24.57-.5.65-.78h2.55c-.41 1.27-1.03 2.18-1.86 2.72-.83.54-1.83.81-3.01.81-.82 0-1.55-.13-2.21-.4-.66-.27-1.21-.64-1.66-1.12-.45-.48-.79-1.06-1.03-1.74-.24-.68-.36-1.42-.36-2.23 0-.78.12-1.51.38-2.19.26-.68.62-1.27 1.09-1.76.47-.49 1.03-.88 1.69-1.16.66-.28 1.39-.42 2.19-.42.9 0 1.68.17 2.35.51.67.34 1.22.8 1.64 1.39.42.59.73 1.26.91 2.02.18.76.24 1.55.18 2.39h-7.61c.04.82.3 1.44.66 1.8zm2.67-4.97c-.29-.32-.75-.49-1.37-.49-.4 0-.73.07-.99.2-.26.13-.47.3-.63.5-.16.2-.27.42-.34.65-.07.23-.11.45-.12.65h4.07c-.12-.64-.33-1.19-.62-1.51zM20.24 5.24h-5.52v1.59h5.52V5.24z"/></svg>
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
}

/* ── CountUp hook ── */
function useCountUp(target: string, active: boolean) {
  const [display, setDisplay] = useState('0')
  useEffect(() => {
    if (!active) return
    const isPlus = target.includes('+')
    const isFloat = target.includes('.')
    const num = parseFloat(target)
    const dur = 1400
    const t0 = performance.now()
    let raf: number
    function tick(now: number) {
      const p = Math.min((now - t0) / dur, 1)
      const e = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p
      setDisplay((isFloat ? (num * e).toFixed(1) : String(Math.round(num * e))) + (isPlus ? '+' : ''))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, target])
  return display
}

function StatItem({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const display = useCountUp(value, active)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setActive(true); obs.disconnect() } }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return <div className="stat-item" ref={ref}><span className="stat-value">{display}</span><span className="stat-label">{label}</span></div>
}

/* ── Reveal component ── */
function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add('visible'); obs.disconnect() } }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>{children}</div>
}

/* ── Section head ── */
function SectionHead({ num, eyebrow, title }: { num: string; eyebrow: string; title: React.ReactNode }) {
  return (
    <Reveal className="sec-head">
      <div className="sec-index">{num}</div>
      <span className="sec-eyebrow">{eyebrow}</span>
      <h2 className="section-title">{title}</h2>
    </Reveal>
  )
}

/* ── Tilt card ── */
function TiltCard({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null)
  const onMove = useCallback((e: React.PointerEvent) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width
    const py = (e.clientY - r.top) / r.height
    el.style.transform = `perspective(800px) rotateY(${(px - 0.5) * 7}deg) rotateX(${(0.5 - py) * 7}deg) translateZ(0)`
    el.style.setProperty('--mx', (px * 100) + '%')
    el.style.setProperty('--my', (py * 100) + '%')
  }, [])
  const onLeave = useCallback(() => { if (ref.current) ref.current.style.transform = '' }, [])
  return <div ref={ref} className={className} style={style} onPointerMove={onMove} onPointerLeave={onLeave}>{children}</div>
}

export function ProfileView({ profile, slug, source }: { profile: Profile; slug: string; source?: string }) {
  const [copied, setCopied]   = useState(false)
  const [leadForm, setLeadForm] = useState({ name: '', email: '', message: '' })
  const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [sideNavState, setSideNavState]   = useState<'hidden' | 'dim' | 'full'>('hidden')
  const [activeSection, setActiveSection] = useState('')
  const [clockStr, setClockStr] = useState('--:--:--')
  const [isOnline, setIsOnline] = useState(false)
  const [heroIn, setHeroIn]     = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)
  const heroInnerRef = useRef<HTMLDivElement>(null)
  const heroSpotRef  = useRef<HTMLDivElement>(null)

  const stats        = parseJ<StatItem[]>(profile.stats, [])
  const services     = parseJ<SvcItem[]>(profile.services, [])
  const projects     = parseJ<ProjItem[]>(profile.projects, [])
  const testimonials = parseJ<TestiItem[]>(profile.testimonials, [])
  const experience   = parseJ<ExpItem[]>(profile.experience, [])
  const education    = parseJ<EduItem[]>(profile.education, [])
  const skills       = parseJ<string[]>(profile.cvSkills, [])
  const languages    = parseJ<string[]>(profile.cvLanguages, [])

  const initials = profile.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const pal      = getPalette(profile.theme)
  const accent   = resolveAccent(pal, profile.accentColor)
  const accent2  = shade(accent, -0.22)

  const qrUrl    = `${process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'http://localhost:3002'}/u/${slug}`
  const qrBg     = pal.bg.replace('#', '')
  const qrFg     = pal.dark ? 'ffffff' : '111111'
  const qrSrc    = `https://api.qrserver.com/v1/create-qr-code/?size=376x376&bgcolor=${qrBg}&color=${qrFg}&data=${encodeURIComponent(qrUrl)}`

  /* ── Body classes ── */
  useEffect(() => {
    const body = document.body
    body.classList.remove('card-minimal', 'card-glass', 'type-compact', 'type-spacious')
    if (profile.cardStyle === 'minimal') body.classList.add('card-minimal')
    if (profile.cardStyle === 'glass')   body.classList.add('card-glass')
    if (profile.typographyDensity === 'compact')  body.classList.add('type-compact')
    if (profile.typographyDensity === 'spacious') body.classList.add('type-spacious')
    return () => { body.classList.remove('card-minimal','card-glass','type-compact','type-spacious') }
  }, [profile.cardStyle, profile.typographyDensity])

  /* ── Tema paletini :root'a uygula (body arka planı + aurora) ── */
  useEffect(() => {
    const root = document.documentElement
    const [sr, sg, sb] = hexToRgb(accent)
    const vars: Record<string, string> = {
      '--bg': pal.bg, '--bg-2': pal.bg2, '--bg-elev': pal.bgElev,
      '--line': pal.line, '--line-2': pal.line2,
      '--text': pal.text, '--muted': pal.muted, '--faint': pal.faint,
      '--accent': accent, '--accent-2': accent2, '--accent-ink': accentInk(accent),
      '--accent-glow': rgba(accent, pal.dark ? 0.22 : 0.16),
      '--spark-r': String(sr), '--spark-g': String(sg), '--spark-b': String(sb),
    }
    Object.entries(vars).forEach(([k, v]) => root.style.setProperty(k, v))
    document.body.classList.toggle('pv-light-mode', !pal.dark)
    return () => {
      Object.keys(vars).forEach(k => root.style.removeProperty(k))
      document.body.classList.remove('pv-light-mode')
    }
  }, [profile.theme, profile.accentColor]) // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Analytics ── */
  useEffect(() => { trackEvent(slug, { eventType: 'PAGE_VIEW', source: source || 'direct' }) }, [slug, source])

  /* ── Hero name animation ── */
  useEffect(() => { requestAnimationFrame(() => setHeroIn(true)) }, [])

  /* ── Clock ── */
  useEffect(() => {
    function update() {
      const now = new Date()
      const tp = new Intl.DateTimeFormat('tr-TR', { timeZone: 'Europe/Istanbul', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(now)
      const g = (t: string) => (tp.find(x => x.type === t) || { value: '00' }).value
      setClockStr(`${g('hour')}:${g('minute')}:${g('second')}`)
      const dp = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Istanbul', hour: 'numeric', hour12: false, weekday: 'short' }).formatToParts(now)
      const h  = parseInt((dp.find(x => x.type === 'hour') || { value: '0' }).value, 10)
      const wd = (dp.find(x => x.type === 'weekday') || { value: '' }).value
      setIsOnline(profile.available && !['Sat', 'Sun'].includes(wd) && h >= 9 && h < 19)
    }
    update()
    const iv = setInterval(update, 1000)
    return () => clearInterval(iv)
  }, [profile.available])

  /* ── Scroll progress + side nav ── */
  useEffect(() => {
    function onScroll() {
      const h = document.documentElement.scrollHeight - window.innerHeight
      if (progressRef.current) progressRef.current.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%'
      const scrolled = window.scrollY
      const halfPage = window.innerHeight * 0.5
      const footer = document.querySelector('footer')
      const footerTop = footer ? footer.getBoundingClientRect().top : window.innerHeight
      if (footerTop < 80) setSideNavState('hidden')
      else if (scrolled >= halfPage) setSideNavState('full')
      else setSideNavState('dim')
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Hero parallax ── */
  useEffect(() => {
    const inner = heroInnerRef.current; if (!inner) return
    const el = inner
    function onScroll() {
      const p = Math.min(window.scrollY / window.innerHeight, 1)
      el.style.transform = `translateY(${p * -52}px) scale(${1 - p * 0.06})`
      el.style.opacity   = String(Math.max(0, 1 - p * 1.08))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── Hero spot ── */
  useEffect(() => {
    const hero = document.getElementById('hero')
    const spot = heroSpotRef.current
    if (!hero || !spot) return
    function onMove(e: PointerEvent) {
      const r = hero!.getBoundingClientRect()
      spot!.style.left = (e.clientX - r.left) + 'px'
      spot!.style.top  = (e.clientY - r.top) + 'px'
      spot!.style.opacity = '.7'
    }
    function onLeave() { if (spot) { spot.style.opacity = '.5'; spot.style.left = '50%'; spot.style.top = '42%' } }
    hero.addEventListener('pointermove', onMove)
    hero.addEventListener('pointerleave', onLeave)
    return () => { hero.removeEventListener('pointermove', onMove); hero.removeEventListener('pointerleave', onLeave) }
  }, [])

  /* ── Active section via IntersectionObserver ── */
  useEffect(() => {
    const ids = ['sec-bio','contact','sec-socials','sec-services','sec-projects',
                 'sec-testi','sec-career','sec-company','sec-skills','sec-qr','contact-form']
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => { if (en.isIntersecting) setActiveSection(en.target.id) })
    }, { threshold: 0.25, rootMargin: '-60px 0px -40% 0px' })
    ids.forEach(id => { const el = document.getElementById(id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [])

  /* ── Timeline draw ── */
  useEffect(() => {
    const line = document.querySelector<HTMLElement>('.tl-line')
    const dots = document.querySelectorAll<HTMLElement>('.tl-dot')
    if (!line) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        line.style.transition = 'transform 1.2s cubic-bezier(0.16,1,0.3,1)'
        line.style.transform  = 'scaleY(1)'
        dots.forEach((d, i) => setTimeout(() => d.classList.add('tl-reached'), 200 + i * 160))
        obs.disconnect()
      }
    }, { threshold: 0.15 })
    obs.observe(line.parentElement!)
    return () => obs.disconnect()
  }, [experience])

  const scrollTo = (id: string) => {
    const el = document.getElementById(id); if (!el) return
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 8, behavior: 'smooth' })
  }

  const copyLink = () => {
    navigator.clipboard.writeText(qrUrl).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  const downloadVCard = () => {
    window.open(`${API}/p/${slug}/vcard`, '_blank')
  }

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!leadForm.name || !leadForm.message) return
    setLeadStatus('sending')
    try {
      const res = await fetch(`${API}/p/${slug}/lead`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadForm),
      })
      if (res.ok) { setLeadStatus('sent'); setLeadForm({ name: '', email: '', message: '' }) }
      else setLeadStatus('error')
    } catch { setLeadStatus('error') }
  }

  const NAV_SECTIONS = [
    { id: 'sec-bio',     label: 'Hakkımda' },
    { id: 'contact',     label: 'İletişim' },
    { id: 'sec-socials', label: 'Sosyal' },
    ...(profile.showServicesSection && services.length     ? [{ id: 'sec-services', label: 'Hizmetler' }] : []),
    ...(profile.showProjectsSection && projects.length     ? [{ id: 'sec-projects', label: 'Projeler' }] : []),
    ...(profile.showTestimonialsSection && testimonials.length ? [{ id: 'sec-testi', label: 'Referanslar' }] : []),
    ...(profile.showCareerSection && (experience.length || education.length) ? [{ id: 'sec-career', label: 'Kariyer' }] : []),
    ...(profile.showCompanySection && profile.companyName  ? [{ id: 'sec-company', label: 'Şirket' }] : []),
    ...((skills.length || languages.length) && profile.showCvSection ? [{ id: 'sec-skills', label: 'Beceriler' }] : []),
    ...(profile.showQrSection ? [{ id: 'sec-qr', label: 'QR Kod' }] : []),
    ...(profile.showContactForm ? [{ id: 'contact-form', label: 'Bana Yaz' }] : []),
  ]

  const avatarRadius = profile.profileShape === 'SQUARE' ? '14px' : profile.profileShape === 'HEXAGON' ? '0px' : '50%'
  const avatarClip   = profile.profileShape === 'HEXAGON' ? 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' : 'none'
  const btnRadius    = profile.buttonStyle === 'PILL' ? '999px' : profile.buttonStyle === 'SQUARE' ? '3px' : '14px'

  const sparkRgb = hexToRgb(accent)
  const cssVars = {
    '--accent':       accent,
    '--accent-2':     accent2,
    '--accent-ink':   accentInk(accent),
    '--accent-glow':  rgba(accent, pal.dark ? 0.22 : 0.16),
    '--accent-soft':  rgba(accent, pal.dark ? 0.09 : 0.10),
    '--bg':           pal.bg,
    '--bg-2':         pal.bg2,
    '--bg-elev':      pal.bgElev,
    '--line':         pal.line,
    '--line-2':       pal.line2,
    '--text':         pal.text,
    '--muted':        pal.muted,
    '--faint':        pal.faint,
    '--spark-r':      String(sparkRgb[0]),
    '--spark-g':      String(sparkRgb[1]),
    '--spark-b':      String(sparkRgb[2]),
    '--font-display': "'Fraunces', Georgia, serif",
    '--font-body':    `'${profile.fontFamily || 'Manrope'}', system-ui, sans-serif`,
    '--font-mono':    "'Space Mono', 'SFMono-Regular', monospace",
    '--avatar-radius': avatarRadius,
    '--avatar-clip':   avatarClip,
    '--btn-radius':    btnRadius,
  } as React.CSSProperties

  return (
    <div className={`pv-root ${pal.dark ? 'pv-dark' : 'pv-light'}`} style={{ ...cssVars, fontFamily: 'var(--font-body)' }}>
      {/* Atmosphere */}
      <div className="aurora"><i className="a1"/><i className="a2"/><i className="a3"/></div>
      <div className="grain"/>
      <div className="vignette"/>
      <div className="progress" ref={progressRef}/>

      {/* Side nav */}
      <nav className={`hero-sidenav ${sideNavState === 'full' ? 'full' : 'fade'}`}>
        {NAV_SECTIONS.map(s => (
          <button key={s.id} className={`hsn-item${activeSection === s.id ? ' hsn-active' : ''}`} onClick={() => scrollTo(s.id)}>
            <span className="hsn-dot"/>
            <span className="hsn-label">{s.label}</span>
          </button>
        ))}
      </nav>

      {/* ── HERO ── */}
      <section className="hero" id="hero">
        <div className="pv-hero-grid"/>
        <div className="pv-hero-spot" ref={heroSpotRef}/>
        <div className="pw hero-inner" ref={heroInnerRef}>
          <Reveal>
            <div className="avatar-wrap">
              <div className="avatar-halo"/>
              <div className="avatar-ring2"/>
              {profile.avatarUrl
                ? <img className="avatar-img" src={`${API}${profile.avatarUrl}`} alt={profile.displayName} loading="lazy"/>
                : <div className="avatar-circle"><span className="avatar-initials">{initials}</span></div>
              }
              {profile.available && <div className="avail-dot" title="Yeni Projelere Açık"/>}
            </div>
          </Reveal>

          <Reveal delay={80}><div className="hero-kicker">Dijital Kimlik</div></Reveal>

          <h1 className={`hero-name${heroIn ? ' in' : ''}`}>
            {profile.displayName.split(' ').map((w, i) => (
              <span key={i} className="word-mask">
                <span className="word" style={{ transitionDelay: `${0.2 + i * 0.09}s` }}>{w}</span>
              </span>
            )).reduce<React.ReactNode[]>((acc, el, i) => i === 0 ? [el] : [...acc, ' ', el], [])}
          </h1>

          {(profile.title || profile.companyName) && (
            <Reveal delay={160}>
              <div className="hero-sub">
                {profile.title}
                {profile.title && profile.companyName && <span className="at"> · </span>}
                {profile.companyName}
              </div>
            </Reveal>
          )}
          {profile.tagline && <Reveal delay={200}><p className="hero-tagline">{profile.tagline}</p></Reveal>}

          <Reveal delay={240}>
            <div className={`hero-status${isOnline ? ' online' : ''}`}>
              <span className="st-dot"/>
              {profile.location && <span>◆ {profile.location}</span>}
              <span className="st-sep">·</span>
              <span className="st-time">{clockStr}</span>
              <span className="st-sep">·</span>
              <span>{isOnline ? 'Çevrimiçi' : 'Şu an çevrimdışı'}</span>
            </div>
          </Reveal>

          <Reveal delay={300}>
            <div className="hero-btns">
              <button className="btn btn-primary" onClick={downloadVCard}>{IC.download} Rehbere Kaydet</button>
              <a href="#contact-form" className="btn btn-secondary">{IC.msg} İletişime Geç</a>
            </div>
          </Reveal>
        </div>
        <div className="scroll-hint">{IC.chevron}</div>
      </section>

      {/* ── STATS ── */}
      {profile.showStatsSection && stats.length > 0 && (
        <div className="stats-band">
          <div className="stats-grid">
            {stats.map((s, i) => <StatItem key={i} value={s.value} label={s.label}/>)}
          </div>
        </div>
      )}

      {/* ── BIO ── */}
      {profile.bio && (
        <section className="sec" id="sec-bio">
          <div className="pw">
            <SectionHead num="01" eyebrow="Hakkımda" title={<>Ben <em>kimim</em></>}/>
            <Reveal>
              <TiltCard className="bio-card">
                <p className="bio-text">{profile.bio}</p>
                <div className="bio-meta">
                  {profile.companyIndustry && <span className="bio-industry">{profile.companyIndustry}</span>}
                  {profile.available && <span className="bio-avail">Yeni Projelere Açık</span>}
                </div>
              </TiltCard>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── CONTACT ── */}
      {profile.contacts.length > 0 && (
        <section className="sec" id="contact">
          <div className="pw">
            <SectionHead num="02" eyebrow="İletişim" title={<>Bana <em>ulaşın</em></>}/>
            <Reveal>
              <div className="contacts-grid">
                {profile.contacts.map(c => (
                  <TiltCard key={c.id} className="cc" style={{ display: 'flex' } as any}>
                    <a href={contactHref(c.type, c.value)} target="_blank" rel="noopener noreferrer"
                       style={{ display: 'contents', textDecoration: 'none', color: 'inherit' }}>
                      <span className="cc-icon"><ContactIcon type={c.type}/></span>
                      <span className="cc-info">
                        <span className="cc-label">{contactLabel(c.type, c.label)}</span>
                        <span className="cc-val">{c.value}</span>
                      </span>
                      <span className="cc-arr">{IC.arrow}</span>
                    </a>
                  </TiltCard>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── SOCIALS ── */}
      {profile.socials.length > 0 && (
        <section className="sec" id="sec-socials">
          <div className="pw">
            <SectionHead num="03" eyebrow="Sosyal Medya" title={<>Takip <em>edin</em></>}/>
            <Reveal>
              <div className="socials-grid">
                {profile.socials.map(s => {
                  const color = SC_COLORS[s.platform.toUpperCase()] || '#ffffff'
                  return (
                    <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="sc"
                       onMouseEnter={e => { const el = e.currentTarget; el.style.background = color + '1f'; el.style.borderColor = color + '66'; const ic = el.querySelector<HTMLElement>('.sc-icon'); const nm = el.querySelector<HTMLElement>('.sc-name'); if (ic) ic.style.color = color; if (nm) nm.style.color = color }}
                       onMouseLeave={e => { const el = e.currentTarget; el.style.background = ''; el.style.borderColor = ''; const ic = el.querySelector<HTMLElement>('.sc-icon'); const nm = el.querySelector<HTMLElement>('.sc-name'); if (ic) ic.style.color = ''; if (nm) nm.style.color = '' }}>
                      <span className="sc-icon"><SocialIcon platform={s.platform}/></span>
                      <span className="sc-name">{s.platform.toLowerCase()}</span>
                    </a>
                  )
                })}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── SERVICES ── */}
      {profile.showServicesSection && services.length > 0 && (
        <section className="sec" id="sec-services">
          <div className="pw">
            <SectionHead num="04" eyebrow="Hizmetler" title={<>Neler <em>yapıyorum</em></>}/>
            <div className="services-grid">
              {services.map((s, i) => (
                <Reveal key={i} delay={i * 60}>
                  <TiltCard className="svc">
                    <div className="svc-num">{String(i + 1).padStart(2, '0')}</div>
                    <span className="svc-icon">{s.icon}</span>
                    <div className="svc-title">{s.title}</div>
                    <div className="svc-desc">{s.desc}</div>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PROJECTS ── */}
      {profile.showProjectsSection && projects.length > 0 && (
        <section className="sec" id="sec-projects">
          <div className="pw">
            <SectionHead num="05" eyebrow="Projeler" title={<>Öne çıkan <em>işler</em></>}/>
            <Reveal>
              {projects.map((p, i) => (
                <div key={i} className="proj"
                     onMouseEnter={e => { const bar = e.currentTarget.querySelector<HTMLElement>('.proj-bar'); if (bar) bar.style.background = p.color }}
                     onMouseLeave={e => { const bar = e.currentTarget.querySelector<HTMLElement>('.proj-bar'); if (bar) bar.style.background = '' }}>
                  <div className="proj-bar"/>
                  <div className="proj-num">{String(i + 1).padStart(2, '0')}</div>
                  <div className="proj-body">
                    <div className="proj-title">{p.title}</div>
                    <div className="proj-cat">{p.category}</div>
                    <div className="proj-desc">{p.desc}</div>
                    <div className="tags">
                      {(Array.isArray(p.tags) ? p.tags : (p.tags as string).split(',')).map((t, j) => (
                        <span key={j} className="tag">{t.trim()}</span>
                      ))}
                    </div>
                  </div>
                  <span className="proj-go">{IC.arrow}</span>
                </div>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ── */}
      {profile.showTestimonialsSection && testimonials.length > 0 && (
        <section className="sec" id="sec-testi">
          <div className="pw">
            <SectionHead num="06" eyebrow="Referanslar" title={<>Müşteriler <em>ne diyor</em></>}/>
            <Reveal>
              <TiltCard className="testi-feat">
                <div className="testi-qmark">❝</div>
                <div className="testi-text">{testimonials[0].quote}</div>
                <div className="testi-auth">
                  <div className="testi-av">{testimonials[0].initials}</div>
                  <div>
                    <div className="testi-name">{testimonials[0].name}</div>
                    <div className="testi-role">{testimonials[0].role} · {testimonials[0].company}</div>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
            {testimonials.length > 1 && (
              <Reveal>
                <div className="testi-smalls">
                  {testimonials.slice(1).map((t, i) => (
                    <div key={i} className="testi-sm">
                      <div className="testi-text">{t.quote}</div>
                      <div className="testi-auth">
                        <div className="testi-av">{t.initials}</div>
                        <div><div className="testi-name">{t.name}</div><div className="testi-role">{t.role}</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* ── CAREER ── */}
      {profile.showCareerSection && (experience.length > 0 || education.length > 0) && (
        <section className="sec" id="sec-career">
          <div className="pw">
            <SectionHead num="07" eyebrow="Deneyim" title={<><em>Kariyer</em> yolu</>}/>
            {experience.length > 0 && (
              <Reveal>
                <div className="timeline">
                  <div className="tl-line"/>
                  {experience.map((e, i) => (
                    <div key={i} className="tl-item">
                      <div className="tl-dot"/>
                      <div className="tl-year">{e.year}</div>
                      <div className="tl-role">{e.role} <span className="tl-company">· {e.company}</span></div>
                      {e.desc && <div className="tl-desc">{e.desc}</div>}
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
            {education.length > 0 && (
              <Reveal>
                <div className="edu-list">
                  <div className="edu-head">Eğitim</div>
                  {education.map((e, i) => (
                    <div key={i} className="edu-item">
                      <span className="edu-year">{e.year}</span>
                      <span className="edu-deg">{e.degree}</span>
                      <span className="edu-school">{e.school}</span>
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* ── COMPANY ── */}
      {profile.showCompanySection && profile.companyName && (
        <section className="sec" id="sec-company">
          <div className="pw">
            <SectionHead num="08" eyebrow="Şirket" title={<em>{profile.companyName}</em>}/>
            <Reveal>
              <TiltCard className="company-card">
                <div className="co-name">{profile.companyName}</div>
                {profile.companyDescription && <div className="co-desc">{profile.companyDescription}</div>}
                {(profile.companyPhone || profile.companyAddress) && (
                  <div className="co-contact">
                    {profile.companyPhone && (
                      <a href={`tel:${profile.companyPhone.replace(/\s/g, '')}`} className="co-contact-row">
                        <span className="co-contact-label">Tel</span>{profile.companyPhone}
                      </a>
                    )}
                    {profile.companyAddress && (
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(profile.companyAddress)}`}
                        target="_blank" rel="noopener noreferrer" className="co-contact-row"
                      >
                        <span className="co-contact-label">Adres</span>{profile.companyAddress}
                      </a>
                    )}
                  </div>
                )}
                {(() => {
                  let socials: { platform: string; url: string }[] = []
                  try { socials = JSON.parse(profile.companySocials || '[]') } catch {}
                  if (!Array.isArray(socials) || socials.length === 0) return null
                  return (
                    <div className="co-socials">
                      {socials.filter(s => s?.url).map((s, i) => (
                        <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="co-social-pill">
                          {s.platform}
                        </a>
                      ))}
                    </div>
                  )
                })()}
                {profile.companyWebsite && (
                  <a href={profile.companyWebsite} target="_blank" rel="noopener noreferrer" className="co-link">
                    Web Sitesini Ziyaret Et {IC.ext}
                  </a>
                )}
              </TiltCard>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── SKILLS ── */}
      {profile.showCvSection && (skills.length > 0 || languages.length > 0) && (
        <section className="sec" id="sec-skills">
          <div className="pw">
            <SectionHead num="09" eyebrow="Yetenekler" title={<>Beceriler & <em>diller</em></>}/>
          </div>
          {skills.length > 0 && (
            <Reveal>
              <div className="marquee" aria-hidden="true">
                <div className="marquee-track">
                  {[...skills, ...skills].map((s, i) => <span key={i} className="mq-item">{s}</span>)}
                </div>
              </div>
            </Reveal>
          )}
          <div className="pw">
            <Reveal>
              <div className="skills-cols">
                {skills.length > 0 && (
                  <div>
                    <div className="col-head">Teknolojiler</div>
                    <div className="pills">{skills.map((s, i) => <span key={i} className="pill">{s}</span>)}</div>
                  </div>
                )}
                {languages.length > 0 && (
                  <div>
                    <div className="col-head">Diller</div>
                    <div className="pills">{languages.map((l, i) => <span key={i} className="pill pill-lang">{l}</span>)}</div>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── QR ── */}
      {profile.showQrSection && (
        <section className="sec" id="sec-qr">
          <div className="pw">
            <SectionHead num="10" eyebrow="QR Kod" title={<>Profil <em>linki</em></>}/>
            <Reveal>
              <div className="qr-card">
                <div className="qr-wrap">
                  <img src={qrSrc} alt={`${profile.displayName} profil QR kodu`} loading="lazy" width="188" height="188"/>
                </div>
                <p className="qr-url">{qrUrl}</p>
                <button className={`btn-copy${copied ? ' copied' : ''}`} onClick={copyLink}>
                  {IC.copy} {copied ? 'Kopyalandı ✓' : 'Linki Kopyala'}
                </button>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── FORM ── */}
      {profile.showContactForm && (
        <section className="sec" id="contact-form">
          <div className="pw">
            <SectionHead num="11" eyebrow="İletişim Formu" title={<>Bana <em>yaz</em></>}/>
            <Reveal>
              {leadStatus === 'sent' ? (
                <div className="form-success">
                  <div className="form-success-icon">{IC.check}</div>
                  <div className="form-success-msg">Mesajınız iletildi!</div>
                  <div className="form-success-sub">En kısa sürede size geri dönüş yapılacak.</div>
                </div>
              ) : (
                <form onSubmit={submitLead}>
                  <div className="form-group">
                    <input type="text" className="form-input" placeholder=" " autoComplete="name" required
                           value={leadForm.name} onChange={e => setLeadForm(f => ({ ...f, name: e.target.value }))}/>
                    <label className="form-label">Ad Soyad *</label>
                  </div>
                  <div className="form-group">
                    <input type="email" className="form-input" placeholder=" " autoComplete="email" inputMode="email"
                           value={leadForm.email} onChange={e => setLeadForm(f => ({ ...f, email: e.target.value }))}/>
                    <label className="form-label">E-posta</label>
                  </div>
                  <div className="form-group">
                    <textarea className="form-textarea" placeholder=" " required
                              value={leadForm.message} onChange={e => setLeadForm(f => ({ ...f, message: e.target.value }))}/>
                    <label className="form-label">Mesajınız *</label>
                  </div>
                  {leadStatus === 'error' && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>Bir hata oluştu, lütfen tekrar deneyin.</p>}
                  <button type="submit" className="btn btn-primary form-btn" disabled={leadStatus === 'sending'}>
                    {leadStatus === 'sending' ? 'Gönderiliyor…' : 'Gönder'} {IC.arrow}
                  </button>
                </form>
              )}
            </Reveal>
          </div>
        </section>
      )}

      <footer>
        <div className="foot-brand">
          <svg width="16" height="16" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill={accent} opacity=".18"/><text x="16" y="22" textAnchor="middle" fontFamily="Fraunces,serif" fontSize="15" fontWeight="700" fill={accent}>Q</text></svg>
          Q·Kart ile oluşturuldu
        </div>
        {profile.socials.length > 0 && (
          <div className="foot-socials">
            {profile.socials.slice(0, 4).map(s => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="foot-soc" aria-label={s.platform}>
                <SocialIcon platform={s.platform}/>
              </a>
            ))}
          </div>
        )}
      </footer>
    </div>
  )
}
