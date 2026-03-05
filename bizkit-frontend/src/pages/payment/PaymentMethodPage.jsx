import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import api from '../../api/axios'

export default function PaymentMethodPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ open: false, mode: 'add', item: null })
  const [confirm, setConfirm] = useState({ open: false, id: null })
  const [form, setForm] = useState({ name: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get('/payment-methods')
      setData(res.data.data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const filtered = data.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase())
  )
  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    try {
      if (modal.mode === 'add') await api.post('/payment-methods', { name: form.name })
      else await api.put(`/payment-methods/${modal.item.ID}`, { name: form.name })
      fetchData()
      setModal({ open: false })
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/payment-methods/${confirm.id}`)
      fetchData()
    } catch (err) { console.error(err) }
    finally { setConfirm({ open: false, id: null }) }
  }

  const columns = [
    { key: 'no', label: 'No', render: (row) => filtered.indexOf(row) + 1 },
    { key: 'name', label: 'Metode Pembayaran' },
    {
      key: 'aksi', label: 'Aksi',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => { setForm({ name: row.name }); setModal({ open: true, mode: 'edit', item: row }) }} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs transition">Edit</button>
          <button onClick={() => setConfirm({ open: true, id: row.ID })} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs transition">Hapus</button>
        </div>
      )
    },
  ]
  return (
    <Layout title="Metode Pembayaran">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Metode Pembayaran</h1>
            <p className="text-gray-500 text-sm">Kelola metode pembayaran</p>
          </div>
          <button onClick={() => { setForm({ name: '' }); setModal({ open: true, mode: 'add' }) }} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Tambah
          </button>
        </div>
        <div className="mb-4">
          <input type="text" placeholder="Cari metode pembayaran..." value={search} onChange={e => setSearch(e.target.value)} className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <Table columns={columns} data={filtered} loading={loading} />
        <Modal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === 'add' ? 'Tambah Metode Pembayaran' : 'Edit Metode Pembayaran'}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Metode</label>
              <input type="text" value={form.name} onChange={e => setForm({ name: e.target.value })} placeholder="Contoh: Cash, QRIS, Transfer" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" onKeyDown={e => e.key === 'Enter' && handleSave()} />
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