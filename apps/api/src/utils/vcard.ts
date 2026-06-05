import { ProfileDetail } from '@dkp/types'

export function generateVCard(profile: ProfileDetail): string {
  // N (yapısal ad) alanı — telefonlar kişi adını buradan okur.
  // Eksik olduğunda bazı cihazlar ismi ORG (iş yeri) alanından türetir.
  const nameParts = (profile.displayName || '').trim().split(/\s+/).filter(Boolean)
  const given = nameParts[0] || ''
  const family = nameParts.slice(1).join(' ')

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${family};${given};;;`,
    `FN:${profile.displayName}`,
  ]

  if (profile.title) lines.push(`TITLE:${profile.title}`)
  if (profile.companyName) lines.push(`ORG:${profile.companyName}`)
  if (profile.location) lines.push(`ADR;TYPE=WORK:;;${profile.location};;;;`)

  const noteparts: string[] = []
  if (profile.tagline) noteparts.push(profile.tagline)
  if (profile.bio) noteparts.push(profile.bio)
  if (noteparts.length) lines.push(`NOTE:${noteparts.join(' | ')}`)

  for (const contact of profile.contacts) {
    if (contact.type === 'PHONE') {
      const label = contact.label || 'WORK'
      lines.push(`TEL;TYPE=${label.toUpperCase()}:${contact.value}`)
    } else if (contact.type === 'EMAIL') {
      lines.push(`EMAIL:${contact.value}`)
    } else if (contact.type === 'WEBSITE') {
      const url = contact.value.startsWith('http') ? contact.value : `https://${contact.value}`
      lines.push(`URL:${url}`)
    } else if (contact.type === 'WHATSAPP') {
      lines.push(`X-WHATSAPP:${contact.value}`)
    } else if (contact.type === 'TELEGRAM') {
      lines.push(`X-TELEGRAM:${contact.value}`)
    }
  }

  if (profile.calendarUrl) lines.push(`URL;TYPE=CALENDAR:${profile.calendarUrl}`)

  const linkedin = profile.socials.find(s => s.platform === 'LINKEDIN')
  const instagram = profile.socials.find(s => s.platform === 'INSTAGRAM')
  const twitter = profile.socials.find(s => s.platform === 'TWITTER')
  const github = profile.socials.find(s => s.platform === 'GITHUB')

  if (linkedin) lines.push(`URL;TYPE=LINKEDIN:${linkedin.url}`)
  if (instagram) lines.push(`URL;TYPE=INSTAGRAM:${instagram.url}`)
  if (twitter) lines.push(`URL;TYPE=TWITTER:${twitter.url}`)
  if (github) lines.push(`URL;TYPE=GITHUB:${github.url}`)

  if (profile.companyWebsite) {
    const url = profile.companyWebsite.startsWith('http') ? profile.companyWebsite : `https://${profile.companyWebsite}`
    lines.push(`URL;TYPE=COMPANY:${url}`)
  }

  if (profile.avatarUrl) {
    lines.push(`PHOTO;TYPE=JPEG;VALUE=URI:${profile.avatarUrl}`)
  }

  lines.push(`REV:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`)
  lines.push('END:VCARD')
  return lines.join('\r\n')
}
