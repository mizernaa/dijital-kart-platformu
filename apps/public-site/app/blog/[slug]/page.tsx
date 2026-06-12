import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { BLOG_POSTS, getPost } from '@/lib/blogPosts'

const SITE = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'https://qansvizit.com'

export function generateStaticParams() {
  return BLOG_POSTS.map(p => ({ slug: p.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug)
  if (!post) return { title: 'Yazı Bulunamadı', robots: { index: false } }
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      locale: 'tr_TR',
    },
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug)
  if (!post) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    inLanguage: 'tr-TR',
    author: { '@type': 'Organization', name: 'Q-Kart', url: SITE },
    publisher: { '@type': 'Organization', name: 'Q-Kart', url: SITE },
    mainEntityOfPage: `${SITE}/blog/${post.slug}`,
  }

  return (
    <article style={{ maxWidth: 720, margin: '0 auto', padding: '60px 24px 80px', fontFamily: "'Manrope', system-ui, sans-serif", color: '#2a241a' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/blog" style={{ fontSize: 13, color: '#b08d3f', textDecoration: 'none', fontWeight: 700 }}>← Tüm Yazılar</Link>
      <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 34, lineHeight: 1.2, margin: '20px 0 10px' }}>{post.title}</h1>
      <div style={{ fontSize: 13, color: '#999', marginBottom: 36 }}>
        {new Date(post.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} · {post.readMin} dk okuma · Q-Kart
      </div>

      {post.sections.map((s, i) => (
        <section key={i} style={{ marginBottom: 30 }}>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, margin: '0 0 12px' }}>{s.h}</h2>
          {s.p.map((para, j) => (
            <p key={j} style={{ fontSize: 16, lineHeight: 1.8, color: '#4a4336', margin: '0 0 14px' }}>{para}</p>
          ))}
        </section>
      ))}

      <div style={{ marginTop: 44, padding: '26px 28px', background: '#faf6ec', border: '1px solid #eadfc4', borderRadius: 16 }}>
        <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 19, margin: '0 0 8px' }}>Dijital kartvizitini bugün oluştur</h3>
        <p style={{ fontSize: 14.5, color: '#666', margin: '0 0 16px', lineHeight: 1.6 }}>
          Q-Kart ile NFC ve QR kodlu dijital kartvizitin dakikalar içinde hazır. Tek seferlik ücret, ömür boyu profil.
        </p>
        <Link href="/" style={{ display: 'inline-block', background: '#b08d3f', color: '#fff', padding: '12px 24px', borderRadius: 999, textDecoration: 'none', fontWeight: 700, fontSize: 14 }}>
          Q-Kart'ı İncele →
        </Link>
      </div>
    </article>
  )
}
