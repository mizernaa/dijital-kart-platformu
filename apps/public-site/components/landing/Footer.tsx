'use client'

const FOOTER_LINKS = {
  Ürün: [
    { label: 'Özellikler', href: '#ozellikler' },
    { label: 'Fiyatlar', href: '#fiyat' },
    { label: 'Nasıl Çalışır', href: '#nasil' },
    { label: 'Sipariş Ver', href: '#siparis' },
  ],
  Şirket: [
    { label: 'Hakkımızda', href: '#' },
    { label: 'Kariyer', href: '#' },
    { label: 'Referanslar', href: '#yorumlar' },
    { label: 'İletişim', href: '#' },
  ],
  Yasal: [
    { label: 'Gizlilik', href: '#' },
    { label: 'Kullanım Şartları', href: '#' },
    { label: 'KVKK', href: '#' },
    { label: 'İade Politikası', href: '#' },
  ],
}

export default function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <div className="foot-grid">
          <div className="foot-brand">
            <a className="brand" href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
              <svg className="logo-mark" viewBox="0 0 34 34" fill="none" aria-hidden="true">
                <rect x="1.2" y="1.2" width="31.6" height="31.6" rx="9" stroke="currentColor" strokeOpacity=".22" strokeWidth="1.4"/>
                <circle cx="17" cy="17" r="8.4" stroke="var(--accent)" strokeWidth="2.4"/>
                <path d="M18.6 18.6 L25 25" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round"/>
              </svg>
              <span className="brand-name">Q<b>·</b>Kart</span>
            </a>
            <p>Tek dokunuşla bağlanan akıllı dijital kimlik. Türkiye&apos;de tasarlandı ve üretildi.</p>
          </div>
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div className="foot-col" key={heading}>
              <h4>{heading}</h4>
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={l.href.startsWith('#') ? (e) => {
                    e.preventDefault()
                    document.querySelector(l.href)?.scrollIntoView({ behavior: 'smooth' })
                  } : undefined}
                >
                  {l.label}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div className="foot-bot">
          <span>© 2026 Q-Kart. Tüm hakları saklıdır.</span>
          <div className="foot-social">
            <a href="#" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.8"/><circle cx="16.8" cy="7.2" r="1" fill="currentColor"/></svg>
            </a>
            <a href="#" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="3.5" width="17" height="17" rx="3" stroke="currentColor" strokeWidth="1.8"/><path d="M8 10v7M8 7v0M12 17v-4a2 2 0 014 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </a>
            <a href="#" aria-label="X">
              <svg viewBox="0 0 24 24" fill="none"><path d="M4 4l16 16M20 4L4 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
