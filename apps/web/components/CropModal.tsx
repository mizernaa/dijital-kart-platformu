'use client'
import { useCallback, useState } from 'react'
import Cropper, { Area } from 'react-easy-crop'

/**
 * WhatsApp benzeri görsel kırpma modalı: kullanıcı görseli sürükleyip
 * yakınlaştırarak istediği bölgeyi seçer; sonuç kare PNG blob olarak döner.
 */
export function CropModal({
  file,
  onDone,
  onCancel,
  aspect = 1,
  title = 'Görseli Konumlandır',
}: {
  file: File
  onDone: (cropped: File) => void
  onCancel: () => void
  aspect?: number
  title?: string
}) {
  const [imageUrl] = useState(() => URL.createObjectURL(file))
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)

  const onCropComplete = useCallback((_: Area, areaPx: Area) => setCroppedArea(areaPx), [])

  async function confirm() {
    if (!croppedArea) return
    setBusy(true)
    try {
      const img = new Image()
      img.src = imageUrl
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej })

      // Çıktıyı makul boyutta tut (sunucu zaten optimize ediyor)
      const maxOut = 1024
      const scale = Math.min(1, maxOut / croppedArea.width)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(croppedArea.width * scale)
      canvas.height = Math.round(croppedArea.height * scale)
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(
        img,
        croppedArea.x, croppedArea.y, croppedArea.width, croppedArea.height,
        0, 0, canvas.width, canvas.height,
      )
      const blob: Blob = await new Promise((res, rej) =>
        canvas.toBlob(b => (b ? res(b) : rej(new Error('crop failed'))), 'image/png')
      )
      const name = file.name.replace(/\.[^.]+$/, '') + '-kirpilmis.png'
      onDone(new File([blob], name, { type: 'image/png' }))
    } finally {
      setBusy(false)
      URL.revokeObjectURL(imageUrl)
    }
  }

  function cancel() {
    URL.revokeObjectURL(imageUrl)
    onCancel()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
          <button onClick={cancel} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>

        <div className="relative w-full bg-gray-900" style={{ height: 320 }}>
          <Cropper
            image={imageUrl}
            crop={crop}
            zoom={zoom}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid={false}
            cropShape={aspect === 1 ? 'round' : 'rect'}
          />
        </div>

        <div className="px-5 py-3 flex items-center gap-3">
          <span className="text-xs text-gray-400">Uzaklaştır</span>
          <input
            type="range" min={1} max={3} step={0.01} value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="flex-1 accent-blue-600"
          />
          <span className="text-xs text-gray-400">Yakınlaştır</span>
        </div>
        <p className="px-5 text-xs text-gray-400 -mt-1">Görseli parmağınla/fareyle sürükleyerek konumlandır.</p>

        <div className="px-5 py-4 flex gap-2 justify-end">
          <button onClick={cancel} className="btn-secondary text-sm" disabled={busy}>Vazgeç</button>
          <button onClick={confirm} className="btn-primary text-sm" disabled={busy}>
            {busy ? 'İşleniyor…' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}
