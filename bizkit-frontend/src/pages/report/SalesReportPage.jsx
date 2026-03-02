import { useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../api/axios'

export default function SalesReportPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const today = new Date().toISOString().split('T')[0]
  const [filter, setFilter] = useState({
    start_date: today,
    end_date: today
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/reports/sales?start_date=${filter.start_date}&end_date=${filter.end_date}`)
      setData(res.data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  return (
    <Layout title="Riwayat Penjualan">
      <div className="max-w-6xl mx-auto">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-800">Riwayat Penjualan</h1>
          <p className="text-gray-500 text-sm">Laporan penjualan berdasarkan periode</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
          <div className="flex items-end gap-3 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
              <input type="date" value={filter.start_date} onChange={e => setFilter(f => ({ ...f, start_date: e.target.value }))} className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
              <input type="date" value={filter.end_date} onChange={e => setFilter(f => ({ ...f, end_date: e.target.value }))} className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <button onClick={fetchData} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium transition">
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
            <div className="grid grid-cols-3 gap-4 mb-5">
              {[
                { label: 'Total Transaksi', value: data.total_transaksi, icon: '🧾' },
                { label: 'Total Diskon', value: `Rp ${Number(data.total_diskon).toLocaleString('id-ID')}`, icon: '🏷️' },
                { label: 'Total Omzet', value: `Rp ${Number(data.total_omzet).toLocaleString('id-ID')}`, icon: '💰' },
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

            {/* Tabel */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b">
                <h2 className="font-semibold text-gray-800">Detail Transaksi</h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['No', 'Invoice', 'Tanggal', 'Kasir', 'Metode', 'Subtotal', 'Diskon', 'Total'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.sales?.length > 0 ? data.sales.map((sale, idx) => (
                    <tr key={sale.ID} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">{idx + 1}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{sale.InvoiceNumber}</td>
                      <td className="px-4 py-3 text-gray-700">{new Date(sale.CreatedAt).toLocaleDateString('id-ID')}</td>
                      <td className="px-4 py-3 text-gray-700">{sale.user?.Name || '-'}</td>
                      <td className="px-4 py-3 text-gray-700">{sale.payment_method?.Name || '-'}</td>
                      <td className="px-4 py-3 text-gray-700">Rp {Number(sale.Subtotal).toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3 text-red-500">- Rp {Number(sale.DiscountTotal).toLocaleString('id-ID')}</td>
                      <td className="px-4 py-3 font-semibold text-gray-800">Rp {Number(sale.GrandTotal).toLocaleString('id-ID')}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                        <p className="text-3xl mb-2">📭</p>
                        <p>Tidak ada data pada periode ini</p>
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