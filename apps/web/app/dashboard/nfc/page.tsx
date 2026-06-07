'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Wifi, Package, Truck, CheckCircle, XCircle, Clock, ChevronDown, Check, Plus } from 'lucide-react'

interface NfcOrder {
  id: string
  status: 'PENDING' | 'PRODUCTION' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  trackingNumber: string | null
  cardModel: string | null
  address: string
  notes: string | null
  createdAt: string
  updatedAt: string
}

interface Plan {
  id: string; slug: string; displayName: string; tagline: string | null
  price: number | null; priceLabel: string | null; currency: string; period: string
  features: string[]; featured: boolean
}

const STATUS_STEPS = ['PENDING', 'PRODUCTION', 'SHIPPED', 'DELIVERED'] as const

const STATUS_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  PENDING:    { label: 'Bekliyor',       icon: <Clock size={20} />,       color: 'text-yellow-500' },
  PRODUCTION: { label: 'Üretimde',       icon: <Package size={20} />,     color: 'text-blue-500' },
  SHIPPED:    { label: 'Kargoda',        icon: <Truck size={20} />,       color: 'text-orange-500' },
  DELIVERED:  { label: 'Teslim Edildi',  icon: <CheckCircle size={20} />, color: 'text-green-500' },
  CANCELLED:  { label: 'İptal',          icon: <XCircle size={20} />,     color: 'text-red-500' },
}

// Fiyatlandırma planları yüklenemezse yedek kart modelleri
const FALLBACK_PLANS: Plan[] = [
  { id: 'k', slug: 'klasik', displayName: 'Klasik', tagline: 'Zarif PVC NFC kart', price: 399, priceLabel: null, currency: '₺', period: 'tek seferlik', features: ['Mat PVC gövde', 'Ücretsiz dijital profil'], featured: false },
  { id: 'm', slug: 'metal', displayName: 'Metal', tagline: 'Lazer kazıma premium metal', price: 899, priceLabel: null, currency: '₺', period: 'tek seferlik', features: ['Premium metal', 'Lazer kazıma'], featured: true },
  { id: 'c', slug: 'kurumsal', displayName: 'Kurumsal', tagline: 'Ekipler için toplu üretim', price: null, priceLabel: 'Teklif', currency: '', period: '', features: ['Toplu üretim', 'Ekip yönetimi'], featured: false },
]

export default function NfcPage() {
  const [latest, setLatest] = useState<NfcOrder | null>(null)
  const [history, setHistory] = useState<NfcOrder[]>([])
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const [orderOpen, setOrderOpen] = useState(false)
  const [model, setModel] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const load = () => Promise.all([
    api.get('/customer/nfc').then(r => setLatest(r.data.data)),
    api.get('/customer/nfc/history').then(r => setHistory(r.data.data)),
  ])

  useEffect(() => {
    Promise.all([
      load(),
      api.get('/p/plans').then(r => {
        const list = (r.data?.data || []) as Plan[]
        if (list.length) setPlans(list)
      }).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [])

  const activeInProgress = !!latest && !['DELIVERED', 'CANCELLED'].includes(latest.status)
  // Aktif sipariş yoksa sipariş formunu varsayılan açık göster
  useEffect(() => { if (!loading) setOrderOpen(!activeInProgress) }, [loading, activeInProgress])

  const submitOrder = async () => {
    setError('')
    if (!model) { setError('Lütfen bir kart modeli seçin.'); return }
    if (address.trim().length < 10) { setError('Lütfen tam bir teslimat adresi girin.'); return }
    setSubmitting(true)
    try {
      await api.post('/customer/nfc', { cardModel: model, address: address.trim(), notes: notes.trim() || undefined })
      setSubmitted(true)
      setAddress(''); setNotes(''); setModel('')
      await load()
      setTimeout(() => setSubmitted(false), 4000)
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Sipariş oluşturulamadı, tekrar deneyin.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Yükleniyor...</div>

  const currentStepIndex = activeInProgress ? STATUS_STEPS.indexOf(latest!.status as any) : -1

  const priceText = (p: Plan) => p.price != null ? `${p.currency}${p.price}` : (p.priceLabel || '—')

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">NFC Kartım</h1>

      {/* Aktif sipariş durumu */}
      {latest && (
        <div className="card p-6 mb-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-gray-900">Sipariş Durumu{latest.cardModel ? ` · ${latest.cardModel}` : ''}</h2>
            <span className="text-xs text-gray-400">{new Date(latest.createdAt).toLocaleDateString('tr-TR')}</span>
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
              <div className="relative flex items-center justify-between mb-8">
                <div className="absolute left-0 right-0 top-5 h-0.5 bg-gray-200 -z-0" />
                <div className="absolute left-0 top-5 h-0.5 bg-blue-500 transition-all duration-500"
                  style={{ width: currentStepIndex >= 0 ? `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` : '0%' }} />
                {STATUS_STEPS.map((step, idx) => {
                  const meta = STATUS_META[step]
                  const done = idx <= currentStepIndex
                  const active = idx === currentStepIndex
                  return (
                    <div key={step} className="flex flex-col items-center gap-2 z-10">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${done ? 'bg-blue-500 text-white shadow-md' : 'bg-white border-2 border-gray-200 text-gray-300'}`}>{meta.icon}</div>
                      <span className={`text-xs font-medium ${active ? 'text-blue-600' : done ? 'text-gray-700' : 'text-gray-400'}`}>{meta.label}</span>
                    </div>
                  )
                })}
              </div>
              <div className={`p-4 rounded-xl ${STATUS_META[latest.status]?.color.replace('text-', 'bg-').replace('-500', '-50')}`}>
                <div className={`flex items-center gap-2 ${STATUS_META[latest.status]?.color} font-semibold`}>
                  {STATUS_META[latest.status]?.icon}{STATUS_META[latest.status]?.label}
                </div>
                {latest.trackingNumber && <p className="text-sm text-gray-600 mt-2">Kargo takip: <strong>{latest.trackingNumber}</strong></p>}
              </div>
            </>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 font-medium mb-1">Teslimat Adresi</p>
            <p className="text-sm text-gray-700">{latest.address}</p>
          </div>
        </div>
      )}

      {/* Yeni sipariş */}
      <div className="card p-6 mb-4">
        {activeInProgress && !orderOpen ? (
          <button onClick={() => setOrderOpen(true)} className="flex items-center gap-2 text-blue-600 font-medium text-sm">
            <Plus size={16} /> Yeni Kart Siparişi Ver
          </button>
        ) : (
          <>
            <h2 className="font-semibold text-gray-900 mb-1">{latest ? 'Yeni Kart Siparişi' : 'NFC Kartını Sipariş Et'}</h2>
            <p className="text-sm text-gray-500 mb-4">Bir model seç, teslimat adresini gir; kartın 1-3 iş günü içinde kapında.</p>

            {submitted ? (
              <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl mb-2">
                <CheckCircle size={22} className="text-green-500" />
                <div>
                  <p className="font-semibold text-green-700">Siparişin alındı! 🎉</p>
                  <p className="text-sm text-green-600">Ekibimiz en kısa sürede üretime alacak. Durumu buradan takip edebilirsin.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Kart modelleri */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  {plans.map(p => {
                    const selected = model === p.displayName
                    return (
                      <button key={p.id} onClick={() => setModel(p.displayName)}
                        className={`relative text-left rounded-xl border-2 p-4 transition-all hover:border-blue-300 ${selected ? 'border-blue-500 ring-2 ring-blue-200 bg-blue-50' : 'border-gray-200'}`}>
                        {p.featured && <span className="absolute top-2 right-2 text-[10px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Popüler</span>}
                        <p className="font-bold text-gray-900">{p.displayName}</p>
                        <p className="text-lg font-extrabold text-gray-900 mt-1">{priceText(p)}<span className="text-xs font-medium text-gray-400 ml-1">{p.period}</span></p>
                        {p.tagline && <p className="text-xs text-gray-500 mt-1 leading-snug">{p.tagline}</p>}
                        {selected && <div className="absolute bottom-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"><Check size={12} className="text-white" /></div>}
                      </button>
                    )
                  })}
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Teslimat Adresi</label>
                    <textarea className="input" rows={3} value={address} onChange={e => setAddress(e.target.value)} placeholder="Ad soyad, açık adres, ilçe/il, posta kodu, telefon" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Not (opsiyonel)</label>
                    <input className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Kart üzerine yazılacak isim/ünvan vb." />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                  <div className="flex items-center gap-3">
                    <button onClick={submitOrder} disabled={submitting} className="btn-primary">{submitting ? 'Gönderiliyor…' : 'Siparişi Ver'}</button>
                    {activeInProgress && <button onClick={() => setOrderOpen(false)} className="text-sm text-gray-500 hover:underline">Vazgeç</button>}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Geçmiş siparişler */}
      {history.length > 1 && (
        <div className="card overflow-hidden">
          <button className="flex items-center justify-between w-full p-4 text-sm font-medium text-gray-700 hover:bg-gray-50" onClick={() => setHistoryOpen(v => !v)}>
            <span>Geçmiş Siparişler ({history.length - 1})</span>
            <ChevronDown size={16} className={`transition-transform ${historyOpen ? 'rotate-180' : ''}`} />
          </button>
          {historyOpen && (
            <div className="border-t border-gray-100 divide-y divide-gray-50">
              {history.slice(1).map(order => (
                <div key={order.id} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <span className={`text-sm font-medium ${STATUS_META[order.status]?.color}`}>{STATUS_META[order.status]?.label}</span>
                    {order.cardModel && <span className="text-xs text-gray-400 ml-2">{order.cardModel}</span>}
                    <p className="text-xs text-gray-400 mt-0.5">{order.address.slice(0, 50)}...</p>
                  </div>
                  <span className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
