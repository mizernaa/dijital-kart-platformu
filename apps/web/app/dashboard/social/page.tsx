'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import {
  parseSocialData, resolveSocialStyle, defaultSocialData, SOCIAL_FONTS, LINK_STYLES,
  SocialData, SocialLinkBlock, GalleryItem, SocialPost,
} from '@/lib/social'
import { SOCIAL_VIBES, getVibe } from '@/lib/socialVibes'
import { accentInk } from '@/lib/themes'
import {
  Check, Globe, Sparkles, Plus, Trash2, Upload, Image as ImageIcon, Music,
  Link2, ArrowUp, ArrowDown, Briefcase,
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const uid = () => Math.random().toString(36).slice(2, 10)
const SHAPES = [{ id: 'CIRCLE', label: 'Daire' }, { id: 'SQUARE', label: 'Kare' }, { id: 'HEXAGON', label: 'Altıgen' }]
const PLATFORMS = ['INSTAGRAM', 'TIKTOK', 'YOUTUBE', 'TWITTER', 'SPOTIFY', 'SOUNDCLOUD', 'GITHUB', 'LINKEDIN', 'FACEBOOK', 'TELEGRAM', 'WHATSAPP', 'BEHANCE', 'DRIBBBLE', 'CUSTOM']

function imgUrl(u?: string) { if (!u) return ''; return u.startsWith('http') ? u : `${API}${u}` }

/* ── Canlı önizleme (SocialView'ı yansıtır) ── */
function SocialPreview({ data, displayName, avatarUrl, slug }: { data: SocialData; displayName: string; avatarUrl: string; slug: string }) {
  const st = resolveSocialStyle(data)
  const ink = accentInk(st.accent)
  const handle = data.handle || slug || 'kullanici'
  const avatarRadius = data.avatarStyle === 'SQUARE' ? '16px' : data.avatarStyle === 'HEXAGON' ? '0' : '50%'
  const avatarClip = data.avatarStyle === 'HEXAGON' ? 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' : undefined
  const surface = st.surface, border = st.surfaceBorder
  const linkBg = data.linkStyle === 'outline' ? 'transparent' : surface
  const linkBorder = data.linkStyle === 'outline' ? `1.5px solid ${st.accent}` : `1px solid ${border}`

  return (
    <div className="sticky top-6">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 text-center">Canlı Önizleme</p>
      <div className="mx-auto rounded-[2rem] p-2 shadow-2xl" style={{ maxWidth: 280, background: '#0b0b0c', border: '1px solid #27272a' }}>
        <div className="rounded-[1.5rem] overflow-hidden relative" style={{ background: st.background, color: st.vibe.text, fontFamily: `'${st.font}', sans-serif`, height: 520, overflowY: 'auto' }}>
          {/* Animasyonlu arka plan göstergesi (public sayfadaki efektin küçük temsili) */}
          {st.animated !== 'none' && (
            <>
              <style>{`@keyframes pvFloatA{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(18px,12px) scale(1.15)}}@keyframes pvFloatB{0%,100%{transform:translate(0,0)}50%{transform:translate(-14px,-10px)}}@keyframes pvRise{0%{transform:translateY(0);opacity:0}15%{opacity:.7}100%{transform:translateY(-500px);opacity:0}}@keyframes pvFlow{0%{background-position:0% 0%}100%{background-position:200% 200%}}`}</style>
              {(st.animated === 'aurora') && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                  <i style={{ position: 'absolute', top: -60, left: -50, width: 190, height: 190, borderRadius: '50%', filter: 'blur(38px)', opacity: .55, background: `radial-gradient(circle, ${st.accent}, transparent 62%)`, animation: 'pvFloatA 7s ease-in-out infinite' }} />
                  <i style={{ position: 'absolute', bottom: -60, right: -50, width: 170, height: 170, borderRadius: '50%', filter: 'blur(38px)', opacity: .4, background: 'radial-gradient(circle, #6f7bff, transparent 62%)', animation: 'pvFloatB 9s ease-in-out infinite' }} />
                </div>
              )}
              {(st.animated === 'flow') && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'linear-gradient(120deg, transparent, rgba(255,255,255,.16), transparent)', backgroundSize: '200% 200%', animation: 'pvFlow 5s linear infinite', mixBlendMode: 'overlay' }} />
              )}
              {(st.animated === 'particles') && (
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                  {[12, 34, 58, 76, 90].map((x, i) => (
                    <i key={i} style={{ position: 'absolute', bottom: -8, left: `${x}%`, width: 5, height: 5, borderRadius: '50%', background: st.accent, animation: `pvRise ${4 + i}s linear infinite`, animationDelay: `${i * 0.8}s` }} />
                  ))}
                </div>
              )}
            </>
          )}
          <div style={{ position: 'relative', zIndex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* poster hero (Bento Sahne) */}
            <div style={{ position: 'relative', margin: '-16px -16px 0', height: 170, overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <div style={{ position: 'absolute', inset: 0, backgroundSize: 'cover', backgroundPosition: 'center 30%', background: (imgUrl(data.cover) || imgUrl(avatarUrl)) ? `linear-gradient(180deg, rgba(0,0,0,.1) 30%, rgba(0,0,0,.55)), url(${imgUrl(data.cover) || imgUrl(avatarUrl)}) center/cover` : `linear-gradient(160deg, ${st.accent}88, ${st.vibe.gradient[1]})` }} />
              <span style={{ position: 'absolute', top: 10, left: 12, zIndex: 2, fontSize: 10, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,.35)', padding: '3px 9px', borderRadius: 999 }}>@{handle}</span>
              {data.location && <span style={{ position: 'absolute', top: 10, right: 12, zIndex: 2, fontSize: 9.5, color: '#fff', background: 'rgba(0,0,0,.35)', padding: '3px 8px', borderRadius: 999 }}>📍 {data.location}</span>}
              <div style={{ position: 'relative', zIndex: 2, padding: '0 12px 4px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '-0.04em', lineHeight: 0.9, fontSize: 30, color: '#fff' }}>
                {(displayName || handle).split(/\s+/).map((w, i) => <span key={i} style={{ display: 'block', color: i === 1 ? st.accent : '#fff' }}>{w}</span>)}
              </div>
              {data.status && <span style={{ position: 'relative', zIndex: 2, alignSelf: 'flex-start', margin: '6px 12px 10px', fontSize: 10, fontWeight: 700, color: st.accent, background: 'rgba(0,0,0,.35)', border: `1px solid ${st.accent}66`, padding: '3px 9px', borderRadius: 999 }}>{data.status}</span>}
            </div>
            {(data.bio || (data.show.interests && data.interests.length > 0)) && (
              <div style={{ padding: '0 2px' }}>
                {data.bio && <div style={{ fontSize: 11, color: st.vibe.muted, lineHeight: 1.5 }}>{data.bio}</div>}
                {data.show.interests && data.interests.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                    {data.interests.slice(0, 5).map((t, i) => <span key={i} style={{ fontSize: 10, padding: '3px 9px', borderRadius: 999, background: border, fontWeight: 600 }}>{t}</span>)}
                  </div>
                )}
              </div>
            )}
            {/* anlar şeridi */}
            {data.show.gallery && data.gallery.length > 0 && (
              <div style={{ display: 'flex', gap: 7, overflow: 'hidden' }}>
                {data.gallery.slice(0, 5).map(g => <div key={g.id} style={{ width: 42, height: 42, flexShrink: 0, borderRadius: '50%', border: `2px solid ${st.accent}`, padding: 2 }}><img src={imgUrl(g.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} /></div>)}
                <span style={{ fontSize: 9, color: st.vibe.muted, alignSelf: 'center', marginLeft: 'auto' }}>anlar</span>
              </div>
            )}
            {/* links */}
            {data.show.links && data.links.map(l => (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 14, background: linkBg, border: linkBorder }}>
                <span style={{ width: 32, height: 32, borderRadius: 9, background: st.accent, color: ink, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{(l.platform || 'L').slice(0, 2)}</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{l.label || l.url || 'Link'}</span>
                <span style={{ color: st.accent, fontWeight: 700 }}>→</span>
              </div>
            ))}
            {/* gallery */}
            {data.show.gallery && data.gallery.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 5 }}>
                {data.gallery.slice(0, 6).map(g => <div key={g.id} style={{ aspectRatio: '1', borderRadius: 9, overflow: 'hidden', background: border }}><img src={imgUrl(g.url)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>)}
              </div>
            )}
            {/* posts */}
            {data.show.posts && data.posts.slice(0, 2).map(p => (
              <div key={p.id} style={{ background: surface, border: `1px solid ${border}`, borderRadius: 14, overflow: 'hidden' }}>
                {p.imageUrl && <img src={imgUrl(p.imageUrl)} alt="" style={{ width: '100%', maxHeight: 90, objectFit: 'cover' }} />}
                <div style={{ padding: 10 }}>
                  {p.title && <div style={{ fontSize: 12.5, fontWeight: 700 }}>{p.title}</div>}
                  {p.body && <div style={{ fontSize: 11, color: st.vibe.muted, marginTop: 3 }}>{p.body.slice(0, 80)}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mt-3">
        <span className="w-3.5 h-3.5 rounded-full" style={{ background: st.accent }} />
        <span className="text-xs text-gray-500 font-medium">{st.vibe.label}</span>
        <span className="text-gray-300">·</span>
        <span className="text-xs text-gray-400">{st.font}</span>
      </div>
    </div>
  )
}

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block"><span className="text-xs font-medium text-gray-600 mb-1 block">{label}</span>{children}</label>
)

export default function SocialPage() {
  const [data, setData] = useState<SocialData>(defaultSocialData())
  // İlgi alanları girdisinin ham hali — virgül yazılınca anında parse edilirse
  // virgül input'tan kaybolur (join/split döngüsü); o yüzden ham metin ayrı tutulur.
  const [interestsRaw, setInterestsRaw] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [slug, setSlug] = useState('')
  const [mode, setMode] = useState('BUSINESS')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState('')
  const publicSiteUrl = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'http://localhost:3002'

  useEffect(() => {
    api.get('/customer/profile').then(res => {
      const p = res.data.data
      setData(parseSocialData(p.socialData))
      setDisplayName(p.displayName || '')
      setAvatarUrl(p.avatarUrl || '')
      setSlug(p.slug || '')
      setMode(p.profileMode || 'BUSINESS')
    }).catch(console.error).finally(() => setLoading(false))
  }, [])

  const patch = useCallback((partial: Partial<SocialData>) => setData(prev => ({ ...prev, ...partial })), [])

  const save = async (extra?: Record<string, any>) => {
    setSaving(true)
    try {
      await api.put('/customer/profile', { socialData: JSON.stringify(data), ...extra })
      setSaved(true); setTimeout(() => setSaved(false), 2500)
    } finally { setSaving(false) }
  }

  const enableSocial = async () => { setMode('SOCIAL'); try { await api.put('/customer/profile', { profileMode: 'SOCIAL' }) } catch (e) { console.error(e) } }

  const uploadImage = async (file: File, key: string): Promise<string> => {
    setUploading(key)
    try {
      const fd = new FormData(); fd.append('image', file)
      const res = await api.post('/customer/profile/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      return res.data.data.url as string
    } finally { setUploading('') }
  }

  // vibe seçimi → arka plan defaultlarını da güncelle
  const pickVibe = (id: string) => {
    const v = getVibe(id)
    patch({ vibe: id, bg: { ...data.bg, type: 'vibe', gradient: v.gradient, angle: v.angle, animated: v.animated } })
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Yükleniyor...</div>

  const st = resolveSocialStyle(data)

  return (
    <div className="flex gap-8 max-w-6xl">
      <div className="flex-1 min-w-0 space-y-4">
        {/* Başlık */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2"><Sparkles className="text-fuchsia-500" size={22} /> Sosyal Sayfa</h1>
            <p className="text-sm text-gray-500 mt-0.5">Kendini parlat: sosyal medya, galeri, blog ve daha fazlası.</p>
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="flex items-center gap-1 text-green-600 text-sm font-medium"><Check size={14} /> Kaydedildi</span>}
            <a href={`${publicSiteUrl}/u/${slug}`} target="_blank" rel="noopener noreferrer" className="btn-secondary flex items-center gap-2 text-sm"><Globe size={14} /> Aç</a>
            <button onClick={() => save()} disabled={saving} className="btn-primary">{saving ? 'Kaydediliyor…' : 'Kaydet'}</button>
          </div>
        </div>

        {/* Mod uyarısı */}
        {mode !== 'SOCIAL' && (
          <div className="card p-4 border-2 border-fuchsia-200 bg-fuchsia-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Briefcase size={18} className="text-gray-400" />
              <p className="text-sm text-gray-700">Şu an <b>İş Kartı</b> modu yayında. Bu sayfanın görünmesi için Sosyal modu aktif et.</p>
            </div>
            <button onClick={enableSocial} className="btn-primary text-sm whitespace-nowrap">Sosyal Modu Aç</button>
          </div>
        )}

        {/* Vibe & Arka Plan */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Vibe</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
            {SOCIAL_VIBES.map(v => (
              <button key={v.id} onClick={() => pickVibe(v.id)}
                className={`relative rounded-xl border-2 overflow-hidden transition-all hover:scale-[1.03] ${data.vibe === v.id ? 'border-fuchsia-500 ring-2 ring-fuchsia-200' : 'border-transparent'}`}>
                <div style={{ background: `linear-gradient(150deg, ${v.gradient[0]}, ${v.gradient[1]})`, height: 54, display: 'flex', alignItems: 'flex-end', padding: 6 }}>
                  <span style={{ width: 12, height: 12, borderRadius: 4, background: v.accent }} />
                </div>
                <p className="text-[11px] font-bold py-1.5 text-gray-700">{v.label}</p>
                {data.vibe === v.id && <div className="absolute top-1 right-1 w-4 h-4 bg-fuchsia-500 rounded-full flex items-center justify-center"><Check size={10} className="text-white" /></div>}
              </button>
            ))}
          </div>

          <h3 className="text-sm font-semibold text-gray-800 mb-2">Arka Plan Tipi</h3>
          <div className="flex gap-2 mb-3 flex-wrap">
            {[['vibe', 'Vibe'], ['gradient', 'Gradyan'], ['image', 'Görsel'], ['animated', 'Animasyon']].map(([id, lbl]) => (
              <button key={id} onClick={() => patch({ bg: { ...data.bg, type: id as any } })}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${data.bg.type === id ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700' : 'border-gray-200 text-gray-600'}`}>{lbl}</button>
            ))}
          </div>
          {data.bg.type === 'gradient' && (
            <div className="flex items-center gap-3 flex-wrap">
              <input type="color" value={data.bg.gradient[0]} onChange={e => patch({ bg: { ...data.bg, gradient: [e.target.value, data.bg.gradient[1]] } })} className="w-9 h-9 rounded cursor-pointer border border-gray-200" />
              <input type="color" value={data.bg.gradient[1]} onChange={e => patch({ bg: { ...data.bg, gradient: [data.bg.gradient[0], e.target.value] } })} className="w-9 h-9 rounded cursor-pointer border border-gray-200" />
              <label className="text-xs text-gray-500 flex items-center gap-2">Açı
                <input type="range" min={0} max={360} value={data.bg.angle} onChange={e => patch({ bg: { ...data.bg, angle: +e.target.value } })} />
              </label>
            </div>
          )}
          {data.bg.type === 'animated' && (
            <div className="flex gap-2">
              {[['aurora', 'Aurora'], ['flow', 'Akış'], ['particles', 'Parçacık']].map(([id, lbl]) => (
                <button key={id} onClick={() => patch({ bg: { ...data.bg, animated: id as any } })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${data.bg.animated === id ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700' : 'border-gray-200 text-gray-600'}`}>{lbl}</button>
              ))}
            </div>
          )}
          {data.bg.type === 'image' && (
            <ImageUpload current={data.bg.image} busy={uploading === 'bg'} onUpload={async f => patch({ bg: { ...data.bg, image: await uploadImage(f, 'bg') } })} onClear={() => patch({ bg: { ...data.bg, image: '' } })} label="Wallpaper yükle" />
          )}
        </div>

        {/* Kimlik */}
        <div className="card p-5 space-y-3">
          <h2 className="font-semibold text-gray-900">Kimlik</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Kullanıcı adı (@handle)"><input className="input" value={data.handle} onChange={e => patch({ handle: e.target.value })} placeholder={slug} /></Field>
            <Field label="Konum"><input className="input" value={data.location} onChange={e => patch({ location: e.target.value })} placeholder="İstanbul" /></Field>
          </div>
          <Field label="Durum / Vibe (emoji serbest)"><input className="input" value={data.status} onChange={e => patch({ status: e.target.value })} placeholder="✨ yeni şeyler peşinde" /></Field>
          <Field label="Kısa bio"><textarea className="input" rows={2} maxLength={200} value={data.bio} onChange={e => patch({ bio: e.target.value })} placeholder="Kendini birkaç kelimeyle anlat" /></Field>
          <ImageUpload current={data.cover} busy={uploading === 'cover'} onUpload={async f => patch({ cover: await uploadImage(f, 'cover') })} onClear={() => patch({ cover: '' })} label="Kapak görseli (opsiyonel)" />
          <p className="text-xs text-gray-400">Avatar, Profilim sayfasından yüklenir.</p>
        </div>

        {/* Görünüm */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Görünüm</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Vurgu rengi">
              <div className="flex items-center gap-2">
                <input type="color" value={data.accent || st.accent} onChange={e => patch({ accent: e.target.value })} className="w-9 h-9 rounded cursor-pointer border border-gray-200" />
                {data.accent && <button onClick={() => patch({ accent: null })} className="text-xs text-fuchsia-600 hover:underline">Vibe rengi</button>}
              </div>
            </Field>
            <Field label="Yazı tipi">
              <select className="input" value={data.font || st.vibe.font} onChange={e => patch({ font: e.target.value })}>
                {SOCIAL_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Link stili">
              <div className="flex gap-2">
                {LINK_STYLES.map(s => <button key={s.id} onClick={() => patch({ linkStyle: s.id as any })} className={`flex-1 py-2 text-xs font-medium border rounded-lg ${data.linkStyle === s.id ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700' : 'border-gray-200 text-gray-600'}`}>{s.label}</button>)}
              </div>
            </Field>
            <Field label="Avatar şekli">
              <div className="flex gap-2">
                {SHAPES.map(s => <button key={s.id} onClick={() => patch({ avatarStyle: s.id as any })} className={`flex-1 py-2 text-xs font-medium border rounded-lg ${data.avatarStyle === s.id ? 'border-fuchsia-500 bg-fuchsia-50 text-fuchsia-700' : 'border-gray-200 text-gray-600'}`}>{s.label}</button>)}
              </div>
            </Field>
          </div>
          <div className="flex gap-4">
            {([['glow', 'Avatar parlaması'], ['grain', 'Doku (grain)'], ['tilt', 'Eğilme efekti']] as const).map(([k, lbl]) => (
              <label key={k} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input type="checkbox" checked={data.effects[k]} onChange={e => patch({ effects: { ...data.effects, [k]: e.target.checked } })} /> {lbl}
              </label>
            ))}
          </div>
        </div>

        {/* Linkler */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Link2 size={16} /> Link Blokları</h2>
            <button onClick={() => patch({ links: [...data.links, { id: uid(), label: '', url: '', platform: 'CUSTOM' }] })} className="btn-secondary text-sm flex items-center gap-1"><Plus size={14} /> Ekle</button>
          </div>
          <div className="space-y-2">
            {data.links.length === 0 && <p className="text-sm text-gray-400">Henüz link yok. Instagram, YouTube, kişisel siten…</p>}
            {data.links.map((l, i) => (
              <div key={l.id} className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-gray-50">
                <div className="flex flex-col">
                  <button onClick={() => i > 0 && patch({ links: swap(data.links, i, i - 1) })} className="text-gray-400 hover:text-gray-700"><ArrowUp size={13} /></button>
                  <button onClick={() => i < data.links.length - 1 && patch({ links: swap(data.links, i, i + 1) })} className="text-gray-400 hover:text-gray-700"><ArrowDown size={13} /></button>
                </div>
                <select className="input !w-32 text-xs" value={l.platform} onChange={e => patch({ links: edit(data.links, i, { platform: e.target.value }) })}>
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <input className="input flex-1 text-sm" placeholder="Etiket" value={l.label} onChange={e => patch({ links: edit(data.links, i, { label: e.target.value }) })} />
                <input className="input flex-1 text-sm" placeholder="https://…" value={l.url} onChange={e => patch({ links: edit(data.links, i, { url: e.target.value }) })} />
                <button onClick={() => patch({ links: data.links.filter(x => x.id !== l.id) })} className="text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* Galeri */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2"><ImageIcon size={16} /> Galeri</h2>
            <label className="btn-secondary text-sm flex items-center gap-1 cursor-pointer">
              <Upload size={14} /> {uploading === 'gallery' ? 'Yükleniyor…' : 'Görsel Ekle'}
              <input type="file" accept="image/*" className="hidden" onChange={async e => { const f = e.target.files?.[0]; if (f) { const url = await uploadImage(f, 'gallery'); patch({ gallery: [...data.gallery, { id: uid(), url }] }) } e.target.value = '' }} />
            </label>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {data.gallery.map(g => (
              <div key={g.id} className="relative aspect-square rounded-lg overflow-hidden group">
                <img src={imgUrl(g.url)} alt="" className="w-full h-full object-cover" />
                <button onClick={() => patch({ gallery: data.gallery.filter(x => x.id !== g.id) })} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><Trash2 size={12} /></button>
              </div>
            ))}
            {data.gallery.length === 0 && <p className="col-span-full text-sm text-gray-400">Fotoğraflarını ekle.</p>}
          </div>
        </div>

        {/* Blog / Notlar */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900">Notlar / Mini Blog</h2>
            <button onClick={() => patch({ posts: [...data.posts, { id: uid(), title: '', body: '', date: new Date().toLocaleDateString('tr-TR') }] })} className="btn-secondary text-sm flex items-center gap-1"><Plus size={14} /> Not Ekle</button>
          </div>
          <div className="space-y-3">
            {data.posts.length === 0 && <p className="text-sm text-gray-400">Kısa yazılar, düşünceler, duyurular…</p>}
            {data.posts.map((p, i) => (
              <div key={p.id} className="p-3 rounded-lg bg-gray-50 space-y-2">
                <div className="flex items-center gap-2">
                  <input className="input flex-1 text-sm font-semibold" placeholder="Başlık" value={p.title} onChange={e => patch({ posts: edit(data.posts, i, { title: e.target.value }) })} />
                  <button onClick={() => patch({ posts: data.posts.filter(x => x.id !== p.id) })} className="text-gray-400 hover:text-red-500"><Trash2 size={15} /></button>
                </div>
                <textarea className="input text-sm" rows={2} placeholder="İçerik" value={p.body} onChange={e => patch({ posts: edit(data.posts, i, { body: e.target.value }) })} />
                <ImageUpload current={p.imageUrl} busy={uploading === `post-${p.id}`} small onUpload={async f => patch({ posts: edit(data.posts, i, { imageUrl: await uploadImage(f, `post-${p.id}`) }) })} onClear={() => patch({ posts: edit(data.posts, i, { imageUrl: '' }) })} label="Görsel (opsiyonel)" />
              </div>
            ))}
          </div>
        </div>

        {/* Müzik & İlgi */}
        <div className="card p-5 space-y-4">
          <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Music size={16} /> Müzik & İlgi Alanları</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Platform">
              <select className="input" value={data.music.type} onChange={e => patch({ music: { ...data.music, type: e.target.value as any } })}>
                <option value="">Yok</option><option value="spotify">Spotify</option><option value="soundcloud">SoundCloud</option>
              </select>
            </Field>
            <div className="sm:col-span-2"><Field label="Bağlantı (URL)"><input className="input" value={data.music.url} onChange={e => patch({ music: { ...data.music, url: e.target.value } })} placeholder="https://open.spotify.com/..." /></Field></div>
          </div>
          <Field label="İlgi alanları (virgülle ayır)">
            <input
              className="input"
              value={interestsRaw ?? data.interests.join(', ')}
              onChange={e => {
                setInterestsRaw(e.target.value)
                patch({ interests: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })
              }}
              onBlur={() => setInterestsRaw(null)}
              placeholder="müzik, kahve, oyun, seyahat"
            />
          </Field>
        </div>

        {/* Bölüm görünürlüğü */}
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 mb-3">Bölüm Görünürlüğü</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {([['links', 'Linkler'], ['socials', 'Sosyal ikonlar'], ['gallery', 'Anlar (galeri)'], ['posts', 'Notlar'], ['music', 'Müzik'], ['interests', 'İlgi alanları'], ['reaction', 'Tepki sayacı (🔥)'], ['contactForm', 'Bana Yaz formu']] as const).map(([k, lbl]) => (
              <label key={k} className="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 text-sm">
                <span className="text-gray-700">{lbl}</span>
                <input type="checkbox" checked={data.show[k]} onChange={e => patch({ show: { ...data.show, [k]: e.target.checked } })} />
              </label>
            ))}
          </div>
        </div>

        <button onClick={() => save()} disabled={saving} className="btn-primary w-full py-3">{saved ? '✓ Kaydedildi' : saving ? 'Kaydediliyor…' : 'Sosyal Sayfayı Kaydet'}</button>
        <Link href="/dashboard/design" className="block text-center text-sm text-gray-500 hover:underline">← Tasarım & mod ayarlarına dön</Link>
      </div>

      {/* Önizleme */}
      <div className="w-80 flex-shrink-0 hidden lg:block">
        <SocialPreview data={data} displayName={displayName} avatarUrl={avatarUrl} slug={slug} />
      </div>
    </div>
  )
}

function swap<T>(arr: T[], i: number, j: number): T[] { const a = arr.slice();[a[i], a[j]] = [a[j], a[i]]; return a }
function edit<T>(arr: T[], i: number, partial: Partial<T>): T[] { const a = arr.slice(); a[i] = { ...a[i], ...partial }; return a }

function ImageUpload({ current, onUpload, onClear, label, busy, small }: { current?: string; onUpload: (f: File) => void; onClear: () => void; label: string; busy?: boolean; small?: boolean }) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div className="flex items-center gap-3">
      {current ? (
        <div className="relative">
          <img src={imgUrl(current)} alt="" className={`rounded-lg object-cover ${small ? 'w-12 h-12' : 'w-16 h-16'}`} />
          <button onClick={onClear} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-800 text-white flex items-center justify-center"><Trash2 size={11} /></button>
        </div>
      ) : (
        <button onClick={() => ref.current?.click()} className={`rounded-lg border-2 border-dashed border-gray-300 text-gray-400 flex items-center justify-center ${small ? 'w-12 h-12' : 'w-16 h-16'}`}><Upload size={16} /></button>
      )}
      <div>
        <button onClick={() => ref.current?.click()} className="text-sm text-fuchsia-600 font-medium hover:underline">{busy ? 'Yükleniyor…' : label}</button>
        <p className="text-xs text-gray-400">PNG/JPG</p>
      </div>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) onUpload(f); e.target.value = '' }} />
    </div>
  )
}
