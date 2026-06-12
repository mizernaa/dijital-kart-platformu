import type { Metadata } from 'next'
import Link from 'next/link'
import { BLOG_POSTS } from '@/lib/blogPosts'

export const metadata: Metadata = {
  title: 'Blog — Dijital Kartvizit Rehberi',
  description: 'Dijital kartvizit, NFC kartvizit ve QR kodlu kartvizit hakkında rehberler, ipuçları ve networking stratejileri.',
  alternates: { canonical: '/blog' },
}

export default function BlogIndex() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '60px 24px 80px', fontFamily: "'Manrope', system-ui, sans-serif" }}>
      <Link href="/" style={{ fontSize: 13, color: '#b08d3f', textDecoration: 'none', fontWeight: 700 }}>← Q-Kart Ana Sayfa</Link>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 38, margin: '20px 0 8px' }}>Blog</h1>
      <p style={{ color: '#777', fontSize: 15, marginBottom: 40 }}>
        Dijital kartvizit, NFC ve networking dünyasından rehberler.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {BLOG_POSTS.map(p => (
          <Link key={p.slug} href={`/blog/${p.slug}`}
                style={{ display: 'block', padding: '24px 26px', border: '1px solid #e6e0d2', borderRadius: 16, textDecoration: 'none', color: 'inherit', background: '#fff' }}>
            <div style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
              {new Date(p.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} · {p.readMin} dk okuma
            </div>
            <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 21, margin: '0 0 8px', color: '#1c1810' }}>{p.title}</h2>
            <p style={{ color: '#666', fontSize: 14.5, lineHeight: 1.65, margin: 0 }}>{p.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
