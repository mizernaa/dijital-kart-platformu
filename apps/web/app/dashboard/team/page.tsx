'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Users, UserPlus, Trash2, Clock, X, UserCheck } from 'lucide-react'

interface TeamMember {
  id: string
  memberId: string
  role: 'ADMIN' | 'EDITOR' | 'VIEWER'
  createdAt: string
  member: { username: string; email: string; profile: { displayName: string; avatarUrl: string | null } | null }
}

interface Invitation {
  id: string
  email: string
  token: string
  expiresAt: string
  createdAt: string
}

interface TeamData {
  members: TeamMember[]
  memberCount: number
  maxTeamMembers: number
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-red-100 text-red-700',
  EDITOR: 'bg-blue-100 text-blue-700',
  VIEWER: 'bg-gray-100 text-gray-600',
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Yönetici',
  EDITOR: 'Düzenleyici',
  VIEWER: 'Görüntüleyici',
}

export default function TeamPage() {
  const [data, setData] = useState<TeamData | null>(null)
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'EDITOR' | 'VIEWER'>('VIEWER')
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchAll = async () => {
    try {
      const [teamRes, invRes] = await Promise.all([
        api.get('/customer/team'),
        api.get('/customer/team/invitations'),
      ])
      setData(teamRes.data.data)
      setInvitations(invRes.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const flash = (msg: string, isError = false) => {
    if (isError) { setError(msg); setSuccess('') }
    else { setSuccess(msg); setError('') }
    setTimeout(() => { setError(''); setSuccess('') }, 4000)
  }

  const invite = async () => {
    if (!email.trim()) return
    setInviting(true)
    try {
      const res = await api.post('/customer/team/invite', { email: email.trim(), role })
      flash(res.data.message || 'İşlem tamamlandı.')
      setEmail('')
      fetchAll()
    } catch (err: any) {
      flash(err?.response?.data?.message || 'Bir hata oluştu.', true)
    } finally {
      setInviting(false)
    }
  }

  const removeMember = async (memberId: string) => {
    if (!confirm('Üye ekipten çıkarılsın mı?')) return
    try {
      await api.delete(`/customer/team/${memberId}`)
      flash('Üye çıkarıldı.')
      fetchAll()
    } catch (err: any) {
      flash(err?.response?.data?.message || 'Bir hata oluştu.', true)
    }
  }

  const cancelInvitation = async (id: string) => {
    try {
      await api.delete(`/customer/team/invitations/${id}`)
      setInvitations(prev => prev.filter(i => i.id !== id))
      flash('Davet iptal edildi.')
    } catch (err: any) {
      flash(err?.response?.data?.message || 'Bir hata oluştu.', true)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Yükleniyor...</div>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users size={24} className="text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">Ekip</h1>
        </div>
        {data && (
          <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
            {data.memberCount} / {data.maxTeamMembers} üye
          </span>
        )}
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">{success}</div>}

      {/* Üye listesi */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserCheck size={16} /> Mevcut Üyeler
        </h2>

        {data?.members.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">Henüz ekip üyesi yok.</p>
        ) : (
          <div className="space-y-3">
            {data?.members.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600 overflow-hidden">
                    {m.member.profile?.avatarUrl ? (
                      <img src={m.member.profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      m.member.profile?.displayName?.[0]?.toUpperCase() || m.member.username[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {m.member.profile?.displayName || m.member.username}
                    </p>
                    <p className="text-xs text-gray-500">{m.member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[m.role]}`}>
                    {ROLE_LABELS[m.role]}
                  </span>
                  <button onClick={() => removeMember(m.memberId)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Davet formu */}
      <div className="card p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <UserPlus size={16} /> Üye Davet Et
        </h2>
        <div className="flex gap-2 mb-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="email@ornek.com"
            className="input flex-1"
            onKeyDown={e => e.key === 'Enter' && invite()}
          />
          <select
            value={role}
            onChange={e => setRole(e.target.value as any)}
            className="input w-36"
          >
            <option value="VIEWER">Görüntüleyici</option>
            <option value="EDITOR">Düzenleyici</option>
            <option value="ADMIN">Yönetici</option>
          </select>
        </div>
        <button onClick={invite} disabled={inviting || !email.trim()} className="btn-primary w-full">
          {inviting ? 'Gönderiliyor...' : 'Davet Gönder'}
        </button>
      </div>

      {/* Bekleyen davetler */}
      {invitations.length > 0 && (
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={16} /> Bekleyen Davetler
          </h2>
          <div className="space-y-2">
            {invitations.map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                <div>
                  <p className="text-sm font-medium text-gray-900">{inv.email}</p>
                  <p className="text-xs text-gray-400">
                    Son: {new Date(inv.expiresAt).toLocaleDateString('tr-TR')}
                  </p>
                </div>
                <button onClick={() => cancelInvitation(inv.id)}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
