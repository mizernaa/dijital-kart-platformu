'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  Phone, Mail, MessageCircle, Send, Globe, Instagram,
  Linkedin, Twitter, Youtube, Github, Facebook, Music,
  Download, CheckCircle, ChevronDown,
} from 'lucide-react'
import { clsx } from 'clsx'
import { trackEvent } from '@/lib/api'

interface ContactItem { id: string; type: string; value: string; label: string | null; order: number }
interface SocialLink { id: string; platform: string; url: string; order: number }
interface Profile {
  slug: string; displayName: string; title: string | null; bio: string | null; avatarUrl: string | null
  theme: string; bgColor: string; fontFamily: string; buttonStyle: string; profileShape: string
  companyName: string | null; companyLogoUrl: string | null; companyDescription: string | null
  companyWebsite: string | null; companyIndustry: string | null; showCompanySection: boolean
  cvSkills: string | null; cvLanguages: string | null; showCvSection: boolean
  contacts: ContactItem[]; socials: SocialLink[]
}

// ── Tema sistemi ───────────────────────────────────────────────────────────────
const PALETTES: Record<string, {
  heroFrom: string; heroTo: string; heroText: string; heroSub: string
  cardBg: string; cardText: string; cardSub: string; cardBorder: string
  accent: string; accentSoft: string; buttonBg: string; buttonText: string
  sectionBg: string; divider: string; skillBg: string; skillText: string
  langBg: string; langText: string; orbColor: string
}> = {
  minimal: {
    heroFrom: '#1e293b', heroTo: '#0f172a', heroText: '#f8fafc', heroSub: '#94a3b8',
    cardBg: '#ffffff', cardText: '#111827', cardSub: '#6b7280', cardBorder: '#e5e7eb',
    accent: '#3b82f6', accentSoft: '#eff6ff', buttonBg: '#111827', buttonText: '#ffffff',
    sectionBg: '#f9fafb', divider: '#f3f4f6', skillBg: '#eff6ff', skillText: '#1d4ed8',
    langBg: '#f5f3ff', langText: '#6d28d9', orbColor: 'rgba(59,130,246,0.15)',
  },
  ocean: {
    heroFrom: '#1e3a8a', heroTo: '#0c1461', heroText: '#e0f2fe', heroSub: '#93c5fd',
    cardBg: '#ffffff', cardText: '#1e3a8a', cardSub: '#3b82f6', cardBorder: '#bfdbfe',
    accent: '#1d4ed8', accentSoft: '#dbeafe', buttonBg: '#1d4ed8', buttonText: '#ffffff',
    sectionBg: '#eff6ff', divider: '#dbeafe', skillBg: '#dbeafe', skillText: '#1e40af',
    langBg: '#f0f9ff', langText: '#0369a1', orbColor: 'rgba(29,78,216,0.25)',
  },
  forest: {
    heroFrom: '#14532d', heroTo: '#052e16', heroText: '#dcfce7', heroSub: '#86efac',
    cardBg: '#ffffff', cardText: '#14532d', cardSub: '#16a34a', cardBorder: '#bbf7d0',
    accent: '#15803d', accentSoft: '#dcfce7', buttonBg: '#15803d', buttonText: '#ffffff',
    sectionBg: '#f0fdf4', divider: '#dcfce7', skillBg: '#dcfce7', skillText: '#15803d',
    langBg: '#f0fdf4', langText: '#166534', orbColor: 'rgba(21,128,61,0.25)',
  },
  sunset: {
    heroFrom: '#7c2d12', heroTo: '#431407', heroText: '#fff7ed', heroSub: '#fcd34d',
    cardBg: '#ffffff', cardText: '#7c2d12', cardSub: '#ea580c', cardBorder: '#fed7aa',
    accent: '#c2410c', accentSoft: '#fff7ed', buttonBg: '#c2410c', buttonText: '#ffffff',
    sectionBg: '#fff7ed', divider: '#ffedd5', skillBg: '#ffedd5', skillText: '#c2410c',
    langBg: '#fff7ed', langText: '#b45309', orbColor: 'rgba(194,65,12,0.25)',
  },
  dark: {
    heroFrom: '#111827', heroTo: '#030712', heroText: '#f9fafb', heroSub: '#9ca3af',
    cardBg: '#1f2937', cardText: '#f9fafb', cardSub: '#9ca3af', cardBorder: 'rgba(255,255,255,0.08)',
    accent: '#818cf8', accentSoft: 'rgba(129,140,248,0.15)', buttonBg: '#ffffff', buttonText: '#111827',
    sectionBg: 'rgba(255,255,255,0.04)', divider: 'rgba(255,255,255,0.08)', skillBg: 'rgba(129,140,248,0.15)', skillText: '#a5b4fc',
    langBg: 'rgba(255,255,255,0.07)', langText: '#c4b5fd', orbColor: 'rgba(129,140,248,0.2)',
  },
  purple: {
    heroFrom: '#4c1d95', heroTo: '#2e1065', heroText: '#f5f3ff', heroSub: '#c4b5fd',
    cardBg: '#ffffff', cardText: '#4c1d95', cardSub: '#7c3aed', cardBorder: '#ddd6fe',
    accent: '#7e22ce', accentSoft: '#f5f3ff', buttonBg: '#7e22ce', buttonText: '#ffffff',
    sectionBg: '#faf5ff', divider: '#ede9fe', skillBg: '#ede9fe', skillText: '#7e22ce',
    langBg: '#faf5ff', langText: '#6d28d9', orbColor: 'rgba(126,34,206,0.25)',
  },
}

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  INSTAGRAM: <Instagram size={18} />, LINKEDIN: <Linkedin size={18} />, TWITTER: <Twitter size={18} />,
  YOUTUBE: <Youtube size={18} />, FACEBOOK: <Facebook size={18} />, GITHUB: <Github size={18} />,
  SPOTIFY: <Music size={18} />, SOUNDCLOUD: <Music size={18} />,
}
const SOCIAL_LABELS: Record<string, string> = {
  INSTAGRAM: 'Instagram', LINKEDIN: 'LinkedIn', TWITTER: 'Twitter / X', YOUTUBE: 'YouTube',
  FACEBOOK: 'Facebook', GITHUB: 'GitHub', SPOTIFY: 'Spotify', SOUNDCLOUD: 'SoundCloud',
  TIKTOK: 'TikTok', BEHANCE: 'Behance', DRIBBBLE: 'Dribbble', CUSTOM: 'Link',
}

function getContactHref(type: string, value: string) {
  switch (type) {
    case 'PHONE': return `tel:${value}`
    case 'EMAIL': return `mailto:${value}`
    case 'WHATSAPP': return `https://wa.me/${value.replace(/\D/g, '')}`
    case 'TELEGRAM': return `https://t.me/${value.replace('@', '')}`
    case 'WEBSITE': return value.startsWith('http') ? value : `https://${value}`
    default: return value
  }
}
function getContactIcon(type: string) {
  const m: Record<string, React.ReactNode> = {
    PHONE: <Phone size={17} />, EMAIL: <Mail size={17} />, WHATSAPP: <MessageCircle size={17} />,
    TELEGRAM: <Send size={17} />, WEBSITE: <Globe size={17} />,
  }
  return m[type] ?? <Globe size={17} />
}
function getContactLabel(type: string, label: string | null) {
  if (label) return label
  return { PHONE: 'Ara', EMAIL: 'E-posta', WHATSAPP: 'WhatsApp', TELEGRAM: 'Telegram', WEBSITE: 'Web Sitesi' }[type] || type
}
function getBtnRadius(s: string) {
  return s === 'PILL' ? '9999px' : s === 'SQUARE' ? '4px' : '14px'
}
function getAvatarStyle(shape: string, accent: string): React.CSSProperties {
  const base: React.CSSProperties = { border: `3px solid ${accent}50`, boxShadow: `0 0 0 6px ${accent}25, 0 16px 40px rgba(0,0,0,0.3)` }
  if (shape === 'CIRCLE') return { ...base, borderRadius: '9999px' }
  if (shape === 'SQUARE') return { ...base, borderRadius: '20px' }
  return { ...base, clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)', borderRadius: '0' }
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// ── Component ──────────────────────────────────────────────────────────────────
export function ProfileView({ profile, slug, source }: { profile: Profile; slug: string; source?: string }) {
  const [leadForm, setLeadForm] = useState({ name: '', email: '', message: '' })
  const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [cardVisible, setCardVisible] = useState(false)

  useEffect(() => {
    trackEvent(slug, { eventType: 'PAGE_VIEW', source: source || 'direct' })
    const t = setTimeout(() => setCardVisible(true), 80)
    return () => clearTimeout(t)
  }, [slug, source])

  const pal = PALETTES[profile.theme] ?? PALETTES.minimal
  const btnR = getBtnRadius(profile.buttonStyle)

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

  return (
    <div className="min-h-screen" style={{ background: pal.heroFrom, fontFamily: profile.fontFamily }}>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden pb-20 pt-12 px-6 text-center"
        style={{ background: `linear-gradient(160deg, ${pal.heroFrom} 0%, ${pal.heroTo} 100%)` }}
      >
        {/* Orb dekorasyon */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-20 pointer-events-none"
          style={{ background: pal.orbColor, filter: 'blur(60px)', transform: 'translate(30%,-30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full opacity-15 pointer-events-none"
          style={{ background: pal.orbColor, filter: 'blur(50px)', transform: 'translate(-30%,30%)' }} />

        {/* Avatar */}
        <div className="relative inline-block mb-5 profile-in">
          {profile.avatarUrl ? (
            <div className="w-28 h-28 overflow-hidden" style={getAvatarStyle(profile.profileShape, pal.accent)}>
              <Image src={`${API}${profile.avatarUrl}`} alt={profile.displayName} width={112} height={112} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div
              className="w-28 h-28 flex items-center justify-center text-4xl font-black"
              style={{ ...getAvatarStyle(profile.profileShape, pal.accent), background: `linear-gradient(135deg, ${pal.accent}40, ${pal.accent}70)`, color: '#fff' }}
            >
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          {/* Animated accent ring */}
          <div className="avatar-ring absolute -inset-2 rounded-full pointer-events-none"
            style={{
              borderRadius: profile.profileShape === 'CIRCLE' ? '9999px' : profile.profileShape === 'SQUARE' ? '24px' : '0',
              clipPath: profile.profileShape === 'HEXAGON' ? 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' : undefined,
              boxShadow: `0 0 0 2px ${pal.accent}60`,
            }} />
        </div>

        {/* İsim & ünvan */}
        <div className="profile-header-in relative z-10">
          <h1 className="text-3xl font-black mb-1 tracking-tight" style={{ color: pal.heroText }}>{profile.displayName}</h1>
          {profile.title && (
            <p className="text-sm font-semibold mb-3 tracking-wide" style={{ color: pal.accent === '#f9fafb' ? '#a5b4fc' : pal.accent, opacity: 0.9 }}>
              {profile.title}
            </p>
          )}
          {profile.bio && (
            <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: pal.heroSub }}>{profile.bio}</p>
          )}
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 animate-bounce opacity-30">
          <ChevronDown size={20} style={{ color: pal.heroText }} />
        </div>
      </div>

      {/* ── CONTENT CARD ────────────────────────────────────────────── */}
      <div
        className="relative z-10 px-4 pb-10"
        style={{
          background: pal.cardBg,
          borderRadius: '28px 28px 0 0',
          marginTop: '-28px',
          minHeight: '60vh',
          transition: 'transform 0.5s cubic-bezier(0.16,1,0.3,1), opacity 0.5s ease',
          transform: cardVisible ? 'translateY(0)' : 'translateY(20px)',
          opacity: cardVisible ? 1 : 0,
        }}
      >
        <div className="max-w-sm mx-auto pt-6">

          {/* Handle bar */}
          <div className="w-10 h-1 rounded-full mx-auto mb-6 opacity-20" style={{ backgroundColor: pal.cardSub }} />

          {/* ── İletişim butonları ─────────────────────────────────── */}
          {profile.contacts.length > 0 && (
            <div className="space-y-3 mb-5">
              <p className="text-xs font-bold uppercase tracking-widest mb-3 text-center" style={{ color: pal.cardSub }}>İletişim</p>
              {profile.contacts.map((c, i) => (
                <a
                  key={c.id}
                  href={getContactHref(c.type, c.value)}
                  target={c.type === 'WEBSITE' ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  onClick={() => trackEvent(slug, { eventType: 'BUTTON_CLICK', buttonLabel: getContactLabel(c.type, c.label) })}
                  className="stagger-btn flex items-center gap-3.5 w-full px-5 py-3.5 font-semibold text-sm border-2 transition-all duration-200 group"
                  style={{
                    borderRadius: btnR, animationDelay: `${i * 70}ms`,
                    color: pal.cardText, borderColor: pal.cardBorder,
                    backgroundColor: profile.theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)',
                  }}
                  onMouseEnter={e => {
                    const t = e.currentTarget
                    t.style.borderColor = pal.accent
                    t.style.color = pal.accent
                    t.style.transform = 'translateY(-2px)'
                    t.style.boxShadow = `0 6px 20px ${pal.accent}22`
                    t.style.backgroundColor = pal.accentSoft
                  }}
                  onMouseLeave={e => {
                    const t = e.currentTarget
                    t.style.borderColor = pal.cardBorder
                    t.style.color = pal.cardText
                    t.style.transform = ''
                    t.style.boxShadow = ''
                    t.style.backgroundColor = profile.theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.8)'
                  }}
                >
                  <span style={{ color: pal.accent }}>{getContactIcon(c.type)}</span>
                  <span className="flex-1">{getContactLabel(c.type, c.label)}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: pal.accent }}>→</span>
                </a>
              ))}
            </div>
          )}

          {/* ── Rehbere Ekle ──────────────────────────────────────── */}
          <a
            href={`${API}/p/${slug}/vcard`}
            download={`${slug}.vcf`}
            onClick={() => trackEvent(slug, { eventType: 'VCARD_DOWNLOAD' })}
            className="flex items-center justify-center gap-3 w-full py-4 font-bold text-sm mb-7 transition-all duration-200"
            style={{
              borderRadius: btnR,
              background: `linear-gradient(135deg, ${pal.buttonBg}, ${pal.accent === pal.buttonBg ? pal.buttonBg + 'cc' : pal.buttonBg})`,
              color: pal.buttonText,
              boxShadow: `0 6px 24px ${pal.accent}45`,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-2px)'
              e.currentTarget.style.boxShadow = `0 10px 32px ${pal.accent}60`
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = ''
              e.currentTarget.style.boxShadow = `0 6px 24px ${pal.accent}45`
            }}
          >
            <Download size={17} />
            Rehbere Ekle
          </a>

          {/* ── Sosyal medya ──────────────────────────────────────── */}
          {profile.socials.length > 0 && (
            <div className="mb-7">
              <div className="w-full h-px mb-5" style={{ background: `linear-gradient(to right, transparent, ${pal.divider}, transparent)` }} />
              <p className="text-xs font-bold uppercase tracking-widest text-center mb-4" style={{ color: pal.cardSub }}>Sosyal Medya</p>
              <div className="grid grid-cols-4 gap-2.5">
                {profile.socials.map(s => (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer"
                    onClick={() => trackEvent(slug, { eventType: 'BUTTON_CLICK', buttonLabel: SOCIAL_LABELS[s.platform] || s.platform })}
                    className="flex flex-col items-center gap-1.5 py-3.5 rounded-2xl border-2 transition-all duration-200"
                    style={{ color: pal.cardText, borderColor: pal.cardBorder, background: profile.theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)' }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color = pal.accent
                      e.currentTarget.style.borderColor = `${pal.accent}50`
                      e.currentTarget.style.transform = 'scale(1.07) translateY(-1px)'
                      e.currentTarget.style.backgroundColor = pal.accentSoft
                      e.currentTarget.style.boxShadow = `0 4px 14px ${pal.accent}22`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color = pal.cardText
                      e.currentTarget.style.borderColor = pal.cardBorder
                      e.currentTarget.style.transform = ''
                      e.currentTarget.style.backgroundColor = profile.theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.7)'
                      e.currentTarget.style.boxShadow = ''
                    }}
                  >
                    {SOCIAL_ICONS[s.platform] || <Globe size={18} />}
                    <span className="text-[10px] font-semibold" style={{ color: pal.cardSub }}>
                      {SOCIAL_LABELS[s.platform]?.split('/')[0] || s.platform}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* ── Şirket bölümü ─────────────────────────────────────── */}
          {profile.showCompanySection && (profile.companyName || profile.companyDescription) && (
            <div className="mb-7">
              <div className="w-full h-px mb-5" style={{ background: `linear-gradient(to right, transparent, ${pal.divider}, transparent)` }} />
              <p className="text-xs font-bold uppercase tracking-widest text-center mb-4" style={{ color: pal.cardSub }}>Şirket</p>
              <div className="rounded-2xl border-2 p-5"
                style={{ backgroundColor: pal.sectionBg, borderColor: pal.cardBorder }}>
                <div className="flex items-center gap-3 mb-3">
                  {profile.companyLogoUrl && (
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: pal.cardBorder }}>
                      <img src={`${API}${profile.companyLogoUrl}`} alt={profile.companyName || ''} className="w-full h-full object-contain p-1" />
                    </div>
                  )}
                  <div>
                    {profile.companyName && <p className="font-bold text-sm" style={{ color: pal.cardText }}>{profile.companyName}</p>}
                    {profile.companyIndustry && <p className="text-xs mt-0.5 font-medium" style={{ color: pal.cardSub }}>{profile.companyIndustry}</p>}
                  </div>
                </div>
                {profile.companyDescription && <p className="text-sm leading-relaxed" style={{ color: pal.cardSub }}>{profile.companyDescription}</p>}
                {profile.companyWebsite && (
                  <a href={profile.companyWebsite.startsWith('http') ? profile.companyWebsite : `https://${profile.companyWebsite}`}
                    target="_blank" rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold"
                    style={{ color: pal.accent }}>
                    <Globe size={12} />{profile.companyWebsite.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>
            </div>
          )}

          {/* ── CV / Beceriler ────────────────────────────────────── */}
          {profile.showCvSection && (profile.cvSkills || profile.cvLanguages) && (() => {
            const skills: string[] = profile.cvSkills ? JSON.parse(profile.cvSkills) : []
            const langs: string[] = profile.cvLanguages ? JSON.parse(profile.cvLanguages) : []
            if (!skills.length && !langs.length) return null
            return (
              <div className="mb-7">
                <div className="w-full h-px mb-5" style={{ background: `linear-gradient(to right, transparent, ${pal.divider}, transparent)` }} />
                <p className="text-xs font-bold uppercase tracking-widest text-center mb-4" style={{ color: pal.cardSub }}>Hakkımda</p>
                {skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-bold mb-2" style={{ color: pal.cardSub }}>Beceriler</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map(s => (
                        <span key={s} className="px-3 py-1 rounded-full text-xs font-bold border-2"
                          style={{ background: pal.skillBg, color: pal.skillText, borderColor: `${pal.accent}30` }}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                {langs.length > 0 && (
                  <div>
                    <p className="text-xs font-bold mb-2" style={{ color: pal.cardSub }}>Diller</p>
                    <div className="flex flex-wrap gap-2">
                      {langs.map(l => (
                        <span key={l} className="px-3 py-1 rounded-full text-xs font-bold border-2"
                          style={{ background: pal.langBg, color: pal.langText, borderColor: `${pal.langText}30` }}>{l}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          {/* ── Bana Ulaş formu ───────────────────────────────────── */}
          <div>
            <div className="w-full h-px mb-5" style={{ background: `linear-gradient(to right, transparent, ${pal.divider}, transparent)` }} />
            <p className="text-xs font-bold uppercase tracking-widest text-center mb-5" style={{ color: pal.cardSub }}>Bana Ulaş</p>

            {leadStatus === 'sent' ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#dcfce7' }}>
                  <CheckCircle size={34} className="text-green-500" />
                </div>
                <p className="font-bold text-base" style={{ color: pal.cardText }}>Mesajınız gönderildi!</p>
                <p className="text-sm text-center" style={{ color: pal.cardSub }}>En kısa sürede dönüş yapacağım.</p>
                <button onClick={() => setLeadStatus('idle')} className="text-xs underline mt-1" style={{ color: pal.cardSub }}>Tekrar gönder</button>
              </div>
            ) : (
              <form onSubmit={submitLead} className="space-y-3">
                {[
                  { field: 'name' as const, placeholder: 'Ad Soyad *', type: 'text', required: true },
                  { field: 'email' as const, placeholder: 'E-posta (opsiyonel)', type: 'email', required: false },
                ] .map(({ field, placeholder, type, required }) => (
                  <input key={field} type={type} placeholder={placeholder} required={required} value={leadForm[field]}
                    onChange={e => setLeadForm(f => ({ ...f, [field]: e.target.value }))}
                    maxLength={100}
                    className="w-full px-4 py-3.5 text-sm border-2 bg-transparent outline-none transition-all"
                    style={{ borderRadius: btnR, color: pal.cardText, borderColor: pal.cardBorder }}
                    onFocus={e => { e.target.style.borderColor = pal.accent; e.target.style.boxShadow = `0 0 0 3px ${pal.accent}18` }}
                    onBlur={e => { e.target.style.borderColor = pal.cardBorder; e.target.style.boxShadow = '' }}
                  />
                ))}
                <textarea placeholder="Mesajınız *" required maxLength={500} rows={3}
                  value={leadForm.message} onChange={e => setLeadForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-3.5 text-sm border-2 bg-transparent outline-none transition-all resize-none"
                  style={{ borderRadius: btnR, color: pal.cardText, borderColor: pal.cardBorder }}
                  onFocus={e => { e.target.style.borderColor = pal.accent; e.target.style.boxShadow = `0 0 0 3px ${pal.accent}18` }}
                  onBlur={e => { e.target.style.borderColor = pal.cardBorder; e.target.style.boxShadow = '' }}
                />
                {leadStatus === 'error' && <p className="text-xs text-red-500 text-center">Bir hata oluştu, tekrar deneyin.</p>}
                <button type="submit" disabled={leadStatus === 'sending'}
                  className="w-full py-4 font-bold text-sm transition-all"
                  style={{
                    borderRadius: btnR,
                    background: `linear-gradient(135deg, ${pal.buttonBg}, ${pal.accent === pal.buttonBg ? pal.buttonBg : pal.buttonBg})`,
                    color: pal.buttonText,
                    opacity: leadStatus === 'sending' ? 0.65 : 1,
                    boxShadow: `0 6px 20px ${pal.accent}40`,
                  }}>
                  {leadStatus === 'sending' ? 'Gönderiliyor...' : 'Gönder'}
                </button>
              </form>
            )}
          </div>

          {/* Watermark */}
          <p className="text-center text-[11px] mt-10 opacity-30" style={{ color: pal.cardSub }}>Q-Kart ile oluşturuldu</p>
        </div>
      </div>
    </div>
  )
}
