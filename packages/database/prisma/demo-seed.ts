/**
 * Sunum için iki zengin demo profili oluşturur (idempotent — tekrar çalıştırılabilir).
 * Her iki profilde de hem İŞ KARTI hem SOSYAL içerik doludur; sunumda mod geçişiyle
 * platformun iki yüzü de gösterilebilir.
 *
 * Çalıştır:  cd packages/database && npx ts-node prisma/demo-seed.ts
 */
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()
const img = (seed: string, s = 800) => `https://picsum.photos/seed/${seed}/${s}/${s}`
const uid = (p: string, i: number) => `${p}${i}`

async function upsertProfile(opts: {
  username: string; email: string; phone: string; company: string
  slug: string; profile: any; contacts: any[]; socials: any[]
}) {
  const passwordHash = await bcrypt.hash('Demo1234!', 10)
  const pkg = (await prisma.package.findFirst({ where: { name: 'PRO' } })) ||
              (await prisma.package.findFirst())
  if (!pkg) throw new Error('Paket bulunamadı — önce ana seed çalıştırın.')

  const user = await prisma.user.upsert({
    where: { username: opts.username },
    update: { email: opts.email, phone: opts.phone, company: opts.company, status: 'ACTIVE', passwordChanged: true },
    create: {
      username: opts.username, email: opts.email, passwordHash,
      role: 'CUSTOMER', status: 'ACTIVE', passwordChanged: true,
      phone: opts.phone, company: opts.company, packageId: pkg.id,
    },
  })

  const profile = await prisma.profile.upsert({
    where: { userId: user.id },
    update: { ...opts.profile, slug: opts.slug },
    create: { userId: user.id, slug: opts.slug, ...opts.profile },
  })

  await prisma.contactItem.deleteMany({ where: { profileId: profile.id } })
  await prisma.contactItem.createMany({ data: opts.contacts.map(c => ({ ...c, profileId: profile.id })) })
  await prisma.socialLink.deleteMany({ where: { profileId: profile.id } })
  await prisma.socialLink.createMany({ data: opts.socials.map(s => ({ ...s, profileId: profile.id })) })

  console.log(`✓ ${opts.profile.displayName} (@${opts.slug}) — mod: ${opts.profile.profileMode}`)
}

async function main() {
  /* ───────────────────────── 1) ELİF YILDIZ — Mimar (İş Kartı) ───────────────────────── */
  const elifSocial = {
    handle: 'elifyildiz', status: '✨ Yeni projelere açığım', location: 'İstanbul',
    bio: 'Mekânları yaşanabilir hikâyelere dönüştüren mimar. Kahve, seramik ve iyi ışık.',
    cover: img('elif-cover', 1200),
    interests: ['mimari', 'iç tasarım', 'seramik', 'kahve', 'seyahat', 'fotoğraf'],
    links: [
      { id: uid('el', 1), label: 'Portföyüm (Behance)', url: 'https://behance.net/elifyildiz', platform: 'BEHANCE' },
      { id: uid('el', 2), label: 'Instagram', url: 'https://instagram.com/elifyildiz.studio', platform: 'INSTAGRAM' },
      { id: uid('el', 3), label: 'Stüdyo Sitesi', url: 'https://yildizmimarlik.com', platform: 'CUSTOM' },
      { id: uid('el', 4), label: 'Pinterest İlham Panom', url: 'https://pinterest.com/elifyildiz', platform: 'CUSTOM' },
    ],
    gallery: [1, 2, 3, 4, 5, 6].map(i => ({ id: uid('eg', i), url: img(`elif-g${i}`) })),
    posts: [
      { id: uid('ep', 1), title: 'Yeni projem yayında', body: 'Beşiktaş\'ta 140 m² bir dairenin minimal dönüşümü tamamlandı. Doğal ahşap ve taş dokular ön planda.', imageUrl: img('elif-p1', 900), date: '02.06.2026' },
      { id: uid('ep', 2), title: 'Renk seçerken', body: 'Az renk, çok doku. Bir mekânı sıcak kılan şey paletin sadeliğidir.', date: '20.05.2026' },
    ],
    music: { type: 'spotify', url: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ' },
    vibe: 'pastel', accent: '#d6336c', font: 'Playfair Display',
    bg: { type: 'vibe', gradient: ['#ffe4f0', '#e0f2ff'], angle: 160, animated: 'none' },
    linkStyle: 'glass', avatarStyle: 'CIRCLE',
    effects: { grain: true, glow: true, tilt: true },
    show: { links: true, gallery: true, posts: true, music: true, interests: true, socials: true, contactForm: true },
  }

  await upsertProfile({
    username: 'elifyildiz', email: 'elif@yildizmimarlik.com', phone: '+905321234567', company: 'Yıldız Mimarlık',
    slug: 'elifyildiz',
    contacts: [
      { type: 'PHONE', value: '+905321234567', label: 'İş', order: 0 },
      { type: 'EMAIL', value: 'elif@yildizmimarlik.com', label: 'İş', order: 1 },
      { type: 'WHATSAPP', value: '+905321234567', label: 'WhatsApp', order: 2 },
      { type: 'WEBSITE', value: 'https://yildizmimarlik.com', label: 'Stüdyo', order: 3 },
    ],
    socials: [
      { platform: 'INSTAGRAM', url: 'https://instagram.com/elifyildiz.studio', order: 0 },
      { platform: 'LINKEDIN', url: 'https://linkedin.com/in/elifyildiz', order: 1 },
      { platform: 'BEHANCE', url: 'https://behance.net/elifyildiz', order: 2 },
      { platform: 'DRIBBBLE', url: 'https://dribbble.com/elifyildiz', order: 3 },
    ],
    profile: {
      displayName: 'Elif Yıldız',
      title: 'Kurucu Mimar · Yıldız Mimarlık',
      bio: 'Mekânları yaşanabilir hikâyelere dönüştürüyorum. Konut, ofis ve ticari projelerde 8 yıllık deneyim. İşlevi estetikle, sadeliği sıcaklıkla buluşturmayı seviyorum.',
      tagline: 'İyi tasarım sessizce hissedilir.',
      location: 'İstanbul, Türkiye',
      available: true,
      calendarUrl: 'https://cal.com/elifyildiz/gorusme',
      avatarUrl: 'https://randomuser.me/api/portraits/women/65.jpg',
      theme: 'purple', accentColor: '#9333ea', bgColor: '#faf5ff',
      fontFamily: 'Playfair Display', buttonStyle: 'PILL', profileShape: 'CIRCLE',
      cardStyle: 'glass', typographyDensity: 'spacious', isPublished: true,
      profileMode: 'BUSINESS',
      companyName: 'Yıldız Mimarlık', companyDescription: 'İstanbul merkezli butik mimarlık ve iç mimarlık stüdyosu. Konut, ofis ve ticari mekânlarda uçtan uca tasarım.',
      companyWebsite: 'https://yildizmimarlik.com', companyIndustry: 'Mimarlık & İç Mimarlık',
      showCompanySection: true,
      cvSkills: JSON.stringify(['AutoCAD', 'SketchUp', '3ds Max', 'V-Ray', 'Revit', 'Konsept Tasarım', 'Proje Yönetimi', 'Malzeme Seçimi']),
      cvLanguages: JSON.stringify(['Türkçe (Anadil)', 'İngilizce (İleri)', 'İtalyanca (Orta)']),
      showCvSection: true,
      stats: JSON.stringify([
        { value: '8+', label: 'Yıl Deneyim' }, { value: '120+', label: 'Tamamlanan Proje' },
        { value: '45', label: 'Mutlu Müşteri' }, { value: '4.9', label: 'Memnuniyet' },
      ]),
      services: JSON.stringify([
        { icon: '◈', title: 'Konut Tasarımı', desc: 'Daire ve villalarda işlevsel, sıcak ve zamansız iç mekânlar.' },
        { icon: '▲', title: 'Ofis & Ticari', desc: 'Markanızı yansıtan ofis, mağaza ve kafe konseptleri.' },
        { icon: '✦', title: '3B Görselleştirme', desc: 'Fotogerçekçi render ile projeyi inşa etmeden görün.' },
        { icon: '◇', title: 'Mimari Danışmanlık', desc: 'Malzeme, renk ve aydınlatma için uzman yönlendirme.' },
      ]),
      projects: JSON.stringify([
        { title: 'Nişantaşı Loft', category: 'Konut', desc: '120 m² çatı katının açık plana dönüşümü.', tags: ['Konut', 'Minimal'], color: '#9333ea' },
        { title: 'Karaköy Kafe', category: 'Ticari', desc: 'Endüstriyel dokuyla sıcak bir buluşma noktası.', tags: ['Ticari', 'Endüstriyel'], color: '#c2410c' },
        { title: 'Bebek Ofis', category: 'Ofis', desc: 'Boğaz manzaralı 300 m² yaratıcı ajans ofisi.', tags: ['Ofis', 'Modern'], color: '#1d4ed8' },
      ]),
      testimonials: JSON.stringify([
        { quote: 'Elif evimizi hayal ettiğimizden çok daha iyi yorumladı. Her detay düşünülmüş.', name: 'Selin Kaya', role: 'Ev Sahibi', company: 'Nişantaşı', initials: 'SK' },
        { quote: 'Ofisimiz artık ekibimizin gurur kaynağı. Profesyonel ve titiz bir süreç.', name: 'Murat Aksoy', role: 'Kurucu Ortak', company: 'Aksoy Digital', initials: 'MA' },
        { quote: 'Bütçeyi aşmadan premium bir his yarattı. Kesinlikle tavsiye ederim.', name: 'Deniz Çelik', role: 'İşletme Sahibi', company: 'Karaköy', initials: 'DÇ' },
      ]),
      experience: JSON.stringify([
        { year: '2021 — Bugün', role: 'Kurucu & Baş Mimar', company: 'Yıldız Mimarlık', desc: 'Kendi stüdyomu kurdum; 80+ konut ve ticari projeyi yönettim.' },
        { year: '2018 — 2021', role: 'Proje Mimarı', company: 'Atölye 19', desc: 'Butik konut projelerinde konsepten uygulamaya sorumluluk.' },
        { year: '2016 — 2018', role: 'Junior Mimar', company: 'Form Mimarlık', desc: 'Ticari projelerde 3B görselleştirme ve teknik çizim.' },
      ]),
      education: JSON.stringify([
        { year: '2014 — 2016', degree: 'İç Mimarlık Y. Lisans', school: 'İTÜ' },
        { year: '2010 — 2014', degree: 'Mimarlık Lisans', school: 'Mimar Sinan G.S.Ü.' },
      ]),
      showStatsSection: true, showServicesSection: true, showProjectsSection: true,
      showTestimonialsSection: true, showCareerSection: true, showContactForm: true, showQrSection: true,
      socialData: JSON.stringify(elifSocial),
    },
  })

  /* ───────────────────────── 2) CAN DENİZ — İçerik/Müzik (Sosyal) ───────────────────────── */
  const canSocial = {
    handle: 'candeniz', status: '🎧 Yeni single yolda — çok yakında', location: 'İstanbul',
    bio: 'İçerik üreticisi & müzik prodüktörü. Beat yapıyor, kamera arkası paylaşıyor, kahve içiyorum.',
    cover: img('can-cover', 1200),
    interests: ['müzik', 'prodüksiyon', 'vinyl', 'gaming', 'kahve', 'kamera', 'sneakers'],
    links: [
      { id: uid('cl', 1), label: 'YouTube Kanalım', url: 'https://youtube.com/@candeniz', platform: 'YOUTUBE' },
      { id: uid('cl', 2), label: 'Spotify\'da Dinle', url: 'https://open.spotify.com/artist/candeniz', platform: 'SPOTIFY' },
      { id: uid('cl', 3), label: 'TikTok', url: 'https://tiktok.com/@candeniz', platform: 'TIKTOK' },
      { id: uid('cl', 4), label: 'Instagram', url: 'https://instagram.com/candeniz', platform: 'INSTAGRAM' },
      { id: uid('cl', 5), label: 'Prodüksiyon Talebi', url: 'https://candeniz.studio', platform: 'CUSTOM' },
    ],
    gallery: [1, 2, 3, 4, 5, 6].map(i => ({ id: uid('cg', i), url: img(`can-g${i}`) })),
    posts: [
      { id: uid('cp', 1), title: 'Stüdyo günlüğü #12', body: 'Yeni EP\'nin kayıtları başladı. Bu sefer tamamen analog sentezleyicilerle çalışıyorum.', imageUrl: img('can-p1', 900), date: '03.06.2026' },
      { id: uid('cp', 2), title: 'Setup yeniliği', body: 'Masaya yeni bir MIDI controller eklendi. Akış ikiye katlandı 🔥', imageUrl: img('can-p2', 900), date: '25.05.2026' },
      { id: uid('cp', 3), title: 'Soru-cevap', body: 'En çok sorulan: hangi DAW? Cevap — Ableton, ama her şey kulakla başlar.', date: '14.05.2026' },
    ],
    music: { type: 'spotify', url: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd' },
    vibe: 'neon', accent: '#22d3ee', font: 'Space Grotesk',
    bg: { type: 'animated', gradient: ['#1a0938', '#2d0b5a'], angle: 160, animated: 'aurora' },
    linkStyle: 'glass', avatarStyle: 'CIRCLE',
    effects: { grain: true, glow: true, tilt: true },
    show: { links: true, gallery: true, posts: true, music: true, interests: true, socials: true, contactForm: true },
  }

  await upsertProfile({
    username: 'candeniz', email: 'can@candeniz.studio', phone: '+905339876543', company: 'Deniz Studio',
    slug: 'candeniz',
    contacts: [
      { type: 'EMAIL', value: 'can@candeniz.studio', label: 'İş', order: 0 },
      { type: 'WHATSAPP', value: '+905339876543', label: 'WhatsApp', order: 1 },
      { type: 'WEBSITE', value: 'https://candeniz.studio', label: 'Stüdyo', order: 2 },
    ],
    socials: [
      { platform: 'INSTAGRAM', url: 'https://instagram.com/candeniz', order: 0 },
      { platform: 'YOUTUBE', url: 'https://youtube.com/@candeniz', order: 1 },
      { platform: 'TIKTOK', url: 'https://tiktok.com/@candeniz', order: 2 },
      { platform: 'SPOTIFY', url: 'https://open.spotify.com/artist/candeniz', order: 3 },
      { platform: 'SOUNDCLOUD', url: 'https://soundcloud.com/candeniz', order: 4 },
    ],
    profile: {
      displayName: 'Can Deniz',
      title: 'İçerik Üreticisi & Müzik Prodüktörü',
      bio: 'Beat üretiyor, kamera arkası içerik paylaşıyor ve markalarla yaratıcı işler yapıyorum. 250K+ topluluk.',
      tagline: 'Ses, ışık, akış.',
      location: 'İstanbul, Türkiye',
      available: true,
      calendarUrl: 'https://cal.com/candeniz',
      avatarUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
      theme: 'dark', accentColor: '#22d3ee', bgColor: '#0d0b08',
      fontFamily: 'Space Grotesk', buttonStyle: 'ROUNDED', profileShape: 'CIRCLE',
      cardStyle: 'premium', typographyDensity: 'standard', isPublished: true,
      profileMode: 'SOCIAL',
      companyName: 'Deniz Studio', companyDescription: 'Müzik prodüksiyonu ve marka içeriği üreten bağımsız stüdyo.',
      companyWebsite: 'https://candeniz.studio', companyIndustry: 'Müzik & Medya',
      showCompanySection: true,
      cvSkills: JSON.stringify(['Ableton Live', 'Mix & Master', 'Sound Design', 'Video Kurgu', 'DaVinci Resolve', 'İçerik Stratejisi']),
      cvLanguages: JSON.stringify(['Türkçe (Anadil)', 'İngilizce (İleri)']),
      showCvSection: true,
      stats: JSON.stringify([
        { value: '250K', label: 'Takipçi' }, { value: '40M+', label: 'İzlenme' },
        { value: '60+', label: 'Prodüksiyon' }, { value: '12', label: 'Marka İşbirliği' },
      ]),
      services: JSON.stringify([
        { icon: '♪', title: 'Müzik Prodüksiyonu', desc: 'Beat, aranjman, mix ve master — fikirden master\'a.' },
        { icon: '▶', title: 'İçerik Üretimi', desc: 'Markalar için reels, kısa video ve kampanya içerikleri.' },
        { icon: '✦', title: 'Mix & Master', desc: 'Şarkını yayına hazır, profesyonel sesle teslim et.' },
        { icon: '◇', title: 'Workshop', desc: 'Prodüksiyon ve içerik üzerine birebir / grup eğitim.' },
      ]),
      projects: JSON.stringify([
        { title: 'Gece Modu — EP', category: 'Müzik', desc: '5 parçalık elektronik EP. 2M+ dinlenme.', tags: ['Müzik', 'Elektronik'], color: '#22d3ee' },
        { title: 'Marka X Kampanyası', category: 'İçerik', desc: 'Sneaker lansmanı için 8 videoluk seri.', tags: ['İçerik', 'Reklam'], color: '#e635ff' },
        { title: 'Canlı Set @ Festival', category: 'Performans', desc: '3000 kişilik açık hava DJ performansı.', tags: ['Canlı', 'DJ'], color: '#f59e0b' },
      ]),
      testimonials: JSON.stringify([
        { quote: 'Can\'la çalışmak inanılmazdı; sesimiz ilk kez bu kadar profesyonel çıktı.', name: 'Lara M.', role: 'Vokalist', company: 'indie band', initials: 'LM' },
        { quote: 'Kampanya içeriklerimiz patladı. Yaratıcı ve hızlı.', name: 'Emre Tan', role: 'Pazarlama Md.', company: 'StepUp', initials: 'ET' },
      ]),
      experience: JSON.stringify([
        { year: '2020 — Bugün', role: 'Kurucu / Prodüktör', company: 'Deniz Studio', desc: 'Bağımsız müzik ve içerik stüdyosu; 60+ prodüksiyon.' },
        { year: '2017 — 2020', role: 'İçerik Üreticisi', company: 'Freelance', desc: 'YouTube ve sosyal medyada 250K+ topluluk inşası.' },
      ]),
      education: JSON.stringify([
        { year: '2015 — 2019', degree: 'Müzik Teknolojileri', school: 'İstanbul Bilgi Üniversitesi' },
      ]),
      showStatsSection: true, showServicesSection: true, showProjectsSection: true,
      showTestimonialsSection: true, showCareerSection: true, showContactForm: true, showQrSection: true,
      socialData: JSON.stringify(canSocial),
    },
  })

  console.log('\n--- DEMO PROFİLLERİ HAZIR ---')
  console.log('Elif Yıldız : /u/elifyildiz  (İş Kartı modu)  · giriş: elifyildiz / Demo1234!')
  console.log('Can Deniz   : /u/candeniz   (Sosyal mod)     · giriş: candeniz / Demo1234!')
  console.log('Her iki profilde de iki mod da dolu — Tasarım > Profil Modu ile geçiş yapılabilir.')
}

main().catch(console.error).finally(() => prisma.$disconnect())
