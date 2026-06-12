import { prisma } from '@dkp/database'

/**
 * Expo Push API üzerinden bildirim gönderir (SDK'sız, doğrudan HTTP).
 * Geçersiz/iptal edilmiş token'lar (DeviceNotRegistered) otomatik silinir.
 * Hatalar yutulur — push, ana akışı asla bloklamamalı.
 */
export async function sendPushToUser(
  userId: string,
  title: string,
  body: string,
  data?: Record<string, unknown>
): Promise<void> {
  try {
    const tokens = await prisma.pushToken.findMany({ where: { userId } })
    if (tokens.length === 0) return

    const messages = tokens.map(t => ({
      to: t.token,
      title,
      body,
      sound: 'default' as const,
      data: data || {},
    }))

    const res = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify(messages),
    })
    if (!res.ok) return

    // Geçersiz token'ları temizle
    const json: any = await res.json().catch(() => null)
    const tickets: any[] = json?.data || []
    const dead: string[] = []
    tickets.forEach((ticket, i) => {
      if (ticket?.status === 'error' && ticket?.details?.error === 'DeviceNotRegistered') {
        dead.push(messages[i].to)
      }
    })
    if (dead.length > 0) {
      await prisma.pushToken.deleteMany({ where: { token: { in: dead } } })
    }
  } catch (err) {
    console.error('[Push] Gönderim hatası:', err)
  }
}
