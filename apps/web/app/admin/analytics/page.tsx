'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell,
} from 'recharts'
import { Eye, Users, TrendingUp, MousePointerClick, ExternalLink } from 'lucide-react'

interface Stats {
  users: { total: number; active: number; trial: number; passive: number; suspended: number; newThisMonth: number }
  profiles: { total: number; published: number }
  views: { today: number; thisWeek: number; thisMonth: number }
  leads: { total: number; unread: number }
  nfcOrders: { pending: number }
}

interface Analytics {
  dailyViews: { date: string; count: number }[]
  topProfiles: { slug: string; displayName: string; count: number }[]
  eventsByType: Record<string, number>
  userGrowth: { date: string; count: number }[]
}

const USER_STATUS_COLORS = ['#22c55e', '#f59e0b', '#94a3b8', '#ef4444']

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)

  const fetchData = (d: number) => {
    setLoading(true)
    Promise.all([
      api.get('/admin/stats'),
      api.get(`/admin/analytics?days=${d}`),
    ]).then(([statsRes, analyticsRes]) => {
      setStats(statsRes.data.data)
      setAnalytics(analyticsRes.data.data)
    }).catch(console.error).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData(days) }, [])

  const PUBLIC_SITE = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'http://localhost:3002'

  const userPieData = stats ? [
    { name: 'Aktif', value: stats.users.active },
    { name: 'Deneme', value: stats.users.trial },
    { name: 'Pasif', value: stats.users.passive },
    { name: 'Askıda', value: stats.users.suspended },
  ].filter(d => d.value > 0) : []

  if (loading) return <div className="text-center py-20 text-gray-400">Yükleniyor...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Platform Analitik</h1>
        <select
          value={days}
          onChange={e => { const d = Number(e.target.value); setDays(d); fetchData(d) }}
          className="input w-36"
        >
          <option value={7}>Son 7 gün</option>
          <option value={30}>Son 30 gün</option>
          <option value={90}>Son 90 gün</option>
        </select>
      </div>

      {/* Özet kartlar */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Toplam Müşteri', value: stats?.users.total, sub: `+${stats?.users.newThisMonth} bu ay`, icon: <Users size={18} className="text-blue-500" />, color: 'bg-blue-50' },
          { label: 'Yayında Profil', value: stats?.profiles.published, sub: `${stats?.profiles.total} toplam`, icon: <Eye size={18} className="text-green-500" />, color: 'bg-green-50' },
          { label: 'Görüntülenme (bugün)', value: stats?.views.today, sub: `${stats?.views.thisMonth} bu ay`, icon: <TrendingUp size={18} className="text-purple-500" />, color: 'bg-purple-50' },
          { label: 'Toplam Mesaj', value: stats?.leads.total, sub: `${stats?.leads.unread} okunmamış`, icon: <MousePointerClick size={18} className="text-orange-500" />, color: 'bg-orange-50' },
          { label: 'NFC Bekliyor', value: stats?.nfcOrders.pending, sub: 'bekleyen sipariş', icon: <TrendingUp size={18} className="text-yellow-500" />, color: 'bg-yellow-50' },
        ].map(({ label, value, sub, icon, color }) => (
          <div key={label} className="card p-4">
            <div className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center mb-2`}>{icon}</div>
            <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
            <p className="text-xs text-gray-500 mt-0.5 font-medium">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Günlük görüntülenme trendi */}
      <div className="card p-6 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4">Platform Geneli Günlük Görüntülenme</h2>
        {analytics?.dailyViews && analytics.dailyViews.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={analytics.dailyViews}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip labelFormatter={d => `Tarih: ${d}`} formatter={(v) => [v, 'Görüntülenme']} />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-32 flex items-center justify-center text-gray-400 text-sm">Veri yok.</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Kullanıcı büyüme trendi */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Yeni Müşteri Trendi</h2>
          {analytics?.userGrowth && analytics.userGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={analytics.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip labelFormatter={d => `Tarih: ${d}`} formatter={(v) => [v, 'Yeni Müşteri']} />
                <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-24 flex items-center justify-center text-gray-400 text-sm">Veri yok.</div>
          )}
        </div>

        {/* Kullanıcı durum dağılımı */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Müşteri Durum Dağılımı</h2>
          {userPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={userPieData} cx="50%" cy="50%" outerRadius={65} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                  {userPieData.map((_, i) => <Cell key={i} fill={USER_STATUS_COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-24 flex items-center justify-center text-gray-400 text-sm">Veri yok.</div>
          )}
        </div>
      </div>

      {/* En çok görüntülenen profiller */}
      <div className="card p-6 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4">En Çok Görüntülenen Profiller</h2>
        {analytics?.topProfiles && analytics.topProfiles.length > 0 ? (
          <div className="space-y-2">
            {analytics.topProfiles.map((profile, i) => (
              <div key={profile.slug} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{profile.displayName}</p>
                  <p className="text-xs text-gray-400">/{profile.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${(profile.count / analytics.topProfiles[0].count) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-bold text-gray-900 w-10 text-right">{profile.count}</span>
                  <a
                    href={`${PUBLIC_SITE}/u/${profile.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-16 flex items-center justify-center text-gray-400 text-sm">Henüz veri yok.</div>
        )}
      </div>

      {/* Olay türü dağılımı */}
      {analytics?.eventsByType && Object.keys(analytics.eventsByType).length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Olay Türü Dağılımı</h2>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(analytics.eventsByType).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type} className="bg-gray-50 rounded-xl p-3 text-center">
                <p className="text-xl font-bold text-gray-900">{count}</p>
                <p className="text-xs text-gray-500 mt-0.5">{type.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
