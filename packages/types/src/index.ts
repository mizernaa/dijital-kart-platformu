// Enums
export type UserRole = 'SUPER_ADMIN' | 'SUPPORT' | 'CUSTOMER'
export type UserStatus = 'ACTIVE' | 'PASSIVE' | 'SUSPENDED' | 'TRIAL'
export type PackageName = 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE'
export type ContactType = 'PHONE' | 'EMAIL' | 'WHATSAPP' | 'TELEGRAM' | 'WEBSITE' | 'CUSTOM'
export type SocialPlatform =
  | 'INSTAGRAM'
  | 'LINKEDIN'
  | 'TWITTER'
  | 'YOUTUBE'
  | 'TIKTOK'
  | 'FACEBOOK'
  | 'GITHUB'
  | 'BEHANCE'
  | 'DRIBBBLE'
  | 'SPOTIFY'
  | 'SOUNDCLOUD'
  | 'CUSTOM'
export type QRFormat = 'PNG' | 'SVG' | 'PDF'
export type EventType =
  | 'PAGE_VIEW'
  | 'BUTTON_CLICK'
  | 'QR_SCAN'
  | 'NFC_SCAN'
  | 'VCARD_DOWNLOAD'
  | 'CONTACT_FORM'
export type ButtonStyle = 'ROUNDED' | 'SQUARE' | 'PILL'
export type ProfileShape = 'CIRCLE' | 'SQUARE' | 'HEXAGON'

// API Response wrapper
export interface ApiResponse<T = undefined> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string>
}

// Auth
export interface LoginRequest {
  username: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface JwtPayload {
  userId: string
  role: UserRole
  iat?: number
  exp?: number
}

// User / Admin
export interface UserSummary {
  id: string
  username: string
  email: string
  role: UserRole
  status: UserStatus
  packageName: PackageName
  createdAt: string
  lastLoginAt: string | null
}

export interface UserDetail extends UserSummary {
  phone: string | null
  company: string | null
  notes: string | null
  passwordChanged: boolean
  profile: ProfileSummary | null
}

export interface CreateUserRequest {
  username: string
  email: string
  phone?: string
  company?: string
  notes?: string
  packageId: string
  status?: UserStatus
}

// Package
export interface Package {
  id: string
  name: PackageName
  displayName: string
  maxPages: number
  analyticsRetentionDays: number
  hasCustomDomain: boolean
  hasNfc: boolean
  maxThemes: number
  maxTeamMembers: number
}

// Profile
export interface ProfileSummary {
  id: string
  slug: string
  displayName: string
  isPublished: boolean
}

export interface ProfileDetail {
  id: string
  slug: string
  displayName: string
  title: string | null
  bio: string | null
  avatarUrl: string | null
  theme: string
  bgColor: string
  fontFamily: string
  buttonStyle: ButtonStyle
  profileShape: ProfileShape
  isPublished: boolean
  companyName: string | null
  companyLogoUrl: string | null
  companyDescription: string | null
  companyWebsite: string | null
  companyIndustry: string | null
  showCompanySection: boolean
  cvSkills: string | null
  cvLanguages: string | null
  showCvSection: boolean
  contacts: ContactItem[]
  socials: SocialLink[]
}

export interface ContactItem {
  id: string
  type: ContactType
  value: string
  label: string | null
  order: number
}

export interface SocialLink {
  id: string
  platform: SocialPlatform
  url: string
  order: number
}

export interface UpdateProfileRequest {
  displayName?: string
  title?: string
  bio?: string
  theme?: string
  bgColor?: string
  fontFamily?: string
  buttonStyle?: ButtonStyle
  profileShape?: ProfileShape
  isPublished?: boolean
}

// QR Code
export interface QRCodeConfig {
  foregroundColor: string
  backgroundColor: string
  logoUrl?: string
  format: QRFormat
  size?: number
}

// Analytics
export interface AnalyticsSummary {
  totalViews: number
  uniqueVisitors: number
  vcardDownloads: number
  topSource: string | null
  sourceCounts: Record<string, number>
  dailyViews: DailyCount[]
  topButtons: ButtonCount[]
}

export interface DailyCount {
  date: string
  count: number
}

export interface ButtonCount {
  label: string
  count: number
}

export interface TrackEventRequest {
  eventType: EventType
  source?: string
  buttonLabel?: string
}
