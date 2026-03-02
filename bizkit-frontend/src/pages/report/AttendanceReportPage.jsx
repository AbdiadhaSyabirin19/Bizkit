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
      <div className="max-w-5xl mx-auto">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-800">Laporan Absensi</h1>
          <p className="text-gray-500 text-sm">Rekap absensi karyawan per hari</p>
        </div>

        {/* Date Navigator */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-5 flex items-center justify-between">
          <button onClick={prevDay} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            />
            <span className="text-gray-500 text-sm hidden md:block">{formatDate(date)}</span>
          </div>
          <button onClick={nextDay} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Total */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div>
              <p className="text-gray-500 text-sm">Total Hadir</p>
              <p className="text-2xl font-bold text-gray-800">{data?.total || 0} Karyawan</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.attendances?.length > 0 ? data.attendances.map((att, idx) => (
              <div key={att.ID || idx} className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-lg">
                      {att.user?.Name?.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{att.user?.Name || '-'}</p>
                    <p className="text-gray-400 text-xs">{att.user?.role?.Name || '-'}</p>
                  </div>

                  {/* Waktu */}
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1">Masuk</p>
                      <p className="font-semibold text-emerald-600">{formatTime(att.CheckIn)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-400 text-xs mb-1">Keluar</p>
                      <p className="font-semibold text-red-500">{formatTime(att.CheckOut)}</p>
                    </div>
                  </div>

                  {/* Foto */}
                  {att.Photo && (
                    <div className="flex-shrink-0">
                      <img
                        src={att.Photo}
                        alt="Foto absensi"
                        className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                        onError={e => e.target.style.display = 'none'}
                      />
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-gray-500">Tidak ada data absensi pada tanggal ini</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}