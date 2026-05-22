import PDFDocument from 'pdfkit'
import { PassThrough } from 'stream'

interface DailyView { date: string; count: number }
interface ButtonCount { label: string; count: number }
interface DeviceBreakdown { desktop: number; mobile: number; tablet: number; other: number }

interface PdfData {
  displayName: string
  days: number
  totalViews: number
  uniqueVisitors: number
  vcardDownloads: number
  leadCount: number
  dailyViews: DailyView[]
  topButtons: ButtonCount[]
  deviceBreakdown: DeviceBreakdown
}

export async function generateAnalyticsPDF(data: PdfData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const pass = new PassThrough()
    const chunks: Buffer[] = []

    pass.on('data', (chunk) => chunks.push(chunk))
    pass.on('end', () => resolve(Buffer.concat(chunks)))
    pass.on('error', reject)
    doc.pipe(pass)

    const W = 495 // usable width
    const TEAL = '#1a3a3a'
    const GRAY = '#6b7280'
    const LIGHT = '#f5f0e0'
    const BLACK = '#0a0a0a'

    // ── Header ──────────────────────────────────────────
    doc.rect(0, 0, 595, 80).fill(TEAL)
    doc.fillColor('#ffffff').fontSize(22).font('Helvetica-Bold')
      .text('Q-Kart Analitik Raporu', 50, 28)
    doc.fontSize(11).font('Helvetica')
      .text(`${data.displayName} · Son ${data.days} gün`, 50, 54)

    doc.fillColor(BLACK)

    // ── Summary metrics ──────────────────────────────────
    const metricY = 110
    const metricW = W / 4
    const metrics = [
      { label: 'Görüntülenme', value: data.totalViews },
      { label: 'Tekil Ziyaretçi', value: data.uniqueVisitors },
      { label: 'vCard İndirme', value: data.vcardDownloads },
      { label: 'Mesaj', value: data.leadCount },
    ]

    metrics.forEach((m, i) => {
      const x = 50 + i * metricW
      doc.rect(x, metricY, metricW - 8, 64).fill(LIGHT).stroke('none')
      doc.fillColor(TEAL).fontSize(26).font('Helvetica-Bold')
        .text(String(m.value), x + 10, metricY + 10, { width: metricW - 28, align: 'left' })
      doc.fillColor(GRAY).fontSize(9).font('Helvetica')
        .text(m.label, x + 10, metricY + 42, { width: metricW - 28 })
    })

    // ── Daily bar chart ──────────────────────────────────
    let y = metricY + 90
    doc.fillColor(BLACK).fontSize(13).font('Helvetica-Bold').text('Günlük Görüntülenme', 50, y)
    y += 20

    if (data.dailyViews.length === 0) {
      doc.fillColor(GRAY).fontSize(10).font('Helvetica').text('Veri yok.', 50, y)
      y += 20
    } else {
      const maxVal = Math.max(...data.dailyViews.map(d => d.count), 1)
      const barMaxH = 80
      const barW = Math.min(18, Math.floor(W / data.dailyViews.length) - 2)
      const chartX = 50

      data.dailyViews.forEach((d, i) => {
        const barH = Math.max(2, Math.round((d.count / maxVal) * barMaxH))
        const bx = chartX + i * (barW + 2)
        const by = y + barMaxH - barH
        doc.rect(bx, by, barW, barH).fill(TEAL)
      })

      // x-axis labels — show first, middle, last
      const indices = [0, Math.floor(data.dailyViews.length / 2), data.dailyViews.length - 1]
      doc.fillColor(GRAY).fontSize(7).font('Helvetica')
      indices.forEach(idx => {
        const bx = chartX + idx * (barW + 2)
        const label = data.dailyViews[idx].date.slice(5) // MM-DD
        doc.text(label, bx - 4, y + barMaxH + 4, { width: 30 })
      })

      y += barMaxH + 22
    }

    // ── Device breakdown ─────────────────────────────────
    y += 10
    doc.fillColor(BLACK).fontSize(13).font('Helvetica-Bold').text('Cihaz Dağılımı', 50, y)
    y += 18

    const deviceEntries = Object.entries(data.deviceBreakdown) as [string, number][]
    const totalDevices = deviceEntries.reduce((s, [, v]) => s + v, 0) || 1
    const deviceLabels: Record<string, string> = { desktop: 'Masaüstü', mobile: 'Mobil', tablet: 'Tablet', other: 'Diğer' }

    deviceEntries.forEach(([key, count]) => {
      const pct = Math.round((count / totalDevices) * 100)
      const barLen = Math.round((pct / 100) * (W - 120))
      doc.fillColor(GRAY).fontSize(9).font('Helvetica').text(deviceLabels[key] || key, 50, y + 3, { width: 70 })
      doc.rect(130, y, barLen, 12).fill(TEAL)
      doc.fillColor(GRAY).fontSize(9).text(`${pct}%`, 135 + barLen, y + 2)
      y += 20
    })

    // ── Top buttons ──────────────────────────────────────
    if (data.topButtons.length > 0) {
      y += 10
      doc.fillColor(BLACK).fontSize(13).font('Helvetica-Bold').text('En Çok Tıklanan Butonlar', 50, y)
      y += 18

      const maxClicks = data.topButtons[0].count || 1
      data.topButtons.slice(0, 8).forEach((btn, i) => {
        const barLen = Math.round((btn.count / maxClicks) * (W - 160))
        doc.fillColor(GRAY).fontSize(9).font('Helvetica')
          .text(`${i + 1}. ${btn.label}`, 50, y + 3, { width: 100 })
        doc.rect(160, y, barLen, 12).fill('#ff4d8b')
        doc.fillColor(GRAY).fontSize(9).text(String(btn.count), 165 + barLen, y + 2)
        y += 20
      })
    }

    // ── Footer ───────────────────────────────────────────
    const footerY = 800
    doc.rect(0, footerY, 595, 42).fill(LIGHT)
    doc.fillColor(GRAY).fontSize(8).font('Helvetica')
      .text(`Oluşturma tarihi: ${new Date().toLocaleDateString('tr-TR')} · Q-Kart Dijital Kartvizit Platformu`, 50, footerY + 14, { align: 'center', width: W })

    doc.end()
  })
}
