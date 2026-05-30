'use client'
import SectionHead from './SectionHead'

const STEPS = [
  {
    title: 'Tasarla',
    desc: 'Profilini dakikalar içinde oluştur. Logonu, renklerini, sosyal hesaplarını ve CV\'ni ekle — her şey senin kontrolünde.',
    icon: <path d="M12 19l7-7a2.8 2.8 0 00-4-4l-7 7-1 5 5-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>, path2: <path d="M14 6l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>,
  },
  {
    title: 'Dokun',
    desc: 'Q-Kart\'ı herhangi bir telefona yaklaştır. NFC teknolojisiyle profilin anında, tek bir dokunuşta açılır.',
    icon: <path d="M8 13a4 4 0 008 0M12 17v0M6 9a8 8 0 0112 0M3.5 6.5a12 12 0 0117 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>,
  },
  {
    title: 'Bağlan',
    desc: 'Karşındaki tüm bilgilerine saniyeler içinde ulaşır, kaydeder. Sen bilgini güncelle — kart hep güncel kalsın.',
    icon: <><circle cx="7" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.8"/><circle cx="17" cy="6" r="2.6" stroke="currentColor" strokeWidth="1.8"/><circle cx="17" cy="18" r="2.6" stroke="currentColor" strokeWidth="1.8"/><path d="M9.3 10.8l5.4-3.2M9.3 13.2l5.4 3.2" stroke="currentColor" strokeWidth="1.8"/></>,
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
        <div className="steps">
          {STEPS.map((step, i) => (
            <div className="step" key={step.title}>
              <div className="step-ico">
                <svg viewBox="0 0 24 24" fill="none">{step.icon}{step.path2}</svg>
              </div>
              <h3>{step.title}</h3>
              <p>{step.desc}</p>
              {i < 2 && <span className="step-line"/>}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
