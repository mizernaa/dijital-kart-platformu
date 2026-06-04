import type { Resend } from 'resend'

let cachedResend: Resend | null = null

/** RESEND_API_KEY gerçek bir anahtarla ayarlanmış mı? */
export function isEmailEnabled(): boolean {
  return !!process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_placeholder'
}

async function getResend(): Promise<Resend | null> {
  if (!isEmailEnabled()) return null
  if (!cachedResend) {
    const { Resend } = await import('resend')
    cachedResend = new Resend(process.env.RESEND_API_KEY!)
  }
  return cachedResend
}

export interface SendEmailOptions {
  to: string | string[]
  subject: string
  html: string
}

/**
 * E-posta gönderir.
 * - RESEND_API_KEY ayarlı değilse sessizce no-op döner (false).
 * - Gönderim hatası fırlatmaz; loglar ve yutar — istek akışını bloklamaz.
 * @returns gönderim denendi ve başarılıysa true, atlandı/başarısızsa false
 */
export async function sendEmail(opts: SendEmailOptions): Promise<boolean> {
  try {
    const resend = await getResend()
    if (!resend) return false
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'noreply@dijitalkart.com',
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
    })
    return true
  } catch (err: any) {
    console.error('[email] Gönderim hatası:', err?.message || err)
    return false
  }
}
