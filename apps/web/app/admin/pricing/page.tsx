'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Check, Plus, Trash2, GripVertical } from 'lucide-react'

interface Plan {
  id: string
  slug: string
  displayName: string
  tagline: string
  price: number | null
  priceLabel: string | null
  currency: string
  period: string
  featured: boolean
  features: string[]
  ctaText: string
  sortOrder: number
  isActive: boolean
}

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Plan> & { features: string[] }>({ features: [] })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [newFeature, setNewFeature] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = () => {
    setError(null)
    api.get('/admin/pricing')
      .then(res => {
        setPlans(res.data.data || [])
      })
      .catch(err => {
        console.error(err)
        setError('Planlar yüklenemedi. API bağlantısı kontrol edin.')
      })
      .finally(() => setLoading(false))
  }

  const openEdit = (plan: Plan) => {
    setEditId(plan.id)
    setEditForm({
      displayName: plan.displayName,
      tagline: plan.tagline,
      price: plan.price,
      priceLabel: plan.priceLabel,
      currency: plan.currency,
      period: plan.period,
      featured: plan.featured,
      features: [...plan.features],
      ctaText: plan.ctaText,
      isActive: plan.isActive,
    })
    setNewFeature('')
  }

  const savePlan = async () => {
    if (!editId) return
    setSaving(true)
    try {
      const payload = {
        ...editForm,
        price: editForm.price === null || editForm.price === undefined ? null : Number(editForm.price),
      }
      await api.put(`/admin/pricing/${editId}`, payload)
      setEditId(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
      fetchPlans()
    } catch (err) { console.error(err) }
    setSaving(false)
  }

  const addFeature = () => {
    if (!newFeature.trim()) return
    setEditForm(f => ({ ...f, features: [...(f.features || []), newFeature.trim()] }))
    setNewFeature('')
  }

  const removeFeature = (i: number) => {
    setEditForm(f => ({ ...f, features: (f.features || []).filter((_, idx) => idx !== i) }))
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Yükleniyor...</div>
  if (error) return <div className="text-center py-20 text-red-500">{error}</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Landing Fiyatları</h1>
          <p className="text-sm text-gray-500 mt-1">Burada yaptığın değişiklikler anında landing page'e yansır.</p>
        </div>
        {saved && (
          <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
            <Check size={15} /> Kaydedildi
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {plans.map(plan => (
          <div key={plan.id} className={`card p-6 ${plan.featured ? 'ring-2 ring-amber-400' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{plan.displayName}</span>
                {plan.featured && (
                  <span className="text-xs px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-medium">En Popüler</span>
                )}
                {!plan.isActive && (
                  <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">Pasif</span>
                )}
              </div>
              <button
                onClick={() => editId === plan.id ? setEditId(null) : openEdit(plan)}
                className="text-sm text-blue-600 hover:underline"
              >
                {editId === plan.id ? 'İptal' : 'Düzenle'}
              </button>
            </div>

            {editId === plan.id ? (
              <div className="space-y-3">
                <div>
                  <label className="label">Görünen Ad</label>
                  <input className="input" value={editForm.displayName || ''} onChange={e => setEditForm(f => ({ ...f, displayName: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Açıklama</label>
                  <input className="input" value={editForm.tagline || ''} onChange={e => setEditForm(f => ({ ...f, tagline: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Fiyat (boş = teklif)</label>
                    <input
                      type="number" min="0" className="input"
                      value={editForm.price ?? ''}
                      onChange={e => setEditForm(f => ({ ...f, price: e.target.value === '' ? null : Number(e.target.value) }))}
                      placeholder="Boş bırak = teklif"
                    />
                  </div>
                  <div>
                    <label className="label">Fiyat Etiketi (teklif ise)</label>
                    <input
                      className="input"
                      value={editForm.priceLabel || ''}
                      onChange={e => setEditForm(f => ({ ...f, priceLabel: e.target.value || null }))}
                      placeholder="örn: Teklif"
                    />
                  </div>
                  <div>
                    <label className="label">Para Birimi</label>
                    <input className="input" value={editForm.currency || ''} onChange={e => setEditForm(f => ({ ...f, currency: e.target.value }))} placeholder="₺" />
                  </div>
                  <div>
                    <label className="label">Periyot</label>
                    <input className="input" value={editForm.period || ''} onChange={e => setEditForm(f => ({ ...f, period: e.target.value }))} placeholder="tek seferlik" />
                  </div>
                </div>
                <div>
                  <label className="label">Buton Metni</label>
                  <input className="input" value={editForm.ctaText || ''} onChange={e => setEditForm(f => ({ ...f, ctaText: e.target.value }))} />
                </div>

                {/* Özellikler */}
                <div>
                  <label className="label">Özellikler</label>
                  <ul className="space-y-1.5 mb-2">
                    {(editForm.features || []).map((feat, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm bg-gray-50 rounded-lg px-3 py-1.5">
                        <span className="flex-1">{feat}</span>
                        <button onClick={() => removeFeature(i)} className="text-red-400 hover:text-red-600">
                          <Trash2 size={13} />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-2">
                    <input
                      className="input flex-1"
                      value={newFeature}
                      onChange={e => setNewFeature(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addFeature()}
                      placeholder="Yeni özellik ekle..."
                    />
                    <button onClick={addFeature} className="btn-primary px-3">
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.featured || false}
                      onChange={e => setEditForm(f => ({ ...f, featured: e.target.checked }))}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700">En Popüler</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editForm.isActive !== false}
                      onChange={e => setEditForm(f => ({ ...f, isActive: e.target.checked }))}
                      className="w-4 h-4 rounded"
                    />
                    <span className="text-sm text-gray-700">Aktif</span>
                  </label>
                </div>

                <button onClick={savePlan} disabled={saving} className="btn-primary w-full">
                  {saving ? 'Kaydediliyor...' : 'Kaydet'}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">{plan.tagline}</p>
                <div className="text-2xl font-bold text-gray-900">
                  {plan.price != null
                    ? `${plan.currency}${plan.price} ${plan.period}`
                    : plan.priceLabel || '—'}
                </div>
                <ul className="space-y-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <Check size={13} className="text-green-500 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="text-xs text-gray-400 pt-1">Buton: <span className="font-medium">{plan.ctaText}</span></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
