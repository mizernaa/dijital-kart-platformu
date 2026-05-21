'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Download, RefreshCw, Check } from 'lucide-react'
import Image from 'next/image'

interface QRState {
  foregroundColor: string
  backgroundColor: string
  format: string
}

export default function QRPage() {
  const [config, setConfig] = useState<QRState>({
    foregroundColor: '#000000',
    backgroundColor: '#ffffff',
    format: 'PNG',
  })
  const [dataUrl, setDataUrl] = useState('')
  const [profileUrl, setProfileUrl] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchQR = async () => {
    try {
      const res = await api.get('/customer/qr')
      const { config: c, dataUrl: url, profileUrl: pUrl } = res.data.data
      if (c) setConfig(prev => ({ ...prev, foregroundColor: c.foregroundColor, backgroundColor: c.backgroundColor }))
      setDataUrl(url)
      setProfileUrl(pUrl)
    } catch (err) { console.error(err) }
  }

  useEffect(() => {
    fetchQR().finally(() => setLoading(false))
  }, [])

  const saveAndRefresh = async () => {
    try {
      await api.post('/customer/qr', config)
      setSaved(true)
      await fetchQR()
      setTimeout(() => setSaved(false), 2000)
    } catch (err) { console.error(err) }
  }

  const download = async (format: 'png' | 'svg') => {
    try {
      const res = await api.get(`/customer/qr/download?format=${format}&size=1024`, {
        responseType: 'blob',
      })
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `qr-kod.${format}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) { console.error(err) }
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Yükleniyor...</div>

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">QR Kod Yönetimi</h1>

      <div className="grid grid-cols-2 gap-6">
        {/* Önizleme */}
        <div className="card p-6 flex flex-col items-center">
          <h2 className="font-semibold text-gray-900 mb-4 self-start">Önizleme</h2>
          {dataUrl ? (
            <div className="border border-gray-200 rounded-xl p-4">
              <Image src={dataUrl} alt="QR Kod" width={200} height={200} />
            </div>
          ) : (
            <div className="w-52 h-52 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm">
              QR oluşturuluyor...
            </div>
          )}
          {profileUrl && (
            <p className="text-xs text-gray-500 mt-3 text-center break-all">{profileUrl}</p>
          )}
        </div>

        {/* Ayarlar */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Renk Ayarları</h2>

          <div>
            <label className="label">Ön Plan Rengi (QR)</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.foregroundColor}
                onChange={e => setConfig(p => ({ ...p, foregroundColor: e.target.value }))}
                className="w-10 h-9 rounded cursor-pointer border border-gray-200"
              />
              <input
                type="text"
                value={config.foregroundColor}
                onChange={e => setConfig(p => ({ ...p, foregroundColor: e.target.value }))}
                className="input font-mono text-sm flex-1"
              />
            </div>
          </div>

          <div>
            <label className="label">Arka Plan Rengi</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={config.backgroundColor}
                onChange={e => setConfig(p => ({ ...p, backgroundColor: e.target.value }))}
                className="w-10 h-9 rounded cursor-pointer border border-gray-200"
              />
              <input
                type="text"
                value={config.backgroundColor}
                onChange={e => setConfig(p => ({ ...p, backgroundColor: e.target.value }))}
                className="input font-mono text-sm flex-1"
              />
            </div>
          </div>

          <button onClick={saveAndRefresh} className="btn-primary w-full flex items-center justify-center gap-2">
            {saved ? <><Check size={16} /> Kaydedildi</> : <><RefreshCw size={16} /> Uygula & Yenile</>}
          </button>
        </div>
      </div>

      {/* İndirme */}
      <div className="card p-6 mt-4">
        <h2 className="font-semibold text-gray-900 mb-4">İndir</h2>
        <div className="flex gap-3">
          <button
            onClick={() => download('png')}
            className="btn-secondary flex items-center gap-2 flex-1 justify-center"
          >
            <Download size={16} /> PNG İndir (1024px)
          </button>
          <button
            onClick={() => download('svg')}
            className="btn-secondary flex items-center gap-2 flex-1 justify-center"
          >
            <Download size={16} /> SVG İndir (Vektör)
          </button>
        </div>
      </div>
    </div>
  )
}
