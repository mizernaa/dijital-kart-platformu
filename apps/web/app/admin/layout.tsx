import { Sidebar } from '@/components/Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 md:ml-60 p-4 md:p-8 pt-16 md:pt-8">
        {children}
      </main>
    </div>
  )
}
