'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '@/lib/api'
import { Copy, Check } from 'lucide-react'

const schema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-z0-9_-]+$/, 'Küçük harf, rakam, _ ve - kullanılabilir'),
  email: z.string().email('Geçerli e-posta girin'),
  phone: z.string().optional(),
  company: z.string().optional(),
  notes: z.string().optional(),
  packageId: z.string().min(1, 'Paket seçin'),
  status: z.enum(['ACTIVE', 'PASSIVE', 'SUSPENDED', 'TRIAL']),
})

type FormData = z.infer<typeof schema>

interface Package { id: string; name: string; displayName: string }

export default function NewUserPage() {
  const router = useRouter()
  const [packages, setPackages] = useState<Package[]>([])
  const [error, setError] = useState('')
  const [created, setCreated] = useState<{ username: string; tempPassword: string } | null>(null)
  const [copied, setCopied] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: 'TRIAL' },
  })

  useEffect(() => {
    api.get('/admin/packages').then(res => setPackages(res.data.data)).catch(console.error)
  }, [])

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await api.post('/admin/users', data)
      setCreated({
        username: res.data.data.user.username,
        tempPassword: res.data.data.tempPassword,
      })
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Müşteri oluşturulamadı.')
    }
  }

  const copyPassword = () => {
    if (created) {
      navigator.clipboard.writeText(created.tempPassword)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (created) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <div className="card p-8 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={24} className="text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Müşteri Oluşturuldu</h2>
          <p className="text-sm text-gray-500 mb-6">Geçici şifreyi not alın, bir daha gösterilmeyecek.</p>

          <div className="bg-gray-50 rounded-lg p-4 mb-4 text-left">
            <p className="text-xs text-gray-500 mb-1">Kullanıcı Adı</p>
            <p className="font-mono font-medium text-gray-900">{created.username}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs text-yellow-700 mb-1">Geçici Şifre</p>
            <div className="flex items-center justify-between">
              <p className="font-mono font-bold text-gray-900">{created.tempPassword}</p>
              <button onClick={copyPassword} className="text-yellow-700 hover:text-yellow-900">
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => router.push('/admin/users')} className="btn-secondary flex-1">
              Listeye Dön
            </button>
            <button onClick={() => setCreated(null)} className="btn-primary flex-1">
              Yeni Ekle
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Yeni Müşteri</h1>
        <p className="text-sm text-gray-500 mt-1">Geçici şifre otomatik oluşturulacak.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Kullanıcı Adı *</label>
            <input {...register('username')} className="input" placeholder="ahmetdemir" />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username.message}</p>}
          </div>
          <div>
            <label className="label">E-posta *</label>
            <input {...register('email')} type="email" className="input" placeholder="ahmet@example.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Telefon</label>
            <input {...register('phone')} className="input" placeholder="+905551234567" />
          </div>
          <div>
            <label className="label">Şirket</label>
            <input {...register('company')} className="input" placeholder="ABC Şirketi" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Paket *</label>
            <select {...register('packageId')} className="input">
              <option value="">Paket seçin</option>
              {packages.map(pkg => (
                <option key={pkg.id} value={pkg.id}>{pkg.displayName}</option>
              ))}
            </select>
            {errors.packageId && <p className="text-red-500 text-xs mt-1">{errors.packageId.message}</p>}
          </div>
          <div>
            <label className="label">Durum</label>
            <select {...register('status')} className="input">
              <option value="TRIAL">Deneme</option>
              <option value="ACTIVE">Aktif</option>
              <option value="PASSIVE">Pasif</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label">Notlar</label>
          <textarea {...register('notes')} className="input min-h-[80px] resize-none" placeholder="İç notlar..." />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="btn-secondary flex-1">İptal</button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? 'Oluşturuluyor...' : 'Müşteri Oluştur'}
          </button>
        </div>
      </form>
    </div>
  )
}
