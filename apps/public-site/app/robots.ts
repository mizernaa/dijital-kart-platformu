import type { MetadataRoute } from 'next'

const SITE = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'https://qansvizit.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${SITE}/sitemap.xml`,
  }
}
