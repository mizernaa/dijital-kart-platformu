import QRCode from 'qrcode'

interface QROptions {
  url: string
  foregroundColor?: string
  backgroundColor?: string
  size?: number
}

export async function generateQRPng(opts: QROptions): Promise<Buffer> {
  const buffer = await QRCode.toBuffer(opts.url, {
    type: 'png',
    width: opts.size || 512,
    color: {
      dark: opts.foregroundColor || '#000000',
      light: opts.backgroundColor || '#ffffff',
    },
    errorCorrectionLevel: 'H',
    margin: 2,
  })
  return buffer
}

export async function generateQRSvg(opts: QROptions): Promise<string> {
  return QRCode.toString(opts.url, {
    type: 'svg',
    color: {
      dark: opts.foregroundColor || '#000000',
      light: opts.backgroundColor || '#ffffff',
    },
    errorCorrectionLevel: 'H',
    margin: 2,
  })
}

export async function generateQRDataUrl(opts: QROptions): Promise<string> {
  return QRCode.toDataURL(opts.url, {
    type: 'image/png',
    width: opts.size || 512,
    color: {
      dark: opts.foregroundColor || '#000000',
      light: opts.backgroundColor || '#ffffff',
    },
    errorCorrectionLevel: 'H',
    margin: 2,
  })
}
