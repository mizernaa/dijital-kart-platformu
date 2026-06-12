import type { MetadataRoute } from 'next'

const SITE = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'https://qansvizit.com'
const API = process.env.API_URL || 'http://localhost:3001'

// Sitemap her istekte değil, saatte bir yeniden üretilir.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: SITE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
  ]

  try {
    const res = await fetch(`${API}/p/sitemap/slugs`, { next: { revalidate: 3600 } })
    if (res.ok) {
      const json = await res.json()
      const profiles: { slug: string; updatedAt: string }[] = json?.data || []
      for (const p of profiles) {
        entries.push({
          url: `${SITE}/u/${p.slug}`,
          lastModified: new Date(p.updatedAt),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }
    }
  } catch {
    // API erişilemezse sadece ana sayfayı döndür — sitemap yine geçerli kalır.
  }

  return entries
}
