import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import api from '../../api/axios'

export default function UserPage() {
  const [data, setData] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ open: false, mode: 'add', item: null })
  const [confirm, setConfirm] = useState({ open: false, id: null })
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', username: '', password: '', role_id: '' })

  useEffect(() => { fetchData(); fetchRoles() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get('/users')
      setData(res.data.data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles')
      setRoles(res.data.data || [])
    } catch (err) { console.error(err) }
  }

  const filtered = data.filter(d =>
    d.Name?.toLowerCase().includes(search.toLowerCase()) ||
    d.Username?.toLowerCase().includes(search.toLowerCase())
  )

  const openAdd = () => {
    setForm({ name: '', username: '', password: '', role_id: '' })
    setModal({ open: true, mode: 'add', item: null })
  }

  const openEdit = (item) => {
    setForm({ name: item.Name, username: item.Username, password: '', role_id: item.RoleID || '' })
    setModal({ open: true, mode: 'edit', item })
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.username.trim()) return
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        username: form.username,
        role_id: form.role_id ? Number(form.role_id) : null,
        ...(form.password && { password: form.password })
      }
      if (modal.mode === 'add') {
        await api.post('/users', { ...payload, password: form.password })
      } else {
        await api.put(`/users/${modal.item.ID}`, payload)
      }
      fetchData()
      setModal({ open: false })
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${confirm.id}`)
      fetchData()
    } catch (err) { console.error(err) }
    finally { setConfirm({ open: false, id: null }) }
  }

  const columns = [
    { key: 'no', label: 'No', render: (row) => filtered.indexOf(row) + 1 },
    { key: 'Name', label: 'Nama' },
    { key: 'Username', label: 'Username' },
    { key: 'role', label: 'Role', render: (row) => (
      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
        {row.role?.Name || '-'}
      </span>
    )},
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
    <Layout title="User">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">User</h1>
            <p className="text-gray-500 text-sm">Kelola data pengguna sistem</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Tambah
          </button>
        </div>
        <div className="mb-4">
          <input type="text" placeholder="Cari user..." value={search} onChange={e => setSearch(e.target.value)} className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <Table columns={columns} data={filtered} loading={loading} />

        <Modal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === 'add' ? 'Tambah User' : 'Edit User'}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Masukkan nama" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} placeholder="Masukkan username" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password {modal.mode === 'edit' && <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span>}
              </label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Masukkan password" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select value={form.role_id} onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                <option value="">Pilih Role</option>
                {roles.map(r => <option key={r.ID} value={r.ID}>{r.Name}</option>)}
              </select>
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