import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: { default: 'Q-Kart', template: '%s | Q-Kart' },
  description: 'QR kod ve NFC teknolojisiyle dijital kartvizitinizi oluşturun, paylaşın ve yönetin.',
  openGraph: {
    title: 'Q-Kart — Dijital Kartvizit Platformu',
    description: 'QR kod ve NFC teknolojisiyle dijital kartvizitinizi oluşturun.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&family=Roboto:wght@400;500;700&family=Poppins:wght@400;500;600;700;800&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
