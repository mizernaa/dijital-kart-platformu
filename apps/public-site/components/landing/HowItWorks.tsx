'use client'
import SectionHead from './SectionHead'

const STEPS = [
  {
    num: '1',
    title: 'Tasarla',
    desc: 'Profilini dakikalar içinde oluştur. Logonu, renklerini, sosyal hesaplarını ve CV\'ni ekle — her şey senin kontrolünde.',
  },
  {
    num: '2',
    title: 'Dokun',
    desc: 'Q-Kart\'ı herhangi bir telefona yaklaştır. NFC teknolojisiyle profilin anında, tek bir dokunuşta açılır.',
  },
  {
    num: '3',
    title: 'Bağlan',
    desc: 'Karşındaki tüm bilgilerine saniyeler içinde ulaşır, kaydeder. Sen bilgini güncelle — kart hep güncel kalsın.',
  },
]

export default function HowItWorks() {
  return (
    <section className="sec-pad" id="nasil">
      <div className="wrap">
        <SectionHead
          center
          eyebrow="Üç adımda"
          title={<>Saniyeler içinde<br/>bağlanın</>}
          sub="Uygulama indirmek yok, karşı tarafın bir şey yüklemesi gerekmiyor. Sadece dokun ve bağlan."
        />
        <div className="steps-layout">
          <div className="steps">
            {STEPS.map((step, i) => (
              <div className="step" key={step.title}>
                <span className="step-num">{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
                {i < 2 && <span className="step-line"/>}
              </div>
            ))}
          </div>

          <div className="phone-col">
            <div className="phone-wrap">
              <img src="/assets/phone-mockup.jpg" alt="Q-Kart NFC dokunuşu sonrası telefonda açılan dijital profil ekranı" loading="lazy" />
            </div>
            <div className="phone-badge">
              <svg viewBox="0 0 24 24" fill="none">
                <path d="M8 13a4 4 0 008 0M12 17v0M6 9a8 8 0 0112 0M3.5 6.5a12 12 0 0117 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <span>Karşı tarafta anında açılıyor</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
