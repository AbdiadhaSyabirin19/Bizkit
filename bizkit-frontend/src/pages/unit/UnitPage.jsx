import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import api from '../../api/axios'

export default function UnitPage() {
  const navigate = useNavigate()
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
      const res = await api.get('/units')
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
      if (modal.mode === 'add') await api.post('/units', { name: form.name })
      else await api.put(`/units/${modal.item.ID}`, { name: form.name })
      fetchData()
      setModal({ open: false })
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/units/${confirm.id}`)
      fetchData()
    } catch (err) { console.error(err) }
    finally { setConfirm({ open: false, id: null }) }
  }

  const columns = [
    { key: 'no', label: 'No', render: (row) => filtered.indexOf(row) + 1 },
    { key: 'name', label: 'Satuan' },
    {
      key: 'aksi', label: 'Aksi',
      render: (row) => (
        <div className="flex gap-4">
          <button
            onClick={() => { setForm({ name: row.name }); setModal({ open: true, mode: 'edit', item: row }) }}
            className="text-[#0284c7] hover:text-[#0369a1] transition"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => setConfirm({ open: true, id: row.ID })}
            className="text-[#0284c7] hover:text-[#0369a1] transition"
            title="Hapus"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )
    },
  ]

  return (
    <Layout title="Satuan">
      <div className="w-full relative min-h-[calc(100vh-100px)]">

        {/* Search Bar aligned to right */}
        <div className="flex justify-end mb-4">
          <div className="relative w-64 mr-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
        </div>

        <Table columns={columns} data={filtered} loading={loading} />
        <Modal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === 'add' ? 'Tambah Satuan' : 'Edit Satuan'}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Satuan</label>
              <input type="text" value={form.name} onChange={e => setForm({ name: e.target.value })} placeholder="Contoh: Pcs, Kg, Tray" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" onKeyDown={e => e.key === 'Enter' && handleSave()} />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setModal({ open: false })} className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium transition">Batal</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-xl text-sm font-medium transition">{saving ? 'Menyimpan...' : 'Simpan'}</button>
            </div>
          </div>
        </Modal>
        <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ open: false })} onConfirm={handleDelete} />

        {/* Floating Action Button (Tambah) */}
        <button
          onClick={() => navigate('/units/add')}
          className="fixed bottom-8 right-8 w-14 h-14 bg-[#00A651] hover:bg-[#008f45] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-40"
          title="Tambah Satuan"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

      </div>
    </Layout>
  )
}