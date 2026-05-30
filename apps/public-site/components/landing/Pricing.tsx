'use client'
import { useCallback } from 'react'
import SectionHead from './SectionHead'

const CheckSvg = () => (
  <svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
)

const PLANS = [
  {
    name: 'Klasik',
    tagline: 'Bireysel kullanım için zarif PVC NFC kart.',
    price: '399',
    currency: '₺',
    period: 'tek seferlik',
    featured: false,
    img: '/assets/plan-klasik.jpg',
    imgAlt: 'Q-Kart Klasik mat PVC NFC kart',
    features: ['Mat PVC NFC kart', 'Ücretsiz dijital profil', 'Sosyal medya + iletişim', 'Sınırsız güncelleme'],
    cta: 'Klasik\'i Seç',
    dataPlan: 'Klasik',
  },
  {
    name: 'Metal',
    tagline: 'Lazer kazıma premium metal kart. İz bırak.',
    price: '899',
    currency: '₺',
    period: 'tek seferlik',
    featured: true,
    img: '/assets/plan-metal.jpg',
    imgAlt: 'Q-Kart Metal lazer kazıma kart',
    features: ['Premium metal gövde', 'Lazer kazıma logo + isim', 'CV & portföy yükleme', 'Detaylı analitik paneli', 'Öncelikli destek'],
    cta: 'Metal\'i Seç',
    dataPlan: 'Metal',
  },
  {
    name: 'Kurumsal',
    tagline: 'Ekipler ve şirketler için merkezi yönetim.',
    price: null,
    priceLabel: 'Teklif',
    currency: '',
    period: '',
    featured: false,
    img: '/assets/plan-kurumsal.jpg',
    imgAlt: 'Q-Kart Kurumsal ekip kartları',
    features: ['Toplu kart üretimi', 'Ekip yönetim paneli', 'Marka kimliği şablonu', 'Özel hesap yöneticisi'],
    cta: 'Teklif Al',
    dataPlan: 'Kurumsal',
  },
]

export default function Pricing() {
  const onPlanMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%')
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%')
  }, [])

  const selectPlan = (plan: string) => {
    const select = document.querySelector('#fPlan') as HTMLSelectElement | null
    if (select) {
      select.value = plan
      select.dispatchEvent(new Event('change', { bubbles: true }))
    }
    document.querySelector('#siparis')?.scrollIntoView({ behavior: 'smooth' })
  }

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
          {PLANS.map((plan) => (
            <div className={`plan${plan.featured ? ' featured' : ''}`} key={plan.name} onMouseMove={onPlanMove}>
              {plan.featured && <span className="tag">En Popüler</span>}
              <div className="plan-img">
                <img src={plan.img} alt={plan.imgAlt} loading="lazy" />
              </div>
              <h3>{plan.name}</h3>
              <p className="ptag">{plan.tagline}</p>
              <div className="price">
                {plan.currency && <span className="cur">{plan.currency}</span>}
                {plan.price ? (
                  <span className="amt">{plan.price}</span>
                ) : (
                  <span className="amt" style={{ fontSize: 40 }}>{plan.priceLabel}</span>
                )}
                {plan.period && <span className="per">{plan.period}</span>}
              </div>
              <ul>
                {plan.features.map((f, i) => (
                  <li key={i}><CheckSvg/> {f}</li>
                ))}
              </ul>
              <button
                className={`btn${plan.featured ? ' btn-primary' : ' btn-ghost'}`}
                onClick={() => selectPlan(plan.dataPlan)}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
