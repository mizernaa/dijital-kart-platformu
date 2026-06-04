'use client'
import { useState, useEffect, useCallback } from 'react'

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [])

  const closeMenu = useCallback(() => setMenuOpen(false), [])

  const scrollTo = (id: string) => {
    closeMenu()
    const el = document.querySelector(id)
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 70
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  const linkProps = (href: string) => ({
    href,
    onClick: (e: React.MouseEvent) => { e.preventDefault(); scrollTo(href) },
  })

  return (
    <>
      <header className={`hdr${scrolled ? ' scrolled' : ''}`}>
        <div className="wrap nav">
          <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }} aria-label="Q-Kart ana sayfa">
            <svg className="logo-mark" viewBox="0 0 34 34" fill="none" aria-hidden="true">
              <rect x="1.2" y="1.2" width="31.6" height="31.6" rx="9" stroke="currentColor" strokeOpacity=".22" strokeWidth="1.4"/>
              <circle cx="17" cy="17" r="8.4" stroke="var(--accent)" strokeWidth="2.4"/>
              <path d="M18.6 18.6 L25 25" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round"/>
            </svg>
            <span className="brand-name">Q<b>·</b>Kart</span>
          </a>
          <nav className="nav-links" aria-label="Ana menü">
            <a {...linkProps('#nasil')}>Nasıl Çalışır</a>
            <a {...linkProps('#ozellikler')}>Özellikler</a>
            <a {...linkProps('#fiyat')}>Fiyatlar</a>
            <a {...linkProps('#yorumlar')}>Yorumlar</a>
          </nav>
          <div className="nav-cta">
            <a href={`${DASHBOARD_URL}/register`} className="btn btn-login" style={{ color: 'var(--accent)', borderColor: 'rgba(212,168,67,.3)' }}>
              Kayıt Ol
            </a>
            <a href={`${DASHBOARD_URL}/login`} className="btn btn-login" aria-label="Müşteri girişi">
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16"><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8"/><path d="M5 19c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              Giriş Yap
            </a>
            <a className="btn btn-primary" {...linkProps('#siparis')}>
              Hemen Al
              <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </a>
            {/* Mobil: hamburger yanında giriş butonu */}
            <a
              href={`${DASHBOARD_URL}/login`}
              className="nav-mobile-login"
              aria-label="Giriş Yap"
              style={{
                display: 'none',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--accent)',
                textDecoration: 'none',
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid rgba(212,168,67,.3)',
                whiteSpace: 'nowrap',
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" width="15" height="15"><circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.8"/><path d="M5 19c0-3.3 3.1-6 7-6s7 2.7 7 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              Giriş
            </a>
            <button
              className={`nav-toggle${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
              aria-expanded={menuOpen}
            >
              <span/><span/><span/>
            </button>
          </div>
        </div>
      </header>

      {/* Mobil login butonu CSS */}
      <style>{`
        @media (max-width: 768px) {
          .nav-mobile-login { display: flex !important; }
        }
      `}</style>

      <div className={`m-nav${menuOpen ? ' open' : ''}`} id="mNav">
        <a {...linkProps('#nasil')}>Nasıl Çalışır</a>
        <a {...linkProps('#ozellikler')}>Özellikler</a>
        <a {...linkProps('#fiyat')}>Fiyatlar</a>
        <a {...linkProps('#yorumlar')}>Yorumlar</a>
        <a href={`${DASHBOARD_URL}/login`} className="m-nav-login">Giriş Yap</a>
        <a className="btn btn-primary" {...linkProps('#siparis')}>Hemen Sipariş Ver</a>
      </div>
    </>
  )
}
