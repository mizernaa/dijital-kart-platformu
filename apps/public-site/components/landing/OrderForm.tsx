'use client'
import { useState, useCallback, type FormEvent } from 'react'
import SectionHead from './SectionHead'

const CheckSvg = () => (
  <svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
)

const EyeSvg = ({ open }: { open: boolean }) => open ? (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8"/></svg>
) : (
  <svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>
)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000'

function generateUsername(email: string): string {
  const prefix = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase().slice(0, 15)
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}${suffix}`
}

function setCookie(name: string, value: string, days: number) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${value}; expires=${expires}; path=/; SameSite=Lax`
}

export default function OrderForm() {
  const [formData, setFormData] = useState({
    name: '', phone: '', email: '', password: '', plan: 'Metal', note: '',
  })
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'creating' | 'done'>('form')
  const [existingEmail, setExistingEmail] = useState(false)

  const update = useCallback((field: string, value: string) => {
    setFormData((p) => ({ ...p, [field]: value }))
    setErrors((p) => { const n = { ...p }; delete n[field]; return n })
    if (field === 'email') setExistingEmail(false)
  }, [])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!formData.name.trim()) e.name = 'Ad soyad gerekli'
    if (!formData.phone.replace(/\D/g, '').match(/^\d{10,}/)) e.phone = 'Geçerli bir telefon numarası girin'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) e.email = 'Geçerli bir e-posta adresi girin'
    if (formData.password.length < 8) e.password = 'Şifre en az 8 karakter olmalı'
    return e
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    setExistingEmail(false)

    try {
      const planMap: Record<string, string> = { Klasik: 'KLASIK', Metal: 'METAL', Kurumsal: 'KURUMSAL' }

      // 1. Kullanıcı kaydı oluştur
      const username = generateUsername(formData.email)
      const regRes = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email: formData.email,
          password: formData.password,
          name: formData.name.trim(),
        }),
      })

      if (!regRes.ok) {
        const regData = await regRes.json()
        if (regRes.status === 409) {
          setExistingEmail(true)
          setLoading(false)
          return
        }
        throw new Error(regData.message || 'Kayıt hatası')
      }

      const regData = await regRes.json()
      const { accessToken, refreshToken, user } = regData.data

      // 2. Sipariş oluştur
      await fetch(`${API_URL}/p/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone,
          email: formData.email,
          plan: planMap[formData.plan] || 'METAL',
          note: formData.note,
        }),
      })

      // 3. Oturumu kaydet (cookie + localStorage)
      setCookie('accessToken', accessToken, 1 / 96) // 15 dakika
      setCookie('refreshToken', refreshToken, 7)    // 7 gün
      localStorage.setItem('authUser', JSON.stringify({
        id: user.id,
        username: user.username,
        role: user.role,
        passwordChanged: true,
      }))

      setStep('creating')

      // 4. Dashboard'a yönlendir
      setTimeout(() => {
        window.location.href = `${DASHBOARD_URL}/dashboard`
      }, 2000)

    } catch (err: any) {
      setErrors({ name: err.message || 'Bir hata oluştu, lütfen tekrar deneyin.' })
      setLoading(false)
    }
  }

  if (step === 'creating') {
    return (
      <section className="sec-pad" id="siparis">
        <div className="wrap" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
          <h2 style={{ color: 'var(--accent)', marginBottom: 12 }}>Hesabın oluşturuldu!</h2>
          <p style={{ color: 'var(--fg-2)', fontSize: 16 }}>
            Siparişin alındı. Dijital profil panelinize yönlendiriliyorsunuz…
          </p>
          <div style={{ marginTop: 24, width: 40, height: 4, background: 'var(--accent)', borderRadius: 2, margin: '24px auto 0', animation: 'progress-bar 2s linear forwards' }} />
          <style>{`@keyframes progress-bar { from { width: 0 } to { width: 200px } }`}</style>
        </div>
      </section>
    )
  }

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
          <form id="orderForm" noValidate onSubmit={submit}>
            <div className="form-row two">
              <div className="form-row" style={{ margin: 0 }}>
                <label htmlFor="fName">Ad Soyad</label>
                <input
                  className={`field${formData.name ? ' filled' : ''}${errors.name ? ' invalid' : ''}`}
                  id="fName" type="text" placeholder="Adınız Soyadınız"
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
                className={`field${formData.email ? ' filled' : ''}${errors.email || existingEmail ? ' invalid' : ''}`}
                id="fEmail" type="email" placeholder="ornek@mail.com"
                value={formData.email}
                onChange={(e) => update('email', e.target.value)}
              />
            </div>

            {existingEmail && (
              <div style={{ marginTop: -8, marginBottom: 12, fontSize: 13, color: '#e57373' }}>
                Bu e-posta ile zaten hesap var.{' '}
                <a href={`${DASHBOARD_URL}/login`} style={{ color: 'var(--accent)', fontWeight: 600 }}>
                  Giriş yapın →
                </a>
              </div>
            )}

            <div className="form-row">
              <label htmlFor="fPassword">Şifre <span style={{ fontWeight: 400, color: 'var(--fg-2)', fontSize: 12 }}>(dijital profil girişiniz)</span></label>
              <div style={{ position: 'relative' }}>
                <input
                  className={`field${formData.password ? ' filled' : ''}${errors.password ? ' invalid' : ''}`}
                  id="fPassword"
                  type={showPw ? 'text' : 'password'}
                  placeholder="En az 8 karakter"
                  value={formData.password}
                  onChange={(e) => update('password', e.target.value)}
                  style={{ paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg-2)', padding: 0,
                  }}
                  tabIndex={-1}
                  aria-label={showPw ? 'Şifreyi gizle' : 'Şifreyi göster'}
                >
                  <EyeSvg open={showPw} />
                </button>
              </div>
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

            <button className={`btn btn-primary btn-lg${loading ? ' loading' : ''}`} type="submit" disabled={loading}>
              <span className="spin" aria-hidden="true"/>
              <span className="btn-label">{loading ? 'Hesap oluşturuluyor…' : 'Siparişi Tamamla & Üye Ol'}</span>
              <svg viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>

            <p className="order-note">
              Sipariş vermek hesap oluşturur. Zaten üye misiniz?{' '}
              <a href={`${DASHBOARD_URL}/login`} style={{ color: 'var(--accent)' }}>Giriş yapın</a>
            </p>
          </form>
        </div>
      </div>
    </section>
  )
}
