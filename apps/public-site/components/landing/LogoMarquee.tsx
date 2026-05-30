'use client'

const BRANDS = [
  'ATLAS STUDIO', 'NORA TECH', 'MERİDYEN', 'KuzeyVC',
  'Vektörel', 'FORM&CO', 'Lumen Ajans', 'Bereket Holding',
]

export default function LogoMarquee() {
  const items = [...BRANDS, ...BRANDS]

  return (
    <section className="marq">
      <div className="wrap">
        <p className="marq-label">Sektörün öncüleri Q-Kart kullanıyor</p>
      </div>
      <div className="marq-track" aria-hidden="true">
        {items.map((name, i) => (
          <span key={`${name}-${i}`}>{name}</span>
        ))}
      </div>
    </section>
  )
}
