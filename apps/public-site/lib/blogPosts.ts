// SEO odaklı blog yazıları — statik içerik.
// Yeni yazı eklemek için diziye yeni bir obje ekle; sitemap ve listeleme otomatik.

export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string // ISO
  readMin: number
  sections: { h: string; p: string[] }[]
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'dijital-kartvizit-nedir',
    title: 'Dijital Kartvizit Nedir? 2026 Rehberi',
    description: 'Dijital kartvizit nedir, nasıl çalışır, kağıt kartvizite göre avantajları neler? NFC ve QR kodlu akıllı kartvizitler hakkında bilmeniz gereken her şey.',
    date: '2026-06-12',
    readMin: 5,
    sections: [
      {
        h: 'Dijital kartvizit nedir?',
        p: [
          'Dijital kartvizit, iletişim bilgilerinizi, sosyal medya hesaplarınızı, CV\'nizi ve işinizi tek bir çevrimiçi profilde toplayan modern kartvizit çözümüdür. Kağıt kartvizitin aksine bilgileriniz her zaman günceldir: telefonunuz ya da göreviniz değiştiğinde kartı yeniden bastırmanıza gerek kalmaz, panelden saniyeler içinde güncellersiniz.',
          'Karşınızdaki kişi profilinize NFC kart, QR kod ya da kısa bir link üzerinden ulaşır; rehberine tek dokunuşla kaydeder. Uygulama indirmesi gerekmez.',
        ],
      },
      {
        h: 'Nasıl çalışır?',
        p: [
          'Dijital kartvizitin kalbi, size özel bir profil sayfasıdır (örneğin qansvizit.com/u/adiniz). Bu sayfayı üç yolla paylaşırsınız: NFC kartınızı karşınızdakinin telefonuna yaklaştırarak, kartın üzerindeki QR kodu okutarak ya da linki mesajla göndererek.',
          'Profilinizde iletişim butonları (ara, e-posta, WhatsApp), sosyal medya hesaplarınız, hizmetleriniz, projeleriniz, referanslarınız ve "Rehbere Kaydet" butonu yer alır. Ziyaretçi tek dokunuşla tüm bilgilerinizi telefon rehberine ekler.',
        ],
      },
      {
        h: 'Kağıt kartvizite göre avantajları',
        p: [
          'Her zaman güncel: Bilgi değişince kart çöpe gitmez. Sınırsız içerik: Kağıda sığmayan portfolyo, video, sosyal medya ve müşteri yorumları tek sayfada. Ölçülebilir: Kartınıza kaç kişinin baktığını, hangi butonlara tıkladığını istatistiklerden izlersiniz. Çevre dostu: Basım ve kağıt israfı yok. Etkileyici: Toplantıda telefona dokundurarak bilgi paylaşmak güçlü bir ilk izlenim bırakır.',
        ],
      },
      {
        h: 'Kimler kullanmalı?',
        p: [
          'Satış ve pazarlama profesyonelleri, emlak ve sigorta danışmanları, avukatlar, doktorlar, serbest çalışanlar (freelancer), ajanslar ve sahada müşteriyle buluşan tüm ekipler için dijital kartvizit artık standart hale geliyor. Kurumsal ekiplerde tüm çalışanlara aynı markada kart tanımlanabilir.',
          'Q-Kart ile NFC\'li dijital kartvizitinizi dakikalar içinde oluşturabilir, dilerseniz fiziksel NFC kartınızı da sipariş edebilirsiniz.',
        ],
      },
    ],
  },
  {
    slug: 'nfc-kartvizit-nasil-calisir',
    title: 'NFC Kartvizit Nasıl Çalışır? Hangi Telefonlar Destekler?',
    description: 'NFC kartvizit teknolojisi nasıl çalışır, hangi iPhone ve Android modelleri destekler, QR kod yedeği nedir? Temassız kartvizit hakkında merak edilenler.',
    date: '2026-06-12',
    readMin: 4,
    sections: [
      {
        h: 'NFC teknolojisi nedir?',
        p: [
          'NFC (Near Field Communication — Yakın Alan İletişimi), iki cihazın birkaç santimetre mesafede kablosuz veri alışverişi yapmasını sağlayan teknolojidir. Temassız ödemede kullandığınız teknolojinin aynısıdır. NFC kartvizitin içinde küçük bir çip bulunur; bu çip, profilinizin web adresini taşır.',
        ],
      },
      {
        h: 'Kart telefona dokununca ne olur?',
        p: [
          'Kartınızı karşınızdaki telefonun üst kısmına yaklaştırdığınızda telefon bir bildirim gösterir; bildirime dokunan kişi doğrudan dijital profilinize ulaşır. Uygulama kurulumu, Bluetooth eşleşmesi ya da internet paylaşımı gerekmez — yalnızca telefonun internete bağlı olması yeterlidir.',
        ],
      },
      {
        h: 'Hangi telefonlar destekliyor?',
        p: [
          'iPhone tarafında XS ve sonrası tüm modeller (XS, 11, 12, 13, 14, 15, 16...) kartı ekranı açıkken otomatik algılar. Android tarafında son 5-6 yılın neredeyse tüm modellerinde NFC bulunur; ayarlardan NFC\'nin açık olması yeterlidir.',
          'NFC olmayan ya da kapalı telefonlar için kartın üzerindeki QR kod devreye girer: kamera ile okutulduğunda aynı profile ulaşılır. Yani NFC kartvizit, kameralı her telefonla çalışır.',
        ],
      },
      {
        h: 'Güvenli mi?',
        p: [
          'NFC kart yalnızca bir web adresi taşır; telefondan veri çekemez, uygulama yükleyemez. Profilinizde nelerin görüneceğine tamamen siz karar verirsiniz. Q-Kart\'ta ziyaretçi istatistiklerinde IP adresleri KVKK uyumlu şekilde anonimleştirilir.',
        ],
      },
    ],
  },
  {
    slug: 'qr-kodlu-kartvizit-avantajlari',
    title: 'QR Kodlu Kartvizit: 7 Avantajı ve Kullanım İpuçları',
    description: 'QR kodlu kartvizit neden tercih edilmeli? Maliyet, güncellenebilirlik, istatistik ve profesyonel imaj dahil 7 avantaj + etkili kullanım ipuçları.',
    date: '2026-06-12',
    readMin: 4,
    sections: [
      {
        h: 'QR kodlu kartvizit nedir?',
        p: [
          'QR kodlu kartvizit, telefon kamerasıyla okutulduğunda dijital profilinizi açan kare koddur. Fiziksel kartın üzerine basılabileceği gibi; e-posta imzanıza, sunumlarınıza, vitrin camınıza, hatta telefon ekranınıza da koyabilirsiniz.',
        ],
      },
      {
        h: '7 büyük avantaj',
        p: [
          '1) Her telefonda çalışır — NFC gerekmez, kamera yeter. 2) Bilgileriniz her zaman güncel kalır. 3) Uzaktan da paylaşılır: ekrandaki QR\'ı video görüşmede bile okutabilirsiniz. 4) Kaç kişinin okuttuğunu istatistiklerden görürsünüz. 5) Sınırsız içerik: sosyal medya, portfolyo, randevu linki. 6) Baskı maliyeti düşer: kart eskimez, bilgi değişse de QR aynı kalır. 7) Profesyonel ve modern bir imaj çizer.',
        ],
      },
      {
        h: 'Etkili kullanım ipuçları',
        p: [
          'QR kodu kartın arka yüzüne büyük ve yüksek kontrastla bastırın; kenarında "Beni okut" gibi kısa bir yönlendirme bulunsun. E-posta imzanıza ve LinkedIn özetinize profil linkinizi ekleyin. Fuara giderken telefonunuzun kilit ekranına QR\'ınızı koyun — kartınız bitse bile paylaşım durmaz.',
          'Q-Kart\'ta her profil otomatik QR kod ile gelir; rengi markanıza göre özelleştirebilir, PNG/SVG olarak indirebilirsiniz.',
        ],
      },
    ],
  },
  {
    slug: 'networking-icin-dijital-kartvizit',
    title: 'Networking\'de Fark Yaratın: Dijital Kartvizit ile Bağlantı Kurma Sanatı',
    description: 'Fuarlarda, toplantılarda ve etkinliklerde dijital kartvizitle nasıl güçlü bağlantılar kurulur? Takip, istatistik ve ilk izlenim stratejileri.',
    date: '2026-06-12',
    readMin: 5,
    sections: [
      {
        h: 'İlk izlenim 7 saniyede kurulur',
        p: [
          'Araştırmalar ilk izlenimin saniyeler içinde oluştuğunu gösteriyor. Cüzdandan buruşuk bir kart çıkarmak yerine, kartınızı karşınızdakinin telefonuna dokundurup profilinizin anında ekranda belirmesi unutulmaz bir an yaratır — daha konuşma başlamadan teknolojiye hâkim, modern bir profesyonel izlenimi verirsiniz.',
        ],
      },
      {
        h: 'Kartvizitlerin %88\'i çöpe gidiyor',
        p: [
          'Kağıt kartvizitlerin büyük çoğunluğu bir hafta içinde kayboluyor ya da çöpe gidiyor. Dijital kartvizitte ise bilgileriniz karşınızdakinin telefon rehberine kaydedilir — kaybolması imkânsızdır. Üstelik profilinize sonradan tekrar bakabilir, sosyal medyanızdan sizi takip etmeye başlayabilir.',
        ],
      },
      {
        h: 'Takip (follow-up) kolaylaşır',
        p: [
          'Q-Kart\'taki "Bana Yaz" formu sayesinde ziyaretçiler profilinizden size doğrudan mesaj bırakır; bu mesajlar panelinizde lead olarak birikir. Kiminle ne zaman tanıştığınızı unutmazsınız. İstatistik ekranında hangi etkinlik gününde kaç görüntülenme aldığınızı görerek networking yatırımınızın karşılığını ölçersiniz.',
        ],
      },
      {
        h: 'Etkinlik öncesi kontrol listesi',
        p: [
          'Profil fotoğrafınız ve ünvanınız güncel mi? Öne çıkan projeleriniz ekli mi? Randevu (takvim) linkiniz aktif mi? WhatsApp butonunuz çalışıyor mu? Telefonunuzun NFC\'si açık mı? Bu beş maddelik kontrol, etkinlikten maksimum verim almanızı sağlar.',
        ],
      },
    ],
  },
]

export function getPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug)
}
