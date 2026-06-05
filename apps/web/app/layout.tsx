import type { Metadata } from 'next'
import { Inter, Space_Grotesk, Manrope } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' })

export const metadata: Metadata = {
  title: 'Q-Kart',
  description: 'QR ve NFC ile paylaşılan dijital kartvizit platformu',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Tasarım editörü önizlemesinde seçilebilen tüm yazı tipleri */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;700&family=Poppins:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=Merriweather:wght@400;700&family=Playfair+Display:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.className} ${spaceGrotesk.variable} ${manrope.variable}`}>{children}</body>
    </html>
  )
}
