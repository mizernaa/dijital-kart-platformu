'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getAuthUser, isLoggedIn } from '@/lib/auth'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login')
      return
    }
    const user = getAuthUser()
    if (user?.role === 'CUSTOMER') {
      router.replace('/dashboard')
    } else {
      router.replace('/admin/dashboard')
    }
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )
}
