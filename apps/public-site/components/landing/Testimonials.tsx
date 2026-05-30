'use client'
import SectionHead from './SectionHead'

const QUOTES = [
  {
    stars: '★★★★★',
    text: 'Networking etkinliklerinde artık kartvizit taşımıyorum. Tek dokunuş, herkes etkileniyor. Q-Kart bir yatırım, masraf değil.',
    initials: 'SE',
    name: 'Selin Eren',
    role: 'Pazarlama Direktörü',
  },
  {
    stars: '★★★★★',
    text: '40 kişilik ekibimizin tüm kartlarını tek panelden yönetiyoruz. Yeni personel geldiğinde dakikalar içinde hazır. Mükemmel.',
    initials: 'MK',
    name: 'Murat Kaya',
    role: 'İK Müdürü · Nora Tech',
  },
  {
    stars: '★★★★★',
    text: 'CV\'mi karta yükledim, mülakatta telefona dokundurdum. Görüşmeci \'bunu ilk kez görüyorum\' dedi. İşi aldım.',
    initials: 'AY',
    name: 'Ayşe Yıldız',
    role: 'UX Tasarımcı',
  },
]

export default function Testimonials() {
  return (
    <section className="sec-pad" id="yorumlar">
      <div className="wrap">
        <SectionHead
          center
          eyebrow="Yorumlar"
          title="Binlerce profesyonelin tercihi"
        />
        <figure className="testi-feature">
          <img src="/assets/testi-network.jpg" alt="Lüks bir ortamda Q-Kart'ı telefona dokundurarak bağlantı kuran iki profesyonel" loading="lazy" />
          <div className="tf-inner">
            <div className="qstars">★★★★★</div>
            <blockquote>&quot;Bir lansman gecesinde tek dokunuşla 60&apos;tan fazla kişiyle bağlandım. Q-Kart, ilk izlenimi bir konuşma başlangıcına çeviriyor.&quot;</blockquote>
            <figcaption className="who">
              <span className="av">CB</span>
              <div><b>Can Berk Doğan</b><span>Kurucu Ortak · Meridyen Ventures</span></div>
            </figcaption>
          </div>
        </figure>
        <div className="quotes">
          {QUOTES.map((q) => (
            <figure className="quote" key={q.initials}>
              <div className="qstars">{q.stars}</div>
              <p>{q.text}</p>
              <figcaption className="who">
                <span className="av">{q.initials}</span>
                <div><b>{q.name}</b><span>{q.role}</span></div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
