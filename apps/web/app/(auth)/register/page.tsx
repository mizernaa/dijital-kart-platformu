'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { setAuth } from '@/lib/auth'

const schema = z.object({
  name: z.string().min(1, 'Ad soyad gerekli'),
  username: z.string().min(3, 'En az 3 karakter').max(30).regex(/^[a-zA-Z0-9_]+$/, 'Sadece harf, rakam ve _'),
  email: z.string().email('Geçerli e-posta girin'),
  password: z.string().min(8, 'En az 8 karakter'),
})

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/register', data)
      const { accessToken, refreshToken, user } = res.data.data
      setAuth({ accessToken, refreshToken }, user)
      router.replace('/dashboard')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Kayıt başarısız.')
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
          <h1>Hesap Oluştur</h1>
          <p>Ücretsiz dijital kartvizitinizi oluşturun</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
          <div className="login-field-wrap">
            <label className="login-label">Ad Soyad</label>
            <input {...register('name')} className={`login-field${errors.name ? ' invalid' : ''}`} placeholder="Ahmet Demir" autoFocus />
            {errors.name && <span className="login-err">{errors.name.message}</span>}
          </div>
          <div className="login-field-wrap">
            <label className="login-label">Kullanıcı Adı</label>
            <input {...register('username')} className={`login-field${errors.username ? ' invalid' : ''}`} placeholder="ahmetdemir" autoComplete="username" />
            {errors.username && <span className="login-err">{errors.username.message}</span>}
          </div>
          <div className="login-field-wrap">
            <label className="login-label">E-posta</label>
            <input {...register('email')} type="email" className={`login-field${errors.email ? ' invalid' : ''}`} placeholder="ornek@mail.com" />
            {errors.email && <span className="login-err">{errors.email.message}</span>}
          </div>
          <div className="login-field-wrap">
            <label className="login-label">Şifre</label>
            <input {...register('password')} type="password" className={`login-field${errors.password ? ' invalid' : ''}`} placeholder="En az 8 karakter" autoComplete="new-password" />
            {errors.password && <span className="login-err">{errors.password.message}</span>}
          </div>

          {error && <div className="login-alert" role="alert">{error}</div>}

          <button type="submit" disabled={loading} className="login-btn">
            {loading ? <span className="login-spinner" aria-hidden="true" /> : null}
            {loading ? 'Oluşturuluyor...' : 'Hesap Oluştur'}
          </button>
        </form>

        <p className="login-back">
          Zaten hesabın var mı? <a href="/login">Giriş Yap</a>
        </p>
      </div>
    </div>
  )
}
