'use client'
import { useEffect, useRef, useState } from 'react'
import { trackEvent } from '@/lib/api'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const PUBLIC_SITE = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'http://localhost:3002'

interface ContactItem { id: string; type: string; value: string; label: string | null; order: number }
interface SocialLink { id: string; platform: string; url: string; order: number }
interface SigProfile {
  slug: string; displayName: string; title: string | null; bio: string | null
  tagline: string | null; location: string | null; available: boolean
  tickerText: string | null
  avatarUrl: string | null; accentColor: string | null; calendarUrl: string | null
  companyName: string | null
  stats: string | null; services: string | null; projects: string | null; testimonials: string | null
  cvSkills: string | null
  showStatsSection: boolean; showServicesSection: boolean; showProjectsSection: boolean
  showTestimonialsSection: boolean; showQrSection: boolean
  contacts: ContactItem[]; socials: SocialLink[]
}

function parseJ<T>(s: string | null, fb: T): T { if (!s) return fb; try { return JSON.parse(s) } catch { return fb } }
function splitNum(v: string): { num: number; suf: string; dec: boolean } {
  const m = String(v).match(/^([\d.,]+)(.*)$/)
  if (!m) return { num: 0, suf: String(v), dec: false }
  const numStr = m[1].replace(',', '.')
  return { num: parseFloat(numStr) || 0, suf: m[2] || '', dec: numStr.includes('.') }
}
function contactHref(type: string, value: string) {
  const t = type.toUpperCase()
  if (t === 'PHONE') return `tel:${value.replace(/\s/g, '')}`
  if (t === 'EMAIL') return `mailto:${value}`
  if (t === 'WHATSAPP') return `https://wa.me/${value.replace(/\D/g, '')}`
  if (t === 'TELEGRAM') return `https://t.me/${value.replace('@', '')}`
  return value.startsWith('http') ? value : `https://${value}`
}
function hexToRgb(h: string): [number, number, number] {
  h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join('')
  const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

const ICON: Record<string, JSX.Element> = {
  PHONE: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
  EMAIL: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" /></svg>,
  WHATSAPP: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.821 11.821 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.207z" /></svg>,
  WEBSITE: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" /></svg>,
  TELEGRAM: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>,
  CALENDAR: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  VCARD: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
}

const SOCIAL_ICON: Record<string, JSX.Element> = {
  LINKEDIN: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>,
  INSTAGRAM: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>,
  GITHUB: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>,
  BEHANCE: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zM9.949 9.674c0-1.131-.69-1.674-1.732-1.674H4v3.4h4.217c1.042 0 1.732-.595 1.732-1.726zm-5.949 5.326h4.467c1.184 0 1.901-.717 1.901-1.65 0-1.083-.685-1.65-1.901-1.65H4v3.3zm-4-9h8.099c2.04 0 3.901.642 3.901 3.234 0 1.273-.642 2.106-1.617 2.683 1.32.499 2.116 1.575 2.116 3.115 0 2.516-2.054 3.968-4.482 3.968H0V6z" /></svg>,
  TWITTER: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.6l5.24 6.93zm-1.29 19.5h2.04L6.48 3.24H4.3z" /></svg>,
  YOUTUBE: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.12-2.12C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.53A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.12 2.12c1.88.53 9.38.53 9.38.53s7.5 0 9.38-.53a3 3 0 0 0 2.12-2.12A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8M9.55 15.57V8.43L15.82 12z" /></svg>,
  DRIBBBLE: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24m7.93 5.53a10.1 10.1 0 0 1 2.3 6.32c-.34-.07-3.7-.75-7.08-.33-.07-.17-.14-.34-.22-.52-.2-.49-.44-.99-.68-1.46 3.74-1.53 5.44-3.73 5.68-4.01M12 1.78c2.55 0 4.88.96 6.65 2.53-.2.29-1.74 2.35-5.35 3.71a52 52 0 0 0-3.83-5.98c.8-.18 1.65-.26 2.53-.26M7.5 2.74a63 63 0 0 1 3.79 5.9c-4.78 1.28-9 1.25-9.45 1.25a10.2 10.2 0 0 1 5.66-7.15M1.6 12v-.31c.43.01 5.4.07 10.5-1.46.3.57.57 1.15.82 1.73l-.4.12c-5.27 1.7-8.07 6.35-8.3 6.74A10.16 10.16 0 0 1 1.6 12m10.4 10.22c-2.36 0-4.53-.8-6.26-2.15.18-.37 2.2-4.26 7.96-6.27l.06-.02a42 42 0 0 1 2.17 7.7 10.1 10.1 0 0 1-3.93.74m5.65-1.69a44 44 0 0 0-1.97-7.24c3.18-.5 5.97.33 6.32.44a10.16 10.16 0 0 1-4.35 6.8" /></svg>,
  FACEBOOK: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.38A12 12 0 0 0 24 12" /></svg>,
}

export function SignatureView({ profile, slug, source }: { profile: SigProfile; slug: string; source?: string }) {
  const root = useRef<HTMLDivElement>(null)
  const [toastMsg, setToastMsg] = useState('')
  const toastT = useRef<any>(null)

  const accent = profile.accentColor && /^#[0-9a-fA-F]{6}$/.test(profile.accentColor) ? profile.accentColor : '#d9a93f'
  const [ar, ag, ab] = hexToRgb(accent)

  const stats = parseJ<{ value: string; label: string }[]>(profile.stats, [])
  const services = parseJ<{ icon?: string; title: string; desc?: string }[]>(profile.services, [])
  const projects = parseJ<{ title: string; category?: string; desc?: string }[]>(profile.projects, [])
  const testimonials = parseJ<{ quote: string; name: string; role?: string; company?: string }[]>(profile.testimonials, [])
  const skills = parseJ<string[]>(profile.cvSkills, [])

  const nameParts = (profile.displayName || '').trim().split(/\s+/).filter(Boolean)
  const line1 = nameParts[0] || profile.displayName || ''
  const line2 = nameParts.slice(1).join(' ')

  // Kullanıcının kendi şerit metni öncelikli; yoksa hizmetler → beceriler → varsayılan
  const customTicker = (profile.tickerText || '').split(',').map(s => s.trim()).filter(Boolean)
  const tickerItems = customTicker.length > 0 ? customTicker
    : (services.length ? services.map(s => s.title) : skills.length ? skills : ['Dijital Kimlik', 'NFC', 'QR Kart'])
  const manifesto = profile.tagline || profile.bio || ''
  const vcardUrl = `${API}/p/${slug}/vcard`
  const profileUrl = `${PUBLIC_SITE}/u/${slug}`
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(profileUrl)}`

  const [qi, setQi] = useState(0)

  function toast(s: string) { setToastMsg(s); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToastMsg(''), 2400) }
  const onClick = (label: string) => trackEvent(slug, { eventType: 'BUTTON_CLICK', buttonLabel: label })

  useEffect(() => { trackEvent(slug, { eventType: 'PAGE_VIEW', source: source || 'direct' }) }, [slug, source])

  // Quote otomatik geçiş
  useEffect(() => {
    if (testimonials.length < 2) return
    const t = setInterval(() => setQi(p => (p + 1) % testimonials.length), 9000)
    return () => clearInterval(t)
  }, [testimonials.length])

  // Tüm animasyon/etkileşim mantığı (scope: root)
  useEffect(() => {
    const el = root.current; if (!el) return
    const reduced = matchMedia('(prefers-reduced-motion:reduce)').matches
    const fine = matchMedia('(pointer:fine)').matches
    const cleanups: (() => void)[] = []
    const $ = (sel: string) => el.querySelector(sel) as HTMLElement | null

    // Perde
    const veil = $('.sig-veil')
    const vt = setTimeout(() => veil?.classList.add('open'), 1400)
    cleanups.push(() => clearTimeout(vt))

    // İmleç
    if (fine && !reduced) {
      const c = $('#sig-cursor'), r = $('#sig-ring')
      let mx = 0, my = 0, rx = 0, ry = 0, raf = 0
      const onMove = (e: MouseEvent) => { mx = e.clientX; my = e.clientY; if (c) { c.style.left = mx + 'px'; c.style.top = my + 'px' } }
      window.addEventListener('mousemove', onMove, { passive: true })
      const lerp = () => { rx += (mx - rx) * .13; ry += (my - ry) * .13; if (r) { r.style.left = rx + 'px'; r.style.top = ry + 'px' } raf = requestAnimationFrame(lerp) }
      lerp()
      const hovs = el.querySelectorAll('a,button,.qr-frame,.q-dot')
      const enter = () => el.classList.add('hovering'); const leave = () => el.classList.remove('hovering')
      hovs.forEach(h => { h.addEventListener('mouseenter', enter); h.addEventListener('mouseleave', leave) })
      cleanups.push(() => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); hovs.forEach(h => { h.removeEventListener('mouseenter', enter); h.removeEventListener('mouseleave', leave) }) })
    }

    // Canvas parçacıklar
    if (!reduced) {
      const cv = $('#sig-field') as HTMLCanvasElement | null
      const ctx = cv?.getContext('2d')
      if (cv && ctx) {
        let W = 0, H = 0, parts: any[] = [], mouse = { x: -999, y: -999 }, raf = 0
        const resize = () => {
          W = cv.width = el.clientWidth; H = cv.height = window.innerHeight
          const n = Math.min(80, Math.floor(W * H / 18000))
          parts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25, vy: (Math.random() - .5) * .25, s: .6 + Math.random() * 1.6, o: .12 + Math.random() * .35 }))
        }
        resize(); window.addEventListener('resize', resize)
        const onMove = (e: MouseEvent) => { const r = el.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top }
        window.addEventListener('mousemove', onMove, { passive: true })
        const draw = () => {
          ctx.clearRect(0, 0, W, H)
          for (const p of parts) {
            const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy)
            if (d < 130 && d > 0) { p.vx += dx / d * .06; p.vy += dy / d * .06 }
            p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy
            if (p.x < -10) p.x = W + 10; if (p.x > W + 10) p.x = -10
            if (p.y < -10) p.y = H + 10; if (p.y > H + 10) p.y = -10
            ctx.beginPath(); ctx.arc(p.x, p.y, p.s, 0, 7); ctx.fillStyle = `rgba(${ar},${ag},${ab},${p.o})`; ctx.fill()
          }
          for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
            const a = parts[i], b = parts[j], d = Math.hypot(a.x - b.x, a.y - b.y)
            if (d < 90) { ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.strokeStyle = `rgba(${ar},${ag},${ab},${(1 - d / 90) * .07})`; ctx.stroke() }
          }
          raf = requestAnimationFrame(draw)
        }
        draw()
        cleanups.push(() => { window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf) })
      }
    }

    // Ticker
    const tk = $('#sig-ticker')
    if (tk) {
      tk.innerHTML += tk.innerHTML
      let pos = 0, vel = .6, lastY = window.scrollY, raf = 0
      const onScroll = () => { vel += Math.min(6, Math.abs(window.scrollY - lastY) * .06); lastY = window.scrollY }
      window.addEventListener('scroll', onScroll, { passive: true })
      const run = () => { vel += (.6 - vel) * .05; pos -= vel; const half = tk.scrollWidth / 2; if (-pos >= half) pos += half; tk.style.transform = `translateX(${pos}px)`; raf = requestAnimationFrame(run) }
      run()
      cleanups.push(() => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) })
    }

    // Manifesto kelime aydınlatma
    const m = $('#sig-manifesto')
    if (m) {
      m.innerHTML = (m.textContent || '').split(' ').map(w => `<span class="w">${w}</span>`).join(' ')
      const words = [...m.querySelectorAll('.w')]
      const onScroll = () => {
        const r = m.getBoundingClientRect()
        const prog = Math.max(0, Math.min(1, (window.innerHeight * .85 - r.top) / (r.height + window.innerHeight * .3)))
        const lit = Math.floor(prog * words.length * 1.4)
        words.forEach((w, i) => w.classList.toggle('lit', i < lit))
      }
      window.addEventListener('scroll', onScroll, { passive: true }); onScroll()
      cleanups.push(() => window.removeEventListener('scroll', onScroll))
    }

    // Reveal + countup
    const countAll = () => {
      el.querySelectorAll('#sig-nums .v').forEach(v => {
        const node = v as HTMLElement
        const target = parseFloat(node.dataset.cnt || '0'), suf = node.dataset.suf || '', isF = (node.dataset.cnt || '').includes('.')
        const t0 = performance.now()
        const step = (now: number) => { const t = Math.min((now - t0) / 1700, 1), e = 1 - Math.pow(1 - t, 3), val = target * e; node.textContent = (isF ? val.toFixed(1) : Math.floor(val)) + suf; if (t < 1) requestAnimationFrame(step); else node.textContent = (isF ? target.toFixed(1) : target) + suf }
        requestAnimationFrame(step)
      })
    }
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); if ((e.target as HTMLElement).id === 'sig-nums') countAll(); io.unobserve(e.target) } })
    }, { threshold: .18 })
    el.querySelectorAll('[data-r]').forEach(n => io.observe(n))
    cleanups.push(() => io.disconnect())

    return () => cleanups.forEach(fn => fn())
  }, [ar, ag, ab])

  // İletişim kanalları
  const byType = (t: string) => profile.contacts.find(c => c.type.toUpperCase() === t)
  const channels: { key: string; href: string; label: string; icon: JSX.Element; solid?: boolean; download?: boolean; ext?: boolean }[] = []
  channels.push({ key: 'vcard', href: vcardUrl, label: 'Rehbere Kaydet', icon: ICON.VCARD, solid: true, download: true })
  const phone = byType('PHONE'); if (phone) channels.push({ key: 'phone', href: contactHref('PHONE', phone.value), label: 'Ara', icon: ICON.PHONE })
  const wa = byType('WHATSAPP'); if (wa) channels.push({ key: 'wa', href: contactHref('WHATSAPP', wa.value), label: 'WhatsApp', icon: ICON.WHATSAPP, ext: true })
  const email = byType('EMAIL'); if (email) channels.push({ key: 'email', href: contactHref('EMAIL', email.value), label: 'E-posta', icon: ICON.EMAIL })
  const web = byType('WEBSITE'); if (web) channels.push({ key: 'web', href: contactHref('WEBSITE', web.value), label: 'Web', icon: ICON.WEBSITE, ext: true })
  if (profile.calendarUrl) channels.push({ key: 'cal', href: profile.calendarUrl, label: 'Toplantı', icon: ICON.CALENDAR, ext: true })

  const socials = (profile.socials || []).slice().sort((a, b) => a.order - b.order)
  const q = testimonials[qi]

  return (
    <div className="sig-root" ref={root} style={{ ['--gold' as any]: accent, ['--gold-soft' as any]: `rgba(${ar},${ag},${ab},.16)` }}>
      <div id="sig-cursor" /><div id="sig-ring" />
      <canvas id="sig-field" />

      <div className="sig-veil">
        <div className="v-inner">
          <div className="v-num">N° 001 — SIGNATURE</div>
          <div className="v-name">{(profile.displayName || '').toUpperCase()}</div>
          <div className="v-bar" />
        </div>
      </div>

      <main>
        {/* 01 Açılış */}
        <section className="act-1 frame">
          {profile.title && <div className="lbl" style={{ marginBottom: 26 }}>{profile.title}</div>}
          <h1 className="giant-name">
            <span className="row"><span>{line1}</span></span>
            {line2 && <span className="row"><span>{line2}</span></span>}
          </h1>
          <div className="act1-meta">
            {(profile.bio || profile.companyName) && (
              <p className="who">{profile.companyName && <b>{profile.companyName}</b>}{profile.companyName && profile.bio ? ' · ' : ''}{profile.bio}</p>
            )}
            <div className="coords">
              {profile.location && <>{profile.location.toUpperCase()}<br /></>}
              {profile.available && <span className="live">YENİ PROJELERE AÇIK</span>}
            </div>
          </div>
          <div className="scrollcue">KAYDIR</div>
        </section>

        {/* Şerit */}
        {(customTicker.length > 0 || profile.showServicesSection) && tickerItems.length > 0 && (
          <div className="ticker" data-r>
            <div className="ticker-track" id="sig-ticker">
              {tickerItems.map((t, i) => <span key={i} className={`t${i % 2 ? ' solid' : ''}`}>{t}</span>)}
            </div>
          </div>
        )}

        {/* 02 Manifesto */}
        {manifesto && (
          <section className="act-2 frame">
            <div data-r><span className="idx">02</span>&nbsp;&nbsp;<span className="lbl">Manifesto</span></div>
            <p className="manifesto" id="sig-manifesto" data-r>{manifesto}</p>
          </section>
        )}

        {/* 03 Sayılar */}
        {profile.showStatsSection && stats.length > 0 && (
          <section className="act-3 frame">
            <div data-r><span className="idx">03</span>&nbsp;&nbsp;<span className="lbl">Rakamlarla</span></div>
            <div className="bignums" data-r id="sig-nums">
              {stats.slice(0, 4).map((s, i) => {
                const n = splitNum(s.value)
                return (
                  <div className="bn" data-n={['α', 'β', 'γ', 'δ'][i]} key={i}>
                    <div className="v" data-cnt={n.dec ? n.num.toFixed(1) : String(n.num)} data-suf={n.suf}>0</div>
                    <div className="k">{s.label}</div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 04 İşler */}
        {profile.showProjectsSection && projects.length > 0 && (
          <section className="act-4 frame">
            <div data-r style={{ marginBottom: 28 }}><span className="idx">04</span>&nbsp;&nbsp;<span className="lbl">Seçili İşler</span></div>
            {projects.map((p, i) => (
              <div className="work" data-r key={i}>
                <span className="w-line" />
                <div className="w-top"><span className="w-idx">{['①', '②', '③', '④', '⑤', '⑥'][i] || `0${i + 1}`}</span><h3>{p.title}</h3></div>
                {p.category && <div className="w-cat">{p.category}</div>}
                {p.desc && <p className="w-desc">{p.desc}</p>}
                <span className="w-arrow">→</span>
              </div>
            ))}
          </section>
        )}

        {/* 05 Söz */}
        {profile.showTestimonialsSection && testimonials.length > 0 && q && (
          <section className="act-5 frame">
            <div data-r><span className="idx">05</span>&nbsp;&nbsp;<span className="lbl">Dedikleri</span></div>
            <blockquote className="colossal-quote" data-r>{q.quote}</blockquote>
            <div className="q-who" data-r><b>{q.name}</b>{q.company ? ` — ${q.company}` : q.role ? ` — ${q.role}` : ''}</div>
            {testimonials.length > 1 && (
              <div className="q-nav" data-r>
                {testimonials.map((_, i) => (
                  <button key={i} className={`q-dot${i === qi ? ' on' : ''}`} onClick={() => setQi(i)} aria-label={`Yorum ${i + 1}`} />
                ))}
              </div>
            )}
          </section>
        )}

        {/* 06 Temas */}
        <section className="act-6">
          <a className="contact-giant" href={vcardUrl} onClick={() => onClick('vcard')}>
            <div className="cg-lbl">Bir sonraki büyük işin için</div>
            <div className="cg-main">KONUŞA<span className="flip">LIM</span></div>
            <span className="cg-under" />
          </a>
          <div className="frame">
            <div className="channels" data-r>
              {channels.map(c => (
                <a key={c.key} className={`chan${c.solid ? ' solid' : ''}`} href={c.href}
                  {...(c.ext ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  {...(c.download ? { download: '' } : {})}
                  onClick={() => onClick(c.label)}>
                  {c.icon}{c.label}
                </a>
              ))}
            </div>

            {profile.showQrSection && (
              <div className="qr-zone" data-r>
                <div className="qr-frame" onClick={async () => { try { await navigator.clipboard.writeText(profileUrl) } catch {} toast('Link kopyalandı ✓') }}>
                  <img src={qrSrc} alt={`QR — ${profileUrl}`} loading="lazy" />
                </div>
                <div className="qr-cap">Dokun & Kopyala</div>
              </div>
            )}
          </div>
        </section>

        <footer className="endmark frame">
          <div className="e-sig">{line1} <b>{line2}</b></div>
          <div className="e-sub">Q·Kart Signature</div>
          {socials.length > 0 && (
            <div className="socrow">
              {socials.map(s => (
                <a key={s.id} href={s.url.startsWith('http') ? s.url : `https://${s.url}`} target="_blank" rel="noopener noreferrer" aria-label={s.platform} onClick={() => onClick(s.platform)}>
                  {SOCIAL_ICON[s.platform.toUpperCase()] || ICON.WEBSITE}
                </a>
              ))}
            </div>
          )}
        </footer>
      </main>

      <div className={`sig-toast${toastMsg ? ' show' : ''}`}>{toastMsg}</div>
    </div>
  )
}
