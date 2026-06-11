import sharp from 'sharp'
import path from 'path'
import fs from 'fs/promises'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')

// Yükleme tipine göre maksimum ebatlar. Görseller WebP'e çevrilip
// orantı korunarak küçültülür (büyütme yapılmaz, fit: inside).
export type ImagePreset = 'avatar' | 'logo' | 'general'

const PRESETS: Record<ImagePreset, { maxWidth: number; maxHeight: number; quality: number }> = {
  // Avatar ve logo profil üzerinde küçük gösterilir; 512px fazlasıyla yeter.
  avatar: { maxWidth: 512, maxHeight: 512, quality: 82 },
  logo: { maxWidth: 512, maxHeight: 512, quality: 82 },
  // Kapak/galeri/sosyal post gibi geniş görseller.
  general: { maxWidth: 1600, maxHeight: 1600, quality: 80 },
}

/**
 * Bellekteki görsel buffer'ını verilen presete göre küçültüp WebP olarak
 * uploads klasörüne yazar. Animasyonlu GIF'ler animasyonu korunarak çevrilir.
 * Geri dönüş: kaydedilen dosyanın adı (örn. "1700000000-ab12cd34.webp").
 */
export async function processAndSaveImage(
  buffer: Buffer,
  mimetype: string,
  preset: ImagePreset
): Promise<string> {
  const { maxWidth, maxHeight, quality } = PRESETS[preset]
  const isAnimated = mimetype === 'image/gif'

  const pipeline = sharp(buffer, { animated: isAnimated })
    .rotate() // EXIF yönelimini uygula, sonra metadata sıfırlanır
    .resize({
      width: maxWidth,
      height: maxHeight,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality })

  const outputBuffer = await pipeline.toBuffer()

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.webp`
  await fs.mkdir(UPLOAD_DIR, { recursive: true })
  await fs.writeFile(path.join(UPLOAD_DIR, filename), outputBuffer)

  return filename
}
