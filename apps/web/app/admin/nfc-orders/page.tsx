'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Truck, X } from 'lucide-react'

interface NfcOrder {
  id: string
  status: 'PENDING' | 'PRODUCTION' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  trackingNumber: string | null
  cardModel: string | null
  address: string
  notes: string | null
  createdAt: string
  user: { id: string; username: string; email: string }
}

const STATUS_LABELS: Record<string, string> = {
  PENDING:    'Bekliyor',
  PRODUCTION: 'Üretimde',
  SHIPPED:    'Kargoda',
  DELIVERED:  'Teslim Edildi',
  CANCELLED:  'İptal',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING:    'bg-yellow-100 text-yellow-700',
  PRODUCTION: 'bg-blue-100 text-blue-700',
  SHIPPED:    'bg-orange-100 text-orange-700',
  DELIVERED:  'bg-green-100 text-green-700',
  CANCELLED:  'bg-red-100 text-red-700',
}

export default function AdminNfcOrdersPage() {
  const [orders, setOrders] = useState<NfcOrder[]>([])
  const [meta, setMeta] = useState<any>(null)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newForm, setNewForm] = useState({ userId: '', address: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ status: '', trackingNumber: '', notes: '' })

  const fetchOrders = (p = 1, st = statusFilter) => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), ...(st ? { status: st } : {}) })
    api.get(`/admin/nfc-orders?${params}`)
      .then(res => { setOrders(res.data.data); setMeta(res.data.meta); setPage(p) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchOrders() }, [])

  const createOrder = async () => {
    if (!newForm.userId || !newForm.address) return
    setSaving(true)
    await api.post('/admin/nfc-orders', newForm)
    setShowNew(false)
    setNewForm({ userId: '', address: '', notes: '' })
    fetchOrders()
    setSaving(false)
  }

  const openEdit = (order: NfcOrder) => {
    setEditId(order.id)
    setEditForm({ status: order.status, trackingNumber: order.trackingNumber || '', notes: order.notes || '' })
  }

  const saveEdit = async () => {
    if (!editId) return
    setSaving(true)
    await api.put(`/admin/nfc-orders/${editId}`, {
      status: editForm.status || undefined,
      trackingNumber: editForm.trackingNumber || null,
      notes: editForm.notes || null,
    })
    setEditId(null)
    fetchOrders(page)
    setSaving(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">NFC Siparişler</h1>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); fetchOrders(1, e.target.value) }}
            className="input w-40"
          >
            <option value="">Tüm Durumlar</option>
            {Object.entries(STATUS_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <button onClick={() => setShowNew(true)} className="btn-primary flex items-center gap-2">
            <Plus size={16} />
            Yeni Sipariş
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Yükleniyor...</div>
      ) : orders.length === 0 ? (
        <div className="card p-12 text-center">
          <Truck size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Sipariş bulunamadı.</p>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Müşteri</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Durum</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Kargo No</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tarih</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{order.user.username}{order.cardModel ? <span className="ml-2 text-xs font-semibold text-blue-600">{order.cardModel}</span> : null}</p>
                      <p className="text-xs text-gray-400">{order.user.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status]}`}>
                        {STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{order.trackingNumber || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openEdit(order)} className="text-xs text-blue-600 hover:underline">
                        Düzenle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button disabled={page <= 1} onClick={() => fetchOrders(page - 1)} className="btn-secondary disabled:opacity-40">← Önceki</button>
              <span className="px-4 py-2 text-sm text-gray-600">{page} / {meta.totalPages}</span>
              <button disabled={page >= meta.totalPages} onClick={() => fetchOrders(page + 1)} className="btn-secondary disabled:opacity-40">Sonraki →</button>
            </div>
          )}
        </>
      )}

      {/* Yeni sipariş modal */}
      {showNew && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setShowNew(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Yeni NFC Sipariş</h2>
              <button onClick={() => setShowNew(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Müşteri ID</label>
                <input
                  className="input"
                  placeholder="Kullanıcı ID'si"
                  value={newForm.userId}
                  onChange={e => setNewForm(f => ({ ...f, userId: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Teslimat Adresi</label>
                <textarea
                  className="input min-h-[80px]"
                  placeholder="Teslimat adresi"
                  value={newForm.address}
                  onChange={e => setNewForm(f => ({ ...f, address: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Notlar (opsiyonel)</label>
                <input
                  className="input"
                  value={newForm.notes}
                  onChange={e => setNewForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowNew(false)} className="btn-secondary flex-1">İptal</button>
              <button onClick={createOrder} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Kaydediliyor...' : 'Oluştur'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Düzenleme modal */}
      {editId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setEditId(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Sipariş Güncelle</h2>
              <button onClick={() => setEditId(null)}><X size={20} className="text-gray-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="label">Durum</label>
                <select
                  className="input"
                  value={editForm.status}
                  onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                >
                  {Object.entries(STATUS_LABELS).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Kargo Takip Numarası</label>
                <input
                  className="input"
                  placeholder="Opsiyonel"
                  value={editForm.trackingNumber}
                  onChange={e => setEditForm(f => ({ ...f, trackingNumber: e.target.value }))}
                />
              </div>
              <div>
                <label className="label">Not</label>
                <input
                  className="input"
                  placeholder="Opsiyonel"
                  value={editForm.notes}
                  onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditId(null)} className="btn-secondary flex-1">İptal</button>
              <button onClick={saveEdit} disabled={saving} className="btn-primary flex-1">
                {saving ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
