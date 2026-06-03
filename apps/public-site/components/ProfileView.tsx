'use client'
import { useEffect, useRef, useState } from 'react'
import { trackEvent } from '@/lib/api'

interface ContactItem { id: string; type: string; value: string; label: string | null; order: number }
interface SocialLink { id: string; platform: string; url: string; order: number }
interface Profile {
  slug: string; displayName: string; title: string | null; bio: string | null; avatarUrl: string | null
  theme: string; bgColor: string; fontFamily: string; buttonStyle: string; profileShape: string
  isPublished: boolean
  companyName: string | null; companyLogoUrl: string | null; companyDescription: string | null
  companyWebsite: string | null; companyIndustry: string | null; showCompanySection: boolean
  cvSkills: string | null; cvLanguages: string | null; showCvSection: boolean
  location: string | null; tagline: string | null; available: boolean; calendarUrl: string | null
  stats: string | null; services: string | null; projects: string | null
  testimonials: string | null; experience: string | null; education: string | null
  showStatsSection: boolean; showServicesSection: boolean; showProjectsSection: boolean; showTestimonialsSection: boolean; showCareerSection: boolean; showContactForm: boolean; showQrSection: boolean
  contacts: ContactItem[]; socials: SocialLink[]
}

type StatItem = { value: string; label: string }
type ServiceItem = { icon: string; title: string; desc: string }
type ProjectItem = { title: string; category: string; desc: string; tags: string; color: string }
type TestiItem = { quote: string; name: string; role: string; company: string; initials: string }
type ExpItem = { year: string; role: string; company: string; desc: string }
type EduItem = { year: string; degree: string; school: string }

function parseJ<T>(s: string | null, fb: T): T {
  if (!s) return fb
  try { return JSON.parse(s) } catch { return fb }
}

function contactHref(type: string, value: string) {
  if (type === 'PHONE') return `tel:${value}`
  if (type === 'EMAIL') return `mailto:${value}`
  if (type === 'WHATSAPP') return `https://wa.me/${value.replace(/\D/g, '')}`
  if (type === 'TELEGRAM') return `https://t.me/${value.replace('@', '')}`
  return value.startsWith('http') ? value : `https://${value}`
}

const SOCIAL_COLORS: Record<string, string> = {
  LINKEDIN: '#0A66C2', INSTAGRAM: '#E1306C', TWITTER: '#1DA1F2',
  GITHUB: '#ffffff', YOUTUBE: '#FF0000', BEHANCE: '#1769FF',
  TIKTOK: '#ffffff', FACEBOOK: '#1877F2', DRIBBBLE: '#EA4C89',
  SPOTIFY: '#1DB954', SOUNDCLOUD: '#FF5500',
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

/* ── SVG ICONS ── */
const IcoDownload = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
const IcoMsg = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
const IcoChevron = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
const IcoExt = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15,3 21,3 21,9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
const IcoCopy = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>

function ContactIcon({ type }: { type: string }) {
  const t = type.toLowerCase()
  if (t === 'phone') return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 12a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1.34h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.91 9.27a16 16 0 006.29 6.29l1.29-1.29a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
  if (t === 'email') return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
  if (t === 'whatsapp') return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  if (t === 'telegram') return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
  if (t === 'calendar') return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
}

function SocialIcon({ platform }: { platform: string }) {
  const p = platform.toUpperCase()
  if (p === 'LINKEDIN') return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
  if (p === 'INSTAGRAM') return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
  if (p === 'TWITTER') return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.747l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  if (p === 'GITHUB') return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
  if (p === 'YOUTUBE') return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  if (p === 'BEHANCE') return <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.49-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-.17 1.35-.5.36-1.08.62-1.76.78-.68.16-1.39.25-2.16.25H0V4.51h6.938zm-.408 5.97c.58 0 1.07-.14 1.44-.42.38-.28.57-.72.57-1.32 0-.34-.06-.62-.18-.84-.12-.22-.29-.4-.5-.53-.21-.13-.45-.22-.72-.27-.27-.06-.56-.08-.88-.08H3.24v3.46h3.29zm.187 6.11c.34 0 .66-.03.97-.09.31-.06.58-.17.82-.33.24-.16.43-.38.57-.66.14-.28.21-.64.21-1.08 0-.86-.23-1.47-.7-1.83-.47-.36-1.1-.55-1.89-.55H3.24v4.56h3.48zm13.148 0c.36.36.882.54 1.566.54.487 0 .91-.12 1.27-.36.35-.24.57-.5.65-.78h2.55c-.41 1.27-1.03 2.18-1.86 2.72-.83.54-1.83.81-3.01.81-.82 0-1.55-.13-2.21-.4-.66-.27-1.21-.64-1.66-1.12-.45-.48-.79-1.06-1.03-1.74-.24-.68-.36-1.42-.36-2.23 0-.78.12-1.51.38-2.19.26-.68.62-1.27 1.09-1.76.47-.49 1.03-.88 1.69-1.16.66-.28 1.39-.42 2.19-.42.9 0 1.68.17 2.35.51.67.34 1.22.8 1.64 1.39.42.59.73 1.26.91 2.02.18.76.24 1.55.18 2.39h-7.61c.04.82.3 1.44.66 1.8zm2.67-4.97c-.29-.32-.75-.49-1.37-.49-.4 0-.73.07-.99.2-.26.13-.47.3-.63.5-.16.2-.27.42-.34.65-.07.23-.11.45-.12.65h4.07c-.12-.64-.33-1.19-.62-1.51zM20.24 5.24h-5.52v1.59h5.52V5.24z"/></svg>
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
    const dur = 1500
    const t0 = performance.now()
    let raf: number
    function tick(now: number) {
      const p = Math.min((now - t0) / dur, 1)
      const e = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p
      const val = isFloat ? (num * e).toFixed(1) : String(Math.round(num * e))
      setDisplay(val + (isPlus ? '+' : ''))
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
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setActive(true); obs.disconnect() } }, { threshold: 0.5 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div className="stat-item" ref={ref}>
      <span className="stat-value">{display}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

/* ── Reveal hook ── */
function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { el.classList.add('visible'); obs.disconnect() }
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return ref
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useReveal()
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

/* ── Tema CSS değişkenleri ── */
const THEME_VARS: Record<string, React.CSSProperties> = {
  dark: {},
  minimal: {
    '--bg': '#ffffff', '--bg-2': '#f8fafc', '--bg-elev': '#f1f5f9',
    '--line': 'rgba(0,0,0,0.08)', '--line-2': 'rgba(0,0,0,0.14)',
    '--text': '#111827', '--muted': '#6b7280', '--faint': '#9ca3af',
    '--accent': '#3b82f6', '--accent-2': '#1d4ed8', '--accent-glow': 'rgba(59,130,246,0.2)',
    '--accent-ink': '#ffffff',
  } as React.CSSProperties,
  ocean: {
    '--bg': '#eff6ff', '--bg-2': '#dbeafe', '--bg-elev': '#bfdbfe',
    '--line': 'rgba(29,78,216,0.12)', '--line-2': 'rgba(29,78,216,0.22)',
    '--text': '#1e3a8a', '--muted': '#3b82f6', '--faint': '#60a5fa',
    '--accent': '#1d4ed8', '--accent-2': '#1e40af', '--accent-glow': 'rgba(29,78,216,0.2)',
    '--accent-ink': '#ffffff',
  } as React.CSSProperties,
  forest: {
    '--bg': '#f0fdf4', '--bg-2': '#dcfce7', '--bg-elev': '#bbf7d0',
    '--line': 'rgba(21,128,61,0.12)', '--line-2': 'rgba(21,128,61,0.22)',
    '--text': '#14532d', '--muted': '#16a34a', '--faint': '#4ade80',
    '--accent': '#15803d', '--accent-2': '#166534', '--accent-glow': 'rgba(21,128,61,0.2)',
    '--accent-ink': '#ffffff',
  } as React.CSSProperties,
  sunset: {
    '--bg': '#fff7ed', '--bg-2': '#ffedd5', '--bg-elev': '#fed7aa',
    '--line': 'rgba(194,65,12,0.12)', '--line-2': 'rgba(194,65,12,0.22)',
    '--text': '#7c2d12', '--muted': '#ea580c', '--faint': '#fb923c',
    '--accent': '#c2410c', '--accent-2': '#9a3412', '--accent-glow': 'rgba(194,65,12,0.2)',
    '--accent-ink': '#ffffff',
  } as React.CSSProperties,
  purple: {
    '--bg': '#faf5ff', '--bg-2': '#ede9fe', '--bg-elev': '#ddd6fe',
    '--line': 'rgba(126,34,206,0.12)', '--line-2': 'rgba(126,34,206,0.22)',
    '--text': '#4c1d95', '--muted': '#7c3aed', '--faint': '#a78bfa',
    '--accent': '#7e22ce', '--accent-2': '#6b21a8', '--accent-glow': 'rgba(126,34,206,0.2)',
    '--accent-ink': '#ffffff',
  } as React.CSSProperties,
  rose: {
    '--bg': '#fff1f2', '--bg-2': '#ffe4e6', '--bg-elev': '#fecdd3',
    '--line': 'rgba(225,29,72,0.12)', '--line-2': 'rgba(225,29,72,0.22)',
    '--text': '#881337', '--muted': '#f43f5e', '--faint': '#fb7185',
    '--accent': '#e11d48', '--accent-2': '#be123c', '--accent-glow': 'rgba(225,29,72,0.2)',
    '--accent-ink': '#ffffff',
  } as React.CSSProperties,
  slate: {
    '--bg': '#f8fafc', '--bg-2': '#f1f5f9', '--bg-elev': '#e2e8f0',
    '--line': 'rgba(71,85,105,0.12)', '--line-2': 'rgba(71,85,105,0.22)',
    '--text': '#1e293b', '--muted': '#64748b', '--faint': '#94a3b8',
    '--accent': '#475569', '--accent-2': '#334155', '--accent-glow': 'rgba(71,85,105,0.2)',
    '--accent-ink': '#ffffff',
  } as React.CSSProperties,
  amber: {
    '--bg': '#fffbeb', '--bg-2': '#fef3c7', '--bg-elev': '#fde68a',
    '--line': 'rgba(217,119,6,0.12)', '--line-2': 'rgba(217,119,6,0.22)',
    '--text': '#78350f', '--muted': '#b45309', '--faint': '#d97706',
    '--accent': '#d97706', '--accent-2': '#b45309', '--accent-glow': 'rgba(217,119,6,0.2)',
    '--accent-ink': '#ffffff',
  } as React.CSSProperties,
}

/* ── Contact label helper ── */
function contactLabel(type: string, label: string | null) {
  if (label) return label
  return { PHONE: 'Ara', EMAIL: 'E-posta', WHATSAPP: 'WhatsApp', TELEGRAM: 'Telegram', WEBSITE: 'Web Sitesi', CALENDAR: 'Toplantı Ayarla', CUSTOM: 'Link' }[type] || type
}

export function ProfileView({ profile, slug, source }: { profile: Profile; slug: string; source?: string }) {
  const [copied, setCopied] = useState(false)
  const [leadForm, setLeadForm] = useState({ name: '', email: '', message: '' })
  const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [sideNavState, setSideNavState] = useState<'hidden' | 'dim' | 'full'>('hidden')
  const [activeSection, setActiveSection] = useState<string>('')

  const stats = parseJ<StatItem[]>(profile.stats, [])
  const services = parseJ<ServiceItem[]>(profile.services, [])
  const projects = parseJ<ProjectItem[]>(profile.projects, [])
  const testimonials = parseJ<TestiItem[]>(profile.testimonials, [])
  const experience = parseJ<ExpItem[]>(profile.experience, [])
  const education = parseJ<EduItem[]>(profile.education, [])
  const skills = parseJ<string[]>(profile.cvSkills, [])
  const languages = parseJ<string[]>(profile.cvLanguages, [])

  const initials = profile.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const qrUrl = `${process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'http://localhost:3002'}/u/${slug}`
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=360x360&bgcolor=ffffff&color=0f0c07&data=${encodeURIComponent(qrUrl)}`

  useEffect(() => {
    trackEvent(slug, { eventType: 'PAGE_VIEW', source: source || 'direct' })
  }, [slug, source])

  // IntersectionObserver — aktif bölüm takibi
  useEffect(() => {
    const sectionIds = ['sec-bio','contact','sec-socials','sec-services','sec-projects',
      'sec-testi','sec-career','sec-company','sec-skills','sec-qr','contact-form']
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) setActiveSection(en.target.id)
      })
    }, { threshold: 0.25, rootMargin: '-60px 0px -40% 0px' })

    sectionIds.forEach(id => {
      const el = document.getElementById(id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const onScroll = () => {
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

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY - 8
    window.scrollTo({ top, behavior: 'smooth' })
  }

  const copyLink = () => {
    navigator.clipboard.writeText(qrUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
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
    { id: 'sec-bio', label: 'Hakkımda' },
    { id: 'contact', label: 'İletişim' },
    { id: 'sec-socials', label: 'Sosyal' },
    ...(services.length ? [{ id: 'sec-services', label: 'Hizmetler' }] : []),
    ...(projects.length ? [{ id: 'sec-projects', label: 'Projeler' }] : []),
    ...(testimonials.length ? [{ id: 'sec-testi', label: 'Referanslar' }] : []),
    ...(experience.length ? [{ id: 'sec-career', label: 'Kariyer' }] : []),
    ...(profile.showCompanySection && profile.companyName ? [{ id: 'sec-company', label: 'Şirket' }] : []),
    ...((skills.length || languages.length) && profile.showCvSection ? [{ id: 'sec-skills', label: 'Beceriler' }] : []),
    { id: 'sec-qr', label: 'QR Kod' },
    { id: 'contact-form', label: 'Bana Yaz' },
  ]

  const themeVars = THEME_VARS[profile.theme] ?? {}
  const customBg = profile.bgColor && profile.bgColor !== '#ffffff' && profile.theme !== 'dark'
    ? { '--bg': profile.bgColor } as React.CSSProperties
    : {}

  return (
    <div style={{ ...themeVars, ...customBg, background: 'var(--bg)', minHeight: '100vh', fontFamily: profile.fontFamily ? `'${profile.fontFamily}', sans-serif` : "'Manrope', sans-serif" }}>

      {/* Fixed side nav */}
      <nav className={`hero-sidenav ${sideNavState === 'full' ? 'full' : sideNavState === 'hidden' ? 'fade' : ''}`}>
        {NAV_SECTIONS.map(s => (
          <button key={s.id}
            className={`hsn-item${activeSection === s.id ? ' hsn-active' : ''}`}
            onClick={() => scrollTo(s.id)}
            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left' }}>
            <span className="hsn-dot" />
            <span className="hsn-label">{s.label}</span>
          </button>
        ))}
      </nav>

      {/* ── HERO ── */}
      <section className="hero" id="hero">
        <div className="hero-glow tl" />
        <div className="hero-glow br" />
        {[...Array(8)].map((_, i) => (
          <div key={i} className="particle" style={{
            width: `${Math.random() * 5 + 3}px`, height: `${Math.random() * 5 + 3}px`,
            left: `${Math.random() * 90 + 5}%`, bottom: '-10px',
            opacity: Math.random() * 0.35 + 0.1,
            ['--dur' as string]: `${Math.random() * 6 + 7}s`,
            ['--delay' as string]: `${Math.random() * 8}s`,
            ['--drift' as string]: `${(Math.random() - 0.5) * 80}px`,
          }} />
        ))}

        <div className="pw" style={{ textAlign: 'center', position: 'relative', zIndex: 2 }}>
          <Reveal>
            <div className="avatar-wrap">
              <div className="avatar-halo" />
              {profile.avatarUrl
                ? <img className="avatar-img" src={`${API}${profile.avatarUrl}`} alt={profile.displayName} />
                : <div className="avatar-circle"><span className="avatar-initials">{initials}</span></div>
              }
              {profile.available && <div className="avail-dot" title="Yeni Projelere Açık" />}
            </div>
          </Reveal>

          <Reveal delay={90}><h1 className="hero-name">{profile.displayName}</h1></Reveal>
          <Reveal delay={180}>
            <div className="hero-sub">
              {profile.title}{profile.title && profile.companyName ? ' · ' : ''}{profile.companyName}
            </div>
          </Reveal>
          <Reveal delay={270}><div className="hero-divider" /></Reveal>
          {profile.tagline && <Reveal delay={360}><p className="hero-tagline">{profile.tagline}</p></Reveal>}
          {profile.location && <Reveal delay={450}><p className="hero-loc">📍 {profile.location}</p></Reveal>}

          <Reveal delay={540}>
            <div className="hero-btns">
              <a href={`${API}/p/${slug}/vcard`} download={`${slug}.vcf`}
                onClick={() => trackEvent(slug, { eventType: 'VCARD_DOWNLOAD' })}
                className="btn btn-primary">
                <IcoDownload /> Rehbere Kaydet
              </a>
              <button className="btn btn-secondary" onClick={() => scrollTo('contact-form')}>
                <IcoMsg /> İletişime Geç
              </button>
            </div>
          </Reveal>

          <Reveal delay={630}>
            <div className="nfc-badge">
              <div className="nfc-ring" />
              <div className="nfc-ring" />
              <div className="nfc-ring" />
              <span className="nfc-text">NFC ·)))</span>
            </div>
          </Reveal>
        </div>

        <div className="scroll-hint"><IcoChevron /></div>
      </section>

      {/* ── STATS ── */}
      {stats.length > 0 && profile.showStatsSection !== false && (
        <div className="stats-band">
          <div className="stats-grid">
            {stats.map((s, i) => <StatItem key={i} value={s.value} label={s.label} />)}
          </div>
        </div>
      )}

      {/* ── BIO ── */}
      {profile.bio && (
        <section className="sec" id="sec-bio">
          <div className="pw">
            <Reveal><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-label">Hakkımda</span></div></Reveal>
            <Reveal delay={90}><h2 className="section-title">Ben Kimim</h2></Reveal>
            <Reveal delay={180}>
              <div className="bio-card">
                <p className="bio-text">{profile.bio}</p>
                <div className="bio-meta">
                  {profile.companyIndustry && <span className="bio-industry">{profile.companyIndustry}</span>}
                  {profile.available && <span className="bio-avail">Yeni Projelere Açık</span>}
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── CONTACT ── */}
      {profile.contacts.length > 0 && (
        <section className="sec" id="contact">
          <div className="pw">
            <Reveal><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-label">İletişim</span></div></Reveal>
            <Reveal delay={90}><h2 className="section-title">Bana Ulaşın</h2></Reveal>
            <Reveal delay={180}>
              <div className="contacts-grid">
                {profile.contacts.map(c => (
                  <a key={c.id} href={contactHref(c.type, c.value)} target="_blank" rel="noopener noreferrer"
                    onClick={() => trackEvent(slug, { eventType: 'BUTTON_CLICK', buttonLabel: contactLabel(c.type, c.label) })}
                    className="cc">
                    <span className="cc-icon"><ContactIcon type={c.type} /></span>
                    <span className="cc-info">
                      <span className="cc-label">{contactLabel(c.type, c.label)}</span>
                      <span className="cc-val">{c.value}</span>
                    </span>
                    <span className="cc-arr">→</span>
                  </a>
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
            <Reveal><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-label">Sosyal Medya</span></div></Reveal>
            <Reveal delay={90}><h2 className="section-title">Takip Edin</h2></Reveal>
            <Reveal delay={180}>
              <div className="socials-grid">
                {profile.socials.map(s => {
                  const color = SOCIAL_COLORS[s.platform] || '#ffffff'
                  return (
                    <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                      onClick={() => trackEvent(slug, { eventType: 'BUTTON_CLICK', buttonLabel: s.platform })}
                      className="sc"
                      onMouseEnter={e => {
                        const el = e.currentTarget
                        el.style.background = `${color}26`
                        el.style.borderColor = `${color}66`
                        const ico = el.querySelector('.sc-icon') as HTMLElement
                        const nm = el.querySelector('.sc-name') as HTMLElement
                        if (ico) ico.style.color = color
                        if (nm) nm.style.color = color
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget
                        el.style.background = ''
                        el.style.borderColor = ''
                        const ico = el.querySelector('.sc-icon') as HTMLElement
                        const nm = el.querySelector('.sc-name') as HTMLElement
                        if (ico) ico.style.color = ''
                        if (nm) nm.style.color = ''
                      }}>
                      <span className="sc-icon"><SocialIcon platform={s.platform} /></span>
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
      {services.length > 0 && profile.showServicesSection !== false && (
        <section className="sec" id="sec-services">
          <div className="pw">
            <Reveal><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-label">Hizmetler</span></div></Reveal>
            <Reveal delay={90}><h2 className="section-title">Neler Yapıyorum</h2></Reveal>
            <Reveal delay={180}>
              <div className="services-grid">
                {services.map((s, i) => (
                  <div key={i} className="svc">
                    <div className="svc-num">{String(i + 1).padStart(2, '0')}</div>
                    <span className="svc-icon">{s.icon}</span>
                    <div className="svc-title">{s.title}</div>
                    <div className="svc-desc">{s.desc}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── PROJECTS ── */}
      {projects.length > 0 && profile.showProjectsSection !== false && (
        <section className="sec" id="sec-projects">
          <div className="pw">
            <Reveal><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-label">Projeler</span></div></Reveal>
            <Reveal delay={90}><h2 className="section-title">Öne Çıkan İşler</h2></Reveal>
            <Reveal delay={180}>
              {projects.map((p, i) => (
                <div key={i} className="proj"
                  onMouseEnter={e => { const bar = e.currentTarget.querySelector('.proj-bar') as HTMLElement; if (bar) bar.style.background = p.color }}
                  onMouseLeave={e => { const bar = e.currentTarget.querySelector('.proj-bar') as HTMLElement; if (bar) bar.style.background = '' }}>
                  <div className="proj-bar" />
                  <div className="proj-num">{String(i + 1).padStart(2, '0')}</div>
                  <div className="proj-body">
                    <div className="proj-title">{p.title}</div>
                    <div className="proj-cat">{p.category}</div>
                    <div className="proj-desc">{p.desc}</div>
                    {p.tags && (
                      <div className="tags">
                        {p.tags.split(',').map(t => <span key={t} className="tag">{t.trim()}</span>)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </Reveal>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ── */}
      {testimonials.length > 0 && profile.showTestimonialsSection !== false && (
        <section className="sec" id="sec-testi">
          <div className="pw">
            <Reveal><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-label">Referanslar</span></div></Reveal>
            <Reveal delay={90}><h2 className="section-title">Müşteriler Ne Diyor</h2></Reveal>
            <Reveal delay={180}>
              <div className="testi-feat">
                <div className="testi-qmark">"</div>
                <p className="testi-text">{testimonials[0].quote}</p>
                <div className="testi-auth">
                  <div className="testi-av">{testimonials[0].initials}</div>
                  <div>
                    <div className="testi-name">{testimonials[0].name}</div>
                    <div className="testi-role">{testimonials[0].role} · {testimonials[0].company}</div>
                  </div>
                </div>
              </div>
            </Reveal>
            {testimonials.length > 1 && (
              <Reveal delay={270}>
                <div className="testi-smalls">
                  {testimonials.slice(1).map((t, i) => (
                    <div key={i} className="testi-sm">
                      <div className="testi-qmark">"</div>
                      <p className="testi-text">{t.quote}</p>
                      <div className="testi-auth">
                        <div className="testi-av">{t.initials}</div>
                        <div>
                          <div className="testi-name" style={{ fontSize: 12 }}>{t.name}</div>
                          <div className="testi-role">{t.role}</div>
                        </div>
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
      {(experience.length > 0 || education.length > 0) && profile.showCareerSection !== false && (
        <section className="sec" id="sec-career">
          <div className="pw">
            <Reveal><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-label">Deneyim</span></div></Reveal>
            <Reveal delay={90}><h2 className="section-title">Kariyer</h2></Reveal>
            {experience.length > 0 && (
              <Reveal delay={180}>
                <div className="timeline">
                  {experience.map((e, i) => (
                    <div key={i} className="tl-item">
                      <div className="tl-dot" />
                      <div className="tl-year">{e.year}</div>
                      <div className="tl-role">{e.role} <span className="tl-company">· {e.company}</span></div>
                      {e.desc && <div className="tl-desc">{e.desc}</div>}
                    </div>
                  ))}
                </div>
              </Reveal>
            )}
            {education.length > 0 && (
              <Reveal delay={270}>
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
            <Reveal><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-label">Şirket</span></div></Reveal>
            <Reveal delay={90}><h2 className="section-title">{profile.companyName}</h2></Reveal>
            <Reveal delay={180}>
              <div className="company-card">
                {profile.companyLogoUrl && (
                  <img src={`${API}${profile.companyLogoUrl}`} alt={profile.companyName} style={{ height: 40, objectFit: 'contain', marginBottom: 12 }} />
                )}
                <div className="co-name">{profile.companyName}</div>
                {profile.companyDescription && <div className="co-desc">{profile.companyDescription}</div>}
                {profile.companyWebsite && (
                  <a href={profile.companyWebsite.startsWith('http') ? profile.companyWebsite : `https://${profile.companyWebsite}`}
                    target="_blank" rel="noopener noreferrer" className="co-link">
                    Web Sitesini Ziyaret Et <IcoExt />
                  </a>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── SKILLS ── */}
      {profile.showCvSection && (skills.length > 0 || languages.length > 0) && (
        <section className="sec" id="sec-skills">
          <div className="pw">
            <Reveal><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-label">Yetenekler</span></div></Reveal>
            <Reveal delay={90}><h2 className="section-title">Beceriler & Diller</h2></Reveal>
            <Reveal delay={180}>
              <div className="skills-cols">
                {skills.length > 0 && (
                  <div>
                    <div className="col-head">Teknolojiler</div>
                    <div className="pills">{skills.map(s => <span key={s} className="pill">{s}</span>)}</div>
                  </div>
                )}
                {languages.length > 0 && (
                  <div>
                    <div className="col-head">Diller</div>
                    <div className="pills">{languages.map(l => <span key={l} className="pill pill-lang">{l}</span>)}</div>
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── QR ── */}
      <section className="sec" id="sec-qr">
        <div className="pw">
          <Reveal><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-label">QR Kod</span></div></Reveal>
          <Reveal delay={90}><h2 className="section-title">Profil Linki</h2></Reveal>
          <Reveal delay={180}>
            <div className="qr-card">
              <div className="qr-wrap">
                <img src={qrSrc} alt="QR Kod" width={180} height={180} loading="lazy" />
              </div>
              <p className="qr-url">{qrUrl}</p>
              <button className={`btn-copy ${copied ? 'copied' : ''}`} onClick={copyLink}>
                <IcoCopy /> {copied ? 'Kopyalandı ✓' : 'Linki Kopyala'}
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CONTACT FORM ── */}
      <section className="sec" id="contact-form">
        <div className="pw">
          <Reveal><div className="eyebrow"><div className="eyebrow-line"/><span className="eyebrow-label">İletişim Formu</span></div></Reveal>
          <Reveal delay={90}><h2 className="section-title">Bana Yaz</h2></Reveal>
          <Reveal delay={180}>
            {leadStatus === 'sent' ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)' }}>Mesajınız iletildi!</div>
                <button onClick={() => setLeadStatus('idle')} style={{ marginTop: 16, fontSize: 13, color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}>Tekrar gönder</button>
              </div>
            ) : (
              <form onSubmit={submitLead}>
                <div className="form-group">
                  <input type="text" className="form-input" placeholder=" " required
                    value={leadForm.name} onChange={e => setLeadForm(f => ({ ...f, name: e.target.value }))} />
                  <label className="form-label">Ad Soyad *</label>
                </div>
                <div className="form-group">
                  <input type="email" className="form-input" placeholder=" "
                    value={leadForm.email} onChange={e => setLeadForm(f => ({ ...f, email: e.target.value }))} />
                  <label className="form-label">E-posta</label>
                </div>
                <div className="form-group">
                  <textarea className="form-textarea" placeholder=" " required
                    value={leadForm.message} onChange={e => setLeadForm(f => ({ ...f, message: e.target.value }))} />
                  <label className="form-label">Mesajınız *</label>
                </div>
                {leadStatus === 'error' && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>Bir hata oluştu, tekrar deneyin.</p>}
                <button type="submit" disabled={leadStatus === 'sending'} className="btn btn-primary" style={{ width: '100%' }}>
                  {leadStatus === 'sending' ? 'Gönderiliyor...' : 'Gönder'}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{textAlign:"center",padding:"32px 20px 44px",borderTop:"1px solid var(--line)"}}>
        <div className="foot-brand">
          <svg width="16" height="16" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" fill="#d4a843" fillOpacity=".18"/>
            <text x="16" y="22" textAnchor="middle" fontFamily="Space Grotesk,sans-serif" fontSize="15" fontWeight="700" fill="#d4a843">Q</text>
          </svg>
          Q·Kart ile oluşturuldu
        </div>
        {profile.socials.length > 0 && (
          <div className="foot-socials">
            {profile.socials.slice(0, 4).map(s => (
              <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" className="foot-soc">
                <SocialIcon platform={s.platform} />
              </a>
            ))}
          </div>
        )}
      </footer>
    </div>
  )
}
