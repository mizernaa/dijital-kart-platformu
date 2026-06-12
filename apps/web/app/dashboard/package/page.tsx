'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Check, X, Crown, ArrowRight } from 'lucide-react'

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
}

const PUBLIC_SITE = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'https://qansvizit.com'

// Paket özelliklerini okunur satırlara çevirir
function featureRows(p: Pkg): { label: string; value: string | boolean }[] {
  return [
    { label: 'Dijital profil sayfası', value: p.maxPages > 1 ? `${p.maxPages} sayfa` : '1 sayfa' },
    { label: 'İstatistik geçmişi', value: `${p.analyticsRetentionDays} gün` },
    { label: 'Tema sayısı', value: p.maxThemes >= 99 ? 'Tümü' : `${p.maxThemes} tema` },
    { label: 'Ekip üyesi', value: p.maxTeamMembers > 1 ? `${p.maxTeamMembers} kişi` : '—' },
    { label: 'Özel domain (siradiniz.com)', value: p.hasCustomDomain },
    { label: 'NFC kart desteği', value: p.hasNfc },
  ]
}

export default function PackagePage() {
  const [current, setCurrent] = useState<Pkg | null>(null)
  const [all, setAll] = useState<Pkg[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/customer/package')
      .then(res => { setCurrent(res.data.data.current); setAll(res.data.data.all) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="text-center py-20 text-gray-400">Yükleniyor...</div>

  const currentIdx = all.findIndex(p => p.id === current?.id)

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Paketim</h1>
      <p className="text-sm text-gray-400 mb-6">Mevcut paketin, paket farkları ve yükseltme seçenekleri</p>

      {/* Mevcut paket kartı */}
      <div className="card p-6 mb-8 bg-gradient-to-br from-blue-50 to-white border-blue-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center"><Crown size={22} /></div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Mevcut Paketin</p>
            <p className="text-xl font-bold text-gray-900">{current?.displayName || 'Standart'}</p>
          </div>
          {currentIdx >= 0 && currentIdx < all.length - 1 && (
            <a href="#paketler" className="ml-auto btn-primary text-sm flex items-center gap-1.5">
              Yükselt <ArrowRight size={15} />
            </a>
          )}
        </div>
      </div>

      {/* Karşılaştırma */}
      <h2 id="paketler" className="font-semibold text-gray-900 mb-4">Paket Karşılaştırması</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {all.map((p, i) => {
          const isCurrent = p.id === current?.id
          const isUpgrade = currentIdx >= 0 && i > currentIdx
          return (
            <div key={p.id} className={`card p-5 flex flex-col ${isCurrent ? 'border-blue-400 ring-2 ring-blue-100' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-gray-900">{p.displayName}</p>
                {isCurrent && <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase">Paketin</span>}
              </div>
              <ul className="space-y-2 flex-1">
                {featureRows(p).map((f, j) => (
                  <li key={j} className="flex items-start gap-2 text-sm">
                    {typeof f.value === 'boolean' ? (
                      f.value
                        ? <Check size={15} className="text-green-500 mt-0.5 shrink-0" />
                        : <X size={15} className="text-gray-300 mt-0.5 shrink-0" />
                    ) : (
                      <Check size={15} className="text-green-500 mt-0.5 shrink-0" />
                    )}
                    <span className={typeof f.value === 'boolean' && !f.value ? 'text-gray-300' : 'text-gray-600'}>
                      {f.label}{typeof f.value === 'string' ? `: ${f.value}` : ''}
                    </span>
                  </li>
                ))}
              </ul>
              {isUpgrade && (
                <a
                  href={`${PUBLIC_SITE}/#fiyat`}
                  target="_blank" rel="noopener noreferrer"
                  className="btn-primary text-sm text-center mt-4"
                >
                  Bu Pakete Geç
                </a>
              )}
            </div>
          )
        })}
      </div>

      <div className="card p-5 mt-8 bg-gray-50">
        <p className="text-sm text-gray-600">
          <b>Nasıl yükseltirim?</b> "Bu Pakete Geç" ile fiyat sayfamızdan sipariş verebilir ya da destek ekibimize
          ulaşabilirsin — geçiş aynı gün içinde yapılır, profilindeki hiçbir veri kaybolmaz.
        </p>
      </div>
    </div>
  )
}
