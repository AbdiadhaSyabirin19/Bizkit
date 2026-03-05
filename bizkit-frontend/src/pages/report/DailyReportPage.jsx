import { useState, useEffect, useMemo } from 'react'
import Layout from '../../components/Layout'
import api from '../../api/axios'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import { FaFilePdf, FaFileExcel } from 'react-icons/fa'

// ── Helper Functions ─────────────────────────────────────────────────
const fmt = (n) => Number(n || 0).toLocaleString('id-ID')
const toISO = (d) => d.toISOString().split('T')[0]

const getWeekRange = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const start = new Date(d.setDate(diff))
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  return { start: toISO(start), end: toISO(end) }
}

const getMonthRange = (date) => {
  const d = new Date(date)
  const start = new Date(d.getFullYear(), d.getMonth(), 1)
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return { start: toISO(start), end: toISO(end) }
}

const getYearRange = (date) => {
  const d = new Date(date)
  const start = new Date(d.getFullYear(), 0, 1)
  const end = new Date(d.getFullYear(), 11, 31)
  return { start: toISO(start), end: toISO(end) }
}

const PERIOD_OPTIONS = ['Harian', 'Mingguan', 'Bulanan', 'Tahunan', 'Custom Range']

const PERIOD_TITLES = {
  Harian: 'Laporan Penjualan Harian',
  Mingguan: 'Laporan Penjualan Mingguan',
  Bulanan: 'Laporan Penjualan Bulanan',
  Tahunan: 'Laporan Penjualan Tahunan',
  'Custom Range': 'Laporan Penjualan Custom',
}

const MONTHS_ID = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const DAYS_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

// ── Component ────────────────────────────────────────────────────────
export default function DailyReportPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('Harian')
  const [showPeriodDropdown, setShowPeriodDropdown] = useState(false)

  // Date states
  const [date, setDate] = useState(toISO(new Date()))
  const [customStart, setCustomStart] = useState(toISO(new Date()))
  const [customEnd, setCustomEnd] = useState(toISO(new Date()))
  const [showCustomPicker, setShowCustomPicker] = useState(false)

  // Stat dropdown
  const [statType, setStatType] = useState('Qty')
  const [showStatDropdown, setShowStatDropdown] = useState(false)

  // ── Date Range Computation ───────────────────────────────────────
  const dateRange = useMemo(() => {
    switch (period) {
      case 'Harian':
        return { start: date, end: date }
      case 'Mingguan':
        return getWeekRange(date)
      case 'Bulanan':
        return getMonthRange(date)
      case 'Tahunan':
        return getYearRange(date)
      case 'Custom Range':
        return { start: customStart, end: customEnd }
      default:
        return { start: date, end: date }
    }
  }, [period, date, customStart, customEnd])

  // ── Fetch Data ───────────────────────────────────────────────────
  useEffect(() => {
    fetchData()
  }, [dateRange])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/sales/daily?date=${dateRange.start}&start_date=${dateRange.start}&end_date=${dateRange.end}`)
      setData(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ── Export to PDF ──────────────────────────────────────────────────
  const exportToPDF = () => {
    try {
      const doc = new jsPDF()
      const title = PERIOD_TITLES[period] || 'Laporan Penjualan'
      doc.setFontSize(16)
      doc.text(title, 14, 20)
      doc.setFontSize(10)
      doc.text(`Periode: ${dateLabel}`, 14, 28)

      const headers = tableHeaders
      const body = []

      if (period === 'Harian' && data?.sales?.length > 0) {
        data.sales.forEach((sale, idx) => {
          body.push([
            String(idx + 1),
            new Date(sale.CreatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            '-',
            sale.payment_method?.Name || '-',
            '1',
            fmt(sale.GrandTotal)
          ])
        })
      }
      if (body.length === 0) {
        body.push(['', '', 'Tidak ada data', '', '', ''])
      }
      body.push([
        '', '', '', 'Total',
        String(data?.total_qty || 0),
        fmt(data?.total_omzet)
      ])

      autoTable(doc, {
        head: [headers],
        body: body,
        startY: 34,
        theme: 'grid',
        headStyles: { fillColor: [228, 229, 231], textColor: [51, 51, 51], fontStyle: 'bold' },
        styles: { fontSize: 9 },
      })

      doc.save(`${title.replace(/ /g, '_')}_${dateRange.start}.pdf`)
    } catch (err) {
      console.error('PDF Export Error:', err)
      alert('Gagal export PDF. Silakan coba lagi.')
    }
  }

  // ── Export to Excel ────────────────────────────────────────────────
  const exportToExcel = () => {
    const title = PERIOD_TITLES[period] || 'Laporan Penjualan'
    const rows = []

    if (period === 'Harian' && data?.sales?.length > 0) {
      data.sales.forEach((sale, idx) => {
        rows.push({
          'No.': idx + 1,
          'Waktu': new Date(sale.CreatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          'Cust': '-',
          'Bayar': sale.payment_method?.Name || '-',
          'Q': 1,
          'Total': Number(sale.GrandTotal || 0),
        })
      })
    }
    rows.push({
      'No.': '',
      'Waktu': 'Total',
      'Cust': '',
      'Bayar': '',
      'Q': data?.total_qty || 0,
      'Total': Number(data?.total_omzet || 0),
    })

    const ws = XLSX.utils.json_to_sheet(rows)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan')
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
    saveAs(blob, `${title.replace(/ /g, '_')}_${dateRange.start}.xlsx`)
  }

  // ── Navigation ───────────────────────────────────────────────────
  const navigate = (direction) => {
    const d = new Date(date)
    const delta = direction === 'prev' ? -1 : 1

    switch (period) {
      case 'Harian':
        d.setDate(d.getDate() + delta)
        break
      case 'Mingguan':
        d.setDate(d.getDate() + delta * 7)
        break
      case 'Bulanan':
        d.setMonth(d.getMonth() + delta)
        break
      case 'Tahunan':
        d.setFullYear(d.getFullYear() + delta)
        break
      default:
        break
    }
    setDate(toISO(d))
  }

  // ── Date Display Label ───────────────────────────────────────────
  const dateLabel = useMemo(() => {
    const d = new Date(date)
    switch (period) {
      case 'Harian':
        return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
      case 'Mingguan': {
        const wr = getWeekRange(date)
        const s = new Date(wr.start)
        const e = new Date(wr.end)
        return `${s.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })} - ${e.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })}`
      }
      case 'Bulanan':
        return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
      case 'Tahunan':
        return d.getFullYear().toString()
      case 'Custom Range':
        return `${new Date(customStart).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })} - ${new Date(customEnd).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' })}`
      default:
        return ''
    }
  }, [period, date, customStart, customEnd])

  // ── Period change handler ────────────────────────────────────────
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod)
    setShowPeriodDropdown(false)
    if (newPeriod === 'Custom Range') {
      setShowCustomPicker(true)
    } else {
      setShowCustomPicker(false)
    }
  }

  // ── Summary Period Label ─────────────────────────────────────────
  const summaryLabel = useMemo(() => {
    if (period === 'Mingguan') {
      const wr = getWeekRange(date)
      const s = new Date(wr.start)
      const e = new Date(wr.end)
      return `${s.getDate()} ${MONTHS_ID[s.getMonth()]} ${s.getFullYear()} - ${e.getDate()} ${MONTHS_ID[e.getMonth()]} ${e.getFullYear()}`
    }
    if (period === 'Bulanan') {
      const mr = getMonthRange(date)
      const s = new Date(mr.start)
      const e = new Date(mr.end)
      return `${s.getDate()} ${MONTHS_ID[s.getMonth()]} ${s.getFullYear()} - ${e.getDate()} ${MONTHS_ID[e.getMonth()]} ${e.getFullYear()}`
    }
    if (period === 'Tahunan') {
      const yr = getYearRange(date)
      const s = new Date(yr.start)
      const e = new Date(yr.end)
      return `${s.getDate()} ${MONTHS_ID[s.getMonth()]} ${s.getFullYear()} - ${e.getDate()} ${MONTHS_ID[e.getMonth()]} ${e.getFullYear()}`
    }
    if (period === 'Custom Range') {
      const s = new Date(customStart)
      const e = new Date(customEnd)
      return `${s.getDate()} ${MONTHS_ID[s.getMonth()]} ${s.getFullYear()} - ${e.getDate()} ${MONTHS_ID[e.getMonth()]} ${e.getFullYear()}`
    }
    return ''
  }, [period, date, customStart, customEnd])

  // ── Table headers based on period ────────────────────────────────
  const tableHeaders = useMemo(() => {
    switch (period) {
      case 'Harian':
        return ['No.', 'Waktu', 'Cust', 'Bayar', 'Q', 'Total']
      case 'Mingguan':
        return ['No.', 'Hari', 'Tgl', 'N', 'Q', 'Omzet']
      case 'Bulanan':
        return ['No.', 'Hari', 'Tgl', 'N', 'Q', 'Omzet']
      case 'Tahunan':
        return ['No.', 'Bulan', 'N', 'Q', 'Omzet']
      case 'Custom Range':
        return ['No.', 'Tgl', 'N', 'Q', 'Omzet']
      default:
        return ['No.', 'Waktu', 'Cust', 'Bayar', 'Q', 'Total']
    }
  }, [period])

  // ── Render Rows based on period ──────────────────────────────────
  const renderRows = () => {
    if (period === 'Harian') {
      if (data?.sales?.length > 0) {
        return data.sales.map((sale, idx) => (
          <tr key={sale.ID} className="bg-white hover:bg-gray-50">
            <td className="px-4 py-2 text-gray-700 border-x border-[#d5d7dc]">{idx + 1}</td>
            <td className="px-4 py-2 text-gray-700 border-x border-[#d5d7dc]">{new Date(sale.CreatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
            <td className="px-4 py-2 text-gray-700 border-x border-[#d5d7dc]">-</td>
            <td className="px-4 py-2 text-gray-700 border-x border-[#d5d7dc]">{sale.payment_method?.Name || '-'}</td>
            <td className="px-4 py-2 text-gray-700 border-x border-[#d5d7dc]">1</td>
            <td className="px-4 py-2 text-gray-700 border-x border-[#d5d7dc] text-right pr-6">{fmt(sale.GrandTotal)}</td>
          </tr>
        ))
      }
    }
    // For non-Harian, show empty data since backend doesn't return grouped data yet
    return (
      <tr className="bg-white">
        <td colSpan={tableHeaders.length} className="px-4 py-3 text-left pl-6 text-gray-700">Tidak ada data</td>
      </tr>
    )
  }

  // ── Render Total Row ─────────────────────────────────────────────
  const renderTotalRow = () => {
    const colSpan = period === 'Tahunan' ? tableHeaders.length - 3 : tableHeaders.length - 2
    return (
      <tr className="bg-[#f8f9fa] border-t-2 border-[#d5d7dc]">
        <td colSpan={colSpan} className="px-4 py-2 font-bold text-gray-800 text-right pr-12">Total</td>
        {period === 'Tahunan' || period !== 'Harian' ? (
          <>
            <td className="px-4 py-2 font-bold text-gray-800 border-x border-[#d5d7dc] text-center">{data?.total_nota || 0}</td>
            <td className="px-4 py-2 font-bold text-gray-800 border-x border-[#d5d7dc] text-center">{data?.total_qty || 0}</td>
            <td className="px-4 py-2 font-bold text-gray-800 text-right pr-6">{fmt(data?.total_omzet)}</td>
          </>
        ) : (
          <>
            <td className="px-4 py-2 font-bold text-gray-800 border-x border-[#d5d7dc] text-center">{data?.total_qty || 0}</td>
            <td className="px-4 py-2 font-bold text-gray-800 text-right pr-6">{fmt(data?.total_omzet)}</td>
          </>
        )}
      </tr>
    )
  }

  // ── Render Summary (for non-Harian) ──────────────────────────────
  const renderSummary = () => {
    if (period === 'Harian') return null
    const stats = [
      { label: 'Rata-rata Nota', value: fmt(data?.avg_nota || '0,00') },
      { label: 'Rata-rata Qty', value: fmt(data?.avg_qty || '0,00') },
      { label: 'Rata-rata Omzet', value: `Rp ${fmt(data?.avg_omzet)}` },
      { label: 'Rata-rata Qty/Nota', value: fmt(data?.avg_qty_nota || '0,00') },
      { label: 'Rata-rata Omzet/Nota', value: `Rp ${fmt(data?.avg_omzet_nota)}` },
      { label: 'Rata rata Omzet/Qty', value: `Rp ${fmt(data?.avg_omzet_qty)}` },
    ]
    return (
      <div className="rounded-lg border border-[#d5d7dc] overflow-hidden">
        <div className="bg-[#e4e5e7] py-2 px-4 text-center font-bold text-gray-800 border-b border-[#d5d7dc] text-sm">
          {summaryLabel}
        </div>
        {stats.map((s, i) => (
          <div key={i} className={`px-4 py-2 flex justify-between items-center text-sm ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${i < stats.length - 1 ? 'border-b border-[#d5d7dc]' : ''}`}>
            <span className="text-gray-700">{s.label}</span>
            <span className="text-gray-800 font-medium pr-2">{s.value}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Layout title={PERIOD_TITLES[period] || 'Penjualan Harian'}>
      <div className="max-w-7xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow-sm min-h-[60vh] border border-gray-100 pb-10">

          {/* ── Top Filter Bar ────────────────────────────────────── */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">

            {/* Period Dropdown (Left) */}
            <div className="flex items-center">
              <div className="relative">
                <button
                  onClick={() => setShowPeriodDropdown(!showPeriodDropdown)}
                  className="flex items-center gap-1 hover:bg-gray-50 px-3 py-1.5 rounded transition"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium text-gray-700 text-sm">{period}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Period Dropdown Menu */}
                {showPeriodDropdown && (
                  <div className="absolute top-full left-0 z-20 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg py-1">
                    {PERIOD_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => handlePeriodChange(opt)}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${period === opt ? 'bg-[#0097a7] text-white font-medium' : 'text-gray-700'}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Date Navigator (Center) — hidden for Custom Range */}
            {period !== 'Custom Range' ? (
              <div className="flex-1 flex justify-center items-center">
                <button onClick={() => navigate('prev')} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition font-bold text-lg" title="Sebelumnya">
                  &laquo;
                </button>

                {period === 'Harian' && (
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400 w-36 mx-4 font-bold text-gray-800"
                  />
                )}

                {period !== 'Harian' && (
                  <span className="px-4 py-1.5 font-bold text-gray-800 text-sm min-w-[160px] text-center">
                    {dateLabel}
                  </span>
                )}

                <button onClick={() => navigate('next')} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition font-bold text-lg" title="Selanjutnya">
                  &raquo;
                </button>
              </div>
            ) : (
              <div className="flex-1" />
            )}

            {/* Export Actions (Right) */}
            <div className="flex items-center gap-3">
              <button onClick={exportToPDF} className="text-red-600 hover:text-red-800 transition" title="Export PDF">
                <FaFilePdf size={32} />
              </button>
              <button onClick={exportToExcel} className="text-green-600 hover:text-green-800 transition" title="Export Excel">
                <FaFileExcel size={32} />
              </button>
            </div>
          </div>

          {/* ── Custom Range Picker (shown inline when Custom Range selected) ── */}
          {period === 'Custom Range' && showCustomPicker && (
            <div className="flex items-center gap-3 px-6 py-3 bg-gray-50 border-b border-gray-200">
              <label className="text-sm text-gray-600 font-medium">Dari:</label>
              <input
                type="date"
                value={customStart}
                onChange={e => setCustomStart(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
              />
              <label className="text-sm text-gray-600 font-medium">Sampai:</label>
              <input
                type="date"
                value={customEnd}
                onChange={e => setCustomEnd(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:border-gray-400"
              />
              <button
                onClick={() => setShowCustomPicker(false)}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowCustomPicker(false); fetchData() }}
                className="px-4 py-1.5 bg-[#0097a7] text-white rounded text-sm font-medium hover:bg-[#00838f] transition"
              >
                Apply
              </button>
            </div>
          )}

          {/* ── Tahunan: Dirinci Bulanan / Mingguan toggle ─────── */}
          {period === 'Tahunan' && (
            <div className="flex items-center gap-4 px-6 pt-4">
              <label className="flex items-center gap-2 border border-gray-300 rounded px-4 py-2 cursor-pointer">
                <input type="radio" name="rinci" defaultChecked className="accent-[#0097a7]" />
                <span className="text-sm text-gray-700 font-medium">Dirinci Bulanan</span>
              </label>
              <label className="flex items-center gap-2 border border-gray-300 rounded px-4 py-2 cursor-pointer">
                <input type="radio" name="rinci" className="accent-[#0097a7]" />
                <span className="text-sm text-gray-700 font-medium">Dirinci Mingguan</span>
              </label>
            </div>
          )}

          {/* ── Main Content ──────────────────────────────────────── */}
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : (
            <div className="px-10 py-6 space-y-8">

              {/* 1. Main Data Table */}
              <div className="rounded-lg border border-[#d5d7dc] overflow-hidden">
                <table className="w-full text-sm text-center">
                  <thead className="bg-[#e4e5e7]">
                    <tr>
                      {tableHeaders.map(h => (
                        <th key={h} className="px-4 py-2 font-bold text-gray-800 border-x border-[#d5d7dc] first:border-l-0 last:border-r-0">
                          <div className="flex items-center justify-center gap-1">
                            {h}
                            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path d="M5 10l5-5 5 5H5z" /></svg>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#d5d7dc]">
                    {renderRows()}
                    {renderTotalRow()}
                  </tbody>
                </table>
              </div>

              {/* 2. Summary Stats (non-Harian only) */}
              {renderSummary()}

              {/* 3. Payment Method Summary Table */}
              <div className="rounded-lg border border-[#d5d7dc] overflow-hidden">
                <div className="bg-[#e4e5e7] py-2 px-4 text-center font-bold text-gray-800 border-b border-[#d5d7dc]">
                  Metode Pembayaran
                </div>
                <div className="bg-white px-4 py-3 border-b border-[#d5d7dc] flex justify-between items-center text-sm font-semibold text-gray-700">
                  <span>Total Penjualan</span>
                  <span className="pr-2">{fmt(data?.total_omzet)}</span>
                </div>
              </div>

              {/* 4. Product Statistics (Harian only) */}
              {period === 'Harian' && (
                <div className="pt-2">
                  <div className="flex justify-center mb-6">
                    <div className="relative">
                      <button
                        onClick={() => setShowStatDropdown(!showStatDropdown)}
                        className="bg-[#4259b5] hover:bg-[#344899] text-white px-4 py-2 rounded text-sm transition flex items-center justify-between min-w-[200px]"
                      >
                        <span className="font-medium text-[15px]">Statistik berdasarkan {statType}</span>
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      {showStatDropdown && (
                        <div className="absolute top-full mt-1 left-0 z-10 w-full bg-white border border-gray-200 rounded shadow-lg py-1">
                          {['Qty', 'Nota', 'Omzet'].map((type) => (
                            <button
                              key={type}
                              onClick={() => { setStatType(type); setShowStatDropdown(false) }}
                              className={`block w-full text-left px-4 py-2 text-[15px] hover:bg-gray-100 ${statType === type ? 'text-gray-800' : 'text-gray-600'}`}
                            >
                              Statistik berdasarkan {type}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Produk Table */}
                  <div className="mb-6">
                    <h3 className="text-gray-500 font-medium mb-2 text-sm">Produk</h3>
                    <div className="rounded-lg border border-[#d5d7dc] overflow-hidden">
                      <table className="w-full text-sm text-center">
                        <thead className="bg-[#e4e5e7]">
                          <tr>
                            <th className="px-4 py-2 font-bold text-gray-800 border-r border-[#d5d7dc] w-16">No</th>
                            <th className="px-4 py-2 font-bold text-gray-800 border-r border-[#d5d7dc]">Produk</th>
                            <th className="px-4 py-2 font-bold text-gray-800 w-32">{statType}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#d5d7dc]">
                          <tr className="bg-white">
                            <td colSpan={3} className="px-4 py-3 text-left pl-6 text-gray-700">Tidak ada data</td>
                          </tr>
                          <tr className="bg-[#f8f9fa] border-t-2 border-[#d5d7dc]">
                            <td colSpan={2} className="px-4 py-2 font-bold text-gray-800 text-center">Total</td>
                            <td className="px-4 py-2 font-bold text-gray-800 border-l border-[#d5d7dc]">0</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Paket Table */}
                  <div>
                    <h3 className="text-gray-500 font-medium mb-2 text-sm">Paket</h3>
                    <div className="rounded-lg border border-[#d5d7dc] overflow-hidden">
                      <table className="w-full text-sm text-center">
                        <thead className="bg-[#e4e5e7]">
                          <tr>
                            <th className="px-4 py-2 font-bold text-gray-800 border-r border-[#d5d7dc] w-16">No</th>
                            <th className="px-4 py-2 font-bold text-gray-800 border-r border-[#d5d7dc]">Paket</th>
                            <th className="px-4 py-2 font-bold text-gray-800 w-32">{statType}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#d5d7dc]">
                          <tr className="bg-white">
                            <td colSpan={3} className="px-4 py-3 text-left pl-6 text-gray-700">Tidak ada data</td>
                          </tr>
                          <tr className="bg-[#f8f9fa] border-t-2 border-[#d5d7dc]">
                            <td colSpan={2} className="px-4 py-2 font-bold text-gray-800 text-center">Total</td>
                            <td className="px-4 py-2 font-bold text-gray-800 border-l border-[#d5d7dc]">0</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}