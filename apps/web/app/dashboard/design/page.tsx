'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Check, Globe, Phone, Mail, Download, User } from 'lucide-react'

const THEMES = [
  { id: 'minimal', label: 'Minimal',    bg: '#ffffff', gradFrom: '#f8fafc', accent: '#3b82f6', buttonBg: '#111827', textPrimary: '#111827', textSub: '#6b7280', cardBorder: '#e5e7eb', sectionBg: '#f9fafb' },
  { id: 'ocean',   label: 'Okyanus',    bg: '#eff6ff', gradFrom: '#dbeafe', accent: '#1d4ed8', buttonBg: '#1d4ed8', textPrimary: '#1e3a8a', textSub: '#3b82f6', cardBorder: '#bfdbfe', sectionBg: '#dbeafe' },
  { id: 'forest',  label: 'Orman',      bg: '#f0fdf4', gradFrom: '#dcfce7', accent: '#15803d', buttonBg: '#15803d', textPrimary: '#14532d', textSub: '#16a34a', cardBorder: '#bbf7d0', sectionBg: '#dcfce7' },
  { id: 'sunset',  label: 'Gün Batımı', bg: '#fff7ed', gradFrom: '#fed7aa', accent: '#c2410c', buttonBg: '#c2410c', textPrimary: '#7c2d12', textSub: '#ea580c', cardBorder: '#fed7aa', sectionBg: '#ffedd5' },
  { id: 'dark',    label: 'Karanlık',   bg: '#111827', gradFrom: '#1f2937', accent: '#818cf8', buttonBg: '#ffffff', textPrimary: '#f9fafb', textSub: '#9ca3af', cardBorder: 'rgba(255,255,255,0.1)', sectionBg: 'rgba(255,255,255,0.05)' },
  { id: 'purple',  label: 'Mor',        bg: '#faf5ff', gradFrom: '#ede9fe', accent: '#7e22ce', buttonBg: '#7e22ce', textPrimary: '#4c1d95', textSub: '#7c3aed', cardBorder: '#ddd6fe', sectionBg: '#ede9fe' },
]

const FONTS = ['Inter', 'Roboto', 'Poppins', 'Merriweather', 'Playfair Display']
const BUTTON_STYLES = [
  { id: 'ROUNDED', label: 'Yuvarlak Köşe' },
  { id: 'SQUARE',  label: 'Köşeli' },
  { id: 'PILL',    label: 'Hap Şekli' },
]
const PROFILE_SHAPES = [
  { id: 'CIRCLE',  label: 'Daire' },
  { id: 'SQUARE',  label: 'Kare' },
  { id: 'HEXAGON', label: 'Altıgen' },
]

interface DesignState {
  theme: string; bgColor: string; fontFamily: string
  buttonStyle: string; profileShape: string; isPublished: boolean
}

// ── Canlı önizleme bileşeni ───────────────────────────────────────────────────
function DesignPreview({ design, displayName }: { design: DesignState; displayName: string }) {
  const pal = THEMES.find(t => t.id === design.theme) ?? THEMES[0]
  const bg = design.bgColor || pal.bg

  const btnRadius = design.buttonStyle === 'PILL' ? '9999px'
    : design.buttonStyle === 'SQUARE' ? '0px' : '12px'

  const avatarRadius = design.profileShape === 'CIRCLE' ? '9999px'
    : design.profileShape === 'HEXAGON' ? '0px' : '16px'

  const avatarClipPath = design.profileShape === 'HEXAGON'
    ? 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' : undefined

  const mockButtons = [
    { icon: <Phone size={14} />, label: 'Ara' },
    { icon: <Mail size={14} />, label: 'E-posta' },
    { icon: <Globe size={14} />, label: 'Web Sitesi' },
  ]

  return (
    <div className="sticky top-6">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 text-center">Canlı Önizleme</p>
      <div
        className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 mx-auto"
        style={{ maxWidth: 280, fontFamily: design.fontFamily, background: `linear-gradient(160deg, ${pal.gradFrom} 0%, ${bg} 60%)` }}
      >
        {/* Blur orb */}
        <div style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: `${pal.accent}18`, filter: 'blur(40px)', pointerEvents: 'none' }} />

          <div className="px-6 py-8 text-center relative z-10">
            {/* Avatar */}
            <div className="inline-block mb-3" style={{ position: 'relative' }}>
              <div
                style={{
                  width: 72, height: 72,
                  borderRadius: avatarRadius,
                  clipPath: avatarClipPath,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `linear-gradient(135deg, ${pal.accent}22, ${pal.accent}44)`,
                  border: `3px solid ${pal.accent}30`,
                  fontSize: 24, fontWeight: 900, color: pal.accent,
                  boxShadow: `0 0 0 6px ${pal.accent}15`,
                }}
              >
                {displayName ? displayName.charAt(0).toUpperCase() : <User size={28} />}
              </div>
            </div>
            <p className="font-black text-sm mb-0.5" style={{ color: pal.textPrimary }}>{displayName || 'İsim Soyisim'}</p>
            <p className="text-xs font-semibold" style={{ color: pal.accent }}>Ünvan / Pozisyon</p>
          </div>

          {/* Mock buttons */}
          <div className="px-4 pb-4 space-y-2 relative z-10">
            {mockButtons.map(({ icon, label }) => (
              <div key={label}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-xs font-medium border"
                style={{
                  borderRadius: btnRadius,
                  color: pal.textPrimary,
                  borderColor: pal.cardBorder,
                  backgroundColor: design.theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.6)',
                }}
              >
                <span style={{ color: pal.accent }}>{icon}</span>
                {label}
              </div>
            ))}

            {/* vCard button */}
            <div className="flex items-center justify-center gap-2 w-full px-3 py-2.5 text-xs font-bold mt-1"
              style={{
                borderRadius: btnRadius,
                backgroundColor: pal.buttonBg,
                color: design.theme === 'dark' ? '#111827' : '#ffffff',
                boxShadow: `0 4px 12px ${pal.accent}35`,
              }}
            >
              <Download size={12} />
              Rehbere Ekle
            </div>
          </div>

          {/* Watermark */}
          <p className="text-center text-xs pb-3 opacity-30 relative z-10" style={{ color: pal.textSub }}>Q-Kart ile oluşturuldu</p>
        </div>
      </div>

      {/* Current theme badge */}
      <div className="flex items-center justify-center gap-2 mt-4">
        <div className="w-3 h-3 rounded-full border border-gray-300" style={{ backgroundColor: bg }} />
        <span className="text-xs text-gray-400 font-medium capitalize">{THEMES.find(t => t.id === design.theme)?.label ?? design.theme}</span>
        <span className="text-xs text-gray-300">·</span>
        <span className="text-xs text-gray-400">{design.fontFamily}</span>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function DesignPage() {
  const [design, setDesign] = useState<DesignState>({
    theme: 'minimal', bgColor: '#ffffff', fontFamily: 'Inter',
    buttonStyle: 'ROUNDED', profileShape: 'CIRCLE', isPublished: false,
  })
  const [displayName, setDisplayName] = useState('')
  const [slug, setSlug] = useState('')
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const publicSiteUrl = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'http://localhost:3002'

  useEffect(() => {
    api.get('/customer/profile').then(res => {
      const p = res.data.data
      setDesign({
        theme: p.theme || 'minimal',
        bgColor: p.bgColor || '#ffffff',
        fontFamily: p.fontFamily || 'Inter',
        buttonStyle: p.buttonStyle || 'ROUNDED',
        profileShape: p.profileShape || 'CIRCLE',
        isPublished: p.isPublished,
      })
      setSlug(p.slug)
      setDisplayName(p.displayName || '')
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    try {
      await api.put('/customer/profile', design)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) { console.error(err) }
  }

  const selectTheme = (theme: typeof THEMES[0]) => {
    setDesign(prev => ({ ...prev, theme: theme.id, bgColor: theme.bg }))
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Yükleniyor...</div>

  return (
    <div className="flex gap-8 max-w-5xl">
      {/* ── Sol: Kontroller ─────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Tasarım Editörü</h1>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
                <Check size={15} /> Kaydedildi
              </span>
            )}
            <a href={`${publicSiteUrl}/u/${slug}`} target="_blank" rel="noopener noreferrer"
              className="btn-secondary flex items-center gap-2 text-sm">
              <Globe size={14} /> Önizle
            </a>
            <button onClick={save} className="btn-primary flex items-center gap-2">
              {saved ? <><Check size={16} /> Kaydedildi</> : 'Kaydet'}
            </button>
          </div>
        </div>

        {/* Tema */}
        <div className="card p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-4">Tema</h2>
          <div className="grid grid-cols-3 gap-3">
            {THEMES.map(theme => (
              <button
                key={theme.id}
                onClick={() => selectTheme(theme)}
                className={`relative rounded-xl border-2 p-3 text-left transition-all hover:scale-[1.02] ${
                  design.theme === theme.id
                    ? 'border-blue-500 ring-2 ring-blue-200 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ background: `linear-gradient(135deg, ${theme.gradFrom}, ${theme.bg})` }}
              >
                <div className="w-full h-7 rounded-lg mb-2" style={{ background: theme.accent, opacity: 0.2 }} />
                <p className="text-xs font-bold" style={{ color: theme.textPrimary }}>{theme.label}</p>
                <p className="text-xs mt-0.5" style={{ color: theme.textSub }}>abc</p>
                {design.theme === theme.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check size={12} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Arka plan rengi */}
        <div className="card p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Arka Plan Rengi (Override)</h2>
          <p className="text-xs text-gray-400 mb-3">Tema rengini geçersiz kılmak için özel renk seçin.</p>
          <div className="flex items-center gap-3">
            <input type="color" value={design.bgColor}
              onChange={e => setDesign(prev => ({ ...prev, bgColor: e.target.value }))}
              className="w-12 h-10 rounded-lg cursor-pointer border border-gray-200" />
            <input type="text" value={design.bgColor}
              onChange={e => setDesign(prev => ({ ...prev, bgColor: e.target.value }))}
              className="input w-32 font-mono text-sm" placeholder="#ffffff" />
            <button onClick={() => {
              const pal = THEMES.find(t => t.id === design.theme)
              if (pal) setDesign(prev => ({ ...prev, bgColor: pal.bg }))
            }} className="text-xs text-blue-600 hover:underline">Sıfırla</button>
          </div>
        </div>

        {/* Yazı tipi */}
        <div className="card p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Yazı Tipi</h2>
          <div className="grid grid-cols-2 gap-2">
            {FONTS.map(font => (
              <button key={font} onClick={() => setDesign(prev => ({ ...prev, fontFamily: font }))}
                className={`px-4 py-2.5 rounded-lg border text-sm text-left transition-all ${
                  design.fontFamily === font
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-700 hover:border-gray-300'
                }`}
                style={{ fontFamily: font }}>
                {font}
              </button>
            ))}
          </div>
        </div>

        {/* Buton stili */}
        <div className="card p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Buton Şekli</h2>
          <div className="flex gap-3">
            {BUTTON_STYLES.map(style => (
              <button key={style.id} onClick={() => setDesign(prev => ({ ...prev, buttonStyle: style.id }))}
                className={`flex-1 py-2.5 text-sm font-medium border transition-all ${
                  design.buttonStyle === style.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                } ${style.id === 'ROUNDED' ? 'rounded-lg' : style.id === 'PILL' ? 'rounded-full' : 'rounded-none'}`}>
                {style.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fotoğraf şekli */}
        <div className="card p-6 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Profil Fotoğrafı Şekli</h2>
          <div className="flex gap-3">
            {PROFILE_SHAPES.map(shape => (
              <button key={shape.id} onClick={() => setDesign(prev => ({ ...prev, profileShape: shape.id }))}
                className={`flex-1 py-2.5 text-sm font-medium border rounded-lg transition-all ${
                  design.profileShape === shape.id
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                }`}>
                {shape.label}
              </button>
            ))}
          </div>
        </div>

        {/* Yayın durumu */}
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Profil Durumu</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                {design.isPublished ? 'Profiliniz herkese açık.' : 'Profiliniz henüz yayında değil.'}
              </p>
            </div>
            <button
              onClick={() => setDesign(prev => ({ ...prev, isPublished: !prev.isPublished }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${design.isPublished ? 'bg-blue-600' : 'bg-gray-200'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${design.isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Sağ: Canlı önizleme ──────────────────────────────── */}
      <div className="w-72 flex-shrink-0">
        <DesignPreview design={design} displayName={displayName} />
      </div>
    </div>
  )
}
