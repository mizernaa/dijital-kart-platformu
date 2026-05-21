'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { Plus, Search, ChevronLeft, ChevronRight } from 'lucide-react'

interface User {
  id: string
  username: string
  email: string
  status: string
  packageName: string
  company: string | null
  lastLoginAt: string | null
  createdAt: string
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Aktif', PASSIVE: 'Pasif', SUSPENDED: 'Askıya Alındı', TRIAL: 'Deneme',
}
const STATUS_CLASSES: Record<string, string> = {
  ACTIVE: 'badge-active', PASSIVE: 'badge-passive', SUSPENDED: 'badge-suspended', TRIAL: 'badge-trial',
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' })
      if (search) params.set('search', search)
      if (statusFilter) params.set('status', statusFilter)
      const res = await api.get(`/admin/users?${params}`)
      setUsers(res.data.data.users)
      setTotalPages(res.data.data.pagination.totalPages)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchUsers() }, [page, statusFilter])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Müşteriler</h1>
        <Link href="/admin/users/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          Yeni Müşteri
        </Link>
      </div>

      <div className="card mb-4">
        <div className="p-4 flex gap-3">
          <form onSubmit={handleSearch} className="flex gap-2 flex-1">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input pl-9"
                placeholder="Kullanıcı adı, e-posta veya şirket ara..."
              />
            </div>
            <button type="submit" className="btn-secondary">Ara</button>
          </form>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
            className="input w-40"
          >
            <option value="">Tüm Durumlar</option>
            <option value="ACTIVE">Aktif</option>
            <option value="TRIAL">Deneme</option>
            <option value="PASSIVE">Pasif</option>
            <option value="SUSPENDED">Askıya Alındı</option>
          </select>
        </div>
      </div>

      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Kullanıcı</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Şirket</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Paket</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Durum</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3">Son Giriş</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">Yükleniyor...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">Müşteri bulunamadı.</td>
              </tr>
            ) : users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-5 py-3.5">
                  <p className="font-medium text-sm text-gray-900">{user.username}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-600">{user.company || '—'}</td>
                <td className="px-5 py-3.5">
                  <span className="text-xs font-medium text-gray-700 bg-gray-100 px-2 py-1 rounded">
                    {user.packageName}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <span className={STATUS_CLASSES[user.status]}>{STATUS_LABELS[user.status]}</span>
                </td>
                <td className="px-5 py-3.5 text-sm text-gray-500">
                  {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('tr-TR') : '—'}
                </td>
                <td className="px-5 py-3.5 text-right">
                  <Link href={`/admin/users/${user.id}`} className="text-sm text-blue-600 hover:underline">
                    Detay
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">Sayfa {page} / {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary py-1.5 px-2.5 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="btn-secondary py-1.5 px-2.5 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
