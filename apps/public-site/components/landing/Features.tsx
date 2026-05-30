'use client'
import { useCallback } from 'react'
import SectionHead from './SectionHead'
import CountUp from './CountUp'

const FEATURES = [
  {
    title: 'Ekip Yönetimi',
    desc: 'Şirketler ekip oluşturur, personel ekler veya çıkarır. Herkesin kartı tek panelden yönetilir.',
    icon: <><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8"/><path d="M3.5 19a5.5 5.5 0 0111 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><circle cx="17" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.8"/><path d="M16 14a4 4 0 014.5 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>,
  },
  {
    title: 'Sosyal Medya',
    desc: 'Instagram, LinkedIn, X, WhatsApp ve daha fazlası — tüm hesapların tek bir profilde toplanır.',
    icon: <><rect x="4" y="4" width="16" height="16" rx="4.5" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.8"/><circle cx="16.6" cy="7.4" r="1.1" fill="currentColor"/></>,
  },
  {
    title: 'Dijital CV',
    desc: 'Özgeçmişini kartına yükle, tek dokunuşla paylaş. İş görüşmelerinde fark yarat.',
    icon: <><path d="M6 3h8l4 4v14H6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M14 3v4h4M9 13h6M9 16.5h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>,
  },
  {
    title: 'Sınırsız Tasarım',
    desc: 'Kartını ve dijital profilini istediğin gibi tasarla. Renkler, düzen, içerik — tamamen sana özel.',
    icon: <path d="M12 3l2.3 4.7 5.2.8-3.8 3.7.9 5.1L12 15l-4.6 2.4.9-5.1L4.5 8.5l5.2-.8z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>,
  },
  {
    title: 'Anlık Güncelleme',
    desc: 'Bilgilerin değişti mi? Profilini güncelle, kart aynı kalsın. Yeni kart bastırmaya gerek yok.',
    icon: <><path d="M4 12a8 8 0 0114-5.3M20 12a8 8 0 01-14 5.3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M18 4v3h-3M6 20v-3h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></>,
  },
  {
    title: 'Analitik',
    desc: 'Profilini kaç kişi görüntüledi, hangi bağlantına tıklandı? Tüm etkileşimleri takip et.',
    icon: <><path d="M4 19V5M20 19H4M8 16v-4M12 16V8M16 16v-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></>,
  },
]

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none"><path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
)

export default function Features() {
  const onFeatMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget
    const r = el.getBoundingClientRect()
    el.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100) + '%')
    el.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100) + '%')
  }, [])

  return (
    <section className="sec-pad" id="ozellikler">
      <div className="wrap">
        <SectionHead
          eyebrow="Özellikler"
          title="Tek kart, sınırsız olasılık"
          sub="Bireyler için akıllı bir kartvizit, şirketler için eksiksiz bir ekip platformu."
        />
        <div className="feat-grid">
          {FEATURES.map((f) => (
            <article className="feat" key={f.title} onMouseMove={onFeatMove}>
              <div className="feat-ico"><svg viewBox="0 0 24 24" fill="none">{f.icon}</svg></div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </article>
          ))}
        </div>

        <div className="showrows" style={{ marginTop: 'clamp(60px,8vw,110px)' }}>
          <div className="showrow">
            <div className="showrow-media">
              <img src="/assets/feat-team.jpg" alt="Karanlık bir ofiste dizüstü bilgisayarında ekip panelini inceleyen profesyonel" loading="lazy" />
              <span className="showrow-badge"><span/>Canlı ekip paneli</span>
            </div>
            <div className="showrow-copy">
              <span className="eyebrow">Şirketler için</span>
              <h3>Tüm ekibin, tek panelde</h3>
              <p>Personel ekle, çıkar, kart tasarımlarını standartlaştır. Kim profili ne zaman güncelledi — hepsi merkezi yönetimde.</p>
              <ul className="showrow-list">
                <li><CheckIcon/> Toplu kart üretimi ve dağıtımı</li>
                <li><CheckIcon/> Marka kimliği şablonları</li>
                <li><CheckIcon/> Görüntülenme ve tıklama analitiği</li>
              </ul>
            </div>
          </div>

          <div className="showrow flip">
            <div className="showrow-media">
              <img src="/assets/feat-metal.jpg" alt="Lazerle kazınan premium siyah metal Q-Kart, altın kıvılcımlar" loading="lazy" />
              <span className="showrow-badge"><span/>Lazer kazıma</span>
            </div>
            <div className="showrow-copy">
              <span className="eyebrow">Zanaatkârlık</span>
              <h3>Elde hissedilen kalite</h3>
              <p>Fırçalanmış metal gövde, hassas lazer kazıma, ağırlığıyla hissettiren bir ilk izlenim. Plastik bir karttan çok daha fazlası.</p>
              <ul className="showrow-list">
                <li><CheckIcon/> Premium metal ve PVC seçenekleri</li>
                <li><CheckIcon/> İsme özel lazer kazıma</li>
                <li><CheckIcon/> Suya ve çizilmeye dayanıklı</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="stats">
          <CountUp to={10000} suffix="+" format="short" label="Aktif kullanıcı" />
          <CountUp to={48} format="full" label="Ülkede teslimat" />
          <CountUp to={1200000} suffix="+" format="short" label="Paylaşılan bağlantı" />
          <div className="stat">
            <div className="num"><span className="accent-text">∞</span></div>
            <div className="lbl">Sınırsız güncelleme</div>
          </div>
        </div>
      </div>
    </section>
  )
}
