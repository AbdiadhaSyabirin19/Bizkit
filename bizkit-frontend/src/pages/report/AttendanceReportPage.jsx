import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api from '../../api/axios'

export default function AttendanceReportPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => { fetchData() }, [date])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/reports/attendance?date=${date}`)
      setData(res.data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const prevDay = () => {
    const d = new Date(date)
    d.setDate(d.getDate() - 1)
    setDate(d.toISOString().split('T')[0])
  }

  const nextDay = () => {
    const d = new Date(date)
    d.setDate(d.getDate() + 1)
    setDate(d.toISOString().split('T')[0])
  }

  const formatTime = (val) => {
    if (!val) return '-'
    return new Date(val).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (val) => {
    if (!val) return '-'
    return new Date(val).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <Layout title="Laporan Absensi">
      <div className="max-w-5xl mx-auto p-4">
        {/* Date Navigator & Data Container in 1 big box conceptually, or separated like cards. The reference uses a single white background area for the data, but navigation is inside. Let's make it a clean card. */}
        <div className="bg-white rounded-lg p-6 shadow-sm min-h-[60vh]">

          {/* Main Navigation Row like ref screenshot */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-4 bg-gray-50 rounded-md p-2">
              <button onClick={prevDay} className="p-2 hover:bg-gray-200 rounded transition" title="Hari Sebelumnya">
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>

              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 w-36 mx-4 font-semibold text-gray-800"
              />

              <button onClick={nextDay} className="p-2 hover:bg-gray-200 rounded transition" title="Hari Selanjutnya">
                <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {data?.attendances?.length > 0 ? (
                <>
                  <div className="mb-4 bg-emerald-50 text-emerald-800 px-4 py-2 rounded text-sm inline-block">
                    Total Hadir: {data?.total || 0} Karyawan
                  </div>
                  <div className="grid gap-3">
                    {data.attendances.map((att, idx) => (
                      <div key={att.ID || idx} className="border border-gray-100 rounded-lg p-4 flex items-center gap-4 hover:shadow-sm transition">
                        <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold">
                          {att.user?.Name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 text-sm">{att.user?.Name || '-'}</p>
                          <p className="text-gray-500 text-xs">{att.user?.role?.Name || '-'}</p>
                        </div>
                        <div className="flex gap-6 text-sm text-center">
                          <div>
                            <p className="text-gray-400 text-xs mb-0.5">Masuk</p>
                            <p className="font-semibold text-emerald-600">{formatTime(att.CheckIn)}</p>
                          </div>
                          <div>
                            <p className="text-gray-400 text-xs mb-0.5">Keluar</p>
                            <p className="font-semibold text-red-500">{formatTime(att.CheckOut)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="py-8">
                  <p className="text-gray-500 text-sm">Belum ada data absensi.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}