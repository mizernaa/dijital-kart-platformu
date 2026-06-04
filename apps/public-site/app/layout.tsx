import type { Metadata, Viewport } from 'next'
import './globals.css'
import './q-kart.css'

export const metadata: Metadata = {
  title: { default: 'Q-Kart — Tek dokunuşla, tüm dünyan', template: '%s | Q-Kart' },
  description: 'Q-Kart, NFC\'li akıllı dijital kimlik kartı. Kartvizitin, sosyal medyan, CV\'n ve ekibin tek dokunuşla karşındakinde.',
  openGraph: {
    title: 'Q-Kart — Tek dokunuşla, tüm dünyan',
    description: 'NFC\'li akıllı dijital kimlik kartı. Tek dokunuşla bağlan.',
    type: 'website',
    siteName: 'Q-Kart',
    locale: 'tr_TR',
    images: '/assets/og-image.jpg',
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
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Poppins:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
