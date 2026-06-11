// Sosyal mod veri tipleri + defaultlar + normalizasyon.
// apps/web ve apps/public-site BİREBİR aynı tutulmalı.
import { getVibe, BgAnimated } from './socialVibes'
import { rgba } from './themes'

export interface SocialLinkBlock { id: string; label: string; url: string; platform: string; thumbUrl?: string }
export interface GalleryItem { id: string; url: string; caption?: string }
export interface SocialPost { id: string; title: string; body: string; imageUrl?: string; date?: string }

export interface SocialBg {
  type: 'vibe' | 'gradient' | 'image' | 'animated'
  gradient: [string, string]
  angle: number
  image?: string
  animated: BgAnimated
}

export interface SocialShow {
  links: boolean; gallery: boolean; posts: boolean; music: boolean
  interests: boolean; socials: boolean; contactForm: boolean
  reaction: boolean
}

export interface SocialEffects { grain: boolean; glow: boolean; tilt: boolean }

export interface SocialData {
  handle: string
  status: string
  bio: string
  location: string
  cover: string
  interests: string[]
  links: SocialLinkBlock[]
  gallery: GalleryItem[]
  posts: SocialPost[]
  music: { type: 'spotify' | 'soundcloud' | ''; url: string }
  // Özelleştirme
  vibe: string
  accent: string | null        // null → vibe accent'i
  font: string | null          // null → vibe font'u
  bg: SocialBg
  linkStyle: 'filled' | 'glass' | 'outline'
  avatarStyle: 'CIRCLE' | 'SQUARE' | 'HEXAGON'
  effects: SocialEffects
  show: SocialShow
}

export const SOCIAL_FONTS = [
  'Space Grotesk', 'Poppins', 'Manrope', 'Inter', 'Playfair Display', 'Fraunces', 'Merriweather', 'Roboto',
]

export const LINK_STYLES = [
  { id: 'filled', label: 'Dolu' },
  { id: 'glass',  label: 'Cam' },
  { id: 'outline', label: 'Çerçeve' },
] as const

export function defaultSocialData(): SocialData {
  const v = getVibe('neon')
  return {
    handle: '', status: '', bio: '', location: '', cover: '',
    interests: [], links: [], gallery: [], posts: [],
    music: { type: '', url: '' },
    vibe: 'neon', accent: null, font: null,
    bg: { type: 'vibe', gradient: v.gradient, angle: v.angle, animated: v.animated },
    linkStyle: 'glass', avatarStyle: 'CIRCLE',
    effects: { grain: true, glow: true, tilt: true },
    show: { links: true, gallery: true, posts: true, music: true, interests: true, socials: true, contactForm: true, reaction: true },
  }
}

/** Ham JSON string → eksik alanları default'larla doldurulmuş SocialData */
export function parseSocialData(raw: string | null | undefined): SocialData {
  const d = defaultSocialData()
  if (!raw) return d
  let p: any
  try { p = JSON.parse(raw) } catch { return d }
  if (!p || typeof p !== 'object') return d
  return {
    ...d, ...p,
    music: { ...d.music, ...(p.music || {}) },
    bg: { ...d.bg, ...(p.bg || {}) },
    effects: { ...d.effects, ...(p.effects || {}) },
    show: { ...d.show, ...(p.show || {}) },
    interests: Array.isArray(p.interests) ? p.interests : [],
    links: Array.isArray(p.links) ? p.links : [],
    gallery: Array.isArray(p.gallery) ? p.gallery : [],
    posts: Array.isArray(p.posts) ? p.posts : [],
  }
}

const HEX6 = /^#[0-9a-fA-F]{6}$/

/** Etkin renk paleti (vibe + kullanıcı override'ları) */
export function resolveSocialStyle(data: SocialData) {
  const vibe = getVibe(data.vibe)
  const accent = data.accent && HEX6.test(data.accent) ? data.accent : vibe.accent
  const font = data.font || vibe.font
  const dark = vibe.dark
  const surface = rgba(vibe.surfaceBase, dark ? 0.07 : 0.55)
  const surfaceBorder = rgba(dark ? '#ffffff' : '#0f172a', dark ? 0.12 : 0.08)
  // Arka plan CSS'i
  const g0 = data.bg.gradient?.[0] || vibe.gradient[0]
  const g1 = data.bg.gradient?.[1] || vibe.gradient[1]
  let background = `linear-gradient(${data.bg.angle ?? vibe.angle}deg, ${g0}, ${g1})`
  if (data.bg.type === 'image' && data.bg.image) {
    background = `linear-gradient(${rgba('#000000', dark ? 0.35 : 0.15)}, ${rgba('#000000', dark ? 0.55 : 0.25)}), url(${data.bg.image}) center/cover no-repeat`
  }
  const animated: BgAnimated = data.bg.type === 'animated' ? (data.bg.animated || vibe.animated)
    : data.bg.type === 'vibe' ? vibe.animated : 'none'
  return { vibe, accent, font, dark, surface, surfaceBorder, background, animated, g0, g1 }
}
