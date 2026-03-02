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
      <div className="max-w-5xl mx-auto">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-800">Pergantian Shift</h1>
          <p className="text-gray-500 text-sm">Laporan kas masuk & keluar per shift</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
              <input
                type="date"
                value={filter.start_date}
                onChange={e => setFilter(f => ({ ...f, start_date: e.target.value }))}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
              <input
                type="date"
                value={filter.end_date}
                onChange={e => setFilter(f => ({ ...f, end_date: e.target.value }))}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>
            <button
              onClick={fetchData}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition"
            >
              Tampilkan
            </button>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-500 text-sm">Total Kas Masuk</p>
                  <span className="text-2xl">💵</span>
                </div>
                <p className="text-xl font-bold text-emerald-600">
                  Rp {Number(data.total_cash_in).toLocaleString('id-ID')}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-gray-500 text-sm">Total Kas Keluar</p>
                  <span className="text-2xl">💸</span>
                </div>
                <p className="text-xl font-bold text-red-500">
                  Rp {Number(data.total_cash_out).toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            {/* Tabel */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b">
                <h2 className="font-semibold text-gray-800">Detail Shift</h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['No', 'Waktu Mulai', 'Waktu Selesai', 'Karyawan', 'Kas Masuk', 'Kas Keluar', 'Selisih'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.shifts?.length > 0 ? data.shifts.map((shift, idx) => (
                    <tr key={shift.ID || idx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{idx + 1}</td>
                      <td className="px-4 py-3 text-gray-700 text-xs">{formatTime(shift.StartTime)}</td>
                      <td className="px-4 py-3 text-gray-700 text-xs">{formatTime(shift.EndTime)}</td>
                      <td className="px-4 py-3 text-gray-700">{shift.user?.Name || '-'}</td>
                      <td className="px-4 py-3 text-emerald-600 font-medium">
                        Rp {Number(shift.CashIn).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-red-500 font-medium">
                        Rp {Number(shift.CashOut).toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        Rp {Number(shift.Difference).toLocaleString('id-ID')}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                        <p className="text-3xl mb-2">📭</p>
                        <p>Tidak ada data shift pada periode ini</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}