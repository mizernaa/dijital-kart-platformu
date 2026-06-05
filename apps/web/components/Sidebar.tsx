'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Users, Package, LayoutDashboard, UserCircle,
  QrCode, BarChart2, LogOut, Settings, CreditCard,
  MessageSquare, Wifi, TrendingUp, Globe, ShoppingBag, Menu, X, Tag, Sparkles,
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
  { href: '/admin/orders', label: 'Siparişler', icon: <ShoppingBag size={18} /> },
  { href: '/admin/nfc-orders', label: 'NFC Siparişler', icon: <Wifi size={18} /> },
  { href: '/admin/pricing', label: 'Fiyatlar', icon: <Tag size={18} /> },
  { href: '/admin/analytics', label: 'Analitik', icon: <TrendingUp size={18} /> },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<ReturnType<typeof getAuthUser>>(null)
  const [mounted, setMounted] = useState(false)
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'SUPPORT'
  const [unreadLeads, setUnreadLeads] = useState(0)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setUser(getAuthUser())
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isAdmin) return
    api.get('/customer/leads?limit=1')
      .then(res => setUnreadLeads(res.data.meta?.unreadCount ?? 0))
      .catch(() => {})
  }, [isAdmin])

  // Sayfa değişince mobile menüyü kapat
  useEffect(() => { setMobileOpen(false) }, [pathname])

  const customerNav: NavItem[] = [
    { href: '/dashboard', label: 'Genel Bakış', icon: <LayoutDashboard size={18} /> },
    { href: '/dashboard/profile', label: 'Profilim', icon: <UserCircle size={18} /> },
    { href: '/dashboard/design', label: 'Tasarım', icon: <Settings size={18} /> },
    { href: '/dashboard/social', label: 'Sosyal', icon: <Sparkles size={18} /> },
    { href: '/dashboard/qr', label: 'QR Kod', icon: <QrCode size={18} /> },
    { href: '/dashboard/analytics', label: 'Analitik', icon: <BarChart2 size={18} /> },
    { href: '/dashboard/leads', label: 'Mesajlar', icon: <MessageSquare size={18} />, badge: unreadLeads },
    { href: '/dashboard/nfc', label: 'NFC Sipariş', icon: <Wifi size={18} /> },
    { href: '/dashboard/custom-domain', label: 'Özel Domain', icon: <Globe size={18} /> },
    { href: '/dashboard/team', label: 'Ekip', icon: <Users size={18} /> },
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

  const SidebarContent = () => (
    <>
      <div className="p-5 border-b border-[#E8E0D0] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-[#C45E2A] to-[#E8843A] rounded-lg flex items-center justify-center shadow-sm">
            <span className="text-white font-black text-sm">Q</span>
          </div>
          <span className="font-bold bg-gradient-to-r from-[#C45E2A] to-[#E8843A] bg-clip-text text-transparent text-sm">Q-Kart</span>
        </div>
        <button className="md:hidden p-1 rounded-lg hover:bg-gray-100" onClick={() => setMobileOpen(false)}>
          <X size={18} className="text-gray-500" />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {!mounted ? null : navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              pathname === item.href || pathname.startsWith(item.href + '/')
                ? 'bg-[#F5E6D8] text-[#C45E2A] shadow-[inset_0_1px_2px_rgba(196,94,42,0.08)]'
                : 'text-[#5A4A3A] hover:bg-[#F5F0E8] hover:text-[#2C2418]'
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

      <div className="p-3 border-t border-[#E8E0D0]">
        <div className="px-3 py-2 text-xs text-[#8C7B6B] font-medium truncate">
          {mounted ? user?.username : ''}
          <span className="ml-1 text-[#B0A090]">{mounted && isAdmin ? '(Admin)' : ''}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#5A4A3A] hover:bg-red-50 hover:text-red-600 transition-colors w-full"
        >
          <LogOut size={18} />
          Çıkış Yap
        </button>
      </div>
    </>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-60 bg-[#FEFCF9] border-r border-[#E8E0D0] flex-col z-10">
        <SidebarContent />
      </aside>

      {/* Mobile: hamburger button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-white border border-[#E8E0D0] rounded-xl flex items-center justify-center shadow-sm"
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={18} className="text-[#5A4A3A]" />
      </button>

      {/* Mobile: overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex flex-col w-72 max-w-[85vw] bg-[#FEFCF9] h-full z-50 shadow-xl">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  )
}
