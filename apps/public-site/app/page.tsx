'use client'
import { useEffect, useRef, useState } from 'react'
import {
  Wifi, QrCode, BarChart2, Layers, Shield,
  ChevronRight, Star, Check, ArrowRight, Zap,
  Smartphone, Share2, TrendingUp, MessageSquare,
  Menu, X,
} from 'lucide-react'

const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL || 'http://localhost:3000'

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.12 }
    )
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [])
}

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

type CardColor = 'pink' | 'teal' | 'lavender' | 'peach' | 'ochre' | 'cream'

const cardStyles: Record<CardColor, { bg: string; text: string; icon: string }> = {
  pink:     { bg: 'clay-card-pink',     text: 'text-white',      icon: 'bg-white/20 text-white' },
  teal:     { bg: 'clay-card-teal',     text: 'text-white',      icon: 'bg-white/20 text-white' },
  lavender: { bg: 'clay-card-lavender', text: 'text-[#0a0a0a]',  icon: 'bg-white/30 text-[#1a3a3a]' },
  peach:    { bg: 'clay-card-peach',    text: 'text-[#0a0a0a]',  icon: 'bg-white/30 text-[#0a0a0a]' },
  ochre:    { bg: 'clay-card-ochre',    text: 'text-[#0a0a0a]',  icon: 'bg-white/30 text-[#0a0a0a]' },
  cream:    { bg: 'clay-card-cream',    text: 'text-[#0a0a0a]',  icon: 'bg-white/60 text-[#1a3a3a]' },
}

function FeatureCard({ icon, title, desc, color, delay }: {
  icon: React.ReactNode; title: string; desc: string; color: CardColor; delay: number
}) {
  const s = cardStyles[color]
  return (
    <div className={`reveal reveal-delay-${delay} ${s.bg} rounded-3xl p-8 group hover:scale-[1.02] transition-transform duration-300`}>
      <div className={`w-12 h-12 rounded-2xl ${s.icon} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
        {icon}
      </div>
      <h3 className={`${s.text} font-semibold text-lg mb-2 clay-display`}>{title}</h3>
      <p className={`${s.text} opacity-75 text-sm leading-relaxed`}>{desc}</p>
    </div>
  )
}

function PricingCard({ name, price, features, comingSoon = [], popular, accentBg, accentText }: {
  name: string; price: string; features: string[]; comingSoon?: string[]; popular?: boolean; accentBg: string; accentText: string
}) {
  return (
    <div className={`reveal rounded-2xl p-7 flex flex-col clay-hairline transition-all duration-300 hover:scale-[1.02] ${popular ? 'clay-card-teal' : 'bg-[#fffaf0]'}`}>
      {popular && (
        <div className="flex items-center gap-1.5 text-[#a4d4c5] text-xs font-bold uppercase tracking-widest mb-4">
          <Star size={11} fill="currentColor" /> En Popüler
        </div>
      )}
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${accentBg} ${accentText} w-fit mb-4`}>{name}</span>
      <div className="mb-6">
        <span className={`text-4xl font-black clay-display ${popular ? 'text-white' : 'text-[#0a0a0a]'}`}>{price}</span>
        {price !== 'Ücretsiz' && <span className={`text-sm ml-1 ${popular ? 'text-white/60' : 'text-[#6a6a6a]'}`}>/ay</span>}
      </div>
      <ul className="space-y-3 flex-1 mb-6">
        {features.map(f => (
          <li key={f} className={`flex items-start gap-2.5 text-sm ${popular ? 'text-white/85' : 'text-[#3a3a3a]'}`}>
            <Check size={15} className={popular ? 'text-[#a4d4c5] mt-0.5 shrink-0' : 'text-[#1a3a3a] mt-0.5 shrink-0'} />
            {f}
          </li>
        ))}
        {comingSoon.map(f => (
          <li key={f} className={`flex items-start gap-2.5 text-sm ${popular ? 'text-white/40' : 'text-[#9a9a9a]'}`}>
            <span className="mt-0.5 shrink-0">◷</span>
            <span>{f} <span className="text-[10px] font-semibold uppercase tracking-wider ml-1">yakında</span></span>
          </li>
        ))}
      </ul>
      <a
        href={`${DASHBOARD_URL}/login`}
        className={`block text-center py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
          popular
            ? 'bg-[#fffaf0] text-[#1a3a3a] hover:bg-white'
            : 'btn-clay-primary'
        }`}
      >
        Hemen Başla
      </a>
    </div>
  )
}

function MockCard() {
  return (
    <div className="animate-float-card">
      <div
        className="relative w-[300px] bg-[#fffaf0] rounded-3xl p-6 overflow-hidden clay-hairline"
        style={{ boxShadow: '0 20px 60px rgba(10,10,10,0.12), 0 4px 16px rgba(10,10,10,0.06)' }}
      >
        <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl bg-gradient-to-r from-[#ff4d8b] via-[#b8a4ed] to-[#1a3a3a]" />
        <div className="flex items-center gap-3 mb-5 pt-2">
          <div className="w-12 h-12 rounded-2xl bg-[#1a3a3a] flex items-center justify-center text-white font-black text-lg">A</div>
          <div>
            <p className="text-[#0a0a0a] font-bold text-base leading-tight clay-display">Ahmet Yılmaz</p>
            <p className="text-[#6a6a6a] text-xs">Senior Product Manager</p>
            <p className="text-[#9a9a9a] text-xs">TechCorp A.Ş.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {['📞 +90 555 000 00 00', '✉️ ahmet@techcorp.com'].map(c => (
            <span key={c} className="px-2.5 py-1 bg-[#f5f0e0] rounded-full text-xs text-[#3a3a3a] clay-hairline">{c}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 mb-4">
          {['in', 'tw', 'gh', 'ig'].map(s => (
            <div key={s} className="w-8 h-8 rounded-xl bg-[#f5f0e0] clay-hairline flex items-center justify-center hover:bg-[#ebe6d6] transition-colors">
              <span className="text-xs text-[#3a3a3a] font-bold">{s}</span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-[#e5e5e5] pt-3">
          <div className="flex items-center gap-1.5">
            <Wifi size={13} className="text-[#1a3a3a]" />
            <span className="text-xs text-[#6a6a6a]">NFC aktif</span>
          </div>
          <span className="text-xs text-[#9a9a9a] font-mono">qkrt.co/ahmet</span>
        </div>
      </div>

      {/* Floating badges */}
      <div className="absolute -top-3 -right-8 bg-[#ff4d8b] rounded-2xl px-3 py-2 text-xs text-white font-semibold flex items-center gap-1.5 shadow-lg">
        <BarChart2 size={11} /> <span>+248 görüntülenme</span>
      </div>
      <div className="absolute -bottom-3 -left-8 bg-[#1a3a3a] rounded-2xl px-3 py-2 text-xs text-white font-semibold flex items-center gap-1.5 shadow-lg">
        <MessageSquare size={11} /> <span>12 yeni mesaj</span>
      </div>
    </div>
  )
}

export default function LandingPage() {
  useReveal()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <main className="min-h-screen clay-canvas text-[#0a0a0a] overflow-x-hidden">

      {/* ── NAVBAR ───────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 clay-canvas border-b border-[#e5e5e5]">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#0a0a0a] flex items-center justify-center font-black text-sm text-white">Q</div>
            <span className="font-black text-xl text-[#0a0a0a] clay-display tracking-tight">Q-Kart</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm text-[#6a6a6a]">
            {[['Özellikler', '#features'], ['Nasıl Çalışır', '#how'], ['Fiyatlar', '#pricing']].map(([l, h]) => (
              <a key={h} href={h} className="hover:text-[#0a0a0a] transition-colors font-medium">{l}</a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a href={`${DASHBOARD_URL}/login`} className="hidden md:block text-sm text-[#6a6a6a] hover:text-[#0a0a0a] transition-colors px-4 py-2 font-medium">
              Giriş Yap
            </a>
            <a href={`${DASHBOARD_URL}/login`} className="btn-clay-primary text-white text-sm flex items-center gap-2 px-5">
              Ücretsiz Başla <ChevronRight size={15} />
            </a>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl hover:bg-[#f5f0e0] transition-colors">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden clay-canvas border-b border-[#e5e5e5] px-6 py-4 space-y-3">
            {[['Özellikler', '#features'], ['Nasıl Çalışır', '#how'], ['Fiyatlar', '#pricing']].map(([l, h]) => (
              <a key={h} href={h} onClick={() => setMobileMenuOpen(false)} className="block text-sm text-[#3a3a3a] hover:text-[#0a0a0a] font-medium py-1">{l}</a>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16" style={{ background: '#fffaf0' }}>
        <div className="max-w-6xl mx-auto px-6 py-24 w-full grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#f5f0e0] rounded-full text-sm text-[#1a3a3a] border border-[#e5e5e5] mb-7 font-medium">
              <Zap size={13} className="text-[#e8b94a]" />
              QR · NFC · Analitik · Kurumsal
            </div>

            <h1 className="text-5xl md:text-6xl clay-display leading-[1.05] mb-6 text-[#0a0a0a]" style={{ letterSpacing: '-2.5px' }}>
              Dijital kimliğiniz<br />
              <span className="text-[#1a3a3a]">tek bir kartta.</span>
            </h1>

            <p className="text-[#3a3a3a] text-lg leading-relaxed mb-9 max-w-lg">
              QR kod ve NFC teknolojisiyle anlık paylaşılan, kişiselleştirilebilir dijital kartvizit platformu. Bağlantılarınızı, analitiklerinizi ve marka imajınızı tek noktadan yönetin.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <a href={`${DASHBOARD_URL}/login`} className="btn-clay-primary flex items-center gap-2 px-8 py-4 h-auto text-base rounded-2xl">
                Ücretsiz Başla <ArrowRight size={17} />
              </a>
              <a href="/u/ahmetdemir" className="btn-clay-secondary flex items-center gap-2 px-8 py-4 h-auto text-base rounded-2xl">
                Demo Kartı Gör
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs text-[#6a6a6a]">
              <span className="flex items-center gap-1.5"><Check size={13} className="text-[#1a3a3a]" /> Kredi kartı gerekmez</span>
              <span className="flex items-center gap-1.5"><Check size={13} className="text-[#1a3a3a]" /> 2 dakikada kurulum</span>
              <span className="flex items-center gap-1.5"><Check size={13} className="text-[#1a3a3a]" /> KVKK uyumlu</span>
            </div>
          </div>

          <div className="relative flex items-center justify-center py-12">
            <MockCard />
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section className="py-16 border-y border-[#e5e5e5] bg-[#faf5e8]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: 5000,    suffix: '+', label: 'Aktif Kullanıcı' },
              { value: 2500000, suffix: '+', label: 'Profil Görüntülenme' },
              { value: 98,      suffix: '%', label: 'Müşteri Memnuniyeti' },
              { value: 150,     suffix: '+', label: 'Kurumsal Müşteri' },
            ].map(({ value, suffix, label }) => (
              <div key={label} className="reveal">
                <p className="text-4xl font-black text-[#1a3a3a] mb-2 clay-display" style={{ letterSpacing: '-1px' }}>
                  <Counter to={value} suffix={suffix} />
                </p>
                <p className="text-[#6a6a6a] text-sm">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" className="py-24 clay-canvas">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="reveal inline-flex items-center gap-2 px-4 py-2 bg-[#f5f0e0] rounded-full text-sm text-[#1a3a3a] border border-[#e5e5e5] mb-5 font-medium">
              <Layers size={13} /> Platform Özellikleri
            </div>
            <h2 className="reveal text-4xl clay-display font-medium mb-4 text-[#0a0a0a]" style={{ letterSpacing: '-1px' }}>
              Profesyoneller için<br />her şey dahil
            </h2>
            <p className="reveal text-[#6a6a6a] max-w-xl mx-auto leading-relaxed">
              İletişim bilgilerinden sosyal medya linklerine, QR koddan NFC karttaki fiziksel erişime kadar eksiksiz dijital kimlik yönetimi.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard delay={1} color="pink"     icon={<QrCode    size={22} />} title="Akıllı QR Kod"        desc="Markanıza özel renk ve arka plan seçenekleriyle QR kod oluşturun. PNG ve SVG formatlarında indirin." />
            <FeatureCard delay={2} color="teal"     icon={<Wifi      size={22} />} title="NFC Dokunmalı Kart"   desc="Fiziksel NFC kartta profil bilgilerinize dokunuşla erişim sağlayın. Siparişi platformdan verin." />
            <FeatureCard delay={3} color="lavender" icon={<BarChart2 size={22} />} title="Derin Analitik"       desc="Kim baktı, nereden geldi, hangi butona tıkladı? Cihaz, tarayıcı ve saatlik dağılım grafikleri." />
            <FeatureCard delay={4} color="peach"    icon={<Layers    size={22} />} title="Şirket & CV Profili"  desc="Şirket logosu, sektör, web sitesi bilgilerini ekleyin; ya da kişisel CV bölümüyle becerilerinizi sergileyin." />
            <FeatureCard delay={5} color="ochre"    icon={<MessageSquare size={22} />} title="Lead Formu"       desc="Profilinizde iletişim formu. Mesajları panelden takip edin, CSV olarak dışa aktarın." />
            <FeatureCard delay={6} color="cream"    icon={<Shield    size={22} />} title="KVKK Uyumlu"         desc="IP adresleri SHA-256 ile anonimleştirilir, veriler Türkiye'de saklanır. Tam KVKK ve GDPR uyumu." />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how" className="py-24 bg-[#faf5e8]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="reveal inline-flex items-center gap-2 px-4 py-2 bg-[#fffaf0] rounded-full text-sm text-[#1a3a3a] border border-[#e5e5e5] mb-5 font-medium">
              <Zap size={13} /> Hızlı Kurulum
            </div>
            <h2 className="reveal text-4xl clay-display font-medium mb-4 text-[#0a0a0a]" style={{ letterSpacing: '-1px' }}>2 dakikada hazır</h2>
            <p className="reveal text-[#6a6a6a] max-w-lg mx-auto">Teknik bilgi gerektirmez. Hesap oluşturun, profilinizi doldurun, linkinizi paylaşın.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: '1', title: 'Hesap Aç',         desc: 'E-posta ve şifrenizle ücretsiz hesap oluşturun. Kredi kartı gerekmez.',            color: 'clay-card-pink'     as CardColor },
              { num: '2', title: 'Profilini Düzenle', desc: 'Fotoğraf, iletişim bilgileri, sosyal medya ve şirket bilgilerini girin.',            color: 'clay-card-lavender' as CardColor },
              { num: '3', title: 'Paylaş',            desc: 'QR kodunuzu veya kısa linkinizi paylaşın. NFC kart siparişi verin.',               color: 'clay-card-teal'     as CardColor },
            ].map(({ num, title, desc, color }, i) => (
              <div key={num} className={`reveal reveal-delay-${i + 1} ${color} rounded-3xl p-8 text-center`}>
                <div className={`w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-5 text-2xl font-black ${color === 'clay-card-teal' ? 'text-white' : 'text-[#0a0a0a]'}`}>
                  {num}
                </div>
                <h3 className={`font-semibold text-lg mb-2 clay-display ${color === 'clay-card-teal' || color === 'clay-card-pink' ? 'text-white' : 'text-[#0a0a0a]'}`}>{title}</h3>
                <p className={`text-sm leading-relaxed ${color === 'clay-card-teal' || color === 'clay-card-pink' ? 'text-white/75' : 'text-[#3a3a3a]/80'}`}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SHOWCASE ─────────────────────────────────────── */}
      <section className="py-24 clay-canvas">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-4">

            <div className="reveal clay-card-teal rounded-3xl p-8 group hover:scale-[1.01] transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <Wifi size={26} className="text-white" />
              </div>
              <h3 className="text-2xl font-medium text-white mb-3 clay-display" style={{ letterSpacing: '-0.5px' }}>NFC Fiziksel Kart</h3>
              <p className="text-white/75 mb-6 leading-relaxed text-sm">Profesyonel baskı kalitesinde, programlanmış NFC çipli kartvizitiniz kapınıza gelsin. Telefonunuzu yaklaştıran herkes profilinize anında ulaşsın.</p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center gap-2 text-[#a4d4c5]"><Check size={14} /> Kart programlama dahil</span>
                <span className="flex items-center gap-2 text-[#a4d4c5]"><Check size={14} /> 3–5 iş günü teslimat</span>
              </div>
            </div>

            <div className="reveal reveal-delay-2 clay-card-peach rounded-3xl p-8 group hover:scale-[1.01] transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center mb-6">
                <TrendingUp size={26} className="text-[#0a0a0a]" />
              </div>
              <h3 className="text-2xl font-medium text-[#0a0a0a] mb-3 clay-display" style={{ letterSpacing: '-0.5px' }}>Derin Analitik</h3>
              <p className="text-[#0a0a0a]/70 mb-6 leading-relaxed text-sm">Kim baktı, hangi şehirden geldi, hangi cihazı kullandı? Saatlik dağılım, kaynak analizi ve trend grafikleriyle her şeyi görün.</p>
              <div className="flex items-end gap-1 h-14">
                {[40,65,45,80,55,90,70,85,60,95,75,100,80,110].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t bg-[#0a0a0a]/20 group-hover:bg-[#0a0a0a]/35 transition-all duration-500"
                    style={{ height: `${h * 0.55}%`, transitionDelay: `${i * 25}ms` }}
                  />
                ))}
              </div>
            </div>

            <div className="reveal reveal-delay-1 clay-card-lavender rounded-3xl p-8 group hover:scale-[1.01] transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center mb-6">
                <Layers size={26} className="text-[#1a3a3a]" />
              </div>
              <h3 className="text-2xl font-medium text-[#0a0a0a] mb-3 clay-display" style={{ letterSpacing: '-0.5px' }}>Tam Kişiselleştirme</h3>
              <p className="text-[#0a0a0a]/70 mb-6 leading-relaxed text-sm">Tema rengi, arka plan, font, buton şekli — her şeyi özelleştirin. Şirket logosu ve CV bölümüyle kurumsal imaj.</p>
              <div className="flex gap-3">
                {['#ff4d8b','#1a3a3a','#b8a4ed','#ffb084','#e8b94a','#a4d4c5'].map(c => (
                  <div key={c} className="w-8 h-8 rounded-full border-2 border-white/40 group-hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>

            <div className="reveal reveal-delay-3 clay-card-ochre rounded-3xl p-8 group hover:scale-[1.01] transition-transform duration-300">
              <div className="w-14 h-14 rounded-2xl bg-white/30 flex items-center justify-center mb-6">
                <Share2 size={26} className="text-[#0a0a0a]" />
              </div>
              <h3 className="text-2xl font-medium text-[#0a0a0a] mb-3 clay-display" style={{ letterSpacing: '-0.5px' }}>vCard & QR Paylaşım</h3>
              <p className="text-[#0a0a0a]/70 mb-6 leading-relaxed text-sm">Rehbere Ekle butonu ile tek tıkta kişi kaydı. Renkli QR kodunuzu PNG/SVG indirin, yazdırın, paylaşın.</p>
              <div className="flex gap-3">
                {[
                  { label: 'PNG', bg: 'bg-[#0a0a0a]/15' },
                  { label: 'SVG', bg: 'bg-[#0a0a0a]/15' },
                  { label: '.vcf', bg: 'bg-[#0a0a0a]/15' },
                ].map(({ label, bg }) => (
                  <div key={label} className={`px-4 py-2 rounded-xl border border-[#0a0a0a]/20 text-sm font-bold text-[#0a0a0a] ${bg} group-hover:scale-105 transition-transform`}>{label}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-[#faf5e8]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="reveal inline-flex items-center gap-2 px-4 py-2 bg-[#fffaf0] rounded-full text-sm text-[#1a3a3a] border border-[#e5e5e5] mb-5 font-medium">
              <Star size={13} /> Fiyatlandırma
            </div>
            <h2 className="reveal text-4xl clay-display font-medium mb-4 text-[#0a0a0a]" style={{ letterSpacing: '-1px' }}>Her ölçeğe uygun plan</h2>
            <p className="reveal text-[#6a6a6a] max-w-lg mx-auto">Ücretsiz başlayın, büyüdükçe yükseltin. Tüm planlarda temel özellikler dahil.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 items-start">
            <PricingCard name="FREE"       price="Ücretsiz" accentBg="bg-[#f5f0e0]"     accentText="text-[#3a3a3a]" features={['1 sayfa','7 günlük analitik','QR kod','İletişim formu','Sosyal linkler']} />
            <PricingCard name="STARTER"    price="₺199"     accentBg="bg-[#b8a4ed]/20"  accentText="text-[#1a3a3a]" features={['3 sayfa','30 günlük analitik','QR kod indirme','CSV dışa aktarım','Öncelikli destek']} />
            <PricingCard name="PRO"        price="₺499"     accentBg="bg-[#a4d4c5]/30"  accentText="text-[#1a3a3a]" popular features={['10 sayfa','90 günlük analitik','NFC kart desteği','Gelişmiş temalar','Şirket & CV bölümü','PNG/SVG QR indirme']} comingSoon={['Özel domain']} />
            <PricingCard name="ENTERPRISE" price="₺999"     accentBg="bg-[#e8b94a]/20"  accentText="text-[#0a0a0a]" features={['Sınırsız sayfa','365 günlük analitik','NFC kart','Şirket & CV bölümü','vCard indirme']} comingSoon={['Özel domain','Ekip yönetimi','API erişimi']} />
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="py-24 clay-canvas">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="reveal clay-card-teal rounded-3xl p-14">
            <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-6 text-2xl font-black text-white clay-display">Q</div>
            <h2 className="text-4xl clay-display font-medium mb-4 text-white" style={{ letterSpacing: '-1px' }}>
              Dijital kimliğinizi<br />bugün oluşturun
            </h2>
            <p className="text-white/70 mb-8 text-lg">İlk kartvizitinizi ücretsiz oluşturun. Kredi kartı gerekmez.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href={`${DASHBOARD_URL}/login`} className="bg-[#fffaf0] text-[#1a3a3a] font-bold px-10 py-4 rounded-2xl text-base flex items-center justify-center gap-3 hover:bg-white transition-colors">
                Ücretsiz Hesap Aç <ArrowRight size={18} />
              </a>
              <a href={`${DASHBOARD_URL}/login`} className="border border-white/25 text-white font-semibold px-10 py-4 rounded-2xl text-base hover:bg-white/10 transition-colors flex items-center justify-center gap-3">
                <Share2 size={17} /> Giriş Yap
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="border-t border-[#e5e5e5] py-14 bg-[#faf5e8]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg bg-[#0a0a0a] flex items-center justify-center font-black text-xs text-white">Q</div>
                <span className="font-black text-lg text-[#0a0a0a] clay-display tracking-tight">Q-Kart</span>
              </div>
              <p className="text-[#6a6a6a] text-sm leading-relaxed">QR ve NFC teknolojisiyle profesyonel dijital kimlik platformu.</p>
            </div>
            <div>
              <h4 className="text-[#0a0a0a] font-semibold text-sm mb-4">Platform</h4>
              <ul className="space-y-2.5 text-sm text-[#6a6a6a]">
                {['Özellikler','Fiyatlar','Entegrasyonlar','Güvenlik'].map(l => (
                  <li key={l}><a href="#" className="hover:text-[#0a0a0a] transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[#0a0a0a] font-semibold text-sm mb-4">Şirket</h4>
              <ul className="space-y-2.5 text-sm text-[#6a6a6a]">
                {['Hakkımızda','Blog','Kariyer','İletişim'].map(l => (
                  <li key={l}><a href="#" className="hover:text-[#0a0a0a] transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-[#0a0a0a] font-semibold text-sm mb-4">Destek</h4>
              <ul className="space-y-2.5 text-sm text-[#6a6a6a]">
                {['Yardım Merkezi','API Dokümantasyonu','Gizlilik Politikası','Kullanım Şartları'].map(l => (
                  <li key={l}><a href="#" className="hover:text-[#0a0a0a] transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-[#e5e5e5] pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#9a9a9a]">
            <p>© 2025 Q-Kart. Tüm hakları saklıdır.</p>
            <div className="flex items-center gap-2">
              <Smartphone size={11} />
              <span>Türkiye'de geliştirildi ve barındırıldı.</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
