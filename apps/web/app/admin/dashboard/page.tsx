'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Users, Eye, TrendingUp, Package, MessageSquare, Wifi, BarChart2 } from 'lucide-react'

interface Stats {
  users: { total: number; active: number; trial: number; passive: number; suspended: number; newThisMonth: number }
  profiles: { total: number; published: number }
  views: { today: number; thisWeek: number; thisMonth: number }
  leads: { total: number; unread: number }
  nfcOrders: { pending: number }
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Aktif', PASSIVE: 'Pasif', SUSPENDED: 'Askıya Alındı', TRIAL: 'Deneme',
}
const STATUS_CLASSES: Record<string, string> = {
  ACTIVE: 'badge-active', PASSIVE: 'badge-passive', SUSPENDED: 'badge-suspended', TRIAL: 'badge-trial',
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/users?limit=5'),
    ]).then(([statsRes, usersRes]) => {
      setStats(statsRes.data.data)
      setRecentUsers(usersRes.data.data.users)
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-20 text-gray-400">Yükleniyor...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      {/* Müşteri istatistikleri */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        {[
          { label: 'Toplam Müşteri', value: stats?.users.total, sub: `+${stats?.users.newThisMonth} bu ay`, icon: <Users size={20} className="text-blue-600" />, color: 'bg-blue-50' },
          { label: 'Aktif Müşteri', value: stats?.users.active, sub: `${stats?.users.trial} deneme`, icon: <TrendingUp size={20} className="text-green-600" />, color: 'bg-green-50' },
          { label: 'Yayında Profil', value: stats?.profiles.published, sub: `${stats?.profiles.total} toplam`, icon: <Eye size={20} className="text-purple-600" />, color: 'bg-purple-50' },
          { label: 'Askıya Alınan', value: stats?.users.suspended, sub: `${stats?.users.passive} pasif`, icon: <Package size={20} className="text-red-500" />, color: 'bg-red-50' },
        ].map(({ label, value, sub, icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>{icon}</div>
            <p className="text-3xl font-bold text-gray-900">{value ?? '—'}</p>
            <p className="text-sm text-gray-500 mt-0.5 font-medium">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* Platform aktivitesi */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Görüntülenme (bugün)', value: stats?.views.today, sub: `${stats?.views.thisWeek} bu hafta`, icon: <BarChart2 size={18} className="text-indigo-600" />, color: 'bg-indigo-50' },
          { label: 'Okunmamış Mesaj', value: stats?.leads.unread, sub: `${stats?.leads.total} toplam`, icon: <MessageSquare size={18} className="text-orange-600" />, color: 'bg-orange-50' },
          { label: 'Bekleyen NFC', value: stats?.nfcOrders.pending, sub: 'sipariş bekliyor', icon: <Wifi size={18} className="text-teal-600" />, color: 'bg-teal-50' },
        ].map(({ label, value, sub, icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>{icon}</div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Hızlı linkler */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { href: '/admin/users/new', label: 'Yeni Müşteri Oluştur', color: 'bg-blue-600 hover:bg-blue-700 text-white' },
          { href: '/admin/nfc-orders', label: 'NFC Siparişleri Yönet', color: 'bg-teal-600 hover:bg-teal-700 text-white' },
          { href: '/admin/packages', label: 'Paket Limitlerini Düzenle', color: 'bg-purple-600 hover:bg-purple-700 text-white' },
          { href: '/admin/analytics', label: 'Platform Analitiği', color: 'bg-gray-800 hover:bg-gray-900 text-white' },
        ].map(({ href, label, color }) => (
          <Link key={href} href={href} className={`px-4 py-3 rounded-xl text-sm font-semibold text-center transition-colors ${color}`}>
            {label}
          </Link>
        ))}
      </div>

      {/* Son müşteriler */}
      <div className="card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Son Kayıt Olan Müşteriler</h2>
          <Link href="/admin/users" className="text-sm text-blue-600 hover:underline">Tümünü gör →</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {recentUsers.map(user => (
            <div key={user.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50">
              <div>
                <p className="font-medium text-sm text-gray-900">{user.username}</p>
                <p className="text-xs text-gray-500">{user.email}{user.company ? ` · ${user.company}` : ''}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-medium">{user.packageName}</span>
                <span className={STATUS_CLASSES[user.status]}>{STATUS_LABELS[user.status]}</span>
                <span className="text-xs text-gray-400">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</span>
                <Link href={`/admin/users/${user.id}`} className="text-xs text-blue-600 hover:underline">Detay</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
