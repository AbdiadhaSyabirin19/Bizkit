import { useState, useEffect, useMemo } from 'react'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { FaFilePdf, FaFileExcel } from 'react-icons/fa'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

// ── Helpers ──────────────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString('id-ID')
const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const DAYS_ID = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']

// Get ISO week number
function getWeekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const dayNum = date.getUTCDay() || 7
  date.setUTCDate(date.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1))
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7)
}

// Get week date range string
function getWeekRangeStr(year, weekNum) {
  const jan1 = new Date(year, 0, 1)
  const days = (weekNum - 1) * 7
  const start = new Date(jan1)
  start.setDate(jan1.getDate() + days - jan1.getDay() + 1)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const fmtDate = (d) => `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`
  const sMonth = MONTHS_ID[start.getMonth()].substring(0, 3)
  return `${sMonth} (${fmtDate(start)}-${fmtDate(end)})`
}

// ── Component ────────────────────────────────────────────────────────
export default function TrendReportPage() {
  const [activeTab, setActiveTab] = useState('product') // 'product' | 'category'
  const [year, setYear] = useState(new Date().getFullYear())
  const [statType, setStatType] = useState('Qty')
  const [showStatDropdown, setShowStatDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [hasSelected, setHasSelected] = useState(false)

  // Product/Category lists
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')

  // Fetch product & category lists on mount
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.get('/products'),
          api.get('/categories'),
        ])
        setProducts(prodRes.data.data || [])
        setCategories(catRes.data.data || [])
      } catch (err) { console.error(err) }
    }
    fetchLists()
  }, [])

  // Fetch trend data only when a selection has been made and year changes
  useEffect(() => {
    if (hasSelected) fetchData()
  }, [year, hasSelected])

  const fetchData = async () => {
    setLoading(true)
    try {
      const startDate = `${year}-01-01`
      const endDate = `${year}-12-31`
      const res = await api.get(`/reports/trend?start_date=${startDate}&end_date=${endDate}`)
      setData(res.data.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  // ── Compute charts data ────────────────────────────────────────────
  // For "Per Produk" we filter by selectedProduct; for "Per Kategori" by selectedCategory
  // Since backend doesn't return time-series data, we'll mock the structure
  // and show aggregate data we have

  const weeklyChartData = useMemo(() => {
    // Generate weekly placeholders for the year
    const weeks = []
    for (let w = 1; w <= 52; w++) {
      weeks.push({ week: w, name: String(w), value: 0 })
    }
    return weeks
  }, [year])

  const dailyChartData = useMemo(() => {
    return DAYS_ID.map(day => ({ name: day, value: 0 }))
  }, [])

  const hourlyChartData = useMemo(() => {
    const hours = []
    for (let h = 21; h >= 0; h--) {
      hours.push({ name: String(h), value: 0 })
    }
    return hours.reverse()
  }, [])

  // ── Weekly detail table data ───────────────────────────────────────
  const detailData = useMemo(() => {
    const rows = []
    // Show all weeks of the year so far
    const now = new Date()
    const maxWeek = year === now.getFullYear() ? getWeekNumber(now) : 52
    for (let w = 1; w <= maxWeek; w++) {
      rows.push({
        no: w,
        minggu: getWeekRangeStr(year, w),
        n: 0,
        q: 0,
        omzet: 0,
      })
    }

    // If we have product_stats or category_stats, we can't map them to weeks
    // but we show the total in the last row
    return rows
  }, [year, data, activeTab, selectedProduct, selectedCategory])

  const totals = useMemo(() => {
    let totalN = 0, totalQ = 0, totalOmzet = 0
    const stats = activeTab === 'product' ? data?.product_stats : data?.category_stats
    if (stats) {
      const filterName = activeTab === 'product' ? selectedProduct : selectedCategory
      const filtered = stats.filter(s => (s.name || s.Name) === filterName)
      filtered.forEach(s => {
        totalQ += s.qty || 0
        totalOmzet += s.omzet || 0
        totalN += 1
      })
    }
    return { n: totalN, q: totalQ, omzet: totalOmzet }
  }, [data, activeTab, selectedProduct, selectedCategory])

  // ── Summary stats ──────────────────────────────────────────────────
  const summaryStats = useMemo(() => {
    const weeks = detailData.length || 1
    return [
      { label: 'Rata-rata Nota', value: fmt((totals.n / weeks).toFixed(2)) },
      { label: 'Rata-rata Qty', value: fmt((totals.q / weeks).toFixed(2)) },
      { label: 'Rata-rata Omzet', value: `Rp ${fmt(Math.round(totals.omzet / weeks))}` },
      { label: 'Rata-rata Qty/Nota', value: totals.n > 0 ? fmt((totals.q / totals.n).toFixed(2)) : '0,00' },
      { label: 'Rata-rata Omzet/Nota', value: totals.n > 0 ? `Rp ${fmt(Math.round(totals.omzet / totals.n))}` : 'Rp 0' },
      { label: 'Rata rata Omzet/Qty', value: totals.q > 0 ? `Rp ${fmt(Math.round(totals.omzet / totals.q))}` : 'Rp 0' },
    ]
  }, [totals, detailData])

  // ── Export ─────────────────────────────────────────────────────────
  const title = `Laporan Tren Penjualan / ${activeTab === 'product' ? 'Per Produk' : 'Per Kategori'}`

  const exportToPDF = () => {
    try {
      const doc = new jsPDF()
      doc.setFontSize(14)
      doc.text(title, 14, 20)
      doc.setFontSize(10)
      doc.text(`Tahun: ${year}`, 14, 28)
      doc.text(`${activeTab === 'product' ? 'Produk' : 'Kategori'}: ${activeTab === 'product' ? selectedProduct : selectedCategory}`, 14, 34)

      const headers = ['No.', 'Minggu', 'N', 'Q', 'Omzet']
      const body = detailData.map(r => [String(r.no), r.minggu, String(r.n), String(r.q), fmt(r.omzet)])
      body.push(['', 'Total', String(totals.n), String(totals.q), fmt(totals.omzet)])

      autoTable(doc, {
        head: [headers],
        body: body,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [228, 229, 231], textColor: [51, 51, 51], fontStyle: 'bold' },
        styles: { fontSize: 8 },
      })

      doc.save(`Trend_Penjualan_${year}.pdf`)
    } catch (err) {
      console.error('PDF Export Error:', err)
      alert('Gagal export PDF.')
    }
  }

  const exportToExcel = () => {
    const rows = detailData.map(r => ({
      'No.': r.no,
      'Minggu': r.minggu,
      'N': r.n,
      'Q': r.q,
      'Omzet': r.omzet,
    }))
    rows.push({ 'No.': '', 'Minggu': 'Total', 'N': totals.n, 'Q': totals.q, 'Omzet': totals.omzet })

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Trend')
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    saveAs(new Blob([buf]), `Trend_Penjualan_${year}.xlsx`)
  }

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <Layout title={title}>
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm min-h-[60vh] border border-gray-100 pb-10">

          {/* ── Tabs ──────────────────────────────────────────── */}
          <div className="flex justify-center gap-0 pt-6 mb-4">
            <button
              onClick={() => { setActiveTab('product'); setHasSelected(false); setSelectedProduct(''); }}
              className={`px-6 py-2 text-sm font-medium border transition ${activeTab === 'product' ? 'bg-white text-gray-800 border-gray-300 border-b-white relative z-10' : 'bg-gray-50 text-gray-500 border-gray-200'} rounded-t-md`}
            >
              Per Produk
            </button>
            <button
              onClick={() => { setActiveTab('category'); setHasSelected(false); setSelectedCategory(''); }}
              className={`px-6 py-2 text-sm font-medium border transition ${activeTab === 'category' ? 'bg-white text-gray-800 border-gray-300 border-b-white relative z-10' : 'bg-gray-50 text-gray-500 border-gray-200'} rounded-t-md -ml-px`}
            >
              Per Kategori
            </button>
          </div>

          {/* ── Filter Row ────────────────────────────────────── */}
          <div className="flex items-center justify-between px-6 pb-4">
            {/* Product / Category Dropdown */}
            <div>
              <p className="text-xs font-medium text-gray-600 mb-1">
                {activeTab === 'product' ? 'Pilih Produk:' : 'Pilih Produk Kategori:'}
              </p>
              <select
                value={activeTab === 'product' ? selectedProduct : selectedCategory}
                onChange={e => {
                  const val = e.target.value
                  if (!val) return
                  if (activeTab === 'product') {
                    setSelectedProduct(val)
                  } else {
                    setSelectedCategory(val)
                  }
                  setHasSelected(true)
                }}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 min-w-[180px]"
              >
                <option value="">{activeTab === 'product' ? '[Produk]' : '[Produk Kategori]'}</option>
                {(activeTab === 'product' ? products : categories).map((item, i) => (
                  <option key={i} value={item.Name || item.name}>{item.Name || item.name}</option>
                ))}
              </select>
            </div>

            {/* Export Icons - only when data is shown */}
            {hasSelected && (
              <div className="flex items-center gap-3">
                <button onClick={exportToPDF} className="text-red-600 hover:text-red-800 transition" title="Export PDF">
                  <FaFilePdf size={32} />
                </button>
                <button onClick={exportToExcel} className="text-green-600 hover:text-green-800 transition" title="Export Excel">
                  <FaFileExcel size={32} />
                </button>
              </div>
            )}
          </div>

          {hasSelected && (
            <>

              {/* ── Year Navigator ────────────────────────────────── */}
              <div className="flex items-center justify-center mb-2">
                <button onClick={() => setYear(y => y - 1)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition font-bold text-lg">&laquo;</button>
                <span className="px-6 py-1.5 font-bold text-gray-800 text-sm">{year}</span>
                <button onClick={() => setYear(y => y + 1)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition font-bold text-lg">&raquo;</button>
              </div>

              {/* ── Stat Type Dropdown ────────────────────────────── */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <button
                    onClick={() => setShowStatDropdown(!showStatDropdown)}
                    className="bg-[#4259b5] hover:bg-[#344899] text-white px-4 py-2 rounded text-sm transition flex items-center justify-between min-w-[220px]"
                  >
                    <span className="font-medium">Statistik berdasarkan {statType}</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {showStatDropdown && (
                    <div className="absolute top-full mt-1 left-0 z-10 w-full bg-white border border-gray-200 rounded shadow-lg py-1">
                      {['Qty', 'Nota', 'Omzet'].map(type => (
                        <button key={type} onClick={() => { setStatType(type); setShowStatDropdown(false) }}
                          className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${statType === type ? 'text-gray-800 font-medium' : 'text-gray-600'}`}
                        >
                          Statistik berdasarkan {type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
              ) : (
                <div className="px-6 space-y-6">

                  {/* ── Chart 1: Total Qty Per Minggu (Line Chart) ── */}
                  <div className="rounded-lg border border-[#d5d7dc] overflow-hidden">
                    <div className="bg-[#e4e5e7] py-2 px-4 text-center font-bold text-gray-800 text-sm">
                      Total {statType} Per Minggu
                    </div>
                    <div className="bg-white p-4">
                      <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={weeklyChartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Line type="monotone" dataKey="value" stroke="#6b7280" strokeWidth={2} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* ── Chart 2: Analisis Perhari (Bar Chart) ─────── */}
                  <div className="rounded-lg border border-[#d5d7dc] overflow-hidden">
                    <div className="bg-[#e4e5e7] py-2 px-4 text-center font-bold text-gray-800 text-sm">
                      Analisis Perhari - Rata-rata {statType}
                    </div>
                    <div className="bg-white p-4">
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={dailyChartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#6b7280" radius={[2, 2, 0, 0]} barSize={30} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* ── Chart 3: Analisis Perjam (Bar Chart) ────── */}
                  <div className="rounded-lg border border-[#d5d7dc] overflow-hidden">
                    <div className="bg-[#e4e5e7] py-2 px-4 text-center font-bold text-gray-800 text-sm">
                      Analisis Perjam - Rata-rata {statType}
                    </div>
                    <div className="bg-white p-4">
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={hourlyChartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" tick={{ fontSize: 10 }} reversed />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip />
                          <Bar dataKey="value" fill="#6b7280" radius={[2, 2, 0, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* ── Detail Table ──────────────────────────────── */}
                  <div>
                    <h3 className="text-gray-700 font-semibold mb-2 text-sm">Detail</h3>
                    <div className="rounded-lg border border-[#d5d7dc] overflow-hidden">
                      <table className="w-full text-sm text-center">
                        <thead className="bg-[#e4e5e7]">
                          <tr>
                            <th className="px-3 py-2 font-bold text-gray-800 border-r border-[#d5d7dc] w-14">
                              <div className="flex items-center justify-center gap-1">No. <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5 10l5-5 5 5H5z" /></svg></div>
                            </th>
                            <th className="px-3 py-2 font-bold text-gray-800 border-r border-[#d5d7dc]">
                              <div className="flex items-center justify-center gap-1">Minggu <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5 10l5-5 5 5H5z" /></svg></div>
                            </th>
                            <th className="px-3 py-2 font-bold text-gray-800 border-r border-[#d5d7dc] w-20">N</th>
                            <th className="px-3 py-2 font-bold text-gray-800 border-r border-[#d5d7dc] w-20">Q</th>
                            <th className="px-3 py-2 font-bold text-gray-800 w-28">Omzet</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#d5d7dc]">
                          {detailData.length > 0 ? detailData.map(row => (
                            <tr key={row.no} className="bg-white hover:bg-gray-50">
                              <td className="px-3 py-2 text-gray-700 border-r border-[#d5d7dc]">{row.no}</td>
                              <td className="px-3 py-2 text-gray-700 border-r border-[#d5d7dc] text-left pl-4">{row.minggu}</td>
                              <td className="px-3 py-2 text-gray-700 border-r border-[#d5d7dc]">{row.n}</td>
                              <td className="px-3 py-2 text-gray-700 border-r border-[#d5d7dc]">{row.q}</td>
                              <td className="px-3 py-2 text-gray-700 text-right pr-4">{fmt(row.omzet)}</td>
                            </tr>
                          )) : (
                            <tr className="bg-white">
                              <td colSpan={5} className="px-4 py-3 text-gray-500">Tidak ada data</td>
                            </tr>
                          )}
                          <tr className="bg-[#f8f9fa] border-t-2 border-[#d5d7dc]">
                            <td colSpan={2} className="px-3 py-2 font-bold text-gray-800 text-right pr-4">Total</td>
                            <td className="px-3 py-2 font-bold text-gray-800 border-x border-[#d5d7dc]">{totals.n}</td>
                            <td className="px-3 py-2 font-bold text-gray-800 border-r border-[#d5d7dc]">{totals.q}</td>
                            <td className="px-3 py-2 font-bold text-gray-800 text-right pr-4">{fmt(totals.omzet)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ── Summary Stats ─────────────────────────────── */}
                  <div className="rounded-lg border border-[#d5d7dc] overflow-hidden">
                    <div className="bg-[#e4e5e7] py-2 px-4 text-center font-bold text-gray-800 text-sm border-b border-[#d5d7dc]">
                      1 {MONTHS_ID[0]} {year} - 31 {MONTHS_ID[11]} {year}
                    </div>
                    {summaryStats.map((s, i) => (
                      <div key={i} className={`px-4 py-2 flex justify-between items-center text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${i < summaryStats.length - 1 ? 'border-b border-[#d5d7dc]' : ''}`}>
                        <span className="text-gray-700">{s.label}</span>
                        <span className="text-gray-800 font-medium pr-2">{s.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* ── Payment Method Table ──────────────────────── */}
                  <div className="rounded-lg border border-[#d5d7dc] overflow-hidden">
                    <div className="bg-[#e4e5e7] py-2 px-4 text-center font-bold text-gray-800 border-b border-[#d5d7dc] text-sm">
                      Metode Pembayaran
                    </div>
                    <div className="bg-white px-4 py-3 flex justify-between items-center text-sm font-semibold text-gray-700">
                      <span>Total Penjualan</span>
                      <span className="pr-2">{fmt(totals.omzet)}</span>
                    </div>
                  </div>

                </div>
              )}

            </>
          )}

        </div>
      </div>
    </Layout>
  )
}