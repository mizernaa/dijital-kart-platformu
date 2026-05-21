import cron from 'node-cron'
import { prisma } from '@dkp/database'
import { Resend } from 'resend'

export function scheduleWeeklyReport() {
  cron.schedule('0 9 * * 1', async () => {
    console.log('[WeeklyReport] Haftalık rapor gönderimi başladı...')

    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === 're_placeholder') {
      console.log('[WeeklyReport] RESEND_API_KEY ayarlı değil, atlandı.')
      return
    }

    const resend = new Resend(process.env.RESEND_API_KEY)
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000'

    const customers = await prisma.user.findMany({
      where: { status: 'ACTIVE', role: 'CUSTOMER' },
      include: { profile: true },
    })

    let sentCount = 0
    for (const customer of customers) {
      if (!customer.profile) continue

      try {
        const [totalViews, uniqueResult, unreadLeads, topButtons] = await Promise.all([
          prisma.analyticsEvent.count({
            where: { profileId: customer.profile.id, eventType: 'PAGE_VIEW', createdAt: { gte: since } },
          }),
          prisma.analyticsEvent.findMany({
            where: { profileId: customer.profile.id, eventType: 'PAGE_VIEW', createdAt: { gte: since } },
            select: { ipHash: true },
            distinct: ['ipHash'],
          }),
          prisma.leadCapture.count({ where: { profileId: customer.profile.id, isRead: false } }),
          prisma.analyticsEvent.groupBy({
            by: ['buttonLabel'],
            where: {
              profileId: customer.profile.id,
              eventType: 'BUTTON_CLICK',
              createdAt: { gte: since },
              buttonLabel: { not: null },
            },
            _count: { buttonLabel: true },
            orderBy: { _count: { buttonLabel: 'desc' } },
            take: 1,
          }),
        ])

        const uniqueVisitors = uniqueResult.filter(r => r.ipHash).length
        const topButton = topButtons[0]

        await resend.emails.send({
          from: process.env.EMAIL_FROM || 'noreply@dijitalkart.com',
          to: customer.email,
          subject: 'Haftalık Profil Raporu 📊',
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
              <h2 style="color:#1e293b">Merhaba ${customer.profile.displayName},</h2>
              <p style="color:#475569">Son 7 günlük profil özetin:</p>
              <table style="width:100%;border-collapse:collapse;margin:16px 0">
                <tr style="background:#f8fafc">
                  <td style="padding:12px 16px;color:#64748b;font-size:14px">Toplam görüntülenme</td>
                  <td style="padding:12px 16px;font-weight:700;font-size:20px;color:#1e293b">${totalViews}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;color:#64748b;font-size:14px">Benzersiz ziyaretçi</td>
                  <td style="padding:12px 16px;font-weight:700;font-size:20px;color:#1e293b">${uniqueVisitors}</td>
                </tr>
                <tr style="background:#f8fafc">
                  <td style="padding:12px 16px;color:#64748b;font-size:14px">Okunmamış mesaj</td>
                  <td style="padding:12px 16px;font-weight:700;font-size:20px;color:${unreadLeads > 0 ? '#ef4444' : '#1e293b'}">${unreadLeads}</td>
                </tr>
                ${topButton ? `
                <tr>
                  <td style="padding:12px 16px;color:#64748b;font-size:14px">En çok tıklanan</td>
                  <td style="padding:12px 16px;font-weight:600;color:#1e293b">${topButton.buttonLabel} (${topButton._count.buttonLabel}x)</td>
                </tr>` : ''}
              </table>
              <a href="${frontendUrl}/dashboard" style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Dashboard'a Git</a>
            </div>
          `,
        })
        sentCount++
      } catch (err: any) {
        console.error('[WeeklyReport] E-posta hatası:', customer.email, err.message)
      }
    }

    console.log(`[WeeklyReport] ${sentCount}/${customers.length} müşteriye gönderildi.`)
  })

  console.log('[WeeklyReport] Zamanlandı: Her Pazartesi 09:00')
}
