import { ImageResponse } from 'next/og'
import { fetchProfile } from '@/lib/api'

export const runtime = 'nodejs'
export const alt = 'Q·Kart dijital profil'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const HEX6 = /^#[0-9a-fA-F]{6}$/

export default async function OgImage({ params }: { params: { slug: string } }) {
  const profile = await fetchProfile(params.slug).catch(() => null)

  const name = profile?.displayName || params.slug
  const title = profile?.title || ''
  const accent = profile?.accentColor && HEX6.test(profile.accentColor) ? profile.accentColor : '#d9a93f'
  const isSocial = profile?.profileMode === 'SOCIAL'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end', padding: 72,
          background: 'linear-gradient(160deg, #0d0b08 0%, #16120a 100%)',
          fontFamily: 'sans-serif', position: 'relative',
        }}
      >
        <div style={{ position: 'absolute', top: -180, right: -120, width: 560, height: 560, borderRadius: 9999, background: accent, opacity: 0.18, display: 'flex' }} />
        <div style={{ position: 'absolute', top: 64, left: 72, display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 22, height: 22, borderRadius: 6, background: accent, display: 'flex' }} />
          <div style={{ fontSize: 30, color: '#a99e8c', letterSpacing: 4, display: 'flex' }}>Q·KART {isSocial ? '· SOSYAL' : ''}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 96, fontWeight: 700, color: '#f4efe6', lineHeight: 1.02, letterSpacing: -3, display: 'flex', textTransform: 'uppercase' }}>{name}</div>
          {title ? <div style={{ fontSize: 38, color: accent, marginTop: 18, display: 'flex' }}>{title}</div> : null}
          <div style={{ fontSize: 28, color: '#6f6557', marginTop: 28, display: 'flex' }}>qkart · /u/{params.slug}</div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 10, background: accent, display: 'flex' }} />
      </div>
    ),
    size,
  )
}
