'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { setAuth } from '@/lib/auth'

const schema = z.object({
  username: z.string().min(1, 'Kullanıcı adı gerekli'),
  password: z.string().min(1, 'Şifre gerekli'),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [welcome, setWelcome] = useState(false)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  // Sipariş formundan gelen yönlendirme: e-postayı ön-doldur + karşılama göster
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const email = p.get('email')
    if (email) setValue('username', email)
    if (p.get('welcome') === '1') setWelcome(true)
  }, [setValue])

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', data)
      const { accessToken, refreshToken, user } = res.data.data
      setAuth({ accessToken, refreshToken }, user)

      if (!user.passwordChanged) {
        router.replace('/change-password')
        return
      }

      if (user.role === 'CUSTOMER') {
        router.replace('/dashboard')
      } else {
        router.replace('/admin/dashboard')
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Giriş başarısız.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-glow" aria-hidden="true" />

      <div className="login-card">
        <a href="/" className="login-brand">
          <svg viewBox="0 0 34 34" fill="none" aria-hidden="true" width="36" height="36">
            <rect x="1.2" y="1.2" width="31.6" height="31.6" rx="9" stroke="currentColor" strokeOpacity=".22" strokeWidth="1.4"/>
            <circle cx="17" cy="17" r="8.4" stroke="var(--accent)" strokeWidth="2.4"/>
            <path d="M18.6 18.6 L25 25" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round"/>
          </svg>
          <span>Q<b>·</b>Kart</span>
        </a>

        <div className="login-head">
          <h1>{welcome ? 'Hesabın hazır! 🎉' : 'Tekrar hoş geldin'}</h1>
          <p>{welcome ? 'Siparişin alındı. Belirlediğin şifreyle giriş yap.' : 'Hesabınıza giriş yapın'}</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
          <div className="login-field-wrap">
            <label htmlFor="username" className="login-label">Kullanıcı Adı veya E-posta</label>
            <input
              {...register('username')}
              id="username"
              className={`login-field${errors.username ? ' invalid' : ''}`}
              placeholder="kullanici_adi veya e-posta"
              autoComplete="username"
              autoFocus
            />
            {errors.username && <span className="login-err">{errors.username.message}</span>}
          </div>

          <div className="login-field-wrap">
            <label htmlFor="password" className="login-label">Şifre</label>
            <input
              {...register('password')}
              id="password"
              type="password"
              className={`login-field${errors.password ? ' invalid' : ''}`}
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {errors.password && <span className="login-err">{errors.password.message}</span>}
          </div>

          {error && (
            <div className="login-alert" role="alert">{error}</div>
          )}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? <span className="login-spinner" aria-hidden="true" /> : null}
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            {!loading && (
              <svg viewBox="0 0 24 24" fill="none" width="17" height="17">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </form>

        <p className="login-back" style={{ marginTop: 12 }}>
          Hesabın yok mu? <a href="/register">Kayıt Ol</a>
        </p>
        <p className="login-back">
          <a href="/">← Ana sayfaya dön</a>
        </p>
      </div>
    </div>
  )
}
