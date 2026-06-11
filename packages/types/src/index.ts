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
export type TeamRole = 'ADMIN' | 'EDITOR' | 'VIEWER'
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
export type OrderPlan = 'KLASIK' | 'METAL' | 'KURUMSAL'

export interface Order {
  id: string
  name: string
  phone: string
  email: string
  plan: OrderPlan
  note: string | null
  status: OrderStatus
  isRead: boolean
  createdAt: string
  updatedAt: string
}

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
  accentColor: string | null
  profileMode: string
  socialData: string | null
  tickerText: string | null
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
  // Genişletilmiş profil
  location: string | null
  tagline: string | null
  available: boolean
  calendarUrl: string | null
  stats: string | null        // JSON: [{value,label}]
  services: string | null     // JSON: [{icon,title,desc}]
  projects: string | null     // JSON: [{title,category,desc,tags,color}]
  testimonials: string | null // JSON: [{quote,name,role,company,initials}]
  experience: string | null   // JSON: [{year,role,company,desc}]
  education: string | null    // JSON: [{year,degree,school}]
  showStatsSection: boolean
  showServicesSection: boolean
  showProjectsSection: boolean
  showTestimonialsSection: boolean
  showCareerSection: boolean
  showContactForm: boolean
  showQrSection: boolean
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

// Team
export interface TeamMemberUser {
  id: string
  ownerId: string
  memberId: string
  role: TeamRole
  createdAt: string
  member: {
    username: string
    email: string
    profile: { displayName: string; avatarUrl: string | null } | null
  }
}

export interface TeamInvitation {
  id: string
  email: string
  token: string
  expiresAt: string
  createdAt: string
}

export interface InviteMemberRequest {
  email: string
  role: TeamRole
}

export interface TeamListResponse {
  members: TeamMemberUser[]
  invitations: TeamInvitation[]
  memberCount: number
  maxTeamMembers: number
}

// Custom Domain
export interface CustomDomainStatus {
  domain: string | null
  verified: boolean
  token: string | null
  cnameTarget: string
}
