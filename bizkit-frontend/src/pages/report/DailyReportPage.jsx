import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api from '../../api/axios'

export default function DailyReportPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => { fetchData() }, [date])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/sales/daily?date=${date}`)
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

  return (
    <Layout title="Penjualan Harian">
      <div className="max-w-5xl mx-auto">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-800">Penjualan Harian</h1>
          <p className="text-gray-500 text-sm">Laporan transaksi per hari</p>
        </div>

        {/* Date Navigator */}
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-5 flex items-center justify-between">
          <button onClick={prevDay} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex items-center gap-3">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
          </div>
          <button onClick={nextDay} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { label: 'Total Transaksi', value: data?.total_transaksi || 0, icon: '🧾' },
                { label: 'Total Item', value: data?.total_qty || 0, icon: '📦' },
                { label: 'Total Omzet', value: `Rp ${Number(data?.total_omzet || 0).toLocaleString('id-ID')}`, icon: '💰' },
              ].map(s => (
                <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-gray-500 text-sm">{s.label}</p>
                    <span className="text-2xl">{s.icon}</span>
                  </div>
                  <p className="text-xl font-bold text-gray-800">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Rekap Metode Bayar */}
            {data?.payment_summary && Object.keys(data.payment_summary).length > 0 && (
              <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
                <h2 className="font-semibold text-gray-800 mb-3">Rekap Metode Pembayaran</h2>
                <div className="space-y-2">
                  {Object.entries(data.payment_summary).map(([method, total]) => (
                    <div key={method} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-600 text-sm">{method}</span>
                      <span className="font-semibold text-gray-800 text-sm">Rp {Number(total).toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tabel Transaksi */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b">
                <h2 className="font-semibold text-gray-800">Daftar Transaksi</h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['No', 'Invoice', 'Kasir', 'Metode Bayar', 'Total'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data?.sales?.length > 0 ? data.sales.map((sale, idx) => (
                    <tr key={sale.ID} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{idx + 1}</td>
                      <td className="px-4 py-3 text-gray-700 font-mono text-xs">{sale.InvoiceNumber}</td>
                      <td className="px-4 py-3 text-gray-700">{sale.user?.Name || '-'}</td>
                      <td className="px-4 py-3 text-gray-700">{sale.payment_method?.Name || '-'}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">Rp {Number(sale.GrandTotal).toLocaleString('id-ID')}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                        <p className="text-3xl mb-2">📭</p>
                        <p>Tidak ada transaksi pada tanggal ini</p>
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