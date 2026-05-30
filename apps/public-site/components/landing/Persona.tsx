'use client'

export default function Persona() {
  return (
    <section className="sec-pad persona" id="kisisel">
      <div className="wrap persona-grid">
        <div className="persona-stage">
          <div className="persona-frame">
            <video autoPlay muted loop playsInline preload="metadata" poster="/assets/card-vertical-poster.jpg" aria-hidden="true">
              <source src="/assets/card-vertical.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="nfc-rings"><i/><i/><i/></div>
        </div>

        <div className="persona-copy">
          <span className="eyebrow">Her detay senin</span>
          <h2>İsmin, altın<br/>harflerle.</h2>
          <p>Adından logona, renginden düzenine kadar her şey sana ait. Q-Kart sadece bir kart değil — masaya koyduğun andan itibaren senin imzan.</p>
          <div className="persona-chips">
            <span className="persona-chip">
              <svg viewBox="0 0 24 24" fill="none"><path d="M12 3l2.3 4.7 5.2.8-3.8 3.7.9 5.1L12 15l-4.6 2.4.9-5.1L4.5 8.5l5.2-.8z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/></svg>
              Lazer kazıma
            </span>
            <span className="persona-chip">
              <svg viewBox="0 0 24 24" fill="none"><rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.8"/></svg>
              Mat &amp; metalik
            </span>
            <span className="persona-chip">
              <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8"/><path d="M12 8v4l3 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
              Anında güncelleme
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}
