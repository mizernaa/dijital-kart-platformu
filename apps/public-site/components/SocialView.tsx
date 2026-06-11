'use client'
import { useEffect, useRef, useState } from 'react'
import { trackEvent } from '@/lib/api'
import { parseSocialData, resolveSocialStyle } from '@/lib/social'
import { accentInk, rgba } from '@/lib/themes'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface SocialLinkRow { id: string; platform: string; url: string; order: number }
interface SocialProfile {
  slug: string; displayName: string; title: string | null; avatarUrl: string | null
  bio: string | null; socialData: string | null; socials: SocialLinkRow[]
}

/* ── Reveal on scroll ── */
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setSeen(true); io.disconnect() } }, { threshold: 0.1 })
    io.observe(el); return () => io.disconnect()
  }, [])
  return <div ref={ref} className={`sv-reveal ${seen ? 'in' : ''} ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>{children}</div>
}

/* ── Platform glyphs ── */
function Glyph({ p, size = 22 }: { p: string; size?: number }) {
  const k = (p || '').toLowerCase()
  const s = { width: size, height: size }
  if (k === 'instagram') return <svg {...s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0m0 5.84a6.16 6.16 0 100 12.32 6.16 6.16 0 000-12.32M12 16a4 4 0 110-8 4 4 0 010 8m6.41-10.85a1.44 1.44 0 100 2.88 1.44 1.44 0 000-2.88"/></svg>
  if (k === 'tiktok') return <svg {...s} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.3 0 .58.05.85.13V9.4a6.33 6.33 0 00-1-.05A6.34 6.34 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.04-.1z"/></svg>
  if (k === 'youtube') return <svg {...s} viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 00-2.12-2.12C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.53A3 3 0 00.5 6.2 31.3 31.3 0 000 12a31.3 31.3 0 00.5 5.8 3 3 0 002.12 2.12c1.88.53 9.38.53 9.38.53s7.5 0 9.38-.53a3 3 0 002.12-2.12A31.3 31.3 0 0024 12a31.3 31.3 0 00-.5-5.8M9.55 15.57V8.43L15.82 12z"/></svg>
  if (k === 'twitter' || k === 'x') return <svg {...s} viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.46l8.6-9.83L0 1.15h7.6l5.24 6.93zm-1.29 19.5h2.04L6.48 3.24H4.3z"/></svg>
  if (k === 'spotify') return <svg {...s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0a12 12 0 100 24 12 12 0 000-24m5.5 17.3a.75.75 0 01-1.03.25c-2.82-1.72-6.37-2.11-10.55-1.16a.75.75 0 11-.33-1.46c4.57-1.04 8.5-.59 11.66 1.34.36.22.47.69.25 1.03m1.47-3.27a.94.94 0 01-1.29.31c-3.23-1.98-8.15-2.56-11.97-1.4a.94.94 0 11-.55-1.8c4.37-1.32 9.79-.68 13.5 1.6.44.27.58.85.31 1.29m.13-3.4C15.86 8.27 9.6 8.05 6 9.15a1.12 1.12 0 11-.65-2.15c4.12-1.25 11.03-1 15.4 1.6a1.12 1.12 0 11-1.16 1.92"/></svg>
  if (k === 'soundcloud') return <svg {...s} viewBox="0 0 24 24" fill="currentColor"><path d="M1 13.5c0-.3.2-.5.4-.5s.4.2.4.5l.3 2-.3 2c0 .3-.2.5-.4.5s-.4-.2-.4-.5L0 15.5zm2.3-1.7c0-.3.2-.5.4-.5s.4.2.4.5l.3 3.7-.3 3.6c0 .3-.2.5-.4.5s-.4-.2-.4-.5l-.3-3.6zm2.4-.8c0-.3.2-.6.5-.6s.5.3.5.6l.3 5.1-.3 3.5c0 .3-.2.6-.5.6s-.5-.3-.5-.6l-.2-3.5zm2.5-.3c0-.4.3-.6.6-.6s.6.2.6.6l.2 5.4-.2 3.4c0 .4-.3.6-.6.6s-.6-.2-.6-.6l-.2-3.4zM23 17c0 1.7-1.3 3-3 3h-8.5V9.8a5 5 0 017.4 3.4c.4-.2.8-.2 1.1-.2 1.7 0 3 1.3 3 4z"/></svg>
  if (k === 'github') return <svg {...s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 .5A12 12 0 000 12.6c0 5.4 3.4 9.9 8.2 11.5.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.4-5.5-6 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0C17.3 4.7 18.3 5 18.3 5c.6 1.7.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0024 12.6 12 12 0 0012 .5"/></svg>
  if (k === 'linkedin') return <svg {...s} viewBox="0 0 24 24" fill="currentColor"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.07 2.07 0 110-4.14 2.07 2.07 0 010 4.14M7.12 20.45H3.56V9h3.56zM22.22 0H1.77C.8 0 0 .77 0 1.73v20.54C0 23.22.8 24 1.77 24h20.45c.98 0 1.78-.78 1.78-1.73V1.73C24 .77 23.2 0 22.22 0"/></svg>
  if (k === 'facebook') return <svg {...s} viewBox="0 0 24 24" fill="currentColor"><path d="M24 12a12 12 0 10-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.68.24 2.68.24v2.95h-1.51c-1.49 0-1.95.92-1.95 1.87V12h3.32l-.53 3.47h-2.79v8.38A12 12 0 0024 12"/></svg>
  if (k === 'telegram') return <svg {...s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0a12 12 0 100 24 12 12 0 000-24m5.5 7.6l-1.84 8.67c-.13.6-.5.75-1 .47l-2.77-2.04-1.34 1.29c-.15.15-.27.27-.55.27l.2-2.82L15.3 9.6c.22-.2-.05-.31-.34-.11l-6.36 4-2.74-.86c-.6-.18-.61-.6.12-.88l10.7-4.13c.5-.18.93.12.77.85"/></svg>
  if (k === 'whatsapp') return <svg {...s} viewBox="0 0 24 24" fill="currentColor"><path d="M.06 24l1.69-6.16A11.87 11.87 0 01.16 11.9C.16 5.34 5.5 0 12.06 0a11.82 11.82 0 018.41 3.49 11.82 11.82 0 013.48 8.42c0 6.56-5.34 11.9-11.9 11.9a11.9 11.9 0 01-5.69-1.45zm6.6-3.8c1.68.99 3.28 1.59 5.4 1.59 5.45 0 9.89-4.43 9.89-9.88A9.86 9.86 0 0012.06 2a9.88 9.88 0 00-9.88 9.9c0 2.22.65 3.88 1.74 5.62l-1 3.66z"/></svg>
  if (k === 'behance') return <svg {...s} viewBox="0 0 24 24" fill="currentColor"><path d="M22 7h-6V5h6zm1.73 10c-.44 1.3-2.03 3-5.1 3-3.08 0-5.57-1.73-5.57-5.68 0-3.9 2.33-5.92 5.47-5.92 3.08 0 4.96 1.78 5.37 4.43.08.5.11 1.19.1 2.14H15.97c.13 3.21 3.48 3.31 4.59 2.03zm-7.69-4h4.97c-.11-1.55-1.14-2.22-2.48-2.22-1.47 0-2.28.77-2.49 2.22zM9.95 9.67c0-1.13-.69-1.67-1.73-1.67H4v3.4h4.22c1.04 0 1.73-.6 1.73-1.73zM4 15h4.47c1.18 0 1.9-.72 1.9-1.65 0-1.08-.69-1.65-1.9-1.65H4zm-4-9h8.1c2.04 0 3.9.64 3.9 3.23 0 1.28-.64 2.11-1.62 2.69 1.32.5 2.12 1.57 2.12 3.11C12.5 17.55 10.45 19 8.02 19H0z"/></svg>
  if (k === 'dribbble') return <svg {...s} viewBox="0 0 24 24" fill="currentColor"><path d="M12 0a12 12 0 100 24 12 12 0 000-24m7.93 5.53a10.1 10.1 0 012.3 6.32c-.34-.07-3.7-.75-7.08-.33-.07-.17-.14-.34-.22-.52-.2-.49-.44-.99-.68-1.46 3.74-1.53 5.44-3.73 5.68-4.01M12 1.78c2.55 0 4.88.96 6.65 2.53-.2.29-1.74 2.35-5.35 3.71a52 52 0 00-3.83-5.98c.8-.18 1.65-.26 2.53-.26M7.5 2.74a63 63 0 013.79 5.9c-4.78 1.28-9 1.25-9.45 1.25a10.2 10.2 0 015.66-7.15M1.6 12v-.31c.43.01 5.4.07 10.5-1.46.3.57.57 1.15.82 1.73l-.4.12c-5.27 1.7-8.07 6.35-8.3 6.74A10.16 10.16 0 011.6 12m10.4 10.22c-2.36 0-4.53-.8-6.26-2.15.18-.37 2.2-4.26 7.96-6.27l.06-.02a42 42 0 012.17 7.7 10.1 10.1 0 01-3.93.74m5.65-1.69a44 44 0 00-1.97-7.24c3.18-.5 5.97.33 6.32.44a10.16 10.16 0 01-4.35 6.8"/></svg>
  return <svg {...s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15 15 0 014 10 15 15 0 01-4 10 15 15 0 01-4-10 15 15 0 014-10z"/></svg>
}

function linkHref(url: string) {
  if (!url) return '#'
  if (/^(https?:|mailto:|tel:)/.test(url)) return url
  return `https://${url}`
}
function prettyHost(url: string) {
  try { return new URL(linkHref(url)).hostname.replace('www.', '') } catch { return url }
}
function imgUrl(u?: string | null) { if (!u) return ''; return u.startsWith('http') ? u : `${API}${u}` }

/** Müzik embed — yalnızca Spotify/SoundCloud host'ları (güvenlik) */
function musicEmbedSrc(music: { type: string; url: string }, accent: string): string | null {
  try {
    const u = new URL(music.url)
    if (u.protocol !== 'https:') return null
    if (music.type === 'soundcloud') {
      if (!/(^|\.)soundcloud\.com$/.test(u.hostname)) return null
      return `https://w.soundcloud.com/player/?url=${encodeURIComponent(u.href)}&color=%23${accent.replace('#', '')}&visual=true`
    }
    if (u.hostname !== 'open.spotify.com') return null
    return u.href.replace('open.spotify.com/', 'open.spotify.com/embed/')
  } catch { return null }
}

export function SocialView({ profile, slug, source }: { profile: SocialProfile; slug: string; source?: string }) {
  const data = parseSocialData(profile.socialData)
  const st = resolveSocialStyle(data)
  const ink = accentInk(st.accent)
  const handle = data.handle || slug
  const bio = data.bio || profile.bio || ''
  const fontStack = `'${st.font}', system-ui, sans-serif`
  const posterImg = imgUrl(data.cover) || imgUrl(profile.avatarUrl)

  const [lightbox, setLightbox] = useState<string | null>(null)
  const [playerOpen, setPlayerOpen] = useState(false)
  const [reactions, setReactions] = useState(0)
  const [reacted, setReacted] = useState(false)
  const [lead, setLead] = useState({ name: '', email: '', message: '' })
  const [leadStatus, setLeadStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => { trackEvent(slug, { eventType: 'PAGE_VIEW', source: source || 'direct' }) }, [slug, source])

  // Tepki sayacı
  useEffect(() => {
    if (!data.show.reaction) return
    fetch(`${API}/p/${slug}/reactions`).then(r => r.json()).then(j => setReactions(j?.data?.count || 0)).catch(() => {})
  }, [slug]) // eslint-disable-line react-hooks/exhaustive-deps

  // Poster paralaks
  useEffect(() => {
    const el = heroRef.current; if (!el) return
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) return
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 600)
        el.style.transform = `translateY(${y * 0.35}px) scale(${1 + y * 0.0004})`
        el.style.opacity = String(Math.max(0.25, 1 - y / 700))
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [])

  const onLink = (label: string) => trackEvent(slug, { eventType: 'BUTTON_CLICK', buttonLabel: label })

  const react = () => {
    if (reacted) return
    setReacted(true); setReactions(c => c + 1)
    trackEvent(slug, { eventType: 'BUTTON_CLICK', buttonLabel: 'reaction' })
  }

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!lead.name || !lead.message) return
    setLeadStatus('sending')
    try {
      const res = await fetch(`${API}/p/${slug}/lead`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(lead),
      })
      if (res.ok) { setLeadStatus('sent'); setLead({ name: '', email: '', message: '' }) }
      else setLeadStatus('error')
    } catch { setLeadStatus('error') }
  }

  const socials = (profile.socials || []).slice().sort((a, b) => a.order - b.order)
  const embedSrc = data.music.url ? musicEmbedSrc(data.music, st.accent) : null
  const nameParts = (profile.displayName || handle).trim().split(/\s+/)

  const cssVars = {
    '--sv-accent': st.accent, '--sv-ink': ink,
    '--sv-text': st.vibe.text, '--sv-muted': st.vibe.muted,
    '--sv-surface': st.surface, '--sv-border': st.surfaceBorder,
    '--sv-font': fontStack,
    fontFamily: fontStack, color: st.vibe.text,
  } as React.CSSProperties

  return (
    <div className={`sv-root sv2 ${st.dark ? 'sv-dark' : 'sv-light'}`} style={cssVars}>
      {/* Vibe arka plan katmanı */}
      <div className="sv-bg" style={{ background: st.background }} />
      {st.animated === 'aurora' && <div className="sv-aurora"><i /><i /><i /></div>}
      {st.animated === 'flow' && <div className="sv-flow" />}
      {st.animated === 'particles' && <div className="sv-particles">{Array.from({ length: 14 }).map((_, i) => <span key={i} style={{ left: `${(i * 7 + 3) % 100}%`, animationDelay: `${i * 0.7}s`, animationDuration: `${6 + (i % 5)}s` }} />)}</div>}
      {data.effects.grain && <div className="sv-grain" />}

      {/* ── Poster kapak ── */}
      <header className="sv2-poster">
        <div ref={heroRef} className="sv2-poster-media" style={posterImg
          ? { backgroundImage: `linear-gradient(180deg, ${rgba('#000000', 0.12)} 30%, ${rgba('#000000', 0.55)}), url(${posterImg})` }
          : { background: `linear-gradient(160deg, ${rgba(st.accent, 0.55)}, ${st.g1})` }} />
        <div className="sv2-poster-top">
          <span className="sv2-handle">@{handle}</span>
          {data.location && <span className="sv2-loc">📍 {data.location}</span>}
        </div>
        <h1 className="sv2-name">{nameParts.map((w, i) => <span key={i}>{w}</span>)}</h1>
        {data.status && <div className="sv2-status">{data.status}</div>}
      </header>

      <main className="sv2-wrap">
        {bio && <Reveal><p className="sv2-bio">{bio}</p></Reveal>}

        {/* Anlar şeridi */}
        {data.show.gallery && data.gallery.length > 0 && (
          <Reveal>
            <div className="sv2-stories">
              {data.gallery.map((g, i) => (
                <button key={g.id} className="sv2-story" style={{ animationDelay: `${i * 60}ms` }} onClick={() => setLightbox(imgUrl(g.url))}>
                  <img src={imgUrl(g.url)} alt={g.caption || ''} loading="lazy" />
                </button>
              ))}
              <span className="sv2-stories-lbl">anlar</span>
            </div>
          </Reveal>
        )}

        {/* ── Bento ızgara ── */}
        <div className="sv2-bento">
          {/* Linkler — tam genişlik hücreler */}
          {data.show.links && data.links.map((l, i) => (
            <Reveal key={l.id} className="cell-w" delay={i * 40}>
              <a href={linkHref(l.url)} target="_blank" rel="noopener noreferrer" className="sv2-cell sv2-link" onClick={() => onLink(l.label || l.platform)}>
                <span className="ic">{l.thumbUrl ? <img src={imgUrl(l.thumbUrl)} alt="" /> : <Glyph p={l.platform} size={20} />}</span>
                <span className="txt"><b>{l.label || prettyHost(l.url)}</b><small>{prettyHost(l.url)}</small></span>
                <span className="arrow">→</span>
              </a>
            </Reveal>
          ))}

          {/* Müzik — şu an çalıyor */}
          {data.show.music && embedSrc && (
            <Reveal>
              <button className="sv2-cell sv2-music" onClick={() => { setPlayerOpen(o => !o); onLink('music') }}>
                <span className="np"><Glyph p={data.music.type || 'spotify'} size={14} /> şu an çalıyor</span>
                <span className="eq">{[6, 12, 8, 14, 5].map((h, i) => <i key={i} style={{ height: h, animationDelay: `${i * 0.15}s` }} />)}</span>
                <small>{playerOpen ? 'kapat' : 'dinle'}</small>
              </button>
            </Reveal>
          )}

          {/* Tepki */}
          {data.show.reaction && (
            <Reveal>
              <button className={`sv2-cell sv2-react ${reacted ? 'done' : ''}`} onClick={react}>
                <span className="fire">🔥</span>
                <b>{reactions}</b>
                <small>{reacted ? 'tepkin alındı' : 'tepki bırak'}</small>
              </button>
            </Reveal>
          )}

          {/* İlgi alanları */}
          {data.show.interests && data.interests.length > 0 && (
            <Reveal className={data.interests.length > 4 ? 'cell-w' : ''}>
              <div className="sv2-cell sv2-tags">
                <small>ilgiler</small>
                <div className="chips">{data.interests.map((t, i) => <span key={i}>{t}</span>)}</div>
              </div>
            </Reveal>
          )}

          {/* Sosyal ikonlar */}
          {data.show.socials && socials.length > 0 && (
            <Reveal className={socials.length > 3 ? 'cell-w' : ''}>
              <div className="sv2-cell sv2-socials">
                {socials.map(s => (
                  <a key={s.id} href={linkHref(s.url)} target="_blank" rel="noopener noreferrer" aria-label={s.platform} onClick={() => onLink(s.platform)}>
                    <Glyph p={s.platform} size={19} />
                  </a>
                ))}
              </div>
            </Reveal>
          )}

          {/* Notlar */}
          {data.show.posts && data.posts.map((p, i) => (
            <Reveal key={p.id} className="cell-w" delay={i * 40}>
              <article className="sv2-cell sv2-post">
                {p.imageUrl && <img className="pimg" src={imgUrl(p.imageUrl)} alt="" loading="lazy" />}
                <div className="pbody">
                  {p.date && <time>{p.date}</time>}
                  {p.title && <h3>{p.title}</h3>}
                  {p.body && <p>{p.body}</p>}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Açılır müzik çalar */}
        {playerOpen && embedSrc && (
          <div className="sv2-player-embed">
            <iframe src={embedSrc} sandbox="allow-scripts allow-same-origin allow-popups"
              width="100%" height={data.music.type === 'soundcloud' ? 160 : 152} frameBorder="0" allow="encrypted-media" loading="lazy" />
          </div>
        )}

        {/* Bana yaz */}
        {data.show.contactForm && (
          <Reveal>
            <section className="sv2-contact">
              <h2>bana yaz</h2>
              {leadStatus === 'sent' ? (
                <div className="sv2-cell sv2-thanks">Teşekkürler! Mesajın iletildi ✨</div>
              ) : (
                <form className="sv2-cell sv2-form" onSubmit={submitLead}>
                  <input placeholder="Adın" value={lead.name} onChange={e => setLead({ ...lead, name: e.target.value })} required />
                  <input type="email" placeholder="E-posta (opsiyonel)" value={lead.email} onChange={e => setLead({ ...lead, email: e.target.value })} />
                  <textarea placeholder="Mesajın" rows={3} maxLength={500} value={lead.message} onChange={e => setLead({ ...lead, message: e.target.value })} required />
                  {leadStatus === 'error' && <span className="err">Bir hata oluştu, tekrar dene.</span>}
                  <button type="submit" disabled={leadStatus === 'sending'}>{leadStatus === 'sending' ? 'Gönderiliyor…' : 'Gönder'}</button>
                </form>
              )}
            </section>
          </Reveal>
        )}

        <footer className="sv2-footer">Q·Kart ile oluşturuldu</footer>
      </main>

      {/* Sabit mini çalar */}
      {embedSrc && !playerOpen && (
        <button className="sv2-miniplayer" onClick={() => setPlayerOpen(true)}>
          <span className="dot" />
          <span className="t">müzik çal — {data.music.type === 'soundcloud' ? 'SoundCloud' : 'Spotify'}</span>
          <Glyph p={data.music.type || 'spotify'} size={16} />
        </button>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="sv-lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" />
        </div>
      )}
    </div>
  )
}
