// Sosyal mod "vibe" presetleri — apps/web ve apps/public-site BİREBİR aynı tutulmalı.
// Her vibe arka plan + accent + yüzey/metin renkleri + font + animasyon defaultu taşır.

export type BgAnimated = 'none' | 'aurora' | 'flow' | 'particles'

export interface SocialVibe {
  id: string
  label: string
  dark: boolean
  gradient: [string, string]
  angle: number
  animated: BgAnimated
  accent: string
  text: string
  muted: string
  /** cam yüzey taban rengi (rgba ile saydamlaştırılır) */
  surfaceBase: string
  font: string
}

export const SOCIAL_VIBES: SocialVibe[] = [
  { id: 'neon',     label: 'Neon',      dark: true,  gradient: ['#1a0938', '#2d0b5a'], angle: 160, animated: 'aurora',
    accent: '#e635ff', text: '#f6ecff', muted: '#b9a6d6', surfaceBase: '#ffffff', font: 'Space Grotesk' },
  { id: 'darkglow', label: 'Dark Glow', dark: true,  gradient: ['#0a0a12', '#15131f'], angle: 165, animated: 'aurora',
    accent: '#8b5cf6', text: '#ededf5', muted: '#9aa0b5', surfaceBase: '#ffffff', font: 'Manrope' },
  { id: 'vapor',    label: 'Vaporwave', dark: true,  gradient: ['#ff6ec4', '#7873f5'], angle: 145, animated: 'flow',
    accent: '#00f5d4', text: '#ffffff', muted: '#f0e6ff', surfaceBase: '#ffffff', font: 'Space Grotesk' },
  { id: 'sunset',   label: 'Gün Batımı', dark: true, gradient: ['#ff8a56', '#ff5e62'], angle: 150, animated: 'flow',
    accent: '#ffd166', text: '#ffffff', muted: '#ffe3d4', surfaceBase: '#ffffff', font: 'Poppins' },
  { id: 'ocean',    label: 'Okyanus',   dark: true,  gradient: ['#1a7fa8', '#5ad1e6'], angle: 155, animated: 'flow',
    accent: '#bff6ff', text: '#ffffff', muted: '#d6f5ff', surfaceBase: '#ffffff', font: 'Manrope' },
  { id: 'pastel',   label: 'Pastel',    dark: false, gradient: ['#ffe4f0', '#e0f2ff'], angle: 160, animated: 'none',
    accent: '#f472b6', text: '#4a3a52', muted: '#9a8aa0', surfaceBase: '#ffffff', font: 'Poppins' },
  { id: 'nature',   label: 'Doğa',      dark: false, gradient: ['#dcfce7', '#bbf7d0'], angle: 160, animated: 'none',
    accent: '#16a34a', text: '#143a24', muted: '#5a7a64', surfaceBase: '#ffffff', font: 'Manrope' },
  { id: 'mono',     label: 'Mono',      dark: false, gradient: ['#fafafa', '#e7e7ea'], angle: 160, animated: 'none',
    accent: '#111114', text: '#18181b', muted: '#6b7280', surfaceBase: '#ffffff', font: 'Space Grotesk' },
]

export function getVibe(id: string | null | undefined): SocialVibe {
  return SOCIAL_VIBES.find(v => v.id === id) || SOCIAL_VIBES[0]
}
