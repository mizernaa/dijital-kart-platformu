'use client'
import { useEffect, useRef, useState } from 'react'
import {
  Wifi, QrCode, BarChart2, Layers, Shield,
  ChevronRight, Star, Check, ArrowRight, Zap,
  Smartphone, Share2, TrendingUp, MessageSquare,
  Play, Eye,
} from 'lucide-react'

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000'

// ─── scroll reveal hook ───────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.15 }
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

// ─── animated counter ─────────────────────────────────────────────────────────
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      let start = 0
      const step = to / 60
      const t = setInterval(() => {
        start = Math.min(start + step, to)
        setVal(Math.floor(start))
        if (start >= to) clearInterval(t)
      }, 20)
    }, { threshold: 0.5 })
    io.observe(el)
    return () => io.disconnect()
  }, [to])
  return <span ref={ref}>{val.toLocaleString('tr-TR')}{suffix}</span>
}

// ─── feature card ─────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc, color, delay }: {
  icon: React.ReactNode; title: string; desc: string; color: string; delay: number
}) {
  return (
    <div className={`reveal reveal-delay-${delay} glass rounded-2xl p-6 group hover:scale-[1.02] hover:bg-white/8 transition-all duration-300 cursor-default`}>
      <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

// ─── pricing card ────────────────────────────────────────────────────────────
function PricingCard({ name, price, features, comingSoon = [], popular, color }: {
  name: string; price: string; features: string[]; comingSoon?: string[]; popular?: boolean; color: string
}) {
  return (
    <div className={`reveal rounded-2xl p-6 flex flex-col ${popular ? 'pricing-popular scale-[1.03]' : 'glass'} transition-all duration-300 hover:scale-[1.02]`}>
      {popular && (
        <div className="flex items-center gap-1.5 text-violet-300 text-xs font-bold uppercase tracking-wider mb-4">
          <Star size={12} fill="currentColor" /> En Popüler
        </div>
      )}
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${color} w-fit mb-4`}>
        {name}
      </div>
      <div className="mb-6">
        <span className="text-4xl font-black text-white">{price}</span>
        {price !== 'Ücretsiz' && <span className="text-gray-400 text-sm ml-1">/ay</span>}
      </div>
      <ul className="space-y-3 flex-1 mb-6">
        {features.map(f => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
            <Check size={15} className="text-green-400 mt-0.5 shrink-0" />
            {f}
          </li>
        ))}
        {comingSoon.map(f => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-gray-500">
            <span className="mt-0.5 shrink-0 text-gray-600">◷</span>
            <span>{f} <span className="text-[10px] text-gray-600 font-semibold uppercase tracking-wider ml-1">yakında</span></span>
          </li>
        ))}
      </ul>
      <a
        href={`${DASHBOARD_URL}/login`}
        className={`block text-center py-3 rounded-xl text-sm font-bold transition-all duration-300 ${
          popular
            ? 'btn-primary-glow text-white'
            : 'border border-white/20 text-white hover:bg-white/10'
        }`}
      >
        Hemen Başla
      </a>
    </div>
  )
}

// ─── step card ────────────────────────────────────────────────────────────────
function StepCard({ num, title, desc, delay }: { num: string; title: string; desc: string; delay: number }) {
  return (
    <div className={`reveal reveal-delay-${delay} text-center group`}>
      <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-light text-3xl font-black bg-gradient-to-br from-blue-500 to-violet-600 text-white mb-4 group-hover:scale-110 transition-transform duration-300">
        {num}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 blur-xl opacity-40 group-hover:opacity-70 transition-opacity" />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed max-w-[220px] mx-auto">{desc}</p>
    </div>
  )
}

// ─── mock digital card ────────────────────────────────────────────────────────
function MockCard() {
  return (
    <div className="animate-card-float card-3d">
      <div className="relative w-[320px] glass-light rounded-3xl p-6 overflow-hidden" style={{ boxShadow: '0 25px 80px rgba(99,102,241,0.35), 0 0 0 1px rgba(255,255,255,0.1)' }}>
        {/* Beam animation */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
          <div className="animate-beam absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        {/* Card bg gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-violet-600/10 to-cyan-600/10 rounded-3xl" />

        <div className="relative z-10">
          {/* Avatar + name */}
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white font-black text-xl shadow-lg">A</div>
            <div>
              <p className="text-white font-bold text-lg leading-tight">Ahmet Yılmaz</p>
              <p className="text-blue-300 text-sm">Senior Product Manager</p>
              <p className="text-gray-400 text-xs">TechCorp A.Ş.</p>
            </div>
          </div>

          {/* Contact pills */}
          <div className="flex flex-wrap gap-2 mb-5">
            {['📞 +90 555 000 00 00', '✉️ ahmet@techcorp.com', '🌐 techcorp.com'].map(c => (
              <span key={c} className="px-3 py-1.5 bg-white/10 rounded-full text-xs text-gray-200 border border-white/10">{c}</span>
            ))}
          </div>

          {/* Social icons row */}
          <div className="flex items-center gap-2 mb-5">
            {['in', 'tw', 'gh', 'ig'].map(s => (
              <div key={s} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10 hover:bg-white/20 transition-colors">
                <span className="text-xs text-gray-300 font-bold">{s}</span>
              </div>
            ))}
          </div>

          {/* QR + NFC row */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Wifi size={14} className="text-cyan-400" />
              </div>
              <span className="text-xs text-gray-400">NFC aktif</span>
            </div>
            <div className="flex gap-1">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className={`rounded-sm bg-white/80`} style={{ width: 3 + (i % 3) * 2, height: 3 + (i % 3) * 2 }} />
              ))}
            </div>
            <span className="text-xs text-gray-400 font-mono">qkrt.co/ahmet</span>
          </div>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -top-4 -right-6 glass rounded-2xl px-3 py-2 text-xs text-white border border-white/10 flex items-center gap-2 animate-float">
        <Eye size={12} className="text-blue-400" /> <span className="text-green-400 font-bold">+248</span> görüntülenme
      </div>
      <div className="absolute -bottom-4 -left-6 glass rounded-2xl px-3 py-2 text-xs text-white border border-white/10 flex items-center gap-2 animate-float-delayed">
        <MessageSquare size={12} className="text-violet-400" /> <span className="text-violet-300 font-bold">12</span> yeni mesaj
      </div>
    </div>
  )
}

// ─── main page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  useReveal()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[#070711] text-white overflow-x-hidden">

      {/* ── NAVBAR ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-black text-sm shadow-lg glow-blue">Q</div>
            <span className="font-black text-xl shimmer-text">Q-Kart</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            {[['Özellikler', '#features'], ['Nasıl Çalışır', '#how'], ['Fiyatlar', '#pricing']].map(([l, h]) => (
              <a key={h} href={h} className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a href={`${DASHBOARD_URL}/login`} className="hidden md:block text-sm text-gray-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/8">
              Giriş Yap
            </a>
            <a href={`${DASHBOARD_URL}/login`} className="btn-primary-glow text-white text-sm font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2">
              Ücretsiz Başla <ChevronRight size={16} />
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center hero-grid pt-16">
        {/* Background orbs */}
        <div className="orb w-[600px] h-[600px] bg-blue-600/20 top-10 -left-60 animate-glow-pulse" />
        <div className="orb w-[500px] h-[500px] bg-violet-600/20 top-20 right-0 animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="orb w-[300px] h-[300px] bg-cyan-500/10 bottom-20 left-1/3 animate-glow-pulse" style={{ animationDelay: '3s' }} />

        <div className="max-w-6xl mx-auto px-6 py-20 w-full grid lg:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-blue-300 border border-blue-500/30 mb-6">
              <Zap size={14} className="text-yellow-400" />
              QR · NFC · Analitik · Kurumsal
            </div>

            <h1 className="text-5xl md:text-6xl font-black leading-tight mb-6">
              Dijital kimliğiniz<br />
              <span className="text-gradient">tek bir kartta.</span>
            </h1>

            <p className="text-gray-400 text-lg leading-relaxed mb-8 max-w-lg">
              QR kod ve NFC teknolojisiyle anlık paylaşılan, kişiselleştirilebilir dijital kartvizit platformu. Bağlantılarınızı, analitiklerinizi ve marka imajınızı tek noktadan yönetin.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <a href={`${DASHBOARD_URL}/login`} className="btn-primary-glow text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-3 text-base">
                Ücretsiz Başla <ArrowRight size={18} />
              </a>
              <a href="/u/ahmetdemir" className="flex items-center gap-3 px-8 py-4 glass rounded-2xl text-white font-semibold text-base hover:bg-white/10 transition-all duration-300 border border-white/10">
                <Play size={18} className="text-blue-400" /> Demo Kartı Gör
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex items-center gap-6 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><Check size={13} className="text-green-400" /> Kredi kartı gerekmez</span>
              <span className="flex items-center gap-1.5"><Check size={13} className="text-green-400" /> 2 dakikada kurulum</span>
              <span className="flex items-center gap-1.5"><Check size={13} className="text-green-400" /> KVKK uyumlu</span>
            </div>
          </div>

          {/* Right: mock card */}
          <div className="relative flex items-center justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <MockCard />
          </div>
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#070711] to-transparent" />
      </section>

      {/* ── STATS ───────────────────────────────────────────────────────────── */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 5000, suffix: '+', label: 'Aktif Kullanıcı' },
              { value: 2500000, suffix: '+', label: 'Profil Görüntülenme' },
              { value: 98, suffix: '%', label: 'Müşteri Memnuniyeti' },
              { value: 150, suffix: '+', label: 'Kurumsal Müşteri' },
            ].map(({ value, suffix, label }) => (
              <div key={label} className="reveal">
                <p className="text-4xl font-black text-gradient mb-2">
                  <Counter to={value} suffix={suffix} />
                </p>
                <p className="text-gray-400 text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 relative">
        <div className="orb w-[400px] h-[400px] bg-violet-700/15 top-10 right-0" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="reveal inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-violet-300 border border-violet-500/30 mb-4">
              <Layers size={14} /> Platform Özellikleri
            </div>
            <h2 className="reveal text-4xl font-black mb-4">Profesyoneller için<br /><span className="text-gradient">her şey dahil</span></h2>
            <p className="reveal text-gray-400 max-w-xl mx-auto">İletişim bilgilerinden sosyal medya linklerine, QR koddan NFC karttaki fiziksel erişime kadar eksiksiz dijital kimlik yönetimi.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard delay={1} color="bg-blue-600/20" icon={<QrCode size={22} className="text-blue-400" />} title="Akıllı QR Kod" desc="Markanıza özel renk ve arka plan seçenekleriyle QR kod oluşturun. PNG ve SVG formatlarında indirin." />
            <FeatureCard delay={2} color="bg-cyan-600/20" icon={<Wifi size={22} className="text-cyan-400" />} title="NFC Dokunmalı Kart" desc="Fiziksel NFC kartta profil bilgilerinize dokunuşla erişim sağlayın. Siparişi platformdan verin." />
            <FeatureCard delay={3} color="bg-violet-600/20" icon={<BarChart2 size={22} className="text-violet-400" />} title="Derin Analitik" desc="Kim baktı, nereden geldi, hangi butona tıkladı? Cihaz, tarayıcı ve saatlik dağılım grafikleri." />
            <FeatureCard delay={4} color="bg-emerald-600/20" icon={<Layers size={22} className="text-emerald-400" />} title="Şirket & CV Profili" desc="Şirket logosu, sektör, web sitesi bilgilerini ekleyin; ya da kişisel CV bölümüyle becerilerinizi sergileyin." />
            <FeatureCard delay={5} color="bg-orange-600/20" icon={<MessageSquare size={22} className="text-orange-400" />} title="Lead Formu" desc="Profilinizde iletişim formu. Mesajları panelden takip edin, CSV olarak dışa aktarın." />
            <FeatureCard delay={6} color="bg-pink-600/20" icon={<Shield size={22} className="text-pink-400" />} title="KVKK Uyumlu" desc="IP adresleri SHA-256 ile anonimleştirilir, veriler Türkiye'de saklanır. Tam KVKK ve GDPR uyumu." />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
      <section id="how" className="py-24 relative">
        <div className="orb w-[350px] h-[350px] bg-blue-700/15 bottom-0 left-0" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="reveal inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-blue-300 border border-blue-500/30 mb-4">
              <Zap size={14} /> Hızlı Kurulum
            </div>
            <h2 className="reveal text-4xl font-black mb-4">2 dakikada <span className="text-gradient">hazır</span></h2>
            <p className="reveal text-gray-400 max-w-lg mx-auto">Teknik bilgi gerektirmez. Hesap oluşturun, profilinizi doldurun, linkinizi paylaşın.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-7 left-1/6 right-1/6 h-px bg-gradient-to-r from-blue-500/0 via-blue-500/50 to-violet-500/0" style={{ left: '18%', right: '18%' }} />

            <StepCard delay={1} num="1" title="Hesap Aç" desc="E-posta ve şifrenizle ücretsiz hesap oluşturun. Kredi kartı gerekmez." />
            <StepCard delay={2} num="2" title="Profilini Düzenle" desc="Fotoğraf, iletişim bilgileri, sosyal medya ve şirket bilgilerini girin." />
            <StepCard delay={3} num="3" title="Paylaş" desc="QR kodunuzu veya kısa linkinizi paylaşın. NFC kart siparişi verin." />
          </div>
        </div>
      </section>

      {/* ── SHOWCASE ────────────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">

            {/* NFC card */}
            <div className="reveal glass rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-600/10 to-blue-600/5 rounded-3xl" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-cyan-600/20 flex items-center justify-center mb-6">
                  <Wifi size={28} className="text-cyan-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">NFC Fiziksel Kart</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">Profesyonel baskı kalitesinde, programlanmış NFC çipli kartvizitiniz kapınıza gelsin. Telefonunuzu yaklaştıran herkes profilinize anında ulaşsın.</p>
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-2 text-cyan-300"><Check size={15} /> Kart programlama dahil</span>
                  <span className="flex items-center gap-2 text-cyan-300"><Check size={15} /> 3–5 iş günü teslimat</span>
                </div>
              </div>
              {/* Decorative NFC chip */}
              <div className="absolute -bottom-8 -right-8 w-48 h-48 rounded-full border-2 border-cyan-500/20 group-hover:border-cyan-500/40 transition-colors" />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full border-2 border-cyan-500/15 group-hover:border-cyan-500/30 transition-colors" />
            </div>

            {/* Analytics card */}
            <div className="reveal reveal-delay-2 glass rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 to-blue-600/5 rounded-3xl" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-violet-600/20 flex items-center justify-center mb-6">
                  <TrendingUp size={28} className="text-violet-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Derin Analitik</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">Kim baktı, hangi şehirden geldi, hangi cihazı kullandı? Saatlik dağılım, kaynak analizi ve trend grafikleriyle her şeyi görün.</p>
                {/* Mini chart mockup */}
                <div className="flex items-end gap-1.5 h-16">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 100, 80, 110].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-gradient-to-t from-violet-600 to-blue-500 opacity-70 group-hover:opacity-100 transition-all duration-500"
                      style={{ height: `${h * 0.55}%`, transitionDelay: `${i * 30}ms` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Profile customization */}
            <div className="reveal reveal-delay-1 glass rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-pink-600/10 to-violet-600/5 rounded-3xl" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-pink-600/20 flex items-center justify-center mb-6">
                  <Layers size={28} className="text-pink-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">Tam Kişiselleştirme</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">Tema rengi, arka plan, font, buton şekli — her şeyi özelleştirin. Şirket logosu ve CV bölümüyle kurumsal imaj.</p>
                {/* Color swatches */}
                <div className="flex gap-3">
                  {['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'].map(c => (
                    <div key={c} className="w-8 h-8 rounded-full border-2 border-white/20 group-hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-white/30 flex items-center justify-center text-gray-400 text-xs">+</div>
                </div>
              </div>
            </div>

            {/* vCard + QR share */}
            <div className="reveal reveal-delay-3 glass rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-cyan-600/5 rounded-3xl" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 flex items-center justify-center mb-6">
                  <Share2 size={28} className="text-emerald-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-3">vCard & QR Paylaşım</h3>
                <p className="text-gray-400 mb-6 leading-relaxed">Rehbere Ekle butonu ile tek tıkta kişi kaydı. Renkli QR kodunuzu PNG/SVG indirin, yazdırın, paylaşın — her platformda çalışır.</p>
                {/* Download buttons */}
                <div className="flex gap-3">
                  {[
                    { label: 'PNG', color: 'bg-blue-600/30 text-blue-300 border-blue-500/30' },
                    { label: 'SVG', color: 'bg-violet-600/30 text-violet-300 border-violet-500/30' },
                    { label: '.vcf', color: 'bg-emerald-600/30 text-emerald-300 border-emerald-500/30' },
                  ].map(({ label, color }) => (
                    <div key={label} className={`px-4 py-2 rounded-lg border text-sm font-bold ${color} group-hover:scale-105 transition-transform`}>{label}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ─────────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 relative">
        <div className="orb w-[400px] h-[400px] bg-violet-700/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="reveal inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm text-violet-300 border border-violet-500/30 mb-4">
              <Star size={14} /> Fiyatlandırma
            </div>
            <h2 className="reveal text-4xl font-black mb-4">Her ölçeğe uygun <span className="text-gradient">plan</span></h2>
            <p className="reveal text-gray-400 max-w-lg mx-auto">Ücretsiz başlayın, büyüdükçe yükseltin. Tüm planlarda temel özellikler dahil.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 items-start">
            <PricingCard
              name="FREE"
              price="Ücretsiz"
              color="bg-gray-700 text-gray-300"
              features={['1 sayfa', '7 günlük analitik', 'QR kod', 'İletişim formu', 'Sosyal linkler']}
            />
            <PricingCard
              name="STARTER"
              price="₺199"
              color="bg-blue-900 text-blue-300"
              features={['3 sayfa', '30 günlük analitik', 'QR kod indirme', 'CSV dışa aktarım', 'Öncelikli destek']}
            />
            <PricingCard
              name="PRO"
              price="₺499"
              popular
              color="bg-violet-900 text-violet-300"
              features={['10 sayfa', '90 günlük analitik', 'NFC kart desteği', 'Gelişmiş temalar', 'Şirket & CV bölümü', 'PNG/SVG QR indirme']}
              comingSoon={['Özel domain']}
            />
            <PricingCard
              name="ENTERPRISE"
              price="₺999"
              color="bg-amber-900 text-amber-300"
              features={['Sınırsız sayfa', '365 günlük analitik', 'NFC kart', 'Şirket & CV bölümü', 'vCard indirme']}
              comingSoon={['Özel domain', 'Ekip yönetimi', 'API erişimi']}
            />
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────────────────── */}
      <section className="py-24 relative overflow-hidden">
        <div className="orb w-[600px] h-[600px] bg-blue-600/15 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-glow-pulse" />
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
          <div className="reveal glass rounded-3xl p-12 border border-white/10" style={{ boxShadow: '0 0 80px rgba(99,102,241,0.1)' }}>
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mx-auto mb-6 text-3xl font-black glow-blue">Q</div>
            <h2 className="text-4xl font-black mb-4">Dijital kimliğinizi<br /><span className="text-gradient">bugün oluşturun</span></h2>
            <p className="text-gray-400 mb-8 text-lg">İlk kartvizitinizi ücretsiz oluşturun. Kredi kartı gerekmez.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={`${DASHBOARD_URL}/login`} className="btn-primary-glow text-white font-bold px-10 py-4 rounded-2xl text-base flex items-center justify-center gap-3">
                Ücretsiz Hesap Aç <ArrowRight size={20} />
              </a>
              <a href={`${DASHBOARD_URL}/login`} className="glass border border-white/15 text-white font-semibold px-10 py-4 rounded-2xl text-base hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                <Share2 size={18} /> Giriş Yap
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center font-black text-xs">Q</div>
                <span className="font-black text-lg shimmer-text">Q-Kart</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">QR ve NFC teknolojisiyle profesyonel dijital kimlik platformu.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Platform</h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                {['Özellikler', 'Fiyatlar', 'Entegrasyonlar', 'Güvenlik'].map(l => (
                  <li key={l}><a href="#" className="hover:text-gray-300 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Şirket</h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                {['Hakkımızda', 'Blog', 'Kariyer', 'İletişim'].map(l => (
                  <li key={l}><a href="#" className="hover:text-gray-300 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-4">Destek</h4>
              <ul className="space-y-2.5 text-sm text-gray-500">
                {['Yardım Merkezi', 'API Dokümantasyonu', 'Gizlilik Politikası', 'Kullanım Şartları'].map(l => (
                  <li key={l}><a href="#" className="hover:text-gray-300 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600">
            <p>© 2025 Q-Kart. Tüm hakları saklıdır.</p>
            <div className="flex items-center gap-2">
              <Smartphone size={12} className="text-gray-600" />
              <span>Türkiye'de geliştirildi ve barındırıldı.</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
