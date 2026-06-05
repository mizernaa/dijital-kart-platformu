'use client'
import { useEffect, useState, useCallback } from 'react'
import { api } from '@/lib/api'
import { THEMES, getPalette, resolveAccent, accentInk, rgba } from '@/lib/themes'
import { Check, Globe, Phone, Mail, Download, Sun, Moon, Sparkles, RotateCcw } from 'lucide-react'

const FONTS = [
  { id: 'Inter',            label: 'Inter' },
  { id: 'Roboto',           label: 'Roboto' },
  { id: 'Poppins',          label: 'Poppins' },
  { id: 'Manrope',          label: 'Manrope' },
  { id: 'Space Grotesk',    label: 'Space Grotesk' },
  { id: 'Merriweather',     label: 'Merriweather' },
  { id: 'Playfair Display', label: 'Playfair Display' },
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

const ACCENT_PRESETS = ['#d4a843', '#3b82f6', '#1d4ed8', '#15803d', '#ea580c', '#7e22ce', '#e11d48', '#38bdf8', '#818cf8', '#f43f5e', '#0ea5e9', '#10b981']

interface DesignState {
  theme: string; bgColor: string; accentColor: string | null; fontFamily: string
  buttonStyle: string; profileShape: string; isPublished: boolean
  cardStyle: string; typographyDensity: string
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
  { key: 'showCareerSection',       label: 'Kariyer & Eğitim', desc: 'Deneyim ve eğitim' },
  { key: 'showQrSection',           label: 'QR Kod',          desc: 'Profil QR kodu' },
  { key: 'showContactForm',         label: 'Bana Yaz Formu',  desc: 'Ziyaretçi mesaj formu' },
]

/* ── Public profili birebir yansıtan canlı önizleme ── */
function DesignPreview({ design, displayName }: { design: DesignState; displayName: string }) {
  const pal = getPalette(design.theme)
  const accent = resolveAccent(pal, design.accentColor)
  const ink = accentInk(accent)
  const { bg, bg2, bgElev, text, muted, faint, line } = pal

  const btnRadius = design.buttonStyle === 'PILL' ? '9999px' : design.buttonStyle === 'SQUARE' ? '4px' : '12px'
  const avatarRadius = design.profileShape === 'CIRCLE' ? '9999px' : design.profileShape === 'HEXAGON' ? '0' : '14px'
  const avatarClip = design.profileShape === 'HEXAGON' ? 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' : undefined
  const font = design.fontFamily || 'Manrope'

  // Kart stili → yüzey görünümü
  const cardBg = design.cardStyle === 'glass' ? rgba(pal.dark ? '#ffffff' : '#0f172a', pal.dark ? 0.05 : 0.03)
    : design.cardStyle === 'minimal' ? 'transparent'
    : bgElev
  const cardBorder = design.cardStyle === 'minimal' ? `1px solid ${line}` : `1px solid ${line}`
  const gap = design.typographyDensity === 'compact' ? 5 : design.typographyDensity === 'spacious' ? 11 : 8

  return (
    <div className="sticky top-6">
      <div className="flex items-center justify-center gap-2 mb-3">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Canlı Önizleme</p>
        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ background: pal.dark ? '#1e293b' : '#e2e8f0', color: pal.dark ? '#cbd5e1' : '#475569' }}>
          {pal.dark ? 'Koyu' : 'Açık'}
        </span>
      </div>

      {/* Telefon çerçevesi */}
      <div className="mx-auto rounded-[2rem] p-2 shadow-2xl" style={{ maxWidth: 268, background: '#0b0b0c', border: '1px solid #27272a' }}>
        <div className="rounded-[1.5rem] overflow-hidden relative" style={{ fontFamily: `'${font}', sans-serif`, background: bg, color: text }}>
          {/* accent glow */}
          <div style={{ position: 'absolute', top: -50, right: -40, width: 150, height: 150, borderRadius: '50%', background: `radial-gradient(${rgba(accent, 0.35)}, transparent 70%)`, pointerEvents: 'none' }} />

          {/* Hero */}
          <div style={{ background: `linear-gradient(170deg, ${bg2}, ${bg})`, padding: '22px 16px 16px', textAlign: 'center', position: 'relative' }}>
            <div style={{ width: 60, height: 60, margin: '0 auto 10px', borderRadius: avatarRadius, clipPath: avatarClip, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${accent}, ${rgba(accent, 0.6)})`, fontSize: 22, fontWeight: 900, color: ink }}>
              {displayName ? displayName.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 3 }}>{displayName || 'İsim Soyisim'}</div>
            <div style={{ fontSize: 10.5, color: accent, fontWeight: 600, marginBottom: 12 }}>Ünvan · Şirket</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px', borderRadius: btnRadius, background: accent, color: ink, fontSize: 10, fontWeight: 700 }}>
                <Download size={10} /> Rehbere Ekle
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '8px', borderRadius: btnRadius, border: `1px solid ${line}`, color: text, fontSize: 10, fontWeight: 600 }}>
                <Mail size={10} /> İletişim
              </div>
            </div>
          </div>

          {/* Stats */}
          {design.showStatsSection && (
            <div style={{ background: bg2, borderTop: `1px solid ${line}`, borderBottom: `1px solid ${line}`, padding: '10px 0', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
              {['10+', '50+', '12', '4.9'].map((v, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: accent }}>{v}</div>
                  <div style={{ fontSize: 7.5, color: faint, marginTop: 1 }}>{['Yıl', 'Proje', 'Müşteri', 'Puan'][i]}</div>
                </div>
              ))}
            </div>
          )}

          {/* Contact grid */}
          <div style={{ padding: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap }}>
            {[{ icon: <Phone size={11} />, l: 'Ara' }, { icon: <Mail size={11} />, l: 'E-posta' }, { icon: <Globe size={11} />, l: 'Web' }, { icon: <Download size={11} />, l: 'Takvim' }].map(({ icon, l }) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px', borderRadius: btnRadius, border: cardBorder, background: cardBg, color: text, fontSize: 10, fontWeight: 600 }}>
                <span style={{ color: accent }}>{icon}</span>{l}
              </div>
            ))}
          </div>

          {/* Sections */}
          <div style={{ padding: '0 12px 12px', display: 'flex', flexDirection: 'column', gap }}>
            {([['showServicesSection', 'Hizmetler'], ['showProjectsSection', 'Projeler'], ['showTestimonialsSection', 'Referanslar'], ['showContactForm', 'Bana Yaz']] as const)
              .filter(([k]) => design[k as SectionKey])
              .map(([k, lbl]) => (
                <div key={k} style={{ borderRadius: 10, background: cardBg, border: cardBorder, padding: '9px 10px', fontSize: 9.5, color: muted, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: accent, display: 'inline-block' }} />{lbl} bölümü
                </div>
              ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: 8.5, paddingBottom: 12, color: faint, opacity: 0.7 }}>Q·Kart ile oluşturuldu</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-3">
        <span className="w-3.5 h-3.5 rounded-full border" style={{ background: accent, borderColor: line }} />
        <span className="text-xs text-gray-500 font-medium">{pal.label}</span>
        <span className="text-gray-300">·</span>
        <span className="text-xs text-gray-400" style={{ fontFamily: `'${font}', sans-serif` }}>{font}</span>
      </div>
    </div>
  )
}

export default function DesignPage() {
  const [design, setDesign] = useState<DesignState>({
    theme: 'minimal', bgColor: '#ffffff', accentColor: null, fontFamily: 'Inter',
    buttonStyle: 'ROUNDED', profileShape: 'CIRCLE', isPublished: false,
    cardStyle: 'premium', typographyDensity: 'standard',
    showStatsSection: true, showServicesSection: true, showProjectsSection: true,
    showTestimonialsSection: true, showCareerSection: true, showContactForm: true, showQrSection: true,
  })
  const [displayName, setDisplayName] = useState('')
  const [slug, setSlug] = useState('')
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const publicSiteUrl = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'http://localhost:3002'

  useEffect(() => {
    api.get('/customer/profile').then(res => {
      const p = res.data.data
      setDesign({
        theme: p.theme || 'minimal',
        bgColor: p.bgColor || '#ffffff',
        accentColor: p.accentColor ?? null,
        fontFamily: p.fontFamily || 'Inter',
        buttonStyle: p.buttonStyle || 'ROUNDED',
        profileShape: p.profileShape || 'CIRCLE',
        isPublished: p.isPublished,
        cardStyle: p.cardStyle || 'premium',
        typographyDensity: p.typographyDensity || 'standard',
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
    setSaving(true)
    try {
      await api.put('/customer/profile', design)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  const update = useCallback(<K extends keyof DesignState>(key: K, val: DesignState[K]) => {
    setDesign(prev => ({ ...prev, [key]: val }))
  }, [])

  if (loading) return <div className="text-center py-20 text-gray-400">Yükleniyor...</div>

  const currentPal = getPalette(design.theme)
  const effectiveAccent = resolveAccent(currentPal, design.accentColor)

  return (
    <div className="flex gap-8 max-w-6xl">
      {/* ── Sol: Kontroller ── */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tasarım Editörü</h1>
            <p className="text-sm text-gray-500 mt-0.5">Değişiklikler anında sağdaki önizlemeye yansır.</p>
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="flex items-center gap-1 text-green-600 text-sm font-medium"><Check size={14} /> Kaydedildi</span>}
            <a href={`${publicSiteUrl}/u/${slug}`} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2 text-sm">
              <Globe size={14} /> Aç
            </a>
            <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Kaydediliyor…' : 'Kaydet'}</button>
          </div>
        </div>

        {/* Tema */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Tema</h2>
            <span className="text-xs text-gray-400">Arka plan + renk paleti</span>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {THEMES.map(t => {
              const selected = design.theme === t.id
              return (
                <button key={t.id} onClick={() => update('theme', t.id)}
                  className={`relative rounded-xl border-2 p-0 overflow-hidden text-left transition-all hover:scale-[1.03] ${selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-transparent'}`}>
                  <div style={{ background: `linear-gradient(150deg, ${t.bg2}, ${t.bg})`, padding: '12px 10px 10px', minHeight: 70 }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span style={{ width: 16, height: 16, borderRadius: 5, background: t.accent, display: 'inline-block' }} />
                      {t.dark ? <Moon size={11} style={{ color: t.faint }} /> : <Sun size={11} style={{ color: t.faint }} />}
                    </div>
                    <p className="text-[11px] font-bold truncate" style={{ color: t.text }}>{t.label}</p>
                  </div>
                  {selected && (
                    <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center shadow">
                      <Check size={10} className="text-white" />
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Accent rengi */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Sparkles size={16} className="text-blue-500" /> Vurgu Rengi</h2>
            {design.accentColor && (
              <button onClick={() => update('accentColor', null)} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                <RotateCcw size={11} /> Tema rengine dön
              </button>
            )}
          </div>
          <p className="text-xs text-gray-400 mb-3">
            {design.accentColor ? 'Özel renk kullanılıyor.' : `Tema varsayılanı (${currentPal.accent}) kullanılıyor.`}
          </p>
          <div className="flex items-center gap-3 mb-3">
            <input type="color" value={effectiveAccent} onChange={e => update('accentColor', e.target.value)} className="w-11 h-11 rounded-lg cursor-pointer border border-gray-200" />
            <input type="text" value={effectiveAccent} onChange={e => update('accentColor', e.target.value)} className="input w-32 font-mono text-sm" placeholder="#3b82f6" />
            <div className="flex-1 h-11 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: effectiveAccent, color: accentInk(effectiveAccent) }}>
              Örnek Buton
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {ACCENT_PRESETS.map(c => (
              <button key={c} onClick={() => update('accentColor', c)} title={c}
                className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${effectiveAccent.toLowerCase() === c.toLowerCase() ? 'border-gray-900' : 'border-white shadow'}`}
                style={{ background: c }} />
            ))}
          </div>
        </div>

        {/* Yazı tipi */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Yazı Tipi</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {FONTS.map(f => (
              <button key={f.id} onClick={() => update('fontFamily', f.id)}
                className={`px-3 py-3 rounded-lg border text-left transition-all ${design.fontFamily === f.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}`}
                style={{ fontFamily: `'${f.id}', sans-serif` }}>
                <span className="block text-sm font-semibold" style={{ color: design.fontFamily === f.id ? '#1d4ed8' : '#374151' }}>{f.label}</span>
                <span className="block text-xs mt-0.5" style={{ color: '#9ca3af' }}>Aa Bb Cc 123</span>
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
                    className={`flex-1 py-2 text-xs font-medium border transition-all ${design.buttonStyle === s.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'} ${s.id === 'ROUNDED' ? 'rounded-lg' : s.id === 'PILL' ? 'rounded-full' : 'rounded-none'}`}>
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

        {/* Kart stili ve tipografi */}
        <div className="card p-5">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Kart Stili</h2>
              <p className="text-xs text-gray-400 mb-3">Bölüm kartlarının görünümü</p>
              <div className="flex gap-2">
                {[{ id: 'premium', label: 'Premium' }, { id: 'minimal', label: 'Minimal' }, { id: 'glass', label: 'Cam' }].map(s => (
                  <button key={s.id} onClick={() => update('cardStyle', s.id)}
                    className={`flex-1 py-2 text-xs font-medium border rounded-lg transition-all ${design.cardStyle === s.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 mb-1">Tipografi</h2>
              <p className="text-xs text-gray-400 mb-3">Bölümler arası boşluk</p>
              <div className="flex gap-2">
                {[{ id: 'compact', label: 'Sıkı' }, { id: 'standard', label: 'Normal' }, { id: 'spacious', label: 'Ferah' }].map(s => (
                  <button key={s.id} onClick={() => update('typographyDensity', s.id)}
                    className={`flex-1 py-2 text-xs font-medium border rounded-lg transition-all ${design.typographyDensity === s.id ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bölüm görünürlüğü */}
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
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${design[key] ? 'translate-x-5' : 'translate-x-1'}`} />
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
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${design.isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        <button onClick={save} disabled={saving} className="btn-primary w-full py-3">
          {saved ? '✓ Kaydedildi' : saving ? 'Kaydediliyor…' : 'Tüm Değişiklikleri Kaydet'}
        </button>
      </div>

      {/* ── Sağ: Canlı önizleme ── */}
      <div className="w-72 flex-shrink-0 hidden lg:block">
        <DesignPreview design={design} displayName={displayName} />
      </div>
    </div>
  )
}
