'use client'
import { useState, useCallback, type FormEvent } from 'react'
import SectionHead from './SectionHead'

const CheckSvg = () => (
  <svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
)

export default function OrderForm() {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', plan: 'Metal', note: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const update = useCallback((field: string, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }))
    setErrors((p) => { const n = { ...p }; delete n[field]; return n })
  }, [])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.name.trim()) e.name = 'Ad soyad gerekli'
    if (!formData.phone.replace(/\D/g, '').match(/^\d{10,}/)) e.phone = 'Geçerli bir telefon numarası girin'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Geçerli bir e-posta adresi girin'
    return e
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
      const planMap: Record<string, string> = { Klasik: 'KLASIK', Metal: 'METAL', Kurumsal: 'KURUMSAL' }
      const res = await fetch(`${apiUrl}/p/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, plan: planMap[formData.plan] || 'KLASIK' }),
      })
      if (!res.ok) throw new Error('Sunucu hatası')
      setSuccess(true)
      setSuccessMsg(`Teşekkürler ${formData.name.trim()}! Kısa süre içinde ${formData.plan} kartınız için sizinle iletişime geçeceğiz.`)
    } catch {
      setErrors({ name: 'Bir hata oluştu, lütfen tekrar deneyin.' })
    } finally {
      setLoading(false)
    }
  }

  const fields = ['name', 'phone', 'email'] as const

  return (
    <section className="sec-pad" id="siparis">
      <div className="wrap order-grid">
        <div className="order-copy">
          <span className="eyebrow">Sipariş</span>
          <h2>Kartını bugün<br/>oluştur</h2>
          <p>Formu doldur, kartını saniyeler içinde tasarlamaya başla. Türkiye&apos;nin her yerine ücretsiz kargo.</p>
          <ul className="order-list">
            <li><CheckSvg/> 1-3 iş günü içinde kapında</li>
            <li><CheckSvg/> 30 gün koşulsuz iade</li>
            <li><CheckSvg/> Ömür boyu ücretsiz dijital profil</li>
          </ul>
        </div>

        <div className="order-card">
          {!success ? (
            <form id="orderForm" noValidate onSubmit={submit}>
              <div className="form-row two">
                <div className="form-row" style={{ margin: 0 }}>
                  <label htmlFor="fName">Ad Soyad</label>
                  <input
                    className={`field${formData.name ? ' filled' : ''}${errors.name ? ' invalid' : ''}`}
                    id="fName" type="text" placeholder="Adınız"
                    value={formData.name}
                    onChange={(e) => update('name', e.target.value)}
                  />
                </div>
                <div className="form-row" style={{ margin: 0 }}>
                  <label htmlFor="fPhone">Telefon</label>
                  <input
                    className={`field${formData.phone ? ' filled' : ''}${errors.phone ? ' invalid' : ''}`}
                    id="fPhone" type="tel" placeholder="05XX XXX XX XX"
                    value={formData.phone}
                    onChange={(e) => update('phone', e.target.value)}
                  />
                </div>
              </div>
              <div className="form-row">
                <label htmlFor="fEmail">E-posta</label>
                <input
                  className={`field${formData.email ? ' filled' : ''}${errors.email ? ' invalid' : ''}`}
                  id="fEmail" type="email" placeholder="ornek@mail.com"
                  value={formData.email}
                  onChange={(e) => update('email', e.target.value)}
                />
              </div>
              <div className="form-row">
                <label htmlFor="fPlan">Kart modeli</label>
                <select
                  className="field"
                  id="fPlan"
                  value={formData.plan}
                  onChange={(e) => update('plan', e.target.value)}
                >
                  <option value="Klasik">Klasik — ₺399</option>
                  <option value="Metal">Metal — ₺899</option>
                  <option value="Kurumsal">Kurumsal — Teklif al</option>
                </select>
              </div>
              <div className="form-row">
                <label htmlFor="fNote">Not (opsiyonel)</label>
                <textarea
                  className="field"
                  id="fNote"
                  rows={2}
                  placeholder="Kart üzerine yazılmasını istediğin isim, ünvan vb."
                  value={formData.note}
                  onChange={(e) => update('note', e.target.value)}
                />
              </div>
              <div className="form-msg" role="alert">
                {Object.values(errors)[0] || ''}
              </div>
              <button className={`btn btn-primary btn-lg${loading ? ' loading' : ''}`} type="submit">
                <span className="spin" aria-hidden="true"/>
                <span className="btn-label">Siparişi Tamamla</span>
                <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <p className="order-note">Bilgilerin gizli tutulur.</p>
            </form>
          ) : (
            <div className={`form-success${success ? ' show' : ''}`} id="formSuccess">
              <div className="check"><svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg></div>
              <h3>Siparişin alındı!</h3>
              <p>{successMsg}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
