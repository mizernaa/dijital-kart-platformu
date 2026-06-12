'use client'
import { useEffect, useRef, useState } from 'react'
import { trackEvent } from '@/lib/api'
import { getPalette, resolveAccent, accentInk, hexToRgb } from '@/lib/themes'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const PUBLIC_SITE = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'http://localhost:3002'

interface ContactItem { id: string; type: string; value: string; label: string | null; order: number }
interface SocialLink { id: string; platform: string; url: string; order: number }
interface SigProfile {
  slug: string; displayName: string; title: string | null; bio: string | null
  tagline: string | null; location: string | null; available: boolean
  tickerText: string | null
  avatarUrl: string | null; calendarUrl: string | null
  theme: string; accentColor: string | null; fontFamily: string
  buttonStyle: string; profileShape: string
  companyName: string | null; companyLogoUrl: string | null; companyDescription: string | null
  companyWebsite: string | null; companyIndustry: string | null
  companyPhone?: string | null; companyEmail?: string | null; companyAddress?: string | null; companySocials?: string | null
  showCompanySection: boolean
  cvSkills: string | null; cvLanguages: string | null; showCvSection: boolean
  stats: string | null; services: string | null; projects: string | null; testimonials: string | null
  experience: string | null; education: string | null
  showStatsSection: boolean; showServicesSection: boolean; showProjectsSection: boolean
  showTestimonialsSection: boolean; showCareerSection: boolean; showQrSection: boolean; showContactForm: boolean
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
function contactLabel(type: string, label: string | null) {
  if (label) return label
  return ({ PHONE: 'Ara', EMAIL: 'E-posta', WHATSAPP: 'WhatsApp', TELEGRAM: 'Telegram',
            WEBSITE: 'Web', CUSTOM: 'Link' } as Record<string, string>)[type.toUpperCase()] || type
}

const ICON: Record<string, JSX.Element> = {
  PHONE: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>,
  EMAIL: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" /></svg>,
  WHATSAPP: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.821 11.821 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 0 0 1.51 5.26l-.999 3.648 3.978-1.207z" /></svg>,
  WEBSITE: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10 15 15 0 0 1-4-10 15 15 0 0 1 4-10z" /></svg>,
  TELEGRAM: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg>,
  CALENDAR: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>,
  VCARD: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>,
  CUSTOM: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>,
  PIN: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>,
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
  TIKTOK: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>,
  SPOTIFY: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>,
  SOUNDCLOUD: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c0-.057-.045-.1-.09-.1m-.899.828c-.06 0-.091.037-.104.094L0 14.479l.165 1.308c0 .055.045.094.09.094s.089-.045.104-.104l.21-1.319-.21-1.334c0-.061-.044-.09-.09-.09m1.83-1.229c-.061 0-.12.045-.12.104l-.21 2.563.225 2.458c0 .06.045.12.119.12.061 0 .105-.061.121-.12l.254-2.474-.254-2.548c-.016-.06-.061-.12-.135-.12m.945-.089c-.075 0-.135.06-.15.135l-.193 2.64.21 2.544c.016.077.075.138.149.138.075 0 .135-.061.15-.15l.24-2.532-.24-2.623c0-.075-.06-.135-.135-.135l-.031-.017zm1.155.36c-.005-.09-.075-.149-.159-.149-.09 0-.158.06-.164.149l-.217 2.43.2 2.563c0 .09.075.157.159.157.074 0 .148-.068.148-.158l.227-2.563-.227-2.444.033.015zm.809-1.709c-.101 0-.18.09-.18.181l-.21 3.957.187 2.563c0 .09.08.164.18.164.094 0 .174-.09.18-.18l.209-2.563-.209-3.972c-.008-.104-.088-.18-.18-.18m.959-.914c-.105 0-.195.09-.203.194l-.18 4.872.165 2.548c0 .12.09.209.195.209.104 0 .194-.089.21-.209l.193-2.548-.192-4.856c-.016-.12-.105-.21-.21-.21m.989-.449c-.121 0-.211.089-.225.209l-.165 5.275.165 2.52c.014.119.104.225.225.225.119 0 .225-.105.225-.225l.195-2.52-.196-5.275c0-.12-.105-.225-.225-.225m1.245.045c0-.135-.105-.24-.24-.24-.119 0-.24.105-.24.24l-.149 5.441.149 2.503c.016.135.121.24.256.24s.24-.105.24-.24l.164-2.503-.164-5.456-.016.015zm.749-.134c-.135 0-.255.119-.255.254l-.15 5.322.15 2.473c0 .15.12.255.255.255s.255-.105.255-.255l.15-2.473-.165-5.307c0-.148-.12-.255-.24-.255m1.005.166c-.164 0-.284.135-.284.285l-.103 5.143.135 2.474c0 .149.119.277.284.277.149 0 .271-.128.284-.277l.121-2.474-.121-5.158c-.013-.149-.135-.27-.284-.27m1.184-.945c-.045-.029-.105-.044-.165-.044s-.119.015-.165.044c-.09.054-.149.15-.149.255v.061l-.104 6.048.115 2.449v.008c.008.06.03.135.074.18.06.075.15.12.24.12.074 0 .149-.03.209-.09.06-.06.091-.135.091-.225l.015-.24.117-2.203-.135-6.086c0-.104-.061-.193-.135-.247l-.008-.03zm1.006-.547c-.045-.045-.09-.061-.15-.061-.074 0-.149.016-.209.061-.075.06-.119.15-.119.24v.029l-.137 6.609.075 1.215.061 1.185c0 .164.148.314.328.314.181 0 .33-.15.33-.329l.15-2.414-.15-6.637c0-.12-.074-.221-.165-.277l-.014.065zm8.934 3.777c-.405 0-.795.086-1.139.232-.24-2.654-2.46-4.736-5.188-4.736-.659 0-1.305.135-1.889.359-.225.09-.27.18-.285.359v9.368c.016.18.15.33.33.345h8.185C22.681 17.218 24 15.914 24 14.28s-1.319-2.952-2.938-2.952" /></svg>,
}

/* Dinamik bölüm numaralandırma için yardımcı */
function two(n: number) { return String(n).padStart(2, '0') }

/* Bölüm başlığı: büyük hayalet numara + altın etiket + uzayan çizgi */
function SecHead({ n, label, mb = 0 }: { n: string; label: string; mb?: number }) {
  return (
    <div className="sec-mark" data-r style={mb ? { marginBottom: mb } : undefined}>
      <span className="sec-mark-no" aria-hidden="true">{n}</span>
      <span className="sec-mark-lbl">{label}</span>
      <span className="sec-mark-line" aria-hidden="true" />
    </div>
  )
}

export function SignatureView({ profile, slug, source }: { profile: SigProfile; slug: string; source?: string }) {
  const root = useRef<HTMLDivElement>(null)
  const [toastMsg, setToastMsg] = useState('')
  const toastT = useRef<any>(null)

  /* ── Tasarım ayarları: tema paleti + vurgu + font + şekiller ── */
  const pal = getPalette(profile.theme)
  const accent = resolveAccent(pal, profile.accentColor)
  const [ar, ag, ab] = hexToRgb(accent)
  const bodyFont = `'${profile.fontFamily || 'Manrope'}', system-ui, sans-serif`
  const avatarRadius = profile.profileShape === 'SQUARE' ? '18px' : profile.profileShape === 'HEXAGON' ? '0px' : '50%'
  const avatarClip = profile.profileShape === 'HEXAGON' ? 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' : 'none'
  const btnRadius = profile.buttonStyle === 'PILL' ? '999px' : profile.buttonStyle === 'SQUARE' ? '4px' : '14px'

  const stats = parseJ<{ value: string; label: string }[]>(profile.stats, [])
  const services = parseJ<{ icon?: string; title: string; desc?: string }[]>(profile.services, [])
  const projects = parseJ<{ title: string; category?: string; desc?: string; tags?: string | string[] }[]>(profile.projects, [])
  const testimonials = parseJ<{ quote: string; name: string; role?: string; company?: string }[]>(profile.testimonials, [])
  const skills = parseJ<string[]>(profile.cvSkills, [])
  const languages = parseJ<string[]>(profile.cvLanguages, [])
  const experience = parseJ<{ year: string; role: string; company?: string; desc?: string }[]>(profile.experience, [])
  const education = parseJ<{ year: string; degree: string; school?: string }[]>(profile.education, [])
  const companySocials = parseJ<{ platform: string; url: string }[]>(profile.companySocials || null, [])

  const nameParts = (profile.displayName || '').trim().split(/\s+/).filter(Boolean)
  const line1 = nameParts[0] || profile.displayName || ''
  const line2 = nameParts.slice(1).join(' ')

  // Kullanıcının kendi şerit metni öncelikli; yoksa hizmetler → beceriler → varsayılan
  const customTicker = (profile.tickerText || '').split(',').map(s => s.trim()).filter(Boolean)
  const tickerItems = customTicker.length > 0 ? customTicker
    : (services.length ? services.map(s => s.title) : skills.length ? skills : ['Dijital Kimlik', 'NFC', 'QR Kart'])
  const manifesto = profile.tagline || profile.bio || ''
  // Tagline manifesto olduysa bio'yu açılışta göster; ikisi de ayrı yaşasın
  const introBio = profile.tagline ? profile.bio : null
  const vcardUrl = `${API}/p/${slug}/vcard`
  const profileUrl = `${PUBLIC_SITE}/u/${slug}`
  const qrBg = pal.bg.replace('#', '')
  const qrFg = pal.dark ? 'ffffff' : '111111'
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&bgcolor=${qrBg}&color=${qrFg}&data=${encodeURIComponent(profileUrl)}`

  const [qi, setQi] = useState(0)
  const [leadForm, setLeadForm] = useState({ name: '', email: '', message: '' })
  const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  /* ── Bölüm numaraları: yalnızca görünen bölümler sayılır ── */
  const hasManifesto = !!manifesto
  const hasStats = profile.showStatsSection && stats.length > 0
  const hasServices = profile.showServicesSection && services.length > 0
  const hasProjects = profile.showProjectsSection && projects.length > 0
  const hasTesti = profile.showTestimonialsSection && testimonials.length > 0
  const hasCareer = profile.showCareerSection && (experience.length > 0 || education.length > 0)
  const hasSkills = profile.showCvSection && (skills.length > 0 || languages.length > 0)
  const hasCompany = profile.showCompanySection && !!profile.companyName
  let secNo = 1
  const num = () => two(++secNo)

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

    // Kariyer zaman çizgisi çizimi
    const tl = $('.sig-tl-line')
    if (tl) {
      const tlObs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) {
          tl.style.transition = 'transform 1.2s cubic-bezier(.16,1,.3,1)'
          tl.style.transform = 'scaleY(1)'
          el.querySelectorAll('.sig-tl-dot').forEach((d, i) => setTimeout(() => d.classList.add('on'), 200 + i * 160))
          tlObs.disconnect()
        }
      }, { threshold: .15 })
      tlObs.observe(tl.parentElement!)
      cleanups.push(() => tlObs.disconnect())
    }

    return () => cleanups.forEach(fn => fn())
  }, [ar, ag, ab])

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

  /* ── İletişim kanalları: rehber + TÜM iletişim satırları + takvim ── */
  const channels: { key: string; href: string; label: string; icon: JSX.Element; solid?: boolean; download?: boolean; ext?: boolean }[] = []
  channels.push({ key: 'vcard', href: vcardUrl, label: 'Rehbere Kaydet', icon: ICON.VCARD, solid: true, download: true })
  profile.contacts.slice().sort((a, b) => a.order - b.order).forEach(c => {
    const t = c.type.toUpperCase()
    channels.push({
      key: c.id, href: contactHref(c.type, c.value), label: contactLabel(c.type, c.label),
      icon: ICON[t] || ICON.CUSTOM, ext: !['PHONE', 'EMAIL'].includes(t),
    })
  })
  // WhatsApp iletişim satırı yoksa şahsi telefondan otomatik türet —
  // tıklanınca doğrudan WhatsApp sohbeti açılır.
  const hasWa = profile.contacts.some(c => c.type.toUpperCase() === 'WHATSAPP')
  const phoneContact = profile.contacts.find(c => c.type.toUpperCase() === 'PHONE')
  if (!hasWa && phoneContact) {
    channels.push({
      key: 'wa-auto',
      href: `https://wa.me/${phoneContact.value.replace(/\D/g, '').replace(/^0/, '90')}`,
      label: 'WhatsApp', icon: ICON.WHATSAPP, ext: true,
    })
  }
  if (profile.calendarUrl) channels.push({ key: 'cal', href: profile.calendarUrl, label: 'Toplantı Ayarla', icon: ICON.CALENDAR, ext: true })

  const socials = (profile.socials || []).slice().sort((a, b) => a.order - b.order)
  const q = testimonials[qi]

  const rootVars = {
    '--bg': pal.bg, '--bg-2': pal.bg2, '--ink': pal.text, '--mut': pal.muted, '--dim': pal.faint,
    '--gold': accent, '--gold-2': shadeHex(accent, -0.25), '--gold-soft': `rgba(${ar},${ag},${ab},.16)`,
    '--gold-ink': accentInk(accent),
    '--sig-line': pal.line, '--sig-btn-r': btnRadius,
    '--sig-av-r': avatarRadius, '--sig-av-clip': avatarClip,
    fontFamily: bodyFont,
  } as React.CSSProperties

  return (
    <div className={`sig-root${pal.dark ? '' : ' sig-light'}`} ref={root} style={rootVars}>
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
          {(profile.avatarUrl || profile.available) && (
            <div className="sig-avatar-wrap">
              {profile.avatarUrl && (
                <img className="sig-avatar" src={profile.avatarUrl.startsWith('http') ? profile.avatarUrl : `${API}${profile.avatarUrl}`}
                     alt={profile.displayName} loading="lazy" />
              )}
            </div>
          )}
          {profile.title && <div className="lbl" style={{ marginBottom: 26 }}>{profile.title}</div>}
          <h1 className="giant-name">
            <span className="row"><span>{line1}</span></span>
            {line2 && <span className="row"><span>{line2}</span></span>}
          </h1>
          <div className="act1-meta">
            {(introBio || profile.companyName) && (
              <p className="who">
                {profile.companyName && <b>{profile.companyName}</b>}
                {profile.companyName && profile.companyIndustry && <span className="who-ind"> — {profile.companyIndustry}</span>}
                {profile.companyName && introBio ? ' · ' : ''}
                {introBio}
              </p>
            )}
            <div className="coords">
              {profile.location && <>{profile.location.toUpperCase()}<br /></>}
              {profile.available && <span className="live">YENİ PROJELERE AÇIK</span>}
            </div>
          </div>
          <div className="scrollcue">KAYDIR</div>
        </section>

        {/* Şerit */}
        {tickerItems.length > 0 && (
          <div className="ticker" data-r>
            <div className="ticker-track" id="sig-ticker">
              {tickerItems.map((t, i) => <span key={i} className={`t${i % 2 ? ' solid' : ''}`}>{t}</span>)}
            </div>
          </div>
        )}

        {/* Manifesto */}
        {hasManifesto && (
          <section className="act-2 frame">
            <SecHead n={num()} label="Manifesto" />
            <p className="manifesto" id="sig-manifesto" data-r>{manifesto}</p>
          </section>
        )}

        {/* Sayılar */}
        {hasStats && (
          <section className="act-3 frame">
            <SecHead n={num()} label="Rakamlarla" />
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

        {/* Hizmetler */}
        {hasServices && (
          <section className="act-svc frame">
            <SecHead n={num()} label="Hizmetler" mb={28} />
            <div className="svc-grid">
              {services.map((s, i) => (
                <div className="svc-card" data-r key={i}>
                  <div className="svc-top">
                    {s.icon && <span className="svc-glyph">{s.icon}</span>}
                    <span className="svc-no">{two(i + 1)}</span>
                  </div>
                  <h3 className="svc-name">{s.title}</h3>
                  {s.desc && <p className="svc-text">{s.desc}</p>}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* İşler */}
        {hasProjects && (
          <section className="act-4 frame">
            <SecHead n={num()} label="Seçili İşler" mb={28} />
            {projects.map((p, i) => (
              <div className="work" data-r key={i}>
                <span className="w-line" />
                <div className="w-top"><span className="w-idx">{['①', '②', '③', '④', '⑤', '⑥'][i] || `0${i + 1}`}</span><h3>{p.title}</h3></div>
                {p.category && <div className="w-cat">{p.category}</div>}
                {p.desc && <p className="w-desc">{p.desc}</p>}
                {p.tags && (
                  <div className="w-tags">
                    {(Array.isArray(p.tags) ? p.tags : String(p.tags).split(',')).map(t => t.trim()).filter(Boolean).map((t, j) => (
                      <span key={j} className="w-tag">{t}</span>
                    ))}
                  </div>
                )}
                <span className="w-arrow">→</span>
              </div>
            ))}
          </section>
        )}

        {/* Söz */}
        {hasTesti && q && (
          <section className="act-5 frame">
            <SecHead n={num()} label="Dedikleri" />
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

        {/* Kariyer & Eğitim */}
        {hasCareer && (
          <section className="act-career frame">
            <SecHead n={num()} label="Yolculuk" mb={30} />
            {experience.length > 0 && (
              <div className="sig-timeline" data-r>
                <div className="sig-tl-line" />
                {experience.map((e, i) => (
                  <div className="sig-tl-item" key={i}>
                    <span className="sig-tl-dot" />
                    <div className="sig-tl-year">{e.year}</div>
                    <div className="sig-tl-role">{e.role}{e.company && <span className="sig-tl-co"> · {e.company}</span>}</div>
                    {e.desc && <p className="sig-tl-desc">{e.desc}</p>}
                  </div>
                ))}
              </div>
            )}
            {education.length > 0 && (
              <div className="sig-edu" data-r>
                <div className="sig-edu-head">EĞİTİM</div>
                {education.map((e, i) => (
                  <div className="sig-edu-row" key={i}>
                    <span className="sig-edu-year">{e.year}</span>
                    <span className="sig-edu-deg">{e.degree}</span>
                    {e.school && <span className="sig-edu-school">{e.school}</span>}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Beceriler & Diller */}
        {hasSkills && (
          <section className="act-skills frame">
            <SecHead n={num()} label="Beceriler" mb={28} />
            {skills.length > 0 && (
              <div className="sig-pills" data-r>
                {skills.map((s, i) => <span key={i} className="sig-pill">{s}</span>)}
              </div>
            )}
            {languages.length > 0 && (
              <div className="sig-langs" data-r>
                <span className="sig-lang-head">DİLLER —</span>
                {languages.map((l, i) => <span key={i} className="sig-lang">{l}</span>)}
              </div>
            )}
          </section>
        )}

        {/* Şirket */}
        {hasCompany && (
          <section className="act-company frame">
            <SecHead n={num()} label="Şirket" mb={28} />
            <div className="sig-co" data-r>
              <div className="sig-co-head">
                {profile.companyLogoUrl && (
                  <img className="sig-co-logo"
                       src={profile.companyLogoUrl.startsWith('http') ? profile.companyLogoUrl : `${API}${profile.companyLogoUrl}`}
                       alt={`${profile.companyName} logosu`} loading="lazy" />
                )}
                <div>
                  <h3 className="sig-co-name">{profile.companyName}</h3>
                  {profile.companyIndustry && <div className="sig-co-ind">{profile.companyIndustry}</div>}
                </div>
              </div>
              {profile.companyDescription && <p className="sig-co-desc">{profile.companyDescription}</p>}
              {(profile.companyPhone || profile.companyEmail || profile.companyAddress) && (
                <div className="sig-co-contact">
                  {profile.companyPhone && (
                    <a href={`tel:${profile.companyPhone.replace(/\s/g, '')}`} onClick={() => onClick('Şirket Tel')}>
                      {ICON.PHONE}<span>{profile.companyPhone}</span>
                    </a>
                  )}
                  {profile.companyEmail && (
                    <a href={`mailto:${profile.companyEmail}`} onClick={() => onClick('Şirket E-posta')}>
                      {ICON.EMAIL}<span>{profile.companyEmail}</span>
                    </a>
                  )}
                  {profile.companyAddress && (
                    <a href={`https://maps.google.com/?q=${encodeURIComponent(profile.companyAddress)}`} target="_blank" rel="noopener noreferrer" onClick={() => onClick('Şirket Adres')}>
                      {ICON.PIN}<span>{profile.companyAddress}</span>
                    </a>
                  )}
                </div>
              )}
              {(companySocials.length > 0 || profile.companyWebsite) && (
                <div className="sig-co-links">
                  {profile.companyWebsite && (
                    <a className="sig-co-pill solid" href={profile.companyWebsite} target="_blank" rel="noopener noreferrer" onClick={() => onClick('Şirket Web')}>
                      Web Sitesi ↗
                    </a>
                  )}
                  {companySocials.filter(s => s?.url).map((s, i) => (
                    <a key={i} className="sig-co-pill" href={s.url} target="_blank" rel="noopener noreferrer" onClick={() => onClick(`Şirket ${s.platform}`)}>
                      {s.platform}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Sosyal Medya — öne çıkan büyük kartlar */}
        {socials.length > 0 && (
          <section className="act-social frame">
            <SecHead n={num()} label="Sosyal Medya" mb={28} />
            <div className="soc-grid" data-r>
              {socials.map(s => (
                <a key={s.id} className="soc-card" href={s.url.startsWith('http') ? s.url : `https://${s.url}`}
                   target="_blank" rel="noopener noreferrer" onClick={() => onClick(s.platform)}>
                  <span className="soc-ic">{SOCIAL_ICON[s.platform.toUpperCase()] || ICON.WEBSITE}</span>
                  <span className="soc-name">{s.platform.charAt(0) + s.platform.slice(1).toLowerCase()}</span>
                  <span className="soc-arrow" aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Temas */}
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

        {/* Bana Yaz */}
        {profile.showContactForm && (
          <section className="act-form frame">
            <SecHead n={two(secNo + 1)} label="Bana Yaz" mb={30} />
            {leadStatus === 'sent' ? (
              <div className="sig-form-ok" data-r>
                <div className="sig-form-ok-mark">✓</div>
                <div className="sig-form-ok-msg">Mesajın iletildi.</div>
                <div className="sig-form-ok-sub">En kısa sürede dönüş yapılacak.</div>
              </div>
            ) : (
              <form className="sig-form" data-r onSubmit={submitLead}>
                <div className="sf-row">
                  <input type="text" required placeholder="Ad Soyad *" autoComplete="name"
                         value={leadForm.name} onChange={e => setLeadForm(f => ({ ...f, name: e.target.value }))} />
                  <input type="email" placeholder="E-posta" autoComplete="email" inputMode="email"
                         value={leadForm.email} onChange={e => setLeadForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <textarea required placeholder="Mesajın *" rows={4}
                          value={leadForm.message} onChange={e => setLeadForm(f => ({ ...f, message: e.target.value }))} />
                {leadStatus === 'error' && <p className="sf-err">Bir hata oluştu, lütfen tekrar deneyin.</p>}
                <button type="submit" className="sf-send" disabled={leadStatus === 'sending'}>
                  {leadStatus === 'sending' ? 'GÖNDERİLİYOR…' : 'GÖNDER →'}
                </button>
              </form>
            )}
          </section>
        )}

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

/* Vurgu renginden koyu ton üretir (gold-2) */
function shadeHex(h: string, p: number) {
  const [r, g, b] = hexToRgb(h)
  const f = 1 + p
  const c = (x: number) => Math.max(0, Math.min(255, Math.round(x * f)))
  return '#' + [c(r), c(g), c(b)].map(x => x.toString(16).padStart(2, '0')).join('')
}
