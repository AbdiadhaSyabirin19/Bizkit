import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import api from '../../api/axios'

const STATUS_TABS = [
  { label: 'Semua', value: '' },
  { label: 'Aktif', value: 'active' },
  { label: 'Akan Datang', value: 'upcoming' },
  { label: 'Tidak Aktif', value: 'inactive' },
  { label: 'Selesai', value: 'finished' },
]

const STATUS_BADGE = {
  active: 'bg-green-100 text-green-700',
  upcoming: 'bg-blue-100 text-blue-700',
  inactive: 'bg-gray-100 text-gray-500',
  finished: 'bg-red-100 text-red-500',
}

const STATUS_LABEL = {
  active: 'Aktif',
  upcoming: 'Akan Datang',
  inactive: 'Tidak Aktif',
  finished: 'Selesai',
}

export default function PromoPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('')
  const [modal, setModal] = useState({ open: false, mode: 'add', item: null })
  const [confirm, setConfirm] = useState({ open: false, id: null })
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', code: '', type: 'percentage', value: '',
    start_date: '', end_date: '', min_purchase: '', usage_limit: ''
  })

  useEffect(() => { fetchData() }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/promos${activeTab ? `?status=${activeTab}` : ''}`)
      setData(res.data.data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const resetForm = () => setForm({
    name: '', code: '', type: 'percentage', value: '',
    start_date: '', end_date: '', min_purchase: '', usage_limit: ''
  })

  const openEdit = (item) => {
    setForm({
      name: item.name,
      code: item.code,
      type: item.type,
      value: item.value,
      start_date: item.start_date?.split('T')[0] || '',
      end_date: item.end_date?.split('T')[0] || '',
      min_purchase: item.min_purchase,
      usage_limit: item.usage_limit
    })
    setModal({ open: true, mode: 'edit', item })
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.value || !form.start_date || !form.end_date) return
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        code: form.code,
        type: form.type,
        value: Number(form.value),
        start_date: new Date(form.start_date).toISOString(),
        end_date: new Date(form.end_date).toISOString(),
        min_purchase: Number(form.min_purchase) || 0,
        usage_limit: Number(form.usage_limit) || 0,
      }
      if (modal.mode === 'add') await api.post('/promos', payload)
      else await api.put(`/promos/${modal.item.ID}`, payload)
      fetchData()
      setModal({ open: false })
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/promos/${confirm.id}`)
      fetchData()
    } catch (err) { console.error(err) }
    finally { setConfirm({ open: false, id: null }) }
  }

  const columns = [
    { key: 'name', label: 'Nama Promo' },
    { key: 'code', label: 'Kode' },
    { key: 'type', label: 'Jenis', render: (row) => row.type === 'percentage' ? `${row.value}%` : `Rp ${Number(row.value).toLocaleString('id-ID')}` },
    { key: 'date', label: 'Periode', render: (row) => `${row.start_date?.split('T')[0]} s/d ${row.end_date?.split('T')[0]}` },
    { key: 'usage', label: 'Sisa', render: (row) => `${row.usage_remaining}/${row.usage_limit || '∞'}` },
    {
      key: 'status', label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[row.status] || 'bg-gray-100 text-gray-500'}`}>
          {STATUS_LABEL[row.status] || row.status}
        </span>
      )
    },
    {
      key: 'aksi', label: 'Aksi',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs transition">Edit</button>
          <button onClick={() => setConfirm({ open: true, id: row.ID })} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs transition">Hapus</button>
        </div>
      )
    },
  ]

  return (
    <Layout title="Promo & Voucher">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Promo & Voucher</h1>
            <p className="text-gray-500 text-sm">Kelola promo dan voucher</p>
          </div>
          <button onClick={() => { resetForm(); setModal({ open: true, mode: 'add' }) }} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Tambah
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {STATUS_TABS.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${activeTab === tab.value ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Table columns={columns} data={data} loading={loading} />

        <Modal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === 'add' ? 'Tambah Promo' : 'Edit Promo'}>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Promo</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama promo" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kode Voucher</label>
              <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="Contoh: LEBARAN10 (opsional)" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Promo</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  <option value="percentage">Persentase (%)</option>
                  <option value="fixed">Nominal (Rp)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nilai</label>
                <input type="number" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} placeholder={form.type === 'percentage' ? '10' : '5000'} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Berakhir</label>
                <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min. Pembelian</label>
                <input type="number" value={form.min_purchase} onChange={e => setForm(f => ({ ...f, min_purchase: e.target.value }))} placeholder="0" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batas Penukaran</label>
                <input type="number" value={form.usage_limit} onChange={e => setForm(f => ({ ...f, usage_limit: e.target.value }))} placeholder="0 = tidak terbatas" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal({ open: false })} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium transition">Batal</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-xl text-sm font-medium transition">{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </Modal>

        <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ open: false })} onConfirm={handleDelete} />
      </div>
    </Layout>
  )
}