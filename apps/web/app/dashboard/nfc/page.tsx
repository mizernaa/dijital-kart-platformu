'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Wifi, Package, Truck, CheckCircle, XCircle, Clock, ChevronDown } from 'lucide-react'

interface NfcOrder {
  id: string
  status: 'PENDING' | 'PRODUCTION' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  trackingNumber: string | null
  address: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

const STATUS_STEPS = ['PENDING', 'PRODUCTION', 'SHIPPED', 'DELIVERED'] as const

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  PENDING:    { label: 'Bekliyor',      icon: <Clock size={20} />,        color: 'text-yellow-500' },
  PRODUCTION: { label: 'Üretimde',     icon: <Package size={20} />,      color: 'text-blue-500' },
  SHIPPED:    { label: 'Kargoda',      icon: <Truck size={20} />,        color: 'text-orange-500' },
  DELIVERED:  { label: 'Teslim Edildi', icon: <CheckCircle size={20} />, color: 'text-green-500' },
  CANCELLED:  { label: 'İptal',        icon: <XCircle size={20} />,      color: 'text-red-500' },
}

export default function NfcPage() {
  const [latest, setLatest] = useState<NfcOrder | null>(null)
  const [history, setHistory] = useState<NfcOrder[]>([])
  const [historyOpen, setHistoryOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/customer/nfc').then(r => setLatest(r.data.data)),
      api.get('/customer/nfc/history').then(r => setHistory(r.data.data)),
    ]).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-20 text-gray-400">Yükleniyor...</div>

  const currentStepIndex = latest && latest.status !== 'CANCELLED'
    ? STATUS_STEPS.indexOf(latest.status as any)
    : -1

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">NFC Kartım</h1>

      {!latest ? (
        <div className="card p-12 text-center">
          <Wifi size={48} className="mx-auto text-gray-200 mb-4" />
          <p className="text-gray-500 font-medium">Henüz NFC kart siparişiniz yok.</p>
          <p className="text-sm text-gray-400 mt-1">Destek ekibimizle iletişime geçerek sipariş verebilirsiniz.</p>
        </div>
      ) : (
        <>
          {/* Aktif sipariş */}
          <div className="card p-6 mb-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-gray-900">Sipariş Durumu</h2>
              <span className="text-xs text-gray-400">
                {new Date(latest.createdAt).toLocaleDateString('tr-TR')}
              </span>
            </div>

            {latest.status === 'CANCELLED' ? (
              <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
                <XCircle size={24} className="text-red-500" />
                <div>
                  <p className="font-semibold text-red-700">Sipariş İptal Edildi</p>
                  {latest.notes && <p className="text-sm text-red-500 mt-0.5">{latest.notes}</p>}
                </div>
              </div>
            ) : (
              <>
                {/* Adım göstergesi */}
                <div className="relative flex items-center justify-between mb-8">
                  <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200 -z-0" />
                  <div
                    className="absolute left-0 top-5 h-0.5 bg-blue-500 transition-all duration-500"
                    style={{ width: currentStepIndex >= 0 ? `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }}
                  />
                  {STATUS_STEPS.map((step, idx) => {
                    const meta = STATUS_META[step]
                    const done = idx <= currentStepIndex
                    const active = idx === currentStepIndex
                    return (
                      <div key={step} className="flex flex-col items-center gap-2 z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all
                          ${done ? 'bg-blue-500 text-white shadow-md' : 'bg-white border-2 border-gray-200 text-gray-300'}`}>
                          {meta.icon}
                        </div>
                        <span className={`text-xs font-medium ${active ? 'text-blue-600' : done ? 'text-gray-700' : 'text-gray-400'}`}>
                          {meta.label}
                        </span>
                      </div>
                    )
                  })}
                </div>

                {/* Aktif durum detayı */}
                <div className={`p-4 rounded-xl ${STATUS_META[latest.status]?.color.replace('text-', 'bg-').replace('-500', '-50')}`}>
                  <div className={`flex items-center gap-2 ${STATUS_META[latest.status]?.color} font-semibold`}>
                    {STATUS_META[latest.status]?.icon}
                    {STATUS_META[latest.status]?.label}
                  </div>
                  {latest.trackingNumber && (
                    <p className="text-sm text-gray-600 mt-2">
                      Kargo takip: <strong>{latest.trackingNumber}</strong>
                    </p>
                  )}
                </div>
              </>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500 font-medium mb-1">Teslimat Adresi</p>
              <p className="text-sm text-gray-700">{latest.address}</p>
            </div>
          </div>

          {/* Geçmiş siparişler */}
          {history.length > 1 && (
            <div className="card overflow-hidden">
              <button
                className="flex items-center justify-between w-full p-4 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={() => setHistoryOpen(v => !v)}
              >
                <span>Geçmiş Siparişler ({history.length - 1})</span>
                <ChevronDown size={16} className={`transition-transform ${historyOpen ? 'rotate-180' : ''}`} />
              </button>
              {historyOpen && (
                <div className="border-t border-gray-100 divide-y divide-gray-50">
                  {history.slice(1).map(order => (
                    <div key={order.id} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <span className={`text-sm font-medium ${STATUS_META[order.status]?.color}`}>
                          {STATUS_META[order.status]?.label}
                        </span>
                        <p className="text-xs text-gray-400 mt-0.5">{order.address.slice(0, 50)}...</p>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
