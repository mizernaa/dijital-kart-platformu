'use client'
import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { Check, Globe, Phone, Mail, Download, User, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react'

const THEMES = [
  { id: 'minimal',  label: 'Minimal',      bg: '#ffffff', gradFrom: '#f8fafc', accent: '#3b82f6', buttonBg: '#111827', textPrimary: '#111827', textSub: '#6b7280', cardBorder: '#e5e7eb' },
  { id: 'dark',     label: 'Onyx & Altın', bg: '#0f0c07', gradFrom: '#1a1408', accent: '#d4a843', buttonBg: '#d4a843', textPrimary: '#f7f3ee', textSub: '#9e9485', cardBorder: 'rgba(255,255,255,0.12)' },
  { id: 'ocean',    label: 'Okyanus',      bg: '#eff6ff', gradFrom: '#dbeafe', accent: '#1d4ed8', buttonBg: '#1d4ed8', textPrimary: '#1e3a8a', textSub: '#3b82f6', cardBorder: '#bfdbfe' },
  { id: 'forest',   label: 'Orman',        bg: '#f0fdf4', gradFrom: '#dcfce7', accent: '#15803d', buttonBg: '#15803d', textPrimary: '#14532d', textSub: '#16a34a', cardBorder: '#bbf7d0' },
  { id: 'sunset',   label: 'Gün Batımı',   bg: '#fff7ed', gradFrom: '#fed7aa', accent: '#c2410c', buttonBg: '#c2410c', textPrimary: '#7c2d12', textSub: '#ea580c', cardBorder: '#fed7aa' },
  { id: 'purple',   label: 'Mor',          bg: '#faf5ff', gradFrom: '#ede9fe', accent: '#7e22ce', buttonBg: '#7e22ce', textPrimary: '#4c1d95', textSub: '#7c3aed', cardBorder: '#ddd6fe' },
  { id: 'rose',     label: 'Gül',          bg: '#fff1f2', gradFrom: '#ffe4e6', accent: '#e11d48', buttonBg: '#e11d48', textPrimary: '#881337', textSub: '#f43f5e', cardBorder: '#fecdd3' },
  { id: 'slate',    label: 'Arduvaz',      bg: '#f8fafc', gradFrom: '#f1f5f9', accent: '#475569', buttonBg: '#1e293b', textPrimary: '#1e293b', textSub: '#64748b', cardBorder: '#e2e8f0' },
  { id: 'amber',    label: 'Kehribar',     bg: '#fffbeb', gradFrom: '#fef3c7', accent: '#d97706', buttonBg: '#92400e', textPrimary: '#78350f', textSub: '#b45309', cardBorder: '#fde68a' },
]

const FONTS = [
  { id: 'Inter',           label: 'Inter' },
  { id: 'Roboto',          label: 'Roboto' },
  { id: 'Poppins',         label: 'Poppins' },
  { id: 'Manrope',         label: 'Manrope' },
  { id: 'Space Grotesk',   label: 'Space Grotesk' },
  { id: 'Merriweather',    label: 'Merriweather' },
  { id: 'Playfair Display',label: 'Playfair Display' },
]

const BUTTON_STYLES = [
  { id: 'ROUNDED', label: 'Yuvarlak' },
  { id: 'SQUARE',  label: 'Köşeli' },
  { id: 'PILL',    label: 'Hap' },
]

const PROFILE_SHAPES = [
  { id: 'CIRCLE',  label: 'Daire' },
  { id: 'SQUARE',  label: 'Kare' },
  { id: 'HEXAGON', label: 'Altıgen' },
]

interface DesignState {
  theme: string; bgColor: string; fontFamily: string
  buttonStyle: string; profileShape: string; isPublished: boolean
  showStatsSection: boolean; showServicesSection: boolean
  showProjectsSection: boolean; showTestimonialsSection: boolean
  showCareerSection: boolean; showContactForm: boolean; showQrSection: boolean
}

type SectionKey = 'showStatsSection'|'showServicesSection'|'showProjectsSection'|'showTestimonialsSection'|'showCareerSection'|'showQrSection'|'showContactForm'

const SECTION_LABELS: { key: SectionKey; label: string; desc: string }[] = [
  { key: 'showStatsSection',        label: 'İstatistikler',   desc: 'Deneyim, proje sayısı vb.' },
  { key: 'showServicesSection',     label: 'Hizmetler',       desc: 'Sunulan hizmetler' },
  { key: 'showProjectsSection',     label: 'Projeler',        desc: 'Öne çıkan işler' },
  { key: 'showTestimonialsSection', label: 'Referanslar',     desc: 'Müşteri yorumları' },
  { key: 'showCareerSection',       label: 'Kariyer & Eğitim','desc': 'Deneyim ve eğitim' },
  { key: 'showQrSection',           label: 'QR Kod',          desc: 'Profil QR kodu' },
  { key: 'showContactForm',         label: 'Bana Yaz Formu',  desc: 'Ziyaretçi mesaj formu' },
]

function DesignPreview({ design, displayName }: { design: DesignState; displayName: string }) {
  const pal = THEMES.find(t => t.id === design.theme) ?? THEMES[0]
  const isDark = design.theme === 'dark'
  const bg = isDark ? '#0f0c07' : design.bgColor || pal.bg
  const bg2 = isDark ? '#161310' : pal.gradFrom
  const accent = pal.accent
  const textPrimary = pal.textPrimary
  const textSub = pal.textSub
  const cardBorder = pal.cardBorder
  const btnRadius = design.buttonStyle === 'PILL' ? '9999px' : design.buttonStyle === 'SQUARE' ? '3px' : '10px'
  const avatarRadius = design.profileShape === 'CIRCLE' ? '9999px' : design.profileShape === 'HEXAGON' ? '0' : '12px'
  const avatarClip = design.profileShape === 'HEXAGON' ? 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' : undefined
  const font = design.fontFamily || 'Manrope'

  return (
    <div className="sticky top-6">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 text-center">Profil Önizlemesi</p>
      <div className="rounded-2xl overflow-hidden shadow-2xl border mx-auto" style={{ maxWidth: 240, fontFamily: `'${font}', sans-serif`, background: bg, borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#e5e7eb' }}>

        {/* Hero */}
        <div style={{ background: `linear-gradient(160deg, ${bg2}, ${bg})`, padding: '20px 16px 16px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          {/* Glow */}
          <div style={{ position:'absolute', top:-40, right:-40, width:120, height:120, borderRadius:'50%', background: `radial-gradient(${accent}33, transparent)`, pointerEvents:'none' }}/>

          {/* Avatar */}
          <div style={{ display:'inline-flex', marginBottom:10, position:'relative' }}>
            <div style={{ width:56, height:56, borderRadius:avatarRadius, clipPath:avatarClip, display:'flex', alignItems:'center', justifyContent:'center', background:`linear-gradient(135deg,${accent}44,${accent}77)`, border:`2px solid ${accent}55`, fontSize:20, fontWeight:900, color: isDark ? bg : '#fff' }}>
              {displayName ? displayName.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
          <div style={{ fontSize:13, fontWeight:800, color:textPrimary, marginBottom:2 }}>{displayName || 'İsim Soyisim'}</div>
          <div style={{ fontSize:10, color:accent, fontWeight:600, marginBottom:10 }}>Ünvan · Şirket</div>

          {/* Buttons */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6, marginBottom:8 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4, padding:'7px 8px', borderRadius:btnRadius, background:`${accent}22`, color:accent, fontSize:10, fontWeight:700 }}>
              <Download size={9}/> Rehbere Ekle
            </div>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:4, padding:'7px 8px', borderRadius:btnRadius, background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)', border:`1px solid ${cardBorder}`, color:textSub, fontSize:10 }}>
              <Mail size={9}/> İletişim
            </div>
          </div>
        </div>

        {/* Stats band */}
        {design.showStatsSection && (
          <div style={{ background: isDark ? '#161310' : bg2, borderTop:`1px solid ${cardBorder}`, borderBottom:`1px solid ${cardBorder}`, padding:'10px 0', display:'grid', gridTemplateColumns:'repeat(4,1fr)' }}>
            {['10+','50+','12','4.9'].map((v,i) => (
              <div key={i} style={{ textAlign:'center' }}>
                <div style={{ fontSize:13, fontWeight:800, color:accent }}>{v}</div>
                <div style={{ fontSize:8, color:textSub, marginTop:1 }}>{['Yıl','Proje','Müşteri','Puan'][i]}</div>
              </div>
            ))}
          </div>
        )}

        {/* Contact cards */}
        <div style={{ padding:'10px 12px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
          {[{icon:<Phone size={10}/>,l:'Ara'},{icon:<Mail size={10}/>,l:'E-posta'},{icon:<Globe size={10}/>,l:'Web'},{icon:<Download size={10}/>,l:'Takvim'}].map(({icon,l})=>(
            <div key={l} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 8px', borderRadius:btnRadius, border:`1px solid ${cardBorder}`, background: isDark?'rgba(255,255,255,0.03)':'rgba(255,255,255,0.6)', color:textPrimary, fontSize:10 }}>
              <span style={{color:accent}}>{icon}</span>{l}
            </div>
          ))}
        </div>

        {/* Sections preview */}
        <div style={{ padding:'0 12px 12px', display:'flex', flexDirection:'column', gap:4 }}>
          {design.showServicesSection && (
            <div style={{ borderRadius:8, background: isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)', border:`1px solid ${cardBorder}`, padding:'6px 8px', fontSize:9, color:textSub }}>
              Hizmetler bölümü
            </div>
          )}
          {design.showProjectsSection && (
            <div style={{ borderRadius:8, background: isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)', border:`1px solid ${cardBorder}`, padding:'6px 8px', fontSize:9, color:textSub }}>
              Projeler bölümü
            </div>
          )}
          {design.showContactForm && (
            <div style={{ borderRadius:8, background: isDark?'rgba(255,255,255,0.04)':'rgba(0,0,0,0.03)', border:`1px solid ${cardBorder}`, padding:'6px 8px', fontSize:9, color:textSub }}>
              İletişim formu
            </div>
          )}
        </div>

        <p style={{ textAlign:'center', fontSize:9, paddingBottom:10, opacity:0.3, color:textSub }}>Q·Kart ile oluşturuldu</p>
      </div>
      <div className="flex items-center justify-center gap-2 mt-3">
        <div className="w-3 h-3 rounded-full border border-gray-200" style={{backgroundColor:bg}}/>
        <span className="text-xs text-gray-500 font-medium">{THEMES.find(t=>t.id===design.theme)?.label}</span>
        <span className="text-gray-300">·</span>
        <span className="text-xs text-gray-400" style={{fontFamily:font}}>{font}</span>
      </div>
    </div>
  )
}

export default function DesignPage() {
  const [design, setDesign] = useState<DesignState>({
    theme: 'minimal', bgColor: '#ffffff', fontFamily: 'Inter',
    buttonStyle: 'ROUNDED', profileShape: 'CIRCLE', isPublished: false,
    showStatsSection: true, showServicesSection: true, showProjectsSection: true,
    showTestimonialsSection: true, showCareerSection: true, showContactForm: true, showQrSection: true,
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
        showStatsSection: p.showStatsSection ?? true,
        showServicesSection: p.showServicesSection ?? true,
        showProjectsSection: p.showProjectsSection ?? true,
        showTestimonialsSection: p.showTestimonialsSection ?? true,
        showCareerSection: p.showCareerSection ?? true,
        showContactForm: p.showContactForm ?? true,
        showQrSection: p.showQrSection ?? true,
      })
      setSlug(p.slug)
      setDisplayName(p.displayName || '')
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const save = async () => {
    await api.put('/customer/profile', design)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const update = useCallback(<K extends keyof DesignState>(key: K, val: DesignState[K]) => {
    setDesign(prev => ({ ...prev, [key]: val }))
  }, [])

  if (loading) return <div className="text-center py-20 text-gray-400">Yükleniyor...</div>

  return (
    <div className="flex gap-8 max-w-5xl">
      {/* ── Sol: Kontroller ── */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Tasarım Editörü</h1>
          <div className="flex items-center gap-3">
            {saved && <span className="flex items-center gap-1 text-green-600 text-sm font-medium"><Check size={14}/> Kaydedildi</span>}
            <a href={`${publicSiteUrl}/u/${slug}`} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2 text-sm">
              <Globe size={14}/> Önizle
            </a>
            <button onClick={save} className="btn-primary">Kaydet</button>
          </div>
        </div>

        {/* Tema */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Tema</h2>
          <div className="grid grid-cols-3 gap-2">
            {THEMES.map(t => (
              <button key={t.id} onClick={() => { update('theme', t.id); update('bgColor', t.bg) }}
                className={`relative rounded-xl border-2 p-3 text-left transition-all hover:scale-[1.02] ${design.theme === t.id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}`}
                style={{ background: `linear-gradient(135deg,${t.gradFrom},${t.bg})` }}>
                <div className="w-full h-5 rounded-md mb-2 opacity-40" style={{ background: t.accent }}/>
                <p className="text-xs font-bold truncate" style={{ color: t.textPrimary }}>{t.label}</p>
                {design.theme === t.id && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <Check size={10} className="text-white"/>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Arka plan rengi */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-2">Özel Arka Plan Rengi</h2>
          <p className="text-xs text-gray-400 mb-3">Temayı override etmek için kullanın.</p>
          <div className="flex items-center gap-3">
            <input type="color" value={design.bgColor} onChange={e => update('bgColor', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200"/>
            <input type="text" value={design.bgColor} onChange={e => update('bgColor', e.target.value)} className="input w-32 font-mono text-sm" placeholder="#ffffff"/>
            <button onClick={() => update('bgColor', THEMES.find(t => t.id === design.theme)?.bg || '#ffffff')} className="text-xs text-blue-600 hover:underline">Sıfırla</button>
          </div>
        </div>

        {/* Yazı tipi */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Yazı Tipi</h2>
          <div className="grid grid-cols-2 gap-2">
            {FONTS.map(f => (
              <button key={f.id} onClick={() => update('fontFamily', f.id)}
                className={`px-4 py-2.5 rounded-lg border text-sm text-left transition-all ${design.fontFamily === f.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'}`}
                style={{ fontFamily: f.id }}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Buton ve avatar şekli */}
        <div className="card p-5">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Buton Şekli</h2>
              <div className="flex gap-2">
                {BUTTON_STYLES.map(s => (
                  <button key={s.id} onClick={() => update('buttonStyle', s.id)}
                    className={`flex-1 py-2 text-xs font-medium border transition-all ${design.buttonStyle === s.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'} ${s.id==='ROUNDED'?'rounded-lg':s.id==='PILL'?'rounded-full':'rounded-none'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 mb-3">Fotoğraf Şekli</h2>
              <div className="flex gap-2">
                {PROFILE_SHAPES.map(s => (
                  <button key={s.id} onClick={() => update('profileShape', s.id)}
                    className={`flex-1 py-2 text-xs font-medium border rounded-lg transition-all ${design.profileShape === s.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bölüm yönetimi */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-1">Bölüm Görünürlüğü</h2>
          <p className="text-xs text-gray-400 mb-4">Kapalı bölümler public profilinizde görünmez.</p>
          <div className="space-y-2">
            {SECTION_LABELS.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <button onClick={() => update(key, !design[key])}
                  className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${design[key] ? 'bg-blue-500' : 'bg-gray-300'}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${design[key] ? 'translate-x-5' : 'translate-x-1'}`}/>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Yayın durumu */}
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Profil Durumu</h2>
              <p className="text-sm text-gray-500 mt-0.5">{design.isPublished ? 'Profiliniz herkese açık.' : 'Profiliniz henüz yayında değil.'}</p>
            </div>
            <button onClick={() => update('isPublished', !design.isPublished)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${design.isPublished ? 'bg-blue-600' : 'bg-gray-200'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${design.isPublished ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
          </div>
        </div>

        <button onClick={save} className="btn-primary w-full py-3">
          {saved ? '✓ Kaydedildi' : 'Tüm Değişiklikleri Kaydet'}
        </button>
      </div>

      {/* ── Sağ: Canlı önizleme ── */}
      <div className="w-64 flex-shrink-0 hidden md:block">
        <DesignPreview design={design} displayName={displayName}/>
      </div>
    </div>
  )
}
