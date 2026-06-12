'use client'
import { useState } from 'react'
import SectionHead from './SectionHead'

export const FAQS = [
  { q: 'NFC kart nasıl çalışıyor?', a: 'Kartını karşındakinin telefonuna yaklaştırman yeterli — dijital profilin anında ekranında açılır. Uygulama indirmek gerekmez; NFC desteklemeyen telefonlar için kartın üzerindeki QR kod da aynı işi görür.' },
  { q: 'Hangi telefonlarla uyumlu?', a: 'Son 5-6 yılın tüm iPhone (XS ve üzeri) ve Android telefonlarıyla uyumlu. QR kod sayesinde kameralı her telefonda çalışır.' },
  { q: 'Bilgilerimi sonradan değiştirebilir miyim?', a: 'Evet, sınırsız. Panelden bilgini, tasarımını, hatta İş Kartı ↔ Sosyal modunu istediğin an değiştirirsin — kartı yeniden bastırmana asla gerek kalmaz.' },
  { q: 'Kargo ne kadar sürer?', a: 'Siparişler 1-3 iş günü içinde üretilir ve Türkiye\'nin her yerine ücretsiz kargoyla gönderilir. Kargo takip numaranı panelden izleyebilirsin.' },
  { q: 'Aylık ücret ya da abonelik var mı?', a: 'Hayır. Kart ücreti tek seferliktir; dijital profilin ömür boyu ücretsizdir. İleri düzey özellikler için opsiyonel paketler mevcuttur.' },
  { q: 'İade edebilir miyim?', a: '30 gün koşulsuz iade garantisi var. Memnun kalmazsan ücretin tamamını iade ediyoruz.' },
  { q: 'Verilerim güvende mi?', a: 'Evet. Ziyaretçi istatistiklerinde IP adresleri KVKK uyumlu şekilde anonimleştirilir (geri döndürülemez hash). Hangi bilgilerin görüneceğine tamamen sen karar verirsin.' },
]

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="sec-pad" id="sss">
      <div className="wrap" style={{ maxWidth: 760 }}>
        <SectionHead eyebrow="Merak edilenler" title="Sıkça sorulan sorular" center />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          {FAQS.map((f, i) => {
            const isOpen = open === i
            return (
              <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 16, background: 'var(--bg-2)', overflow: 'hidden' }}>
                <button onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, padding: '17px 20px', background: 'none', border: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left' }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)' }}>{f.q}</span>
                  <span aria-hidden style={{ color: 'var(--accent)', fontSize: 20, fontWeight: 400, flexShrink: 0, transform: isOpen ? 'rotate(45deg)' : 'none', transition: 'transform .3s' }}>+</span>
                </button>
                <div style={{ maxHeight: isOpen ? 200 : 0, overflow: 'hidden', transition: 'max-height .4s cubic-bezier(.2,.7,.2,1)' }}>
                  <p style={{ margin: 0, padding: '0 20px 18px', fontSize: 14, lineHeight: 1.7, color: 'var(--muted)' }}>{f.a}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
