'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Copy, Check, Download, Share2, Mail, MessageCircle, QrCode } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function SharePage() {
  const [slug, setSlug] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [title, setTitle] = useState('')
  const [copied, setCopied] = useState('')
  const publicSiteUrl = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'http://localhost:3002'
  const profileUrl = slug ? `${publicSiteUrl}/u/${slug}` : ''

  useEffect(() => {
    api.get('/customer/profile').then(res => {
      const p = res.data.data
      setSlug(p.slug); setDisplayName(p.displayName || ''); setTitle(p.title || '')
    }).catch(console.error)
  }, [])

  const copy = async (text: string, key: string) => {
    try { await navigator.clipboard.writeText(text) } catch {
      const ta = document.createElement('textarea'); ta.value = text
      document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove()
    }
    setCopied(key); setTimeout(() => setCopied(''), 2000)
  }

  const downloadQr = (format: 'png' | 'svg') => {
    api.get(`/customer/qr/download?format=${format}`, { responseType: 'blob' }).then(res => {
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a'); a.href = url; a.download = `qkart-${slug}.${format}`; a.click()
      URL.revokeObjectURL(url)
    }).catch(() => alert('QR indirilemedi — önce QR Kod sayfasından bir QR oluşturun.'))
  }

  const emailSignature = `<table cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif"><tr><td style="padding-right:14px;border-right:2px solid #d9a93f"><strong style="font-size:15px;color:#111">${displayName}</strong><br/><span style="font-size:12px;color:#666">${title}</span></td><td style="padding-left:14px"><a href="${profileUrl}" style="font-size:12px;color:#b8860b;text-decoration:none">📱 Dijital kartvizitim — ${profileUrl.replace(/^https?:\/\//, '')}</a></td></tr></table>`

  const waText = encodeURIComponent(`Merhaba! Dijital kartvizitim: ${profileUrl}`)
  const xText = encodeURIComponent(`Dijital kartvizitim ✨ ${profileUrl}`)

  if (!slug) return <div className="text-center py-20 text-gray-400">Yükleniyor...</div>

  return (
    <div className="max-w-3xl space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Share2 size={22} className="text-blue-500" /> Paylaşım Merkezi</h1>
        <p className="text-sm text-gray-500 mt-0.5">Kartını dünyaya dağıt — link, QR, sosyal medya ve e-posta imzası tek yerde.</p>
      </div>

      {/* Profil linki */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Profil Linkin</h2>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-gray-700 truncate">{profileUrl}</code>
          <button onClick={() => copy(profileUrl, 'link')} className="btn-primary flex items-center gap-1.5 text-sm whitespace-nowrap">
            {copied === 'link' ? <Check size={14} /> : <Copy size={14} />} {copied === 'link' ? 'Kopyalandı' : 'Kopyala'}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">İpucu: Bu linki Instagram/TikTok bio'na koy.</p>
      </div>

      {/* Hızlı paylaş */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Hızlı Paylaş</h2>
        <div className="flex flex-wrap gap-2">
          <a href={`https://wa.me/?text=${waText}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-green-400 hover:bg-green-50 transition-colors">
            <MessageCircle size={16} className="text-green-500" /> WhatsApp
          </a>
          <a href={`https://twitter.com/intent/tweet?text=${xText}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors">
            𝕏 Paylaş
          </a>
          <a href={`mailto:?subject=${encodeURIComponent('Dijital kartvizitim')}&body=${waText}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <Mail size={16} className="text-blue-500" /> E-posta ile gönder
          </a>
        </div>
      </div>

      {/* QR */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2"><QrCode size={17} /> QR Kodun</h2>
        <p className="text-xs text-gray-400 mb-3">Masana, vitrine, kartvizitine — bastır, okutsunlar.</p>
        <div className="flex items-center gap-4">
          <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(profileUrl)}`} alt="QR" className="w-28 h-28 rounded-lg border border-gray-200 p-1.5" />
          <div className="flex flex-col gap-2">
            <button onClick={() => downloadQr('png')} className="btn-secondary flex items-center gap-1.5 text-sm"><Download size={14} /> PNG indir</button>
            <button onClick={() => downloadQr('svg')} className="btn-secondary flex items-center gap-1.5 text-sm"><Download size={14} /> SVG indir (baskı)</button>
          </div>
        </div>
      </div>

      {/* E-posta imzası */}
      <div className="card p-5">
        <h2 className="font-semibold text-gray-900 mb-1">E-posta İmzası</h2>
        <p className="text-xs text-gray-400 mb-3">Gmail/Outlook imza ayarına yapıştır — her e-postan kartını taşısın.</p>
        <div className="border border-gray-200 rounded-xl p-4 mb-3 bg-gray-50" dangerouslySetInnerHTML={{ __html: emailSignature }} />
        <button onClick={() => copy(emailSignature, 'sig')} className="btn-secondary flex items-center gap-1.5 text-sm">
          {copied === 'sig' ? <Check size={14} /> : <Copy size={14} />} {copied === 'sig' ? 'Kopyalandı' : 'HTML kopyala'}
        </button>
      </div>
    </div>
  )
}
