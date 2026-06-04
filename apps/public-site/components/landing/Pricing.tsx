'use client'
import { useCallback, useEffect, useState } from 'react'
import SectionHead from './SectionHead'

interface Plan {
  id: string
  slug: string
  displayName: string
  tagline: string
  price: number | null
  priceLabel: string | null
  currency: string
  period: string
  featured: boolean
  features: string[]
  ctaText: string
}

const CheckSvg = () => (
  <svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function Pricing() {
  const [plans, setPlans] = useState<Plan[]>([])

  useEffect(() => {
    fetch(`${API_URL}/p/plans`)
      .then(r => r.json())
      .then(d => { if (d.success) setPlans(d.data) })
      .catch(() => {})
  }, [])

  const onPlanMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%')
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%')
  }, [])

  const selectPlan = (slug: string) => {
    const select = document.querySelector('#fPlan') as HTMLSelectElement | null
    if (select) {
      const cap = slug.charAt(0).toUpperCase() + slug.slice(1)
      select.value = cap
      select.dispatchEvent(new Event('change', { bubbles: true }))
    }
    document.querySelector('#siparis')?.scrollIntoView({ behavior: 'smooth' })
  }

  const imgMap: Record<string, string> = {
    klasik: '/assets/plan-klasik.jpg',
    metal: '/assets/plan-metal.jpg',
    kurumsal: '/assets/plan-kurumsal.jpg',
  }

  if (plans.length === 0) return null

  return (
    <section className="sec-pad" id="fiyat">
      <div className="wrap">
        <SectionHead
          center
          eyebrow="Fiyatlar"
          title="Sana uygun kartı seç"
          sub="Tüm kartlar ömür boyu ücretsiz dijital profil ile gelir. Tek seferlik ödeme, gizli ücret yok."
        />
        <div className="price-grid">
          {plans.map((plan) => (
            <div
              className={`plan${plan.featured ? ' featured' : ''}`}
              key={plan.id}
              onMouseMove={onPlanMove}
            >
              {plan.featured && <span className="tag">En Popüler</span>}
              <div className="plan-img">
                <img src={imgMap[plan.slug] || '/assets/plan-klasik.jpg'} alt={plan.displayName} loading="lazy" />
              </div>
              <h3>{plan.displayName}</h3>
              <p className="ptag">{plan.tagline}</p>
              <div className="price">
                {plan.currency && <span className="cur">{plan.currency}</span>}
                {plan.price != null ? (
                  <span className="amt">{plan.price}</span>
                ) : (
                  <span className="amt" style={{ fontSize: 40 }}>{plan.priceLabel}</span>
                )}
                {plan.period && <span className="per">{plan.period}</span>}
              </div>
              <ul>
                {plan.features.map((f, i) => (
                  <li key={i}><CheckSvg /> {f}</li>
                ))}
              </ul>
              <button
                className={`btn${plan.featured ? ' btn-primary' : ' btn-ghost'}`}
                onClick={() => selectPlan(plan.slug)}
              >
                {plan.ctaText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
