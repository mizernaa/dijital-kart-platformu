'use client'
import { useState } from 'react'
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

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

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
      {/* Background glow */}
      <div className="login-glow" aria-hidden="true" />

      <div className="login-card">
        {/* Logo */}
        <a href="/" className="login-brand">
          <svg viewBox="0 0 34 34" fill="none" aria-hidden="true" width="36" height="36">
            <rect x="1.2" y="1.2" width="31.6" height="31.6" rx="9" stroke="currentColor" strokeOpacity=".22" strokeWidth="1.4"/>
            <circle cx="17" cy="17" r="8.4" stroke="var(--accent)" strokeWidth="2.4"/>
            <path d="M18.6 18.6 L25 25" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round"/>
          </svg>
          <span>Q<b>·</b>Kart</span>
        </a>

        <div className="login-head">
          <h1>Tekrar hoş geldin</h1>
          <p>Hesabınıza giriş yapın</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form" noValidate>
          <div className="login-field-wrap">
            <label htmlFor="username" className="login-label">Kullanıcı Adı</label>
            <input
              {...register('username')}
              id="username"
              className={`login-field${errors.username ? ' invalid' : ''}`}
              placeholder="kullanici_adi"
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
            {loading ? (
              <span className="login-spinner" aria-hidden="true" />
            ) : null}
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            {!loading && (
              <svg viewBox="0 0 24 24" fill="none" width="17" height="17">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </form>

        <p className="login-back">
          <a href="/">← Ana sayfaya dön</a>
        </p>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg, #0f0c07);
          padding: 24px;
          position: relative;
          overflow: hidden;
          font-family: "Manrope", system-ui, sans-serif;
        }
        .login-glow {
          position: absolute;
          top: -20%;
          left: 50%;
          transform: translateX(-50%);
          width: 700px;
          height: 500px;
          background: radial-gradient(ellipse, color-mix(in oklab, oklch(0.82 0.13 86) 22%, transparent), transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
        .login-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 400px;
          background: var(--bg-2, oklch(0.185 0.014 75));
          border: 1px solid var(--line-2, oklch(1 0 0 / 0.16));
          border-radius: 24px;
          padding: 40px 36px 36px;
          box-shadow: 0 40px 100px -30px oklch(0 0 0 / .8);
        }
        .login-brand {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-family: "Space Grotesk", sans-serif;
          font-weight: 600;
          font-size: 20px;
          color: var(--text, oklch(0.97 0.006 80));
          letter-spacing: -0.02em;
          margin-bottom: 32px;
          text-decoration: none;
        }
        .login-brand b { color: var(--accent, oklch(0.82 0.13 86)); }
        .login-head { margin-bottom: 28px; }
        .login-head h1 {
          font-family: "Space Grotesk", sans-serif;
          font-size: 26px;
          font-weight: 600;
          letter-spacing: -0.03em;
          color: var(--text, oklch(0.97 0.006 80));
          line-height: 1.1;
        }
        .login-head p {
          color: var(--muted, oklch(0.74 0.012 80));
          font-size: 15px;
          margin-top: 6px;
        }
        .login-form { display: flex; flex-direction: column; gap: 18px; }
        .login-field-wrap { display: flex; flex-direction: column; gap: 7px; }
        .login-label {
          font-size: 13px;
          font-weight: 500;
          color: var(--muted, oklch(0.74 0.012 80));
          letter-spacing: 0.01em;
        }
        .login-field {
          width: 100%;
          padding: 12px 16px;
          background: oklch(1 0 0 / .04);
          border: 1px solid var(--line-2, oklch(1 0 0 / 0.16));
          border-radius: 12px;
          color: var(--text, oklch(0.97 0.006 80));
          font-family: inherit;
          font-size: 15px;
          transition: border-color .25s, background .25s;
          outline: none;
        }
        .login-field::placeholder { color: var(--faint, oklch(0.635 0.014 80)); }
        .login-field:focus {
          border-color: var(--accent, oklch(0.82 0.13 86));
          background: oklch(1 0 0 / .06);
        }
        .login-field.invalid { border-color: oklch(0.65 0.2 25); }
        .login-err { font-size: 12px; color: oklch(0.65 0.2 25); }
        .login-alert {
          padding: 12px 14px;
          background: oklch(0.65 0.2 25 / .12);
          border: 1px solid oklch(0.65 0.2 25 / .35);
          border-radius: 10px;
          font-size: 14px;
          color: oklch(0.75 0.18 25);
        }
        .login-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          width: 100%;
          padding: 14px 24px;
          background: linear-gradient(180deg, var(--accent, oklch(0.82 0.13 86)), var(--accent-2, oklch(0.70 0.14 60)));
          color: var(--accent-ink, oklch(0.20 0.04 80));
          font-family: "Space Grotesk", sans-serif;
          font-size: 15px;
          font-weight: 600;
          border: none;
          border-radius: 12px;
          cursor: pointer;
          transition: transform .3s, box-shadow .3s, opacity .2s;
          margin-top: 4px;
          box-shadow: 0 8px 28px -8px color-mix(in oklab, oklch(0.82 0.13 86) 60%, transparent),
                      inset 0 1px 0 oklch(1 0 0 / .3);
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 14px 36px -8px color-mix(in oklab, oklch(0.82 0.13 86) 70%, transparent),
                      inset 0 1px 0 oklch(1 0 0 / .4);
        }
        .login-btn:disabled { opacity: .65; cursor: not-allowed; transform: none; }
        .login-spinner {
          width: 16px; height: 16px;
          border: 2px solid oklch(0.20 0.04 80 / .3);
          border-top-color: oklch(0.20 0.04 80);
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-back {
          text-align: center;
          margin-top: 22px;
          font-size: 13px;
        }
        .login-back a {
          color: var(--muted, oklch(0.74 0.012 80));
          text-decoration: none;
          transition: color .25s;
        }
        .login-back a:hover { color: var(--text, oklch(0.97 0.006 80)); }
      `}</style>
    </div>
  )
}
