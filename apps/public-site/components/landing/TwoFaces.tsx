'use client'
import { useState } from 'react'
import SectionHead from './SectionHead'

const FACES = {
  business: {
    tag: 'İŞ KARTI',
    title: 'Kurumsal imzan',
    desc: 'Sinematik bir dijital kartvizit: hizmetlerin, projelerin, referansların, vCard ve QR — hepsi tek linkte.',
    bullets: ['Tek dokunuşla rehbere kayıt', 'Projeler & referanslar vitrini', 'Randevu ve teklif kanalları'],
    demo: '/u/elifyildiz',
    demoName: 'Elif Yıldız — Mimar',
    accent: '#d9a93f',
  },
  social: {
    tag: 'SOSYAL',
    title: 'Senin sahnen',
    desc: 'Bento Sahne: poster kapak, linklerin, fotoğrafların, müziğin ve notların — kişiliğini yansıtan tek sayfa.',
    bullets: ['Vibe temaları & animasyonlu zemin', 'Linktree + galeri + mini blog', 'Spotify çalar & tepki sayacı'],
    demo: '/u/candeniz',
    demoName: 'Can Deniz — İçerik Üreticisi',
    accent: '#e635ff',
  },
} as const

export default function TwoFaces() {
  const [face, setFace] = useState<'business' | 'social'>('business')
  const f = FACES[face]

  return (
    <section className="sec-pad" id="iki-yuz">
      <div className="wrap">
        <SectionHead eyebrow="Tek kart, iki yüz" title="İster iş, ister sosyal — sen seç" />

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 36 }}>
          <div style={{ display: 'inline-flex', gap: 4, padding: 4, borderRadius: 999, border: '1px solid var(--line)', background: 'var(--bg-2)' }}>
            {(['business', 'social'] as const).map(k => (
              <button key={k} onClick={() => setFace(k)}
                style={{
                  padding: '10px 26px', borderRadius: 999, border: 0, cursor: 'pointer',
                  fontFamily: 'inherit', fontSize: 14, fontWeight: 700, transition: 'all .3s',
                  background: face === k ? FACES[k].accent : 'transparent',
                  color: face === k ? '#14100a' : 'var(--muted)',
                }}>
                {FACES[k].tag}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '.3em', color: f.accent, fontWeight: 700, marginBottom: 12 }}>{f.tag}</div>
            <h3 style={{ fontSize: 'clamp(26px,4vw,38px)', lineHeight: 1.1, marginBottom: 14 }}>{f.title}</h3>
            <p style={{ color: 'var(--muted)', fontSize: 15.5, lineHeight: 1.7, marginBottom: 18 }}>{f.desc}</p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {f.bullets.map(b => (
                <li key={b} style={{ display: 'flex', alignItems: 'center', gap: 9, fontSize: 14, color: 'var(--text)' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: f.accent, flexShrink: 0 }} />{b}
                </li>
              ))}
            </ul>
            <a href={f.demo} target="_blank" rel="noopener noreferrer" className="btn btn-primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              Canlı örneği gör — {f.demoName} →
            </a>
            <p style={{ fontSize: 12, color: 'var(--faint)', marginTop: 10 }}>Panelden tek tıkla mod değiştirebilirsin; aynı link, iki yüz.</p>
          </div>

          {/* Telefon temsili */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 230, borderRadius: 32, padding: 8, background: '#0b0b0c', border: '1px solid rgba(255,255,255,.1)', boxShadow: '0 30px 80px -20px rgba(0,0,0,.6)' }}>
              <div style={{ borderRadius: 24, overflow: 'hidden', height: 420, position: 'relative', background: face === 'business' ? '#0d0b08' : 'linear-gradient(165deg,#1a0938,#2d0b5a)', transition: 'background .5s' }}>
                {face === 'business' ? (
                  <div style={{ padding: '34px 18px', fontFamily: 'inherit' }}>
                    <div style={{ fontSize: 9, letterSpacing: '.4em', color: '#d9a93f', marginBottom: 14 }}>KURUCU MİMAR</div>
                    <div style={{ fontSize: 34, fontWeight: 700, lineHeight: .95, color: '#f4efe6', textTransform: 'uppercase', letterSpacing: '-.03em' }}>ELİF<br /><span style={{ WebkitTextStroke: '1px #d9a93f', color: 'transparent' }}>YILDIZ</span></div>
                    <div style={{ marginTop: 18, fontSize: 10.5, color: '#8f8474', lineHeight: 1.7 }}>Yıldız Mimarlık kurucusu.<br />Mekânları hikâyeye dönüştürür.</div>
                    <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, border: '1px solid rgba(217,169,63,.2)' }}>
                      {[['8+', 'YIL'], ['120+', 'PROJE'], ['45', 'MÜŞTERİ'], ['4.9', 'PUAN']].map(([v, k]) => (
                        <div key={k} style={{ padding: '12px 10px', background: '#0d0b08' }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: '#d9a93f' }}>{v}</div>
                          <div style={{ fontSize: 7.5, letterSpacing: '.25em', color: '#5c5346', marginTop: 3 }}>{k}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 20, padding: '11px 0', textAlign: 'center', borderRadius: 999, background: 'linear-gradient(180deg,#d9a93f,#9d6f1e)', color: '#14100a', fontSize: 11, fontWeight: 700 }}>Rehbere Kaydet</div>
                  </div>
                ) : (
                  <div style={{ fontFamily: 'inherit' }}>
                    <div style={{ height: 150, background: 'linear-gradient(160deg,#7a3df0aa,#2d0b5a)', position: 'relative' }}>
                      <span style={{ position: 'absolute', top: 10, left: 12, fontSize: 9, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,.35)', padding: '3px 9px', borderRadius: 999 }}>@candeniz</span>
                      <div style={{ position: 'absolute', bottom: 8, left: 12, fontSize: 27, fontWeight: 800, textTransform: 'uppercase', lineHeight: .9, color: '#fff', letterSpacing: '-.03em' }}>CAN<br /><span style={{ color: '#22d3ee' }}>DENİZ</span></div>
                    </div>
                    <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7 }}>
                      <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 8, padding: 10, borderRadius: 12, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)' }}>
                        <span style={{ width: 26, height: 26, borderRadius: 8, background: '#22d3ee', flexShrink: 0 }} />
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: '#efe8fb' }}>YouTube Kanalım</span>
                        <span style={{ marginLeft: 'auto', color: '#22d3ee', fontWeight: 700 }}>→</span>
                      </div>
                      <div style={{ padding: 10, borderRadius: 12, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', minHeight: 70 }}>
                        <div style={{ fontSize: 8.5, color: '#36e2a0', fontWeight: 700 }}>▶ şu an çalıyor</div>
                        <div style={{ fontSize: 10, color: '#efe8fb', fontWeight: 600, marginTop: 5 }}>gece modu</div>
                        <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 12, marginTop: 7 }}>
                          {[5, 10, 7, 12, 4].map((h, i) => <span key={i} style={{ width: 3, height: h, background: '#36e2a0', borderRadius: 2 }} />)}
                        </div>
                      </div>
                      <div style={{ padding: 10, borderRadius: 12, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                        <span style={{ fontSize: 16 }}>🔥</span>
                        <span style={{ fontSize: 12, fontWeight: 800, color: '#efe8fb' }}>248</span>
                        <span style={{ fontSize: 8, color: '#8d7fae' }}>tepki</span>
                      </div>
                      <div style={{ gridColumn: 'span 2', padding: 10, borderRadius: 12, background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)' }}>
                        <div style={{ fontSize: 8.5, color: '#8d7fae' }}>notlar · 03.06</div>
                        <div style={{ fontSize: 10, color: '#e6def6', marginTop: 3 }}>Stüdyo günlüğü #12 — analog kayıt ✨</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
