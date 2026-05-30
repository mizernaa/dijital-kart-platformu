'use client'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { api } from '@/lib/api'
import { Plus, Trash2, Check, Building2, User, Contact, Upload, X, ToggleLeft, ToggleRight } from 'lucide-react'

interface ContactItem { id: string; type: string; value: string; label: string | null; order: number }
interface SocialLink { id: string; platform: string; url: string; order: number }

const CONTACT_TYPES = ['PHONE', 'EMAIL', 'WHATSAPP', 'TELEGRAM', 'WEBSITE', 'CUSTOM']
const CONTACT_TYPE_LABELS: Record<string, string> = {
  PHONE: 'Telefon',
  EMAIL: 'E-posta',
  WHATSAPP: 'WhatsApp',
  TELEGRAM: 'Telegram',
  WEBSITE: 'Web Sitesi',
  CUSTOM: 'Özel',
}
const SOCIAL_PLATFORMS = [
  'INSTAGRAM', 'LINKEDIN', 'TWITTER', 'YOUTUBE', 'TIKTOK',
  'FACEBOOK', 'GITHUB', 'BEHANCE', 'DRIBBBLE', 'SPOTIFY', 'SOUNDCLOUD',
]
const TABS = [
  { id: 'profile', label: 'Profil', icon: <User size={15} /> },
  { id: 'company', label: 'Şirket', icon: <Building2 size={15} /> },
  { id: 'cv', label: 'CV / Hakkımda', icon: <Contact size={15} /> },
]

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        value ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      {value ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
      {value ? 'Açık' : 'Kapalı'}
    </button>
  )
}

export default function ProfilePage() {
  const [tab, setTab] = useState('profile')
  const [contacts, setContacts] = useState<ContactItem[]>([])
  const [socials, setSocials] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  // Profil formu
  const { register, handleSubmit, reset } = useForm<{
    displayName: string; title: string; bio: string
  }>()
  const [newContact, setNewContact] = useState({ type: 'PHONE', value: '', label: '' })
  const [newSocial, setNewSocial] = useState({ platform: 'INSTAGRAM', url: '' })

  // Şirket formu
  const [company, setCompany] = useState({
    companyName: '', companyDescription: '', companyWebsite: '', companyIndustry: '',
    showCompanySection: false,
  })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  // CV formu
  const [cv, setCv] = useState({
    cvSkills: [] as string[],
    cvLanguages: [] as string[],
    showCvSection: false,
  })
  const [newSkill, setNewSkill] = useState('')
  const [newLang, setNewLang] = useState('')

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    Promise.all([
      api.get('/customer/profile'),
      api.get('/customer/profile/contacts'),
      api.get('/customer/profile/socials'),
    ]).then(([profileRes, contactsRes, socialsRes]) => {
      const p = profileRes.data.data
      reset({ displayName: p.displayName, title: p.title || '', bio: p.bio || '' })
      setAvatarUrl(p.avatarUrl || null)
      setContacts(contactsRes.data.data)
      setSocials(socialsRes.data.data)
      setCompany({
        companyName: p.companyName || '',
        companyDescription: p.companyDescription || '',
        companyWebsite: p.companyWebsite || '',
        companyIndustry: p.companyIndustry || '',
        showCompanySection: p.showCompanySection || false,
      })
      setCompanyLogoUrl(p.companyLogoUrl || null)
      setCv({
        cvSkills: p.cvSkills ? JSON.parse(p.cvSkills) : [],
        cvLanguages: p.cvLanguages ? JSON.parse(p.cvLanguages) : [],
        showCvSection: p.showCvSection || false,
      })
    }).catch(console.error).finally(() => setLoading(false))
  }, [reset])

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  // --- Profil kaydet ---
  const onSubmitProfile = async (data: any) => {
    await api.put('/customer/profile', data)
    flash()
  }

  // --- Şirket kaydet ---
  const saveCompany = async () => {
    await api.put('/customer/profile', {
      companyName: company.companyName || null,
      companyDescription: company.companyDescription || null,
      companyWebsite: company.companyWebsite || null,
      companyIndustry: company.companyIndustry || null,
      showCompanySection: company.showCompanySection,
    })
    flash()
  }

  const uploadAvatar = async (file: File) => {
    const form = new FormData()
    form.append('avatar', file)
    const res = await api.post('/customer/profile/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    setAvatarUrl(res.data.data.avatarUrl)
  }

  const removeAvatar = async () => {
    await api.put('/customer/profile', { avatarUrl: null })
    setAvatarUrl(null)
  }

  const uploadLogo = async (file: File) => {
    const form = new FormData()
    form.append('logo', file)
    const res = await api.post('/customer/profile/company-logo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    setCompanyLogoUrl(res.data.data.companyLogoUrl)
  }

  const removeLogo = async () => {
    await api.put('/customer/profile', { companyLogoUrl: null })
    setCompanyLogoUrl(null)
  }

  // --- CV kaydet ---
  const saveCv = async () => {
    await api.put('/customer/profile', {
      cvSkills: JSON.stringify(cv.cvSkills),
      cvLanguages: JSON.stringify(cv.cvLanguages),
      showCvSection: cv.showCvSection,
    })
    flash()
  }

  const addSkill = () => {
    const s = newSkill.trim()
    if (!s || cv.cvSkills.includes(s)) return
    setCv(c => ({ ...c, cvSkills: [...c.cvSkills, s] }))
    setNewSkill('')
  }

  const removeSkill = (s: string) => setCv(c => ({ ...c, cvSkills: c.cvSkills.filter(x => x !== s) }))

  const addLang = () => {
    const l = newLang.trim()
    if (!l || cv.cvLanguages.includes(l)) return
    setCv(c => ({ ...c, cvLanguages: [...c.cvLanguages, l] }))
    setNewLang('')
  }

  const removeLang = (l: string) => setCv(c => ({ ...c, cvLanguages: c.cvLanguages.filter(x => x !== l) }))

  // --- İletişim ---
  const addContact = async () => {
    if (!newContact.value) return
    const res = await api.post('/customer/profile/contacts', newContact)
    setContacts(prev => [...prev, res.data.data])
    setNewContact({ type: 'PHONE', value: '', label: '' })
  }
  const removeContact = async (id: string) => {
    await api.delete(`/customer/profile/contacts/${id}`)
    setContacts(prev => prev.filter(c => c.id !== id))
  }

  // --- Sosyal Medya ---
  const addSocial = async () => {
    if (!newSocial.url) return
    const res = await api.post('/customer/profile/socials', newSocial)
    setSocials(prev => [...prev, res.data.data])
    setNewSocial({ platform: 'INSTAGRAM', url: '' })
  }
  const removeSocial = async (id: string) => {
    await api.delete(`/customer/profile/socials/${id}`)
    setSocials(prev => prev.filter(s => s.id !== id))
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Yükleniyor...</div>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profil Düzenle</h1>
        {saved && (
          <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium">
            <Check size={15} /> Kaydedildi
          </span>
        )}
      </div>

      {/* Sekmeler */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 flex-1 justify-center px-3 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* ---- SEKME: PROFİL ---- */}
      {tab === 'profile' && (
        <>
          {/* Profil Fotoğrafı */}
          <div className="card p-6 mb-6">
            <h2 className="font-semibold text-gray-900 pb-2 border-b border-gray-100 mb-4">Profil Fotoğrafı</h2>
            <div className="flex items-center gap-5">
              <div
                className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center cursor-pointer shrink-0"
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarUrl ? (
                  <img src={`${API_URL}${avatarUrl}`} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <Upload size={22} className="text-gray-400" />
                )}
              </div>
              <div className="space-y-2">
                <button type="button" onClick={() => avatarInputRef.current?.click()} className="btn-secondary text-sm">
                  {avatarUrl ? 'Fotoğrafı Değiştir' : 'Fotoğraf Yükle'}
                </button>
                {avatarUrl && (
                  <button type="button" onClick={removeAvatar} className="block text-sm text-red-500 hover:text-red-700">
                    Kaldır
                  </button>
                )}
                <p className="text-xs text-gray-400">PNG, JPG — max 5MB</p>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) uploadAvatar(e.target.files[0]) }}
              />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmitProfile)} className="card p-6 mb-6 space-y-4">
            <h2 className="font-semibold text-gray-900 pb-2 border-b border-gray-100">Temel Bilgiler</h2>
            <div>
              <label className="label">Ad Soyad *</label>
              <input {...register('displayName')} className="input" placeholder="Ahmet Demir" />
            </div>
            <div>
              <label className="label">Unvan</label>
              <input {...register('title')} className="input" placeholder="Yazılım Mühendisi" />
            </div>
            <div>
              <label className="label">Biyografi</label>
              <textarea {...register('bio')} className="input min-h-[100px] resize-none" placeholder="Kendinizi kısaca tanıtın..." />
            </div>
            <button type="submit" className="btn-primary">Kaydet</button>
          </form>

          {/* İletişim Bilgileri */}
          <div className="card p-6 mb-6">
            <h2 className="font-semibold text-gray-900 pb-2 border-b border-gray-100 mb-4">İletişim Bilgileri</h2>
            <div className="space-y-2 mb-4">
              {contacts.map(c => (
                <div key={c.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs font-medium text-gray-500 w-20">{CONTACT_TYPE_LABELS[c.type] ?? c.type}</span>
                  <span className="text-sm text-gray-900 flex-1">{c.value}</span>
                  {c.label && <span className="text-xs text-gray-400">{c.label}</span>}
                  <button onClick={() => removeContact(c.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <select value={newContact.type} onChange={e => setNewContact(p => ({ ...p, type: e.target.value }))} className="input w-32">
                {CONTACT_TYPES.map(t => <option key={t} value={t}>{CONTACT_TYPE_LABELS[t]}</option>)}
              </select>
              <input value={newContact.value} onChange={e => setNewContact(p => ({ ...p, value: e.target.value }))} className="input flex-1" placeholder="Değer" />
              <input value={newContact.label} onChange={e => setNewContact(p => ({ ...p, label: e.target.value }))} className="input w-24" placeholder="Etiket" />
              <button onClick={addContact} className="btn-primary px-3"><Plus size={16} /></button>
            </div>
          </div>

          {/* Sosyal Medya */}
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 pb-2 border-b border-gray-100 mb-4">Sosyal Medya</h2>
            <div className="space-y-2 mb-4">
              {socials.map(s => (
                <div key={s.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-xs font-medium text-gray-500 w-24">{s.platform}</span>
                  <span className="text-sm text-blue-600 flex-1 truncate">{s.url}</span>
                  <button onClick={() => removeSocial(s.id)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <select value={newSocial.platform} onChange={e => setNewSocial(p => ({ ...p, platform: e.target.value }))} className="input w-36">
                {SOCIAL_PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              <input value={newSocial.url} onChange={e => setNewSocial(p => ({ ...p, url: e.target.value }))} className="input flex-1" placeholder="https://..." />
              <button onClick={addSocial} className="btn-primary px-3"><Plus size={16} /></button>
            </div>
          </div>
        </>
      )}

      {/* ---- SEKME: ŞİRKET ---- */}
      {tab === 'company' && (
        <div className="card p-6 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h2 className="font-semibold text-gray-900">Şirket Bölümü</h2>
              <p className="text-xs text-gray-400 mt-0.5">Public profilde şirket kartı göster</p>
            </div>
            <Toggle
              value={company.showCompanySection}
              onChange={v => setCompany(c => ({ ...c, showCompanySection: v }))}
            />
          </div>

          {/* Şirket Logosu */}
          <div>
            <label className="label">Şirket Logosu</label>
            <div className="flex items-center gap-4">
              {companyLogoUrl ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <img src={`${API_URL}${companyLogoUrl}`} alt="logo" className="w-full h-full object-contain p-1" />
                  <button
                    onClick={removeLogo}
                    className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5"
                  >
                    <X size={10} />
                  </button>
                </div>
              ) : (
                <div
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <Upload size={20} className="text-gray-400" />
                </div>
              )}
              <div>
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="btn-secondary text-sm"
                >
                  {companyLogoUrl ? 'Logoyu Değiştir' : 'Logo Yükle'}
                </button>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG — max 5MB</p>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) uploadLogo(e.target.files[0]) }}
              />
            </div>
          </div>

          <div>
            <label className="label">Şirket Adı</label>
            <input
              className="input"
              placeholder="Örn: Acme Teknoloji A.Ş."
              value={company.companyName}
              onChange={e => setCompany(c => ({ ...c, companyName: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">Sektör</label>
            <input
              className="input"
              placeholder="Örn: Yazılım & Teknoloji"
              value={company.companyIndustry}
              onChange={e => setCompany(c => ({ ...c, companyIndustry: e.target.value }))}
            />
          </div>

          <div>
            <label className="label">Kısa Açıklama</label>
            <textarea
              className="input min-h-[90px] resize-none"
              placeholder="Şirketinizi kısaca tanıtın..."
              maxLength={500}
              value={company.companyDescription}
              onChange={e => setCompany(c => ({ ...c, companyDescription: e.target.value }))}
            />
            <p className="text-xs text-gray-400 mt-1">{company.companyDescription.length}/500</p>
          </div>

          <div>
            <label className="label">Web Sitesi</label>
            <input
              className="input"
              placeholder="https://sirket.com"
              value={company.companyWebsite}
              onChange={e => setCompany(c => ({ ...c, companyWebsite: e.target.value }))}
            />
          </div>

          <button onClick={saveCompany} className="btn-primary">Şirket Bilgilerini Kaydet</button>
        </div>
      )}

      {/* ---- SEKME: CV / HAKKIMDA ---- */}
      {tab === 'cv' && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div>
              <h2 className="font-semibold text-gray-900">CV / Hakkımda Bölümü</h2>
              <p className="text-xs text-gray-400 mt-0.5">Public profilde beceri ve dil kartı göster</p>
            </div>
            <Toggle
              value={cv.showCvSection}
              onChange={v => setCv(c => ({ ...c, showCvSection: v }))}
            />
          </div>

          {/* Beceriler */}
          <div>
            <label className="label">Beceriler</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {cv.cvSkills.map(s => (
                <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full font-medium">
                  {s}
                  <button onClick={() => removeSkill(s)} className="text-blue-400 hover:text-blue-700">
                    <X size={12} />
                  </button>
                </span>
              ))}
              {cv.cvSkills.length === 0 && (
                <p className="text-sm text-gray-400">Henüz beceri eklenmedi.</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="Örn: React, Figma, Proje Yönetimi"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill() } }}
              />
              <button onClick={addSkill} className="btn-secondary px-3"><Plus size={16} /></button>
            </div>
            <p className="text-xs text-gray-400 mt-1">Enter'a basarak ekleyebilirsiniz</p>
          </div>

          {/* Diller */}
          <div>
            <label className="label">Diller</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {cv.cvLanguages.map(l => (
                <span key={l} className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full font-medium">
                  {l}
                  <button onClick={() => removeLang(l)} className="text-purple-400 hover:text-purple-700">
                    <X size={12} />
                  </button>
                </span>
              ))}
              {cv.cvLanguages.length === 0 && (
                <p className="text-sm text-gray-400">Henüz dil eklenmedi.</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="Örn: Türkçe (Ana Dil), İngilizce (B2)"
                value={newLang}
                onChange={e => setNewLang(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLang() } }}
              />
              <button onClick={addLang} className="btn-secondary px-3"><Plus size={16} /></button>
            </div>
          </div>

          <button onClick={saveCv} className="btn-primary">CV Bilgilerini Kaydet</button>
        </div>
      )}
    </div>
  )
}
