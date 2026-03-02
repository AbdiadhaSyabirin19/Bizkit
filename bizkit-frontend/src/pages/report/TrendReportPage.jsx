import { useState } from 'react'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

export default function TrendReportPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('product')
  const today = new Date().toISOString().split('T')[0]
  const firstDay = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  const [filter, setFilter] = useState({ start_date: firstDay, end_date: today })

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/reports/trend?start_date=${filter.start_date}&end_date=${filter.end_date}`)
      setData(res.data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const chartData = activeTab === 'product'
    ? (data?.product_stats || []).map(p => ({
        name: p.name?.length > 12 ? p.name.substring(0, 12) + '...' : p.name,
        fullName: p.name,
        qty: p.qty,
        omzet: p.omzet,
      })).sort((a, b) => b.qty - a.qty).slice(0, 10)
    : (data?.category_stats || []).map(c => ({
        name: c.name,
        fullName: c.name,
        qty: c.qty,
        omzet: c.omzet,
      })).sort((a, b) => b.qty - a.qty)

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-lg text-sm">
          <p className="font-semibold text-gray-800 mb-2">{payload[0]?.payload?.fullName}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }}>
              {p.name === 'qty' ? `Qty: ${p.value}` : `Omzet: Rp ${Number(p.value).toLocaleString('id-ID')}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Layout title="Trend Penjualan">
      <div className="max-w-6xl mx-auto">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-800">Trend Penjualan</h1>
          <p className="text-gray-500 text-sm">Statistik penjualan per produk dan kategori</p>
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
            {/* Tab */}
            <div className="flex gap-2 mb-5">
              <button
                onClick={() => setActiveTab('product')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === 'product' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              >
                Per Produk
              </button>
              <button
                onClick={() => setActiveTab('category')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${activeTab === 'category' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              >
                Per Kategori
              </button>
            </div>

            {/* Chart */}
            {chartData.length > 0 ? (
              <>
                <div className="bg-white rounded-2xl p-5 shadow-sm mb-5">
                  <h2 className="font-semibold text-gray-800 mb-4">
                    Grafik {activeTab === 'product' ? 'Produk' : 'Kategori'} Terlaris
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        angle={-35}
                        textAnchor="end"
                        interval={0}
                      />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="qty" name="Qty Terjual" fill="#10b981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Tabel */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b">
                    <h2 className="font-semibold text-gray-800">
                      Detail {activeTab === 'product' ? 'Produk' : 'Kategori'}
                    </h2>
                  </div>
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['No', activeTab === 'product' ? 'Produk' : 'Kategori', 'Qty Terjual', 'Omzet'].map(h => (
                          <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {chartData.map((item, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-700">{idx + 1}</td>
                          <td className="px-4 py-3 font-medium text-gray-800">{item.fullName}</td>
                          <td className="px-4 py-3 text-gray-700">
                            <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                              {item.qty} pcs
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-800">
                            Rp {Number(item.omzet).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                <p className="text-4xl mb-3">📊</p>
                <p className="text-gray-500">Tidak ada data pada periode ini</p>
              </div>
            )}
          </>
        )}

        {!data && !loading && (
          <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-gray-500">Pilih periode lalu klik Tampilkan</p>
          </div>
        )}
      </div>
    </Layout>
  )
}