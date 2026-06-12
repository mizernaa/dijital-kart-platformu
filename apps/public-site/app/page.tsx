'use client'
import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import LogoMarquee from '@/components/landing/LogoMarquee'
import HowItWorks from '@/components/landing/HowItWorks'
import VideoShowcase from '@/components/landing/VideoShowcase'
import Features from '@/components/landing/Features'
import TwoFaces from '@/components/landing/TwoFaces'
import Faq, { FAQS } from '@/components/landing/Faq'
import Persona from '@/components/landing/Persona'
import Pricing from '@/components/landing/Pricing'
import Testimonials from '@/components/landing/Testimonials'
import OrderForm from '@/components/landing/OrderForm'
import Footer from '@/components/landing/Footer'

const SITE = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'https://qansvizit.com'

// Google zengin sonuçları için yapılandırılmış veri (Organization + WebSite + Ürün + SSS)
const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE}/#org`,
      name: 'Q-Kart',
      alternateName: 'qansvizit',
      url: SITE,
      logo: `${SITE}/assets/og-image.jpg`,
      description: "NFC'li akıllı dijital kartvizit — tek dokunuşla kartvizitini, sosyal medyanı ve CV'ni paylaş.",
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#website`,
      url: SITE,
      name: 'Q-Kart',
      inLanguage: 'tr-TR',
      publisher: { '@id': `${SITE}/#org` },
    },
    {
      '@type': 'Product',
      name: 'Q-Kart NFC Dijital Kartvizit',
      description: 'NFC ve QR kodlu akıllı kartvizit kartı. Tek seferlik ücret, ömür boyu dijital profil, sınırsız güncelleme.',
      brand: { '@id': `${SITE}/#org` },
      image: `${SITE}/assets/og-image.jpg`,
    },
    {
      '@type': 'FAQPage',
      mainEntity: FAQS.map(f => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a },
      })),
    },
  ],
}

export default function LandingPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <Navbar />
      <main id="top">
        <Hero />
        <LogoMarquee />
        <HowItWorks />
        <VideoShowcase />
        <Features />
        <TwoFaces />
        <Persona />
        <Pricing />
        <Testimonials />
        <Faq />
        <OrderForm />
      </main>
      <Footer />
    </>
  )
}
