'use client'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { api } from '@/lib/api'
import {
  Plus, Trash2, Check, Building2, User, Contact, Upload, X,
  ToggleLeft, ToggleRight, Briefcase, Star, MapPin, Layers,
} from 'lucide-react'

interface ContactItem { id: string; type: string; value: string; label: string | null; order: number }
interface SocialLink { id: string; platform: string; url: string; order: number }

const CONTACT_TYPES = ['PHONE', 'EMAIL', 'WHATSAPP', 'TELEGRAM', 'WEBSITE', 'CUSTOM']
const CONTACT_TYPE_LABELS: Record<string, string> = {
  PHONE: 'Telefon', EMAIL: 'E-posta', WHATSAPP: 'WhatsApp',
  TELEGRAM: 'Telegram', WEBSITE: 'Web Sitesi', CUSTOM: 'Özel',
}
const SOCIAL_PLATFORMS = [
  'INSTAGRAM', 'LINKEDIN', 'TWITTER', 'YOUTUBE', 'TIKTOK',
  'FACEBOOK', 'GITHUB', 'BEHANCE', 'DRIBBBLE', 'SPOTIFY', 'SOUNDCLOUD',
]
const TABS = [
  { id: 'profile',   label: 'Profil',     icon: <User size={15} /> },
  { id: 'company',   label: 'Şirket',     icon: <Building2 size={15} /> },
  { id: 'cv',        label: 'CV',         icon: <Contact size={15} /> },
  { id: 'extended',  label: 'Kimlik',     icon: <MapPin size={15} /> },
  { id: 'portfolio', label: 'Portfolyo',  icon: <Briefcase size={15} /> },
  { id: 'refs',      label: 'Referanslar',icon: <Star size={15} /> },
  { id: 'sections',  label: 'Bölümler',  icon: <Layers size={15} /> },
]

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${value ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
      {value ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
      {value ? 'Açık' : 'Kapalı'}
    </button>
  )
}

function parseJson<T>(val: string | null, fallback: T): T {
  if (!val) return fallback
  try { return JSON.parse(val) } catch { return fallback }
}

export default function ProfilePage() {
  const [tab, setTab] = useState('profile')
  const [contacts, setContacts] = useState<ContactItem[]>([])
  const [socials, setSocials] = useState<SocialLink[]>([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)

  const { register, handleSubmit, reset } = useForm<{ displayName: string; title: string; bio: string }>()
  const [newContact, setNewContact] = useState({ type: 'PHONE', value: '', label: '' })
  const [newSocial, setNewSocial] = useState({ platform: 'INSTAGRAM', url: '' })

  const [company, setCompany] = useState({
    companyName: '', companyDescription: '', companyWebsite: '', companyIndustry: '', showCompanySection: false,
  })
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [cv, setCv] = useState({ cvSkills: [] as string[], cvLanguages: [] as string[], showCvSection: false })
  const [newSkill, setNewSkill] = useState('')
  const [newLang, setNewLang] = useState('')

  // Genişletilmiş kimlik
  const [extended, setExtended] = useState({
    location: '', tagline: '', available: false, calendarUrl: '',
  })
  const [stats, setStats] = useState<{ value: string; label: string }[]>([])
  const [newStat, setNewStat] = useState({ value: '', label: '' })
  const [services, setServices] = useState<{ icon: string; title: string; desc: string }[]>([])
  const [newService, setNewService] = useState({ icon: '◈', title: '', desc: '' })

  // Portfolyo
  const [projects, setProjects] = useState<{ title: string; category: string; desc: string; tags: string; color: string }[]>([])
  const [newProject, setNewProject] = useState({ title: '', category: '', desc: '', tags: '', color: '#d4a843' })

  // Referanslar
  const [testimonials, setTestimonials] = useState<{ quote: string; name: string; role: string; company: string; initials: string }[]>([])
  const [newTesti, setNewTesti] = useState({ quote: '', name: '', role: '', company: '', initials: '' })
  const [experience, setExperience] = useState<{ year: string; role: string; company: string; desc: string }[]>([])
  const [newExp, setNewExp] = useState({ year: '', role: '', company: '', desc: '' })
  const [education, setEducation] = useState<{ year: string; degree: string; school: string }[]>([])

  // Bölüm toggle'ları
  const [sectionToggles, setSectionToggles] = useState({
    showStatsSection: true,
    showServicesSection: true,
    showProjectsSection: true,
    showTestimonialsSection: true,
    showCareerSection: true,
    showContactForm: true,
    showQrSection: true,
  })
  const [newEdu, setNewEdu] = useState({ year: '', degree: '', school: '' })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    Promise.all([
      api.get('/customer/profile'),
      api.get('/customer/profile/contacts'),
      api.get('/customer/profile/socials'),
    ]).then(([pRes, cRes, sRes]) => {
      const p = pRes.data.data
      reset({ displayName: p.displayName, title: p.title || '', bio: p.bio || '' })
      setAvatarUrl(p.avatarUrl || null)
      setContacts(cRes.data.data)
      setSocials(sRes.data.data)
      setCompany({
        companyName: p.companyName || '', companyDescription: p.companyDescription || '',
        companyWebsite: p.companyWebsite || '', companyIndustry: p.companyIndustry || '',
        showCompanySection: p.showCompanySection || false,
      })
      setCompanyLogoUrl(p.companyLogoUrl || null)
      setCv({
        cvSkills: parseJson(p.cvSkills, []),
        cvLanguages: parseJson(p.cvLanguages, []),
        showCvSection: p.showCvSection || false,
      })
      setExtended({
        location: p.location || '', tagline: p.tagline || '',
        available: p.available || false, calendarUrl: p.calendarUrl || '',
      })
      setStats(parseJson(p.stats, []))
      setServices(parseJson(p.services, []))
      setProjects(parseJson(p.projects, []))
      setTestimonials(parseJson(p.testimonials, []))
      setExperience(parseJson(p.experience, []))
      setEducation(parseJson(p.education, []))
      setSectionToggles({
        showStatsSection: p.showStatsSection ?? true,
        showServicesSection: p.showServicesSection ?? true,
        showProjectsSection: p.showProjectsSection ?? true,
        showTestimonialsSection: p.showTestimonialsSection ?? true,
        showCareerSection: p.showCareerSection ?? true,
        showContactForm: p.showContactForm ?? true,
        showQrSection: p.showQrSection ?? true,
      })
    }).catch(console.error).finally(() => setLoading(false))
  }, [reset])

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  const onSubmitProfile = async (data: any) => { await api.put('/customer/profile', data); flash() }

  const saveCompany = async () => {
    await api.put('/customer/profile', {
      companyName: company.companyName || null, companyDescription: company.companyDescription || null,
      companyWebsite: company.companyWebsite || null, companyIndustry: company.companyIndustry || null,
      showCompanySection: company.showCompanySection,
    }); flash()
  }

  const saveCv = async () => {
    await api.put('/customer/profile', {
      cvSkills: JSON.stringify(cv.cvSkills), cvLanguages: JSON.stringify(cv.cvLanguages),
      showCvSection: cv.showCvSection,
    }); flash()
  }

  const saveExtended = async () => {
    await api.put('/customer/profile', {
      location: extended.location || null, tagline: extended.tagline || null,
      available: extended.available,
      calendarUrl: extended.calendarUrl || null,
      stats: JSON.stringify(stats), services: JSON.stringify(services),
    }); flash()
  }

  const savePortfolio = async () => {
    await api.put('/customer/profile', { projects: JSON.stringify(projects) }); flash()
  }

  const saveSectionToggles = async () => {
    await api.put('/customer/profile', sectionToggles); flash()
  }

  const saveRefs = async () => {
    await api.put('/customer/profile', {
      testimonials: JSON.stringify(testimonials),
      experience: JSON.stringify(experience),
      education: JSON.stringify(education),
    }); flash()
  }

  const uploadAvatar = async (file: File) => {
    const form = new FormData(); form.append('avatar', file)
    const res = await api.post('/customer/profile/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    setAvatarUrl(res.data.data.avatarUrl)
  }
  const removeAvatar = async () => { await api.put('/customer/profile', { avatarUrl: null }); setAvatarUrl(null) }
  const uploadLogo = async (file: File) => {
    const form = new FormData(); form.append('logo', file)
    const res = await api.post('/customer/profile/company-logo', form, { headers: { 'Content-Type': 'multipart/form-data' } })
    setCompanyLogoUrl(res.data.data.companyLogoUrl)
  }
  const removeLogo = async () => { await api.put('/customer/profile', { companyLogoUrl: null }); setCompanyLogoUrl(null) }

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
        {saved && <span className="flex items-center gap-1.5 text-green-600 text-sm font-medium"><Check size={15} /> Kaydedildi</span>}
      </div>

      {/* Sekmeler — 2 satır */}
      <div className="flex flex-wrap gap-1 mb-6 bg-gray-100 p-1 rounded-xl">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {/* ─── PROFİL ─── */}
      {tab === 'profile' && (
        <>
          <div className="card p-6 mb-6">
            <h2 className="font-semibold text-gray-900 pb-2 border-b border-gray-100 mb-4">Profil Fotoğrafı</h2>
            <div className="flex items-center gap-5">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 flex items-center justify-center cursor-pointer shrink-0"
                onClick={() => avatarInputRef.current?.click()}>
                {avatarUrl
                  ? <img src={`${API_URL}${avatarUrl}`} alt="avatar" className="w-full h-full object-cover" />
                  : <Upload size={22} className="text-gray-400" />}
              </div>
              <div className="space-y-2">
                <button type="button" onClick={() => avatarInputRef.current?.click()} className="btn-secondary text-sm">
                  {avatarUrl ? 'Fotoğrafı Değiştir' : 'Fotoğraf Yükle'}
                </button>
                {avatarUrl && <button type="button" onClick={removeAvatar} className="block text-sm text-red-500 hover:text-red-700">Kaldır</button>}
                <p className="text-xs text-gray-400">PNG, JPG — max 5MB</p>
              </div>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => { if (e.target.files?.[0]) uploadAvatar(e.target.files[0]) }} />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmitProfile)} className="card p-6 mb-6 space-y-4">
            <h2 className="font-semibold text-gray-900 pb-2 border-b border-gray-100">Temel Bilgiler</h2>
            <div><label className="label">Ad Soyad *</label><input {...register('displayName')} className="input" placeholder="Ahmet Demir" /></div>
            <div><label className="label">Unvan</label><input {...register('title')} className="input" placeholder="Yazılım Mühendisi" /></div>
            <div><label className="label">Biyografi</label><textarea {...register('bio')} className="input min-h-[100px] resize-none" placeholder="Kendinizi kısaca tanıtın..." /></div>
            <button type="submit" className="btn-primary">Kaydet</button>
          </form>

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

      {/* ─── ŞİRKET ─── */}
      {tab === 'company' && (
        <div className="card p-6 space-y-5">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div><h2 className="font-semibold text-gray-900">Şirket Bölümü</h2><p className="text-xs text-gray-400 mt-0.5">Public profilde şirket kartı göster</p></div>
            <Toggle value={company.showCompanySection} onChange={v => setCompany(c => ({ ...c, showCompanySection: v }))} />
          </div>
          <div>
            <label className="label">Şirket Logosu</label>
            <div className="flex items-center gap-4">
              {companyLogoUrl ? (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                  <img src={`${API_URL}${companyLogoUrl}`} alt="logo" className="w-full h-full object-contain p-1" />
                  <button onClick={removeLogo} className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5"><X size={10} /></button>
                </div>
              ) : (
                <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-blue-300" onClick={() => logoInputRef.current?.click()}>
                  <Upload size={20} className="text-gray-400" />
                </div>
              )}
              <div>
                <button type="button" onClick={() => logoInputRef.current?.click()} className="btn-secondary text-sm">{companyLogoUrl ? 'Logoyu Değiştir' : 'Logo Yükle'}</button>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG — max 5MB</p>
              </div>
              <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={e => { if (e.target.files?.[0]) uploadLogo(e.target.files[0]) }} />
            </div>
          </div>
          <div><label className="label">Şirket Adı</label><input className="input" value={company.companyName} onChange={e => setCompany(c => ({ ...c, companyName: e.target.value }))} placeholder="Acme A.Ş." /></div>
          <div><label className="label">Sektör</label><input className="input" value={company.companyIndustry} onChange={e => setCompany(c => ({ ...c, companyIndustry: e.target.value }))} placeholder="Yazılım & Teknoloji" /></div>
          <div><label className="label">Açıklama</label><textarea className="input min-h-[90px] resize-none" value={company.companyDescription} onChange={e => setCompany(c => ({ ...c, companyDescription: e.target.value }))} placeholder="Şirketinizi kısaca tanıtın..." /></div>
          <div><label className="label">Web Sitesi</label><input className="input" value={company.companyWebsite} onChange={e => setCompany(c => ({ ...c, companyWebsite: e.target.value }))} placeholder="https://sirket.com" /></div>
          <button onClick={saveCompany} className="btn-primary">Şirket Bilgilerini Kaydet</button>
        </div>
      )}

      {/* ─── CV ─── */}
      {tab === 'cv' && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div><h2 className="font-semibold text-gray-900">CV / Hakkımda Bölümü</h2><p className="text-xs text-gray-400 mt-0.5">Public profilde beceri ve dil kartı göster</p></div>
            <Toggle value={cv.showCvSection} onChange={v => setCv(c => ({ ...c, showCvSection: v }))} />
          </div>
          <div>
            <label className="label">Beceriler</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {cv.cvSkills.map(s => (
                <span key={s} className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full font-medium">
                  {s}<button onClick={() => setCv(c => ({ ...c, cvSkills: c.cvSkills.filter(x => x !== s) }))} className="text-blue-400 hover:text-blue-700"><X size={12} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input flex-1" value={newSkill} onChange={e => setNewSkill(e.target.value)} placeholder="Örn: React, Figma" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const s = newSkill.trim(); if (s && !cv.cvSkills.includes(s)) { setCv(c => ({ ...c, cvSkills: [...c.cvSkills, s] })); setNewSkill('') } } }} />
              <button onClick={() => { const s = newSkill.trim(); if (s && !cv.cvSkills.includes(s)) { setCv(c => ({ ...c, cvSkills: [...c.cvSkills, s] })); setNewSkill('') } }} className="btn-secondary px-3"><Plus size={16} /></button>
            </div>
          </div>
          <div>
            <label className="label">Diller</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {cv.cvLanguages.map(l => (
                <span key={l} className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full font-medium">
                  {l}<button onClick={() => setCv(c => ({ ...c, cvLanguages: c.cvLanguages.filter(x => x !== l) }))} className="text-purple-400 hover:text-purple-700"><X size={12} /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input flex-1" value={newLang} onChange={e => setNewLang(e.target.value)} placeholder="Örn: Türkçe (Ana Dil)" onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); const l = newLang.trim(); if (l && !cv.cvLanguages.includes(l)) { setCv(c => ({ ...c, cvLanguages: [...c.cvLanguages, l] })); setNewLang('') } } }} />
              <button onClick={() => { const l = newLang.trim(); if (l && !cv.cvLanguages.includes(l)) { setCv(c => ({ ...c, cvLanguages: [...c.cvLanguages, l] })); setNewLang('') } }} className="btn-secondary px-3"><Plus size={16} /></button>
            </div>
          </div>
          <button onClick={saveCv} className="btn-primary">CV Bilgilerini Kaydet</button>
        </div>
      )}

      {/* ─── KİMLİK (Extended) ─── */}
      {tab === 'extended' && (
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 pb-2 border-b border-gray-100">Kişisel Kimlik</h2>
            <div><label className="label">Konum</label><input className="input" value={extended.location} onChange={e => setExtended(x => ({ ...x, location: e.target.value }))} placeholder="İstanbul, Türkiye" /></div>
            <div><label className="label">Motto / Tagline</label><input className="input" value={extended.tagline} onChange={e => setExtended(x => ({ ...x, tagline: e.target.value }))} placeholder="Fikirleri ürüne dönüştürüyorum." maxLength={160} /></div>
            <div><label className="label">Takvim / Randevu Linki</label><input className="input" value={extended.calendarUrl} onChange={e => setExtended(x => ({ ...x, calendarUrl: e.target.value }))} placeholder="https://cal.com/kullanici" /></div>
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium text-gray-700">Yeni Projelere Açık</p><p className="text-xs text-gray-400">Profilinizde "Müsait" rozeti gösterir</p></div>
              <Toggle value={extended.available} onChange={v => setExtended(x => ({ ...x, available: v }))} />
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 pb-2 border-b border-gray-100">İstatistikler</h2>
            <div className="space-y-2">
              {stats.map((s, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm font-bold text-gray-900 w-16">{s.value}</span>
                  <span className="text-sm text-gray-600 flex-1">{s.label}</span>
                  <button onClick={() => setStats(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input className="input w-24" value={newStat.value} onChange={e => setNewStat(p => ({ ...p, value: e.target.value }))} placeholder="10+" />
              <input className="input flex-1" value={newStat.label} onChange={e => setNewStat(p => ({ ...p, label: e.target.value }))} placeholder="Yıl Deneyim" />
              <button onClick={() => { if (newStat.value && newStat.label) { setStats(p => [...p, newStat]); setNewStat({ value: '', label: '' }) } }} className="btn-primary px-3"><Plus size={16} /></button>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 pb-2 border-b border-gray-100">Hizmetler</h2>
            <div className="space-y-2">
              {services.map((s, i) => (
                <div key={i} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg">{s.icon}</span>
                  <div className="flex-1"><p className="text-sm font-medium text-gray-900">{s.title}</p><p className="text-xs text-gray-500">{s.desc}</p></div>
                  <button onClick={() => setServices(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 mt-0.5"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input className="input w-16 text-center text-lg" value={newService.icon} onChange={e => setNewService(p => ({ ...p, icon: e.target.value }))} placeholder="◈" />
                <input className="input flex-1" value={newService.title} onChange={e => setNewService(p => ({ ...p, title: e.target.value }))} placeholder="Hizmet başlığı" />
              </div>
              <div className="flex gap-2">
                <input className="input flex-1" value={newService.desc} onChange={e => setNewService(p => ({ ...p, desc: e.target.value }))} placeholder="Kısa açıklama" />
                <button onClick={() => { if (newService.title) { setServices(p => [...p, newService]); setNewService({ icon: '◈', title: '', desc: '' }) } }} className="btn-primary px-3"><Plus size={16} /></button>
              </div>
            </div>
          </div>

          <button onClick={saveExtended} className="btn-primary w-full">Kimlik Bilgilerini Kaydet</button>
        </div>
      )}

      {/* ─── PORTFOLYO ─── */}
      {tab === 'portfolio' && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 pb-2 border-b border-gray-100">Projeler</h2>
          <div className="space-y-3">
            {projects.map((p, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg border-l-4" style={{ borderLeftColor: p.color }}>
                <div className="flex justify-between">
                  <p className="text-sm font-bold text-gray-900">{p.title}</p>
                  <button onClick={() => setProjects(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
                <p className="text-xs text-gray-500">{p.category} · {p.tags}</p>
                <p className="text-xs text-gray-600 mt-1">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <div className="flex gap-2">
              <input className="input flex-1" value={newProject.title} onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))} placeholder="Proje adı *" />
              <input className="input w-32" value={newProject.category} onChange={e => setNewProject(p => ({ ...p, category: e.target.value }))} placeholder="Kategori" />
            </div>
            <input className="input w-full" value={newProject.desc} onChange={e => setNewProject(p => ({ ...p, desc: e.target.value }))} placeholder="Kısa açıklama" />
            <div className="flex gap-2">
              <input className="input flex-1" value={newProject.tags} onChange={e => setNewProject(p => ({ ...p, tags: e.target.value }))} placeholder="Etiketler (virgülle ayır)" />
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-500">Renk</label>
                <input type="color" value={newProject.color} onChange={e => setNewProject(p => ({ ...p, color: e.target.value }))} className="w-10 h-10 rounded border border-gray-200 cursor-pointer" />
              </div>
              <button onClick={() => { if (newProject.title) { setProjects(p => [...p, newProject]); setNewProject({ title: '', category: '', desc: '', tags: '', color: '#d4a843' }) } }} className="btn-primary px-3"><Plus size={16} /></button>
            </div>
          </div>
          <button onClick={savePortfolio} className="btn-primary w-full">Portfolyoyu Kaydet</button>
        </div>
      )}

      {/* ─── REFERANSLAR ─── */}
      {tab === 'refs' && (
        <div className="space-y-6">
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 pb-2 border-b border-gray-100">Müşteri Yorumları</h2>
            <div className="space-y-3">
              {testimonials.map((t, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between mb-1">
                    <p className="text-sm font-bold text-gray-900">{t.name} <span className="text-gray-400 font-normal">· {t.role}</span></p>
                    <button onClick={() => setTestimonials(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                  <p className="text-xs text-gray-500 italic">"{t.quote}"</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <textarea className="input w-full resize-none" rows={2} value={newTesti.quote} onChange={e => setNewTesti(p => ({ ...p, quote: e.target.value }))} placeholder="Yorum metni *" />
              <div className="flex gap-2">
                <input className="input flex-1" value={newTesti.name} onChange={e => setNewTesti(p => ({ ...p, name: e.target.value }))} placeholder="Ad Soyad *" />
                <input className="input w-12 text-center" value={newTesti.initials} onChange={e => setNewTesti(p => ({ ...p, initials: e.target.value }))} placeholder="AB" maxLength={2} />
              </div>
              <div className="flex gap-2">
                <input className="input flex-1" value={newTesti.role} onChange={e => setNewTesti(p => ({ ...p, role: e.target.value }))} placeholder="Rol" />
                <input className="input flex-1" value={newTesti.company} onChange={e => setNewTesti(p => ({ ...p, company: e.target.value }))} placeholder="Şirket" />
                <button onClick={() => { if (newTesti.quote && newTesti.name) { setTestimonials(p => [...p, newTesti]); setNewTesti({ quote: '', name: '', role: '', company: '', initials: '' }) } }} className="btn-primary px-3"><Plus size={16} /></button>
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 pb-2 border-b border-gray-100">Deneyim</h2>
            <div className="space-y-2">
              {experience.map((e, i) => (
                <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs text-blue-600 font-bold w-24 shrink-0">{e.year}</span>
                  <div className="flex-1"><p className="text-sm font-bold text-gray-900">{e.role} <span className="font-normal text-gray-500">· {e.company}</span></p><p className="text-xs text-gray-500">{e.desc}</p></div>
                  <button onClick={() => setExperience(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-2 border-t border-gray-100">
              <div className="flex gap-2">
                <input className="input w-32" value={newExp.year} onChange={e => setNewExp(p => ({ ...p, year: e.target.value }))} placeholder="2021—2023" />
                <input className="input flex-1" value={newExp.role} onChange={e => setNewExp(p => ({ ...p, role: e.target.value }))} placeholder="Unvan *" />
              </div>
              <div className="flex gap-2">
                <input className="input flex-1" value={newExp.company} onChange={e => setNewExp(p => ({ ...p, company: e.target.value }))} placeholder="Şirket" />
                <input className="input flex-1" value={newExp.desc} onChange={e => setNewExp(p => ({ ...p, desc: e.target.value }))} placeholder="Açıklama" />
                <button onClick={() => { if (newExp.role && newExp.year) { setExperience(p => [...p, newExp]); setNewExp({ year: '', role: '', company: '', desc: '' }) } }} className="btn-primary px-3"><Plus size={16} /></button>
              </div>
            </div>
          </div>

          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-gray-900 pb-2 border-b border-gray-100">Eğitim</h2>
            <div className="space-y-2">
              {education.map((e, i) => (
                <div key={i} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-xs text-purple-600 font-bold w-12 shrink-0">{e.year}</span>
                  <div className="flex-1"><p className="text-sm font-bold text-gray-900">{e.degree}</p><p className="text-xs text-gray-500">{e.school}</p></div>
                  <button onClick={() => setEducation(prev => prev.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <input className="input w-20" value={newEdu.year} onChange={e => setNewEdu(p => ({ ...p, year: e.target.value }))} placeholder="2020" />
              <input className="input flex-1" value={newEdu.degree} onChange={e => setNewEdu(p => ({ ...p, degree: e.target.value }))} placeholder="Bölüm / Sertifika *" />
              <input className="input flex-1" value={newEdu.school} onChange={e => setNewEdu(p => ({ ...p, school: e.target.value }))} placeholder="Kurum" />
              <button onClick={() => { if (newEdu.degree) { setEducation(p => [...p, newEdu]); setNewEdu({ year: '', degree: '', school: '' }) } }} className="btn-primary px-3"><Plus size={16} /></button>
            </div>
          </div>

          <button onClick={saveRefs} className="btn-primary w-full">Referansları Kaydet</button>
        </div>
      )}

      {/* ─── BÖLÜMLER ─── */}
      {tab === 'sections' && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-gray-900 pb-2 border-b border-gray-100">Profil Bölümlerini Aç / Kapat</h2>
          <p className="text-xs text-gray-400">Kapalı bölümler public profilinizde görünmez.</p>

          {[
            { key: 'showStatsSection',        label: 'İstatistikler Bandı',  desc: 'Yıl deneyim, proje sayısı vb.' },
            { key: 'showServicesSection',      label: 'Hizmetler',            desc: 'Sunduğunuz hizmetler bölümü' },
            { key: 'showProjectsSection',      label: 'Projeler',             desc: 'Öne çıkan işler listesi' },
            { key: 'showTestimonialsSection',  label: 'Referanslar',          desc: 'Müşteri yorumları' },
            { key: 'showCareerSection',        label: 'Kariyer & Eğitim',     desc: 'Deneyim ve eğitim bilgileri' },
            { key: 'showQrSection',            label: 'QR Kod',               desc: 'Profil QR kodu ve link kopyalama' },
            { key: 'showContactForm',          label: 'Bana Yaz Formu',       desc: 'Ziyaretçi mesaj formu' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-400">{desc}</p>
              </div>
              <Toggle
                value={sectionToggles[key as keyof typeof sectionToggles]}
                onChange={v => setSectionToggles(t => ({ ...t, [key]: v }))}
              />
            </div>
          ))}

          <button onClick={saveSectionToggles} className="btn-primary w-full">Bölüm Ayarlarını Kaydet</button>
        </div>
      )}
    </div>
  )
}
