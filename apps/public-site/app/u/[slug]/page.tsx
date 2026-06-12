import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchProfile } from '@/lib/api'
import { SocialView } from '@/components/SocialView'
import { SignatureView } from '@/components/SignatureView'

const SITE = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || 'https://qansvizit.com'
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

interface Props {
  params: { slug: string }
  searchParams: { source?: string }
}

function absImage(url: string | null): string | null {
  if (!url) return null
  return url.startsWith('http') ? url : `${API}${url}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await fetchProfile(params.slug)
  if (!profile) return { title: 'Profil Bulunamadı', robots: { index: false } }

  const title = `${profile.displayName}${profile.title ? ` — ${profile.title}` : ''}`
  const description = profile.bio
    || profile.tagline
    || `${profile.displayName} dijital kartviziti — iletişim bilgileri, sosyal medya ve daha fazlası. Q-Kart ile oluşturuldu.`
  const img = absImage(profile.avatarUrl)

  return {
    title,
    description,
    alternates: { canonical: `/u/${params.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: 'profile',
      url: `/u/${params.slug}`,
      siteName: 'Q-Kart',
      locale: 'tr_TR',
      images: img ? [{ url: img }] : [],
    },
    twitter: {
      card: img ? 'summary_large_image' : 'summary',
      title,
      description,
      images: img ? [img] : [],
    },
  }
}

/* Profil sahibi için schema.org Person yapılandırılmış verisi */
function personJsonLd(profile: any, slug: string) {
  const sameAs = (profile.socials || []).map((s: any) => (s.url.startsWith('http') ? s.url : `https://${s.url}`))
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.displayName,
    url: `${SITE}/u/${slug}`,
    ...(profile.title ? { jobTitle: profile.title } : {}),
    ...(profile.bio ? { description: profile.bio } : {}),
    ...(absImage(profile.avatarUrl) ? { image: absImage(profile.avatarUrl) } : {}),
    ...(profile.location ? { address: { '@type': 'PostalAddress', addressLocality: profile.location } } : {}),
    ...(profile.companyName ? { worksFor: { '@type': 'Organization', name: profile.companyName } } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  }
  return data
}

export default async function ProfilePage({ params, searchParams }: Props) {
  const profile = await fetchProfile(params.slug)
  if (!profile) notFound()

  const jsonLd = (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(profile, params.slug)) }}
    />
  )

  if (profile.profileMode === 'SOCIAL') {
    return <>{jsonLd}<SocialView profile={profile} slug={params.slug} source={searchParams.source} /></>
  }

  return <>{jsonLd}<SignatureView profile={profile} slug={params.slug} source={searchParams.source} /></>
}
