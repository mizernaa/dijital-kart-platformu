'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { Eye, Users, Download, MousePointerClick, MessageSquare } from 'lucide-react'

interface AnalyticsData {
  totalViews: number
  uniqueVisitors: number
  vcardDownloads: number
  leadCount: number
  sourceCounts: Record<string, number>
  dailyViews: { date: string; count: number }[]
  topButtons: { label: string; count: number }[]
  deviceBreakdown: { desktop: number; mobile: number; tablet: number; other: number }
  browserBreakdown: Record<string, number>
  hourlyDistribution: { hour: number; count: number }[]
}

const DEVICE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#94a3b8']
const BROWSER_COLORS = ['#6366f1', '#ec4899', '#14b8a6', '#f97316', '#8b5cf6']

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [days, setDays] = useState(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api.get(`/customer/analytics?days=${days}`)
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [days])

  const downloadCsv = () => {
    api.get(`/customer/analytics/export?days=${days}`, { responseType: 'blob' }).then(res => {
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `analytics-${days}d.csv`
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  if (loading) return <div className="text-center py-20 text-gray-400">Yükleniyor...</div>

  const devicePieData = data ? [
    { name: 'Masaüstü', value: data.deviceBreakdown.desktop },
    { name: 'Mobil', value: data.deviceBreakdown.mobile },
    { name: 'Tablet', value: data.deviceBreakdown.tablet },
    { name: 'Diğer', value: data.deviceBreakdown.other },
  ].filter(d => d.value > 0) : []

  const browserBarData = data
    ? Object.entries(data.browserBreakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
        .map(([name, count]) => ({ name, count }))
    : []

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analitik</h1>
        <div className="flex gap-2">
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            className="input w-36"
          >
            <option value={7}>Son 7 gün</option>
            <option value={30}>Son 30 gün</option>
            <option value={90}>Son 90 gün</option>
          </select>
          <button onClick={downloadCsv} className="btn-secondary flex items-center gap-1.5 text-sm">
            <Download size={15} />
            CSV
          </button>
        </div>
      </div>

      {/* Özet kartlar */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Görüntülenme', value: data?.totalViews, icon: <Eye size={18} className="text-blue-500" />, color: 'bg-blue-50' },
          { label: 'Benzersiz Ziyaretçi', value: data?.uniqueVisitors, icon: <Users size={18} className="text-green-500" />, color: 'bg-green-50' },
          { label: 'vCard İndirme', value: data?.vcardDownloads, icon: <Download size={18} className="text-purple-500" />, color: 'bg-purple-50' },
          { label: 'Toplam Mesaj', value: data?.leadCount, icon: <MessageSquare size={18} className="text-pink-500" />, color: 'bg-pink-50' },
          { label: 'Kaynak Sayısı', value: data ? Object.keys(data.sourceCounts).length : 0, icon: <MousePointerClick size={18} className="text-orange-500" />, color: 'bg-orange-50' },
        ].map(({ label, value, icon, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center mb-3`}>{icon}</div>
            <p className="text-2xl font-bold text-gray-900">{value ?? '—'}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Günlük trend */}
      <div className="card p-6 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4">Günlük Görüntülenme Trendi</h2>
        {data?.dailyViews && data.dailyViews.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.dailyViews}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip labelFormatter={d => `Tarih: ${d}`} formatter={(v) => [v, 'Görüntülenme']} />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-32 flex items-center justify-center text-gray-400 text-sm">Bu dönem için veri yok.</div>
        )}
      </div>

      {/* Saatlik yoğunluk */}
      <div className="card p-6 mb-4">
        <h2 className="font-semibold text-gray-900 mb-4">Saatlik Yoğunluk</h2>
        {data?.hourlyDistribution && data.hourlyDistribution.some(h => h.count > 0) ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.hourlyDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="hour" tick={{ fontSize: 10 }} tickFormatter={h => `${h}:00`} interval={2} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip labelFormatter={h => `Saat: ${h}:00`} formatter={(v) => [v, 'Ziyaret']} />
              <Bar dataKey="count" fill="#6366f1" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-24 flex items-center justify-center text-gray-400 text-sm">Veri yok.</div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Cihaz dağılımı */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Cihaz Dağılımı</h2>
          {devicePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={devicePieData} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {devicePieData.map((_, i) => <Cell key={i} fill={DEVICE_COLORS[i % DEVICE_COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-24 flex items-center justify-center text-gray-400 text-sm">Veri yok.</div>
          )}
        </div>

        {/* Tarayıcı dağılımı */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Tarayıcı Dağılımı</h2>
          {browserBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={browserBarData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={70} />
                <Tooltip />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {browserBarData.map((_, i) => <Cell key={i} fill={BROWSER_COLORS[i % BROWSER_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-24 flex items-center justify-center text-gray-400 text-sm">Veri yok.</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Ziyaret kaynakları */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Ziyaret Kaynakları</h2>
          {data?.sourceCounts && Object.keys(data.sourceCounts).length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={Object.entries(data.sourceCounts).map(([k, v]) => ({ name: k || 'Direkt', count: v }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-24 flex items-center justify-center text-gray-400 text-sm">Veri yok.</div>
          )}
        </div>

        {/* En çok tıklanan butonlar */}
        <div className="card p-6">
          <h2 className="font-semibold text-gray-900 mb-4">En Çok Tıklanan Butonlar</h2>
          {data?.topButtons && data.topButtons.length > 0 ? (
            <div className="space-y-2">
              {data.topButtons.map(btn => (
                <div key={btn.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 truncate flex-1">{btn.label}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 bg-blue-400 rounded-full"
                      style={{ width: `${Math.max(8, (btn.count / data.topButtons[0].count) * 80)}px` }}
                    />
                    <span className="text-sm font-medium text-gray-900 w-6 text-right">{btn.count}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center text-gray-400 text-sm">Veri yok.</div>
          )}
        </div>
      </div>
    </div>
  )
}
