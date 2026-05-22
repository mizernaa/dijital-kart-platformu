'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Globe, CheckCircle, AlertCircle, Trash2, RefreshCw, Lock } from 'lucide-react'

interface DomainStatus {
  domain: string | null
  verified: boolean
  token: string | null
  cnameTarget: string
}

export default function CustomDomainPage() {
  const [status, setStatus] = useState<DomainStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [domainInput, setDomainInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [removing, setRemoving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [locked, setLocked] = useState(false)

  useEffect(() => {
    api.get('/customer/custom-domain')
      .then(res => {
        setStatus(res.data.data)
        setLocked(false)
      })
      .catch(err => {
        if (err?.response?.status === 403) setLocked(true)
        setLoading(false)
      })
      .finally(() => setLoading(false))
  }, [])

  const flash = (msg: string, isError = false) => {
    if (isError) { setError(msg); setSuccess('') }
    else { setSuccess(msg); setError('') }
    setTimeout(() => { setError(''); setSuccess('') }, 4000)
  }

  const saveDomain = async () => {
    if (!domainInput.trim()) return
    setSaving(true)
    try {
      const res = await api.post('/customer/custom-domain', { domain: domainInput.trim() })
      setStatus(res.data.data)
      setDomainInput('')
      flash(res.data.message || 'Domain kaydedildi.')
    } catch (err: any) {
      flash(err?.response?.data?.message || 'Bir hata oluştu.', true)
    } finally {
      setSaving(false)
    }
  }

  const verifyDomain = async () => {
    setVerifying(true)
    try {
      const res = await api.post('/customer/custom-domain/verify')
      flash(res.data.message || 'Doğrulama başarılı!')
      setStatus(prev => prev ? { ...prev, verified: true } : prev)
    } catch (err: any) {
      flash(err?.response?.data?.message || 'Doğrulama başarısız.', true)
    } finally {
      setVerifying(false)
    }
  }

  const removeDomain = async () => {
    if (!confirm('Domain kaldırılsın mı?')) return
    setRemoving(true)
    try {
      await api.delete('/customer/custom-domain')
      setStatus(prev => prev ? { ...prev, domain: null, verified: false, token: null } : prev)
      flash('Domain kaldırıldı.')
    } catch (err: any) {
      flash(err?.response?.data?.message || 'Bir hata oluştu.', true)
    } finally {
      setRemoving(false)
    }
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Yükleniyor...</div>

  if (locked) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Özel Domain</h1>
        <div className="card p-10 text-center">
          <Lock size={40} className="mx-auto mb-4 text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-700 mb-2">PRO veya ENTERPRISE Paket Gerekiyor</h2>
          <p className="text-gray-500 text-sm">Kendi alan adınızı kullanmak için paketinizi yükseltin.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Globe size={24} className="text-gray-700" />
        <h1 className="text-2xl font-bold text-gray-900">Özel Domain</h1>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">{success}</div>}

      {/* Mevcut domain durumu */}
      {status?.domain && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {status.verified ? (
                <CheckCircle size={20} className="text-green-500 flex-shrink-0" />
              ) : (
                <AlertCircle size={20} className="text-yellow-500 flex-shrink-0" />
              )}
              <div>
                <p className="font-semibold text-gray-900">{status.domain}</p>
                <p className={`text-xs mt-0.5 ${status.verified ? 'text-green-600' : 'text-yellow-600'}`}>
                  {status.verified ? 'Doğrulandı' : 'Doğrulama bekliyor'}
                </p>
              </div>
            </div>
            <button onClick={removeDomain} disabled={removing}
              className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Domain giriş formu */}
      {!status?.domain && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-1">Domain Ekle</h2>
          <p className="text-sm text-gray-500 mb-4">Kendi alan adınızı profilinize bağlayın.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={domainInput}
              onChange={e => setDomainInput(e.target.value)}
              placeholder="ornek.com"
              className="input flex-1"
              onKeyDown={e => e.key === 'Enter' && saveDomain()}
            />
            <button onClick={saveDomain} disabled={saving || !domainInput.trim()} className="btn-primary">
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      )}

      {/* DNS talimatları */}
      {status?.domain && !status.verified && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-gray-900 mb-3">DNS Ayarları</h2>
          <p className="text-sm text-gray-500 mb-4">
            Domain sağlayıcınızın DNS panelinde aşağıdaki kayıtları ekleyin:
          </p>

          <div className="space-y-3">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">CNAME Kaydı</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm">
                <div><span className="text-gray-400 text-xs">Ad</span><p className="font-mono font-medium">@</p></div>
                <div><span className="text-gray-400 text-xs">Tür</span><p className="font-mono font-medium">CNAME</p></div>
                <div><span className="text-gray-400 text-xs">Değer</span><p className="font-mono font-medium">{status.cnameTarget}</p></div>
              </div>
            </div>

            {status.token && (
              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">TXT Doğrulama Kaydı</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div><span className="text-gray-400 text-xs">Ad</span><p className="font-mono font-medium">@</p></div>
                  <div><span className="text-gray-400 text-xs">Tür</span><p className="font-mono font-medium">TXT</p></div>
                  <div className="col-span-3">
                    <span className="text-gray-400 text-xs">Değer</span>
                    <p className="font-mono font-medium text-xs break-all">qkrt-verify={status.token}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <button onClick={verifyDomain} disabled={verifying}
            className="btn-primary mt-4 flex items-center gap-2">
            <RefreshCw size={15} className={verifying ? 'animate-spin' : ''} />
            {verifying ? 'Kontrol ediliyor...' : 'Doğrulamayı Kontrol Et'}
          </button>
        </div>
      )}

      {/* Doğrulandı */}
      {status?.domain && status.verified && (
        <div className="card p-6 bg-green-50 border-green-100">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle size={20} className="text-green-500" />
            <h2 className="font-semibold text-green-800">Domain Aktif</h2>
          </div>
          <p className="text-sm text-green-700">
            Profilinize <strong>{status.domain}</strong> adresi üzerinden erişilebilir.
          </p>
        </div>
      )}
    </div>
  )
}
