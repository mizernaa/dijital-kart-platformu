'use client'
import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { MessageSquare, Mail, Check, CheckCheck, Download, X } from 'lucide-react'

interface Lead {
  id: string
  name: string
  email: string | null
  message: string
  isRead: boolean
  createdAt: string
}

interface Meta {
  total: number
  page: number
  totalPages: number
  unreadCount: number
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Lead | null>(null)

  const fetchLeads = (p = 1) => {
    setLoading(true)
    api.get(`/customer/leads?page=${p}&limit=20`)
      .then(res => {
        setLeads(res.data.data)
        setMeta(res.data.meta)
        setPage(p)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchLeads() }, [])

  const markRead = async (id: string) => {
    await api.patch(`/customer/leads/${id}/read`)
    setLeads(prev => prev.map(l => l.id === id ? { ...l, isRead: true } : l))
    if (meta) setMeta({ ...meta, unreadCount: Math.max(0, meta.unreadCount - 1) })
  }

  const markAllRead = async () => {
    await api.patch('/customer/leads/read-all')
    setLeads(prev => prev.map(l => ({ ...l, isRead: true })))
    if (meta) setMeta({ ...meta, unreadCount: 0 })
  }

  const openLead = (lead: Lead) => {
    setSelected(lead)
    if (!lead.isRead) markRead(lead.id)
  }

  const downloadCsv = () => {
    api.get('/customer/leads/export', { responseType: 'blob' }).then(res => {
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = 'leads.csv'
      a.click()
      URL.revokeObjectURL(url)
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mesajlar</h1>
          {meta && meta.unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-0.5">{meta.unreadCount} okunmamış mesaj</p>
          )}
        </div>
        <div className="flex gap-2">
          {meta && meta.unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-secondary flex items-center gap-2">
              <CheckCheck size={16} />
              Tümünü Okundu İşaretle
            </button>
          )}
          <button onClick={downloadCsv} className="btn-secondary flex items-center gap-2">
            <Download size={16} />
            CSV İndir
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Yükleniyor...</div>
      ) : leads.length === 0 ? (
        <div className="card p-12 text-center">
          <MessageSquare size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">Henüz mesaj yok.</p>
          <p className="text-sm text-gray-400 mt-1">Ziyaretçiler profilinizdeki form üzerinden size ulaşabilir.</p>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ad Soyad</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">E-posta</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mesaj</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tarih</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leads.map(lead => (
                  <tr
                    key={lead.id}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${!lead.isRead ? 'bg-blue-50/30' : ''}`}
                    onClick={() => openLead(lead)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {!lead.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                        <span className={`text-sm ${!lead.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                          {lead.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {lead.email ? (
                        <span className="flex items-center gap-1">
                          <Mail size={13} />
                          {lead.email}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                      <span className="truncate block">{lead.message}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                      {new Date(lead.createdAt).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="px-4 py-3">
                      {lead.isRead ? (
                        <Check size={14} className="text-green-400" />
                      ) : (
                        <span className="text-xs text-blue-600 font-medium">Yeni</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <button
                disabled={page <= 1}
                onClick={() => fetchLeads(page - 1)}
                className="btn-secondary disabled:opacity-40"
              >
                ← Önceki
              </button>
              <span className="px-4 py-2 text-sm text-gray-600">{page} / {meta.totalPages}</span>
              <button
                disabled={page >= meta.totalPages}
                onClick={() => fetchLeads(page + 1)}
                className="btn-secondary disabled:opacity-40"
              >
                Sonraki →
              </button>
            </div>
          )}
        </>
      )}

      {/* Detay Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{selected.name}</h2>
                {selected.email && (
                  <a href={`mailto:${selected.email}`} className="text-sm text-blue-600 hover:underline flex items-center gap-1 mt-0.5">
                    <Mail size={13} />
                    {selected.email}
                  </a>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(selected.createdAt).toLocaleString('tr-TR')}
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{selected.message}</p>
            </div>
            {selected.email && (
              <a
                href={`mailto:${selected.email}`}
                className="mt-4 btn-primary w-full text-center block"
              >
                Yanıtla
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
