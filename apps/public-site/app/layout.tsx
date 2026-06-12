import type { Metadata, Viewport } from 'next'
import './globals.css'
import './q-kart.css'
import './social.css'
import './signature.css'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'http://localhost:3002'),
  title: {
    default: 'Q-Kart — NFC Dijital Kartvizit | Tek dokunuşla, tüm dünyan',
    template: '%s | Q-Kart',
  },
  description: 'Q-Kart, NFC\'li akıllı dijital kartvizit. Kartvizitin, sosyal medyan, CV\'n ve ekibin tek dokunuşla karşındakinde. QR kodlu dijital kimlik kartını dakikalar içinde oluştur.',
  keywords: [
    'dijital kartvizit', 'NFC kartvizit', 'QR kartvizit', 'akıllı kartvizit',
    'dijital kimlik kartı', 'NFC kart', 'sanal kartvizit', 'online kartvizit',
    'temassız kartvizit', 'qansvizit', 'Q-Kart',
  ],
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  openGraph: {
    title: 'Q-Kart — NFC Dijital Kartvizit | Tek dokunuşla, tüm dünyan',
    description: 'NFC\'li akıllı dijital kartvizit. Tek dokunuşla bağlan, QR ile paylaş.',
    type: 'website',
    url: '/',
    siteName: 'Q-Kart',
    locale: 'tr_TR',
    images: '/assets/og-image.jpg',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Q-Kart — NFC Dijital Kartvizit',
    description: 'NFC\'li akıllı dijital kartvizit. Tek dokunuşla bağlan, QR ile paylaş.',
    images: ['/assets/og-image.jpg'],
  },
}

export const viewport: Viewport = {
  themeColor: '#0f0c07',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" data-theme="onyx">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Space+Mono:wght@400;700&family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Poppins:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
