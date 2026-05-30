'use client'
import { useState, useEffect, useCallback } from 'react'

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
            <a className="btn btn-primary" {...linkProps('#siparis')}>
              Hemen Al
              <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
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

      <div className={`m-nav${menuOpen ? ' open' : ''}`} id="mNav">
        <a {...linkProps('#nasil')}>Nasıl Çalışır</a>
        <a {...linkProps('#ozellikler')}>Özellikler</a>
        <a {...linkProps('#fiyat')}>Fiyatlar</a>
        <a {...linkProps('#yorumlar')}>Yorumlar</a>
        <a className="btn btn-primary" {...linkProps('#siparis')}>Hemen Sipariş Ver</a>
      </div>
    </>
  )
}
