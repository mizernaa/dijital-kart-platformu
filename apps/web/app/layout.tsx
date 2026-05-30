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
      <body className={`${inter.className} ${spaceGrotesk.variable} ${manrope.variable}`}>{children}</body>
    </html>
  )
}
