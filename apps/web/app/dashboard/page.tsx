'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { getAuthUser } from '@/lib/auth'
import {
  Eye, MousePointerClick, Download, ExternalLink,
  UserCircle, Palette, QrCode, BarChart2, MessageSquare, Wifi,
  ArrowUpRight, Zap, Star, TrendingUp, ChevronRight,
} from 'lucide-react'

interface AnalyticsSummary {
  totalViews: number
  uniqueVisitors: number
  vcardDownloads: number
  leadCount?: number
  sourceCounts: Record<string, number>
}
interface ProfileSummary {
  slug: string
  displayName: string
  isPublished: boolean
  avatarUrl?: string | null
}

const QUICK_LINKS = [
  { href: '/dashboard/profile', icon: UserCircle, label: 'Profil', sub: 'Bilgileri düzenle', grad: 'from-blue-500 to-blue-600', light: 'bg-blue-50', text: 'text-blue-600' },
  { href: '/dashboard/design', icon: Palette, label: 'Tasarım', sub: 'Tema & stil', grad: 'from-violet-500 to-purple-600', light: 'bg-violet-50', text: 'text-violet-600' },
  { href: '/dashboard/qr', icon: QrCode, label: 'QR Kod', sub: 'İndir & paylaş', grad: 'from-emerald-500 to-green-600', light: 'bg-emerald-50', text: 'text-emerald-600' },
  { href: '/dashboard/analytics', icon: BarChart2, label: 'Analitik', sub: 'Ziyaret verileri', grad: 'from-orange-500 to-amber-600', light: 'bg-orange-50', text: 'text-orange-600' },
  { href: '/dashboard/leads', icon: MessageSquare, label: 'Mesajlar', sub: 'Bana ulaş formu', grad: 'from-pink-500 to-rose-600', light: 'bg-pink-50', text: 'text-pink-600' },
  { href: '/dashboard/nfc', icon: Wifi, label: 'NFC Kart', sub: 'Sipariş ver', grad: 'from-cyan-500 to-sky-600', light: 'bg-cyan-50', text: 'text-cyan-600' },
]

const SOURCE_COLORS = [
  'from-blue-500 to-indigo-500',
  'from-emerald-500 to-teal-500',
  'from-orange-500 to-amber-500',
  'from-pink-500 to-rose-500',
  'from-violet-500 to-purple-500',
]

function PublishButton({ slug, onPublished }: { slug: string; onPublished: () => void }) {
  const [loading, setLoading] = useState(false)
  const publicSiteUrl = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'http://localhost:3002'
  const handlePublish = async () => {
    setLoading(true)
    try {
      await import('@/lib/api').then(m => m.api.put('/customer/profile', { isPublished: true }))
      onPublished()
    } finally { setLoading(false) }
  }
  return (
    <div className="flex gap-2 shrink-0">
      <button onClick={handlePublish} disabled={loading}
        className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-60 whitespace-nowrap">
        {loading ? 'Yayınlanıyor...' : 'Yayınla'}
      </button>
      <a href={`${publicSiteUrl}/u/${slug}`} target="_blank" rel="noopener noreferrer"
        className="px-3 py-1.5 bg-white border border-yellow-200 text-yellow-700 text-xs font-semibold rounded-lg hover:bg-yellow-50 transition-colors whitespace-nowrap">
        Önizle
      </a>
    </div>
  )
}

function AnimatedNumber({ value }: { value: number | null }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    if (value === null) return
    if (value === 0) { setDisplay(0); return }
    let current = 0
    const step = Math.ceil(value / 40)
    const timer = setInterval(() => {
      current += step
      if (current >= value) { setDisplay(value); clearInterval(timer) }
      else setDisplay(current)
    }, 16)
    return () => clearInterval(timer)
  }, [value])
  if (value === null) return <span>—</span>
  return <span>{display}</span>
}

export default function DashboardPage() {
  const [user, setUser] = useState<ReturnType<typeof getAuthUser>>(null)
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null)
  const [profile, setProfile] = useState<ProfileSummary | null>(null)
  const publicSiteUrl = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'http://localhost:3002'

  useEffect(() => {
    setUser(getAuthUser())
    api.get('/customer/profile').then(res => {
      const d = res.data.data
      setProfile({ slug: d.slug, displayName: d.displayName, isPublished: d.isPublished, avatarUrl: d.avatarUrl })
    }).catch(console.error)
    api.get('/customer/analytics?days=30').then(res => {
      setAnalytics(res.data.data)
    }).catch(console.error)
  }, [])

  const maxSource = analytics?.sourceCounts
    ? Math.max(...Object.values(analytics.sourceCounts), 1)
    : 1

  return (
    <div className="space-y-5 animate-fade-up">

      {/* ── Yayında Değil Uyarısı ─────────────────────────────── */}
      {profile && !profile.isPublished && (
        <div className="flex items-center justify-between gap-4 bg-yellow-50 border border-yellow-200 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-yellow-100 rounded-xl flex items-center justify-center shrink-0">
              <Zap size={18} className="text-yellow-600" />
            </div>
            <div>
              <p className="font-semibold text-yellow-900 text-sm">Profilin yayında değil</p>
              <p className="text-yellow-700 text-xs mt-0.5">Ziyaretçiler profilini göremez. Yayınlamak için tıkla.</p>
            </div>
          </div>
          <PublishButton slug={profile.slug} onPublished={() => setProfile(p => p ? { ...p, isPublished: true } : p)} />
        </div>
      )}

      {/* ── Hero Header ─────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #2C2418 0%, #7B3A18 45%, #C45E2A 100%)' }}>
        {/* Dot grid overlay */}
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)', backgroundSize: '22px 22px' }} />
        {/* Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(232,132,58,0.45), transparent 70%)', transform: 'translate(30%,-40%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(196,94,42,0.3), transparent 70%)', transform: 'translate(-30%,40%)' }} />

        <div className="relative z-10 p-6">
          {/* Top row */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <p className="text-blue-200 text-xs font-semibold tracking-widest uppercase">Q-Kart Dashboard</p>
              </div>
              <h1 className="text-3xl font-black text-white tracking-tight leading-tight">
                Merhaba, {user?.username} 👋
              </h1>
              <p className="text-blue-300 text-sm mt-1.5">Son 30 günlük performans özeti</p>
            </div>
            {profile && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-white font-bold text-sm">{profile.displayName}</p>
                  <div className="flex items-center justify-end gap-1.5 mt-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${profile.isPublished ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'}`} />
                    <span className="text-xs text-white/60 font-medium">{profile.isPublished ? 'Yayında' : 'Taslak'}</span>
                  </div>
                </div>
                <a href={`${publicSiteUrl}/u/${profile.slug}`} target="_blank" rel="noopener noreferrer"
                  className="w-11 h-11 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 flex items-center justify-center transition-all hover:scale-105">
                  <ExternalLink size={15} className="text-white" />
                </a>
              </div>
            )}
          </div>

          {/* Stat pills */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Eye, label: 'Görüntülenme', value: analytics?.totalViews ?? null, pill: 'bg-blue-500/20 border-blue-400/25' },
              { icon: MousePointerClick, label: 'Benzersiz Ziyaretçi', value: analytics?.uniqueVisitors ?? null, pill: 'bg-emerald-500/20 border-emerald-400/25' },
              { icon: Download, label: 'vCard İndirme', value: analytics?.vcardDownloads ?? null, pill: 'bg-violet-500/20 border-violet-400/25' },
            ].map(({ icon: Icon, label, value, pill }) => (
              <div key={label} className={`rounded-xl border backdrop-blur-sm p-4 ${pill}`}>
                <Icon size={15} className="text-white/50 mb-2" />
                <p className="text-2xl font-black text-white tabular-nums">
                  <AnimatedNumber value={value} />
                </p>
                <p className="text-[11px] text-white/55 font-medium mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Quick Access 2×3 Grid ────────────────────────────────── */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-gray-900">Özellikler</h3>
          <Zap size={14} className="text-amber-500" />
        </div>
        <div className="grid grid-cols-3 gap-2.5">
          {QUICK_LINKS.map(({ href, icon: Icon, label, sub, grad, light, text }) => (
            <Link key={href} href={href}
              className="group relative rounded-xl border border-gray-100 bg-white overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 hover:border-transparent">
              {/* Gradient overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${grad} opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
              <div className="relative z-10 p-3.5">
                <div className={`w-9 h-9 rounded-xl ${light} group-hover:bg-white/20 flex items-center justify-center mb-2.5 transition-colors duration-200`}>
                  <Icon size={18} className={`${text} group-hover:text-white transition-colors duration-200`} />
                </div>
                <p className="text-xs font-bold text-gray-800 group-hover:text-white transition-colors duration-200">{label}</p>
                <p className="text-[10px] text-gray-400 group-hover:text-white/70 transition-colors duration-200 mt-0.5">{sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Bottom Row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Ziyaret Kaynakları */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Ziyaret Kaynakları</h3>
            <TrendingUp size={14} className="text-gray-400" />
          </div>
          {analytics?.sourceCounts && Object.keys(analytics.sourceCounts).length > 0 ? (
            <div className="space-y-3.5">
              {Object.entries(analytics.sourceCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([source, count], i) => (
                  <div key={source} className="flex items-center gap-2.5">
                    <div className={`w-2 h-2 rounded-full bg-gradient-to-r flex-shrink-0 ${SOURCE_COLORS[i % SOURCE_COLORS.length]}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-gray-700 capitalize truncate">{source || 'Direkt'}</span>
                        <span className="text-xs font-black text-gray-900 ml-2 tabular-nums">{count}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${SOURCE_COLORS[i % SOURCE_COLORS.length]} transition-all duration-1000`}
                          style={{ width: `${(count / maxSource) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 text-center">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                <BarChart2 size={22} className="text-gray-200" />
              </div>
              <p className="text-sm font-semibold text-gray-400">Henüz veri yok</p>
              <p className="text-xs text-gray-300 mt-0.5">Profil ziyaret edilince görünür</p>
            </div>
          )}
        </div>

        {/* Profil Durumu */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-gray-900">Profil Durumu</h3>
            <Star size={14} className="text-amber-400" />
          </div>
          {profile ? (
            <div className="space-y-2.5">
              {/* Status indicator */}
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-gray-50">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${profile.isPublished ? 'bg-green-100' : 'bg-amber-100'}`}>
                  <div className={`w-3 h-3 rounded-full ${profile.isPublished ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{profile.isPublished ? 'Yayında' : 'Taslak modunda'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{profile.isPublished ? 'Profiliniz herkese açık' : 'Henüz yayınlanmadı'}</p>
                </div>
              </div>

              {/* View profile link */}
              <a href={`${publicSiteUrl}/u/${profile.slug}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-3 rounded-xl border border-dashed border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 group">
                <div className="w-8 h-8 rounded-lg bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center flex-shrink-0 transition-colors">
                  <ExternalLink size={13} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-700 group-hover:text-blue-700 transition-colors">Profilimi Görüntüle</p>
                  <p className="text-[10px] text-gray-400 truncate">/u/{profile.slug}</p>
                </div>
                <ChevronRight size={13} className="text-gray-300 group-hover:text-blue-500 transition-colors" />
              </a>

              {/* Publish CTA if draft */}
              {!profile.isPublished && (
                <Link href="/dashboard/profile"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-white text-xs font-bold transition-all duration-200 hover:shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg, #3b82f6, #7c3aed)' }}>
                  Profili Yayınla
                  <ArrowUpRight size={12} />
                </Link>
              )}
            </div>
          ) : (
            <div className="animate-pulse space-y-2.5">
              <div className="h-16 bg-gray-100 rounded-xl" />
              <div className="h-12 bg-gray-100 rounded-xl" />
              <div className="h-10 bg-gray-100 rounded-xl" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
