'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Users, Package, LayoutDashboard, UserCircle,
  QrCode, BarChart2, LogOut, Settings, CreditCard,
  MessageSquare, Wifi, TrendingUp,
} from 'lucide-react'
import { clearAuth, getAuthUser } from '@/lib/auth'
import { api } from '@/lib/api'
import Cookies from 'js-cookie'
import { clsx } from 'clsx'
import { useEffect, useState } from 'react'

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  badge?: number
}

const adminNav: NavItem[] = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { href: '/admin/users', label: 'Müşteriler', icon: <Users size={18} /> },
  { href: '/admin/packages', label: 'Paketler', icon: <Package size={18} /> },
  { href: '/admin/nfc-orders', label: 'NFC Siparişler', icon: <Wifi size={18} /> },
  { href: '/admin/analytics', label: 'Analitik', icon: <TrendingUp size={18} /> },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const user = getAuthUser()
  const isAdmin = user?.role !== 'CUSTOMER'
  const [unreadLeads, setUnreadLeads] = useState(0)

  useEffect(() => {
    if (isAdmin) return
    api.get('/customer/leads?limit=1')
      .then(res => setUnreadLeads(res.data.meta?.unreadCount ?? 0))
      .catch(() => {})
  }, [isAdmin])

  const customerNav: NavItem[] = [
    { href: '/dashboard', label: 'Genel Bakış', icon: <LayoutDashboard size={18} /> },
    { href: '/dashboard/profile', label: 'Profilim', icon: <UserCircle size={18} /> },
    { href: '/dashboard/design', label: 'Tasarım', icon: <Settings size={18} /> },
    { href: '/dashboard/qr', label: 'QR Kod', icon: <QrCode size={18} /> },
    { href: '/dashboard/analytics', label: 'Analitik', icon: <BarChart2 size={18} /> },
    { href: '/dashboard/leads', label: 'Mesajlar', icon: <MessageSquare size={18} />, badge: unreadLeads },
    { href: '/dashboard/nfc', label: 'NFC Sipariş', icon: <Wifi size={18} /> },
  ]

  const navItems = isAdmin ? adminNav : customerNav

  const handleLogout = async () => {
    try {
      const refreshToken = Cookies.get('refreshToken')
      await api.post('/auth/logout', { refreshToken })
    } catch {}
    clearAuth()
    router.replace('/login')
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-white border-r border-gray-200 flex flex-col z-10">
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">Q</span>
          </div>
          <span className="font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent text-sm">Q-Kart</span>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
              pathname === item.href || pathname.startsWith(item.href + '/')
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.badge != null && item.badge > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-100">
        <div className="px-3 py-2 text-xs text-gray-500 font-medium truncate">
          {user?.username}
          <span className="ml-1 text-gray-400">
            {isAdmin ? '(Admin)' : ''}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <LogOut size={18} />
          Çıkış Yap
        </button>
      </div>
    </aside>
  )
}
