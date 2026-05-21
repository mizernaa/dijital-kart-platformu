'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api'
import {
  ArrowLeft, User, Mail, Phone, Building2, FileText,
  Key, Trash2, ExternalLink, Check, AlertTriangle, Eye, MessageSquare,
} from 'lucide-react'

interface UserDetail {
  id: string
  username: string
  email: string
  phone: string | null
  company: string | null
  notes: string | null
  role: string
  status: string
  passwordChanged: boolean
  lastLoginAt: string | null
  createdAt: string
  packageId: string
  package: { id: string; name: string; displayName: string }
  profile: {
    id: string; slug: string; isPublished: boolean
    displayName: string; title: string | null
    showCompanySection: boolean; showCvSection: boolean
  } | null
}

interface Package { id: string; name: string; displayName: string }

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  ACTIVE:    { label: 'Aktif',          color: 'text-green-700',  bg: 'bg-green-100' },
  TRIAL:     { label: 'Deneme',         color: 'text-yellow-700', bg: 'bg-yellow-100' },
  PASSIVE:   { label: 'Pasif',          color: 'text-gray-700',   bg: 'bg-gray-100' },
  SUSPENDED: { label: 'Askıya Alındı',  color: 'text-red-700',    bg: 'bg-red-100' },
}

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()

  const [user, setUser] = useState<UserDetail | null>(null)
  const [packages, setPackages] = useState<Package[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [tempPassword, setTempPassword] = useState('')
  const [stats, setStats] = useState<{ views: number; leads: number } | null>(null)

  const [editForm, setEditForm] = useState({
    email: '', phone: '', company: '', notes: '', packageId: '',
  })

  useEffect(() => {
    Promise.all([
      api.get(`/admin/users/${id}`),
      api.get('/admin/packages'),
    ]).then(([userRes, pkgRes]) => {
      const u = userRes.data.data
      setUser(u)
      setPackages(pkgRes.data.data)
      setEditForm({
        email: u.email,
        phone: u.phone || '',
        company: u.company || '',
        notes: u.notes || '',
        packageId: u.packageId,
      })
      // Profil istatistikleri
      if (u.profile) {
        Promise.all([
          api.get(`/admin/analytics?days=30`).catch(() => null),
        ]).catch(() => {})
      }
    }).catch(console.error).finally(() => setLoading(false))
  }, [id])

  const showFlash = (msg: string) => { setFlash(msg); setTimeout(() => setFlash(''), 3000) }

  const saveInfo = async () => {
    setSaving(true)
    try {
      await api.put(`/admin/users/${id}`, {
        email: editForm.email,
        phone: editForm.phone || null,
        company: editForm.company || null,
        notes: editForm.notes || null,
        packageId: editForm.packageId,
      })
      setUser(u => u ? {
        ...u,
        email: editForm.email,
        phone: editForm.phone || null,
        company: editForm.company || null,
        notes: editForm.notes || null,
        packageId: editForm.packageId,
        package: packages.find(p => p.id === editForm.packageId) || u.package,
      } : u)
      showFlash('Bilgiler kaydedildi.')
    } catch { showFlash('Hata oluştu.') }
    setSaving(false)
  }

  const changeStatus = async (status: string) => {
    setSaving(true)
    try {
      await api.patch(`/admin/users/${id}/status`, { status })
      setUser(u => u ? { ...u, status } : u)
      showFlash(`Durum → ${STATUS_META[status].label}`)
    } catch { showFlash('Hata oluştu.') }
    setSaving(false)
  }

  const resetPassword = async () => {
    setSaving(true)
    try {
      const res = await api.post(`/admin/users/${id}/reset-password`)
      setTempPassword(res.data.data.temporaryPassword)
    } catch { showFlash('Hata oluştu.') }
    setSaving(false)
  }

  const deleteUser = async () => {
    setSaving(true)
    try {
      await api.delete(`/admin/users/${id}`)
      router.replace('/admin/users')
    } catch (err: any) {
      showFlash(err?.response?.data?.message || 'Silinemedi.')
      setDeleteConfirm(false)
    }
    setSaving(false)
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Yükleniyor...</div>
  if (!user) return <div className="text-center py-20 text-gray-400">Kullanıcı bulunamadı.</div>

  const PUBLIC_SITE = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'http://localhost:3002'

  return (
    <div className="max-w-3xl">
      {/* Başlık */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/users" className="text-gray-400 hover:text-gray-700">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">@{user.username}</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${STATUS_META[user.status]?.bg} ${STATUS_META[user.status]?.color}`}>
          {STATUS_META[user.status]?.label}
        </span>
      </div>

      {/* Flash */}
      {flash && (
        <div className="mb-4 flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-xl text-sm font-medium">
          <Check size={16} /> {flash}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Kayıt Tarihi</p>
          <p className="font-semibold text-gray-900 text-sm">{new Date(user.createdAt).toLocaleDateString('tr-TR')}</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Son Giriş</p>
          <p className="font-semibold text-gray-900 text-sm">
            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('tr-TR') : '—'}
          </p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Şifre Değişti</p>
          <p className={`font-semibold text-sm ${user.passwordChanged ? 'text-green-600' : 'text-yellow-600'}`}>
            {user.passwordChanged ? 'Evet' : 'Değiştirmedi'}
          </p>
        </div>
      </div>

      {/* Bilgi Düzenleme */}
      <div className="card p-6 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
          <User size={16} className="text-gray-400" /> Hesap Bilgileri
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Kullanıcı Adı</label>
            <input className="input bg-gray-50 cursor-not-allowed" value={user.username} disabled />
          </div>
          <div>
            <label className="label flex items-center gap-1"><Mail size={12} /> E-posta</label>
            <input className="input" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className="label flex items-center gap-1"><Phone size={12} /> Telefon</label>
            <input className="input" value={editForm.phone} onChange={e => setEditForm(f => ({ ...f, phone: e.target.value }))} placeholder="—" />
          </div>
          <div>
            <label className="label flex items-center gap-1"><Building2 size={12} /> Şirket</label>
            <input className="input" value={editForm.company} onChange={e => setEditForm(f => ({ ...f, company: e.target.value }))} placeholder="—" />
          </div>
          <div className="col-span-2">
            <label className="label">Paket</label>
            <select className="input" value={editForm.packageId} onChange={e => setEditForm(f => ({ ...f, packageId: e.target.value }))}>
              {packages.map(p => <option key={p.id} value={p.id}>{p.displayName} ({p.name})</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="label flex items-center gap-1"><FileText size={12} /> Notlar (Admin)</label>
            <textarea
              className="input min-h-[70px] resize-none"
              value={editForm.notes}
              onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="İç notlar..."
            />
          </div>
        </div>
        <button onClick={saveInfo} disabled={saving} className="btn-primary mt-4">
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      {/* Durum Yönetimi */}
      <div className="card p-6 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">Durum Yönetimi</h2>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(STATUS_META).map(([status, meta]) => (
            <button
              key={status}
              onClick={() => changeStatus(status)}
              disabled={saving || user.status === status}
              className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all border-2 ${
                user.status === status
                  ? `${meta.bg} ${meta.color} border-current`
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {meta.label}
            </button>
          ))}
        </div>
      </div>

      {/* Profil Bilgisi */}
      {user.profile && (
        <div className="card p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
            <Eye size={16} className="text-gray-400" /> Profil
          </h2>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-900">{user.profile.displayName}</p>
              <p className="text-xs text-gray-500">/{user.profile.slug}</p>
              <div className="flex gap-2 mt-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.profile.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                  {user.profile.isPublished ? 'Yayında' : 'Taslak'}
                </span>
                {user.profile.showCompanySection && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Şirket</span>}
                {user.profile.showCvSection && <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">CV</span>}
              </div>
            </div>
            <a
              href={`${PUBLIC_SITE}/u/${user.profile.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center gap-2 text-sm"
            >
              <ExternalLink size={14} /> Profili Görüntüle
            </a>
          </div>
        </div>
      )}

      {/* Şifre Sıfırlama */}
      <div className="card p-6 mb-4">
        <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Key size={16} className="text-gray-400" /> Şifre Sıfırla
        </h2>
        {tempPassword ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-sm text-yellow-800 font-medium mb-2">Geçici şifre oluşturuldu:</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-white border border-yellow-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-900">{tempPassword}</code>
              <button
                onClick={() => navigator.clipboard.writeText(tempPassword)}
                className="btn-secondary text-xs"
              >Kopyala</button>
            </div>
            <p className="text-xs text-yellow-600 mt-2">Kullanıcıya iletmeyi unutmayın. Sayfayı kapatınca görünmez.</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-3">Kullanıcı için yeni bir geçici şifre oluşturulur. Sonraki girişinde değiştirmesi gerekir.</p>
            <button onClick={resetPassword} disabled={saving} className="btn-secondary flex items-center gap-2">
              <Key size={14} /> Şifre Sıfırla
            </button>
          </div>
        )}
      </div>

      {/* Tehlikeli Alan */}
      <div className="card p-6 border-red-100">
        <h2 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
          <AlertTriangle size={16} /> Tehlikeli Alan
        </h2>
        {deleteConfirm ? (
          <div className="bg-red-50 rounded-xl p-4">
            <p className="text-sm text-red-700 font-medium mb-3">
              @{user.username} hesabı ve tüm verileri (profil, leadler, NFC siparişler) kalıcı olarak silinecek. Emin misiniz?
            </p>
            <div className="flex gap-2">
              <button onClick={deleteUser} disabled={saving} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700">
                Evet, Kalıcı Olarak Sil
              </button>
              <button onClick={() => setDeleteConfirm(false)} className="btn-secondary">İptal</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setDeleteConfirm(true)} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium">
            <Trash2 size={14} /> Kullanıcıyı Sil
          </button>
        )}
      </div>
    </div>
  )
}
