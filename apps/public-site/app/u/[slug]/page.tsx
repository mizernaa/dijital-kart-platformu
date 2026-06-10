import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { fetchProfile } from '@/lib/api'
import { SocialView } from '@/components/SocialView'
import { SignatureView } from '@/components/SignatureView'

interface Props {
  params: { slug: string }
  searchParams: { source?: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const profile = await fetchProfile(params.slug)
  if (!profile) return { title: 'Profil Bulunamadı' }

  return {
    title: `${profile.displayName}${profile.title ? ` — ${profile.title}` : ''}`,
    description: profile.bio || `${profile.displayName} dijital kartviziti`,
    openGraph: {
      title: profile.displayName,
      description: profile.bio || '',
      type: 'profile',
      images: profile.avatarUrl ? [{ url: profile.avatarUrl }] : [],
    },
    twitter: {
      card: 'summary',
      title: profile.displayName,
      description: profile.bio || '',
    },
  }
}

export default async function ProfilePage({ params, searchParams }: Props) {
  const profile = await fetchProfile(params.slug)
  if (!profile) notFound()

  if (profile.profileMode === 'SOCIAL') {
    return <SocialView profile={profile} slug={params.slug} source={searchParams.source} />
  }

  return <SignatureView profile={profile} slug={params.slug} source={searchParams.source} />
}
