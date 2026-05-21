import { ProfileDetail } from '@dkp/types'

export function generateVCard(profile: ProfileDetail): string {
  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${profile.displayName}`,
  ]

  if (profile.title) {
    lines.push(`TITLE:${profile.title}`)
  }

  if (profile.bio) {
    lines.push(`NOTE:${profile.bio}`)
  }

  for (const contact of profile.contacts) {
    if (contact.type === 'PHONE') {
      const label = contact.label || 'WORK'
      lines.push(`TEL;TYPE=${label.toUpperCase()}:${contact.value}`)
    } else if (contact.type === 'EMAIL') {
      lines.push(`EMAIL:${contact.value}`)
    } else if (contact.type === 'WEBSITE') {
      lines.push(`URL:${contact.value}`)
    }
  }

  const linkedin = profile.socials.find(s => s.platform === 'LINKEDIN')
  if (linkedin) {
    lines.push(`URL;TYPE=LINKEDIN:${linkedin.url}`)
  }

  lines.push('END:VCARD')
  return lines.join('\r\n')
}
