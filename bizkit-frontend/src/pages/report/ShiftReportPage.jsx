import { useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../api/axios'

export default function ShiftReportPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().split('T')[0]
  const [filter, setFilter] = useState({ start_date: today, end_date: today })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/reports/shift?start_date=${filter.start_date}&end_date=${filter.end_date}`)
      setData(res.data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const formatTime = (val) => {
    if (!val) return '-'
    return new Date(val).toLocaleString('id-ID', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  return (
    <Layout title="Pergantian Shift">
      <div className="max-w-5xl mx-auto p-4">

        {/* Main Header area mimicking the screenshot filter area */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 mr-2">
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-700 font-medium text-sm">Periode</span>
            </div>

            <input
              type="date"
              value={filter.start_date}
              onChange={e => setFilter(f => ({ ...f, start_date: e.target.value }))}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 w-36"
            />

            <input
              type="date"
              value={filter.end_date}
              onChange={e => setFilter(f => ({ ...f, end_date: e.target.value }))}
              className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 w-36"
            />

            <button
              onClick={fetchData}
              className="px-6 py-1.5 bg-[#424b55] hover:bg-[#343b43] text-white rounded text-sm transition font-medium ml-2"
            >
              Ganti
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        )}

        {/* Tabel */}
        {!loading && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full text-sm">
              <thead className="bg-[#e4e5e7]">
                <tr>
                  {['Waktu', 'Uraian', 'Jenis', 'Nama', 'Masuk', 'Keluar', 'Selisih', 'Saldo'].map(h => (
                    <th key={h} className="px-4 py-3 text-center text-xs font-bold text-gray-800 capitalize whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-center">
                {data?.shifts?.length > 0 ? data.shifts.map((shift, idx) => (
                  <tr key={shift.ID || idx} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-700 text-xs">
                      {formatTime(shift.StartTime)} - {formatTime(shift.EndTime)}
                    </td>
                    <td className="px-4 py-3 text-gray-700">Pergantian Shift</td>
                    <td className="px-4 py-3 text-gray-700">-</td>
                    <td className="px-4 py-3 text-gray-700">{shift.user?.Name || '-'}</td>
                    <td className="px-4 py-3 text-gray-700">
                      {Number(shift.CashIn).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {Number(shift.CashOut).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {Number(shift.Difference).toLocaleString('id-ID')}
                    </td>
                    <td className="px-4 py-3 text-gray-700">-</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="px-4 py-6 text-center text-gray-500 text-sm">
                      Belum ada data
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}