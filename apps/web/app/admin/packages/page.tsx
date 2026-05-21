'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Check, Package, Users, BarChart2, Globe, Wifi, Palette } from 'lucide-react'

interface Pkg {
  id: string
  name: string
  displayName: string
  maxPages: number
  analyticsRetentionDays: number
  hasCustomDomain: boolean
  hasNfc: boolean
  maxThemes: number
  maxTeamMembers: number
  _count?: { users: number }
}

const PKG_COLORS: Record<string, string> = {
  FREE:       'bg-gray-100 text-gray-700',
  STARTER:    'bg-blue-100 text-blue-700',
  PRO:        'bg-purple-100 text-purple-700',
  ENTERPRISE: 'bg-amber-100 text-amber-700',
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Pkg[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Pkg>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    api.get('/admin/packages')
      .then(res => setPackages(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const openEdit = (pkg: Pkg) => {
    setEditId(pkg.id)
    setEditForm({
      displayName: pkg.displayName,
      maxPages: pkg.maxPages,
      analyticsRetentionDays: pkg.analyticsRetentionDays,
      hasCustomDomain: pkg.hasCustomDomain,
      hasNfc: pkg.hasNfc,
      maxThemes: pkg.maxThemes,
      maxTeamMembers: pkg.maxTeamMembers,
    })
  }

  const savePackage = async () => {
    if (!editId) return
    setSaving(true)
    try {
      const res = await api.put(`/admin/packages/${editId}`, editForm)
      setPackages(prev => prev.map(p => p.id === editId ? { ...p, ...res.data.data } : p))
      setEditId(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) { console.error(err) }
    setSaving(false)
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Yükleniyor...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paket Yönetimi</h1>
        {saved && (
          <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
            <Check size={15} /> Kaydedildi
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {packages.map(pkg => (
          <div key={pkg.id} className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${PKG_COLORS[pkg.name] || 'bg-gray-100 text-gray-700'}`}>
                  {pkg.name}
                </span>
                <span className="font-semibold text-gray-900">{pkg.displayName}</span>
              </div>
              <button
                onClick={() => editId === pkg.id ? setEditId(null) : openEdit(pkg)}
                className="text-sm text-blue-600 hover:underline"
              >
                {editId === pkg.id ? 'İptal' : 'Düzenle'}
              </button>
            </div>

            {editId === pkg.id ? (
              /* Düzenleme formu */
              <div className="space-y-3">
                <div>
                  <label className="label">Görünen Ad</label>
                  <input
                    className="input"
                    value={editForm.displayName || ''}
                    onChange={e => setEditForm(f => ({ ...f, displayName: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Maks. Sayfa</label>
                    <input
                      type="number" min="1" className="input"
                      value={editForm.maxPages || 1}
                      onChange={e => setEditForm(f => ({ ...f, maxPages: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="label">Analitik Saklama (gün)</label>
                    <input
                      type="number" min="1" className="input"
                      value={editForm.analyticsRetentionDays || 7}
                      onChange={e => setEditForm(f => ({ ...f, analyticsRetentionDays: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="label">Maks. Tema</label>
                    <input
                      type="number" min="1" className="input"
                      value={editForm.maxThemes || 1}
                      onChange={e => setEditForm(f => ({ ...f, maxThemes: Number(e.target.value) }))}
                    />
                  </div>
                  <div>
                    <label className="label">Maks. Ekip Üyesi</label>
                    <input
                      type="number" min="1" className="input"
                      value={editForm.maxTeamMembers || 1}
                      onChange={e => setEditForm(f => ({ ...f, maxTeamMembers: Number(e.target.value) }))}
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.hasCustomDomain || false}
                      onChange={e => setEditForm(f => ({ ...f, hasCustomDomain: e.target.checked }))}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700">Özel Domain</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.hasNfc || false}
                      onChange={e => setEditForm(f => ({ ...f, hasNfc: e.target.checked }))}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700">NFC Desteği</span>
                  </label>
                </div>
                <button onClick={savePackage} disabled={saving} className="btn-primary w-full">
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            ) : (
              /* Görünüm */
              <div className="space-y-2">
                {[
                  { icon: <Package size={14} />, label: 'Maks. Sayfa', value: pkg.maxPages },
                  { icon: <BarChart2 size={14} />, label: 'Analitik Saklama', value: `${pkg.analyticsRetentionDays} gün` },
                  { icon: <Palette size={14} />, label: 'Maks. Tema', value: pkg.maxThemes },
                  { icon: <Users size={14} />, label: 'Maks. Ekip', value: pkg.maxTeamMembers },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm text-gray-500">{icon} {label}</span>
                    <span className="text-sm font-semibold text-gray-900">{value}</span>
                  </div>
                ))}
                <div className="flex gap-2 pt-1">
                  {pkg.hasCustomDomain && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                      <Globe size={10} /> Özel Domain
                    </span>
                  )}
                  {pkg.hasNfc && (
                    <span className="flex items-center gap-1 text-xs px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-medium">
                      <Wifi size={10} /> NFC
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
