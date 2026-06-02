'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { ShoppingBag, Check, Truck, Package, X, Clock, Trash2 } from 'lucide-react'

interface Order {
  id: string; name: string; phone: string; email: string
  plan: string; note: string | null; status: string; isRead: boolean; createdAt: string
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Bekliyor', CONFIRMED: 'Onaylandı', SHIPPED: 'Kargoya Verildi',
  DELIVERED: 'Teslim Edildi', CANCELLED: 'İptal',
}
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
}
const PLAN_COLORS: Record<string, string> = {
  KLASIK: 'bg-gray-100 text-gray-700',
  METAL: 'bg-yellow-100 text-yellow-800',
  KURUMSAL: 'bg-blue-100 text-blue-800',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/admin/orders${filter ? `?status=${filter}` : ''}`)
      setOrders(res.data.data.orders)
      setTotal(res.data.data.total)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { fetchOrders() }, [filter])

  const updateStatus = async (id: string, status: string) => {
    await api.patch(`/admin/orders/${id}/status`, { status })
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status, isRead: true } : o))
  }

  const deleteOrder = async (id: string) => {
    if (!confirm('Siparişi silmek istiyor musunuz?')) return
    await api.delete(`/admin/orders/${id}`)
    setOrders(prev => prev.filter(o => o.id !== id))
  }

  const markRead = async (id: string) => {
    await api.patch(`/admin/orders/${id}/read`)
    setOrders(prev => prev.map(o => o.id === id ? { ...o, isRead: true } : o))
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Yükleniyor...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ShoppingBag size={24} className="text-gray-700" />
          <h1 className="text-2xl font-bold text-gray-900">Siparişler</h1>
          <span className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">{total}</span>
        </div>
      </div>

      {/* Filtre */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['', 'PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s ? STATUS_LABELS[s] : 'Tümü'}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">Sipariş bulunamadı.</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id}
              className={`card p-5 ${!order.isRead ? 'border-l-4 border-l-blue-500' : ''}`}
              onClick={() => !order.isRead && markRead(order.id)}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PLAN_COLORS[order.plan]}`}>
                      {order.plan}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status]}
                    </span>
                    {!order.isRead && <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">Yeni</span>}
                  </div>
                  <p className="font-semibold text-gray-900">{order.name}</p>
                  <p className="text-sm text-gray-500">{order.phone} · {order.email}</p>
                  {order.note && <p className="text-sm text-gray-500 mt-1 italic">"{order.note}"</p>}
                  <p className="text-xs text-gray-400 mt-2">{new Date(order.createdAt).toLocaleString('tr-TR')}</p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  {order.status === 'PENDING' && (
                    <button onClick={() => updateStatus(order.id, 'CONFIRMED')}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100">
                      <Check size={12} /> Onayla
                    </button>
                  )}
                  {order.status === 'CONFIRMED' && (
                    <button onClick={() => updateStatus(order.id, 'SHIPPED')}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium hover:bg-purple-100">
                      <Truck size={12} /> Kargola
                    </button>
                  )}
                  {order.status === 'SHIPPED' && (
                    <button onClick={() => updateStatus(order.id, 'DELIVERED')}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-green-50 text-green-700 rounded-lg text-xs font-medium hover:bg-green-100">
                      <Package size={12} /> Teslim Edildi
                    </button>
                  )}
                  {!['DELIVERED', 'CANCELLED'].includes(order.status) && (
                    <button onClick={() => updateStatus(order.id, 'CANCELLED')}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium hover:bg-red-100">
                      <X size={12} /> İptal
                    </button>
                  )}
                  <button onClick={() => deleteOrder(order.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-50 text-gray-500 rounded-lg text-xs font-medium hover:bg-gray-100">
                    <Trash2 size={12} /> Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
