import { Sidebar } from '@/components/Sidebar'
import { NotificationBell } from '@/components/NotificationBell'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 ml-60 flex flex-col">
        <header className="sticky top-0 z-40 flex justify-end items-center px-8 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-100">
          <NotificationBell />
        </header>
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
