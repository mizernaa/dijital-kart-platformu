'use client'
import { useState } from 'react'
import { api } from '@/lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Bir hata oluştu, tekrar deneyin.')
    } finally { setLoading(false) }
  }

  return (
    <div className="login-page">
      <div className="login-glow" aria-hidden="true" />
      <div className="login-card">
        <div className="login-head">
          <h1>Şifreni mi unuttun?</h1>
          <p>E-postanı gir, sıfırlama bağlantısı gönderelim.</p>
        </div>

        {sent ? (
          <div className="login-alert" style={{ background: 'rgba(34,197,94,.1)', borderColor: 'rgba(34,197,94,.4)', color: '#16a34a' }}>
            E-posta adresin kayıtlıysa sıfırlama bağlantısı gönderildi. Gelen kutunu (ve spam klasörünü) kontrol et.
          </div>
        ) : (
          <form onSubmit={submit} className="login-form" noValidate>
            <div className="login-field-wrap">
              <label htmlFor="email" className="login-label">E-posta</label>
              <input id="email" type="email" className="login-field" placeholder="ornek@mail.com"
                value={email} onChange={e => setEmail(e.target.value)} autoFocus required />
            </div>
            {error && <div className="login-alert" role="alert">{error}</div>}
            <button type="submit" disabled={loading || !email} className="login-btn">
              {loading ? 'Gönderiliyor…' : 'Sıfırlama Bağlantısı Gönder'}
            </button>
          </form>
        )}

        <p className="login-back" style={{ marginTop: 12 }}>
          <a href="/login">← Girişe dön</a>
        </p>
      </div>
    </div>
  )
}
