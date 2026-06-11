'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get('token') || '')
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError('Şifre en az 8 karakter olmalı.'); return }
    if (password !== password2) { setError('Şifreler eşleşmiyor.'); return }
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, password })
      setDone(true)
      setTimeout(() => router.replace('/login'), 2500)
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Bir hata oluştu, tekrar deneyin.')
    } finally { setLoading(false) }
  }

  return (
    <div className="login-page">
      <div className="login-glow" aria-hidden="true" />
      <div className="login-card">
        <div className="login-head">
          <h1>Yeni şifre belirle</h1>
          <p>Hesabın için güçlü bir şifre seç.</p>
        </div>

        {!token ? (
          <div className="login-alert" role="alert">Geçersiz bağlantı. Lütfen e-postandaki linke tıklayarak gel.</div>
        ) : done ? (
          <div className="login-alert" style={{ background: 'rgba(34,197,94,.1)', borderColor: 'rgba(34,197,94,.4)', color: '#16a34a' }}>
            Şifren güncellendi ✓ Girişe yönlendiriliyorsun…
          </div>
        ) : (
          <form onSubmit={submit} className="login-form" noValidate>
            <div className="login-field-wrap">
              <label htmlFor="pw" className="login-label">Yeni Şifre</label>
              <input id="pw" type="password" className="login-field" placeholder="En az 8 karakter"
                value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" autoFocus />
            </div>
            <div className="login-field-wrap">
              <label htmlFor="pw2" className="login-label">Yeni Şifre (tekrar)</label>
              <input id="pw2" type="password" className="login-field" placeholder="••••••••"
                value={password2} onChange={e => setPassword2(e.target.value)} autoComplete="new-password" />
            </div>
            {error && <div className="login-alert" role="alert">{error}</div>}
            <button type="submit" disabled={loading} className="login-btn">
              {loading ? 'Kaydediliyor…' : 'Şifreyi Güncelle'}
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
