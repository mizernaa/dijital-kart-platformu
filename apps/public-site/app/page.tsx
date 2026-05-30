'use client'
import Navbar from '@/components/landing/Navbar'
import Hero from '@/components/landing/Hero'
import LogoMarquee from '@/components/landing/LogoMarquee'
import HowItWorks from '@/components/landing/HowItWorks'
import VideoShowcase from '@/components/landing/VideoShowcase'
import Features from '@/components/landing/Features'
import Pricing from '@/components/landing/Pricing'
import Testimonials from '@/components/landing/Testimonials'
import OrderForm from '@/components/landing/OrderForm'
import Footer from '@/components/landing/Footer'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main id="top">
        <Hero />
        <LogoMarquee />
        <HowItWorks />
        <VideoShowcase />
        <Features />
        <Pricing />
        <Testimonials />
        <OrderForm />
      </main>
      <Footer />
    </>
  )
}
