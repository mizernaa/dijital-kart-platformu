// Ortak tema paleti — apps/web ve apps/public-site BİREBİR aynı tutulmalı.
// Public profil (ProfileView) ve dashboard önizleme (DesignPreview) bunu kullanır.

export interface ThemePalette {
  id: string
  label: string
  dark: boolean
  bg: string
  bg2: string
  bgElev: string
  line: string
  line2: string
  text: string
  muted: string
  faint: string
  accent: string
}

export const THEMES: ThemePalette[] = [
  // ── Koyu temalar ──
  { id: 'dark',     label: 'Onyx & Altın', dark: true,
    bg: '#0d0b08', bg2: '#131009', bgElev: '#1b1710',
    line: 'rgba(255,255,255,0.08)', line2: 'rgba(255,255,255,0.15)',
    text: '#f4efe6', muted: '#a99e8c', faint: '#6f6557', accent: '#d4a843' },
  { id: 'midnight', label: 'Gece Yarısı', dark: true,
    bg: '#0b0f1f', bg2: '#111733', bgElev: '#1a2142',
    line: 'rgba(255,255,255,0.08)', line2: 'rgba(255,255,255,0.15)',
    text: '#eef1ff', muted: '#9aa6d6', faint: '#6b78a8', accent: '#818cf8' },
  { id: 'slate',    label: 'Çelik', dark: true,
    bg: '#0e1116', bg2: '#141821', bgElev: '#1c212c',
    line: 'rgba(255,255,255,0.07)', line2: 'rgba(255,255,255,0.14)',
    text: '#e8edf5', muted: '#94a3b8', faint: '#64748b', accent: '#38bdf8' },
  { id: 'carbon',   label: 'Karbon', dark: true,
    bg: '#0c0c0d', bg2: '#161618', bgElev: '#1f1f22',
    line: 'rgba(255,255,255,0.08)', line2: 'rgba(255,255,255,0.15)',
    text: '#f4f4f5', muted: '#a1a1aa', faint: '#71717a', accent: '#f43f5e' },

  // ── Açık temalar ──
  { id: 'minimal',  label: 'Minimal', dark: false,
    bg: '#ffffff', bg2: '#f8fafc', bgElev: '#ffffff',
    line: 'rgba(15,23,42,0.08)', line2: 'rgba(15,23,42,0.14)',
    text: '#0f172a', muted: '#475569', faint: '#64748b', accent: '#3b82f6' },
  { id: 'ocean',    label: 'Okyanus', dark: false,
    bg: '#f0f6ff', bg2: '#e4eeff', bgElev: '#ffffff',
    line: 'rgba(30,58,138,0.10)', line2: 'rgba(30,58,138,0.18)',
    text: '#13294b', muted: '#3b5a87', faint: '#5a7bb0', accent: '#1d4ed8' },
  { id: 'forest',   label: 'Orman', dark: false,
    bg: '#f1faf3', bg2: '#e3f5e8', bgElev: '#ffffff',
    line: 'rgba(20,83,45,0.10)', line2: 'rgba(20,83,45,0.18)',
    text: '#14331f', muted: '#3a6b4d', faint: '#5a8a6c', accent: '#15803d' },
  { id: 'sunset',   label: 'Gün Batımı', dark: false,
    bg: '#fff7f0', bg2: '#ffece0', bgElev: '#ffffff',
    line: 'rgba(124,45,18,0.10)', line2: 'rgba(124,45,18,0.18)',
    text: '#5c2812', muted: '#9a4a26', faint: '#b5683f', accent: '#ea580c' },
  { id: 'purple',   label: 'Mor', dark: false,
    bg: '#faf5ff', bg2: '#f1e9fe', bgElev: '#ffffff',
    line: 'rgba(76,29,149,0.10)', line2: 'rgba(76,29,149,0.18)',
    text: '#3b1568', muted: '#6b3fa0', faint: '#8a5fc0', accent: '#7e22ce' },
  { id: 'rose',     label: 'Gül', dark: false,
    bg: '#fff5f7', bg2: '#ffe6eb', bgElev: '#ffffff',
    line: 'rgba(136,19,55,0.10)', line2: 'rgba(136,19,55,0.18)',
    text: '#6b1230', muted: '#a83a5b', faint: '#c25c7c', accent: '#e11d48' },
  { id: 'amber',    label: 'Kehribar', dark: false,
    bg: '#fffbf0', bg2: '#fef3da', bgElev: '#ffffff',
    line: 'rgba(120,53,15,0.10)', line2: 'rgba(120,53,15,0.18)',
    text: '#5c3a0f', muted: '#946424', faint: '#b5853f', accent: '#d97706' },
]

export function getPalette(themeId: string | null | undefined): ThemePalette {
  return THEMES.find(t => t.id === themeId) || THEMES[0]
}

export function hexToRgb(h: string): [number, number, number] {
  h = h.replace('#', '')
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export function rgba(h: string, a: number): string {
  if (!h.startsWith('#')) return h
  const [r, g, b] = hexToRgb(h)
  return `rgba(${r},${g},${b},${a})`
}

/** accent rengi üzerindeki yazı rengi (parlaksa koyu, koyuysa beyaz) */
export function accentInk(accent: string): string {
  const [r, g, b] = hexToRgb(accent)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  return lum > 0.62 ? '#1a1205' : '#ffffff'
}

const HEX6 = /^#[0-9a-fA-F]{6}$/

/** Geçerli bir özel accent verilmişse onu, yoksa temanın accent'ini döndür */
export function resolveAccent(pal: ThemePalette, accentColor?: string | null): string {
  return accentColor && HEX6.test(accentColor) ? accentColor : pal.accent
}
