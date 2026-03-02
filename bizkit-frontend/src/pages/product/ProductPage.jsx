import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import api from '../../api/axios'

export default function ProductPage() {
  const [data, setData] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [units, setUnits] = useState([])
  const [variants, setVariants] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ open: false, mode: 'add', item: null })
  const [confirm, setConfirm] = useState({ open: false, id: null })
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', category_id: '', brand_id: '', unit_id: '',
    price: '', status: 'active', variant_ids: []
  })

  useEffect(() => {
    fetchData()
    fetchMasterData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get('/products')
      setData(res.data.data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const fetchMasterData = async () => {
    try {
      const [catRes, brandRes, unitRes, variantRes] = await Promise.all([
        api.get('/categories'),
        api.get('/brands'),
        api.get('/units'),
        api.get('/variants'),
      ])
      setCategories(catRes.data.data || [])
      setBrands(brandRes.data.data || [])
      setUnits(unitRes.data.data || [])
      setVariants(variantRes.data.data || [])
    } catch (err) { console.error(err) }
  }

  const filtered = data.filter(d => d.Name?.toLowerCase().includes(search.toLowerCase()))

  const resetForm = () => setForm({
    name: '', category_id: '', brand_id: '', unit_id: '',
    price: '', status: 'active', variant_ids: []
  })

  const openAdd = () => { resetForm(); setModal({ open: true, mode: 'add', item: null }) }

  const openEdit = (item) => {
    setForm({
      name: item.Name,
      category_id: item.CategoryID || '',
      brand_id: item.BrandID || '',
      unit_id: item.UnitID || '',
      price: item.Price,
      status: item.Status,
      variant_ids: item.variants?.map(v => v.ID) || []
    })
    setModal({ open: true, mode: 'edit', item })
  }

  const toggleVariant = (id) => {
    setForm(f => ({
      ...f,
      variant_ids: f.variant_ids.includes(id)
        ? f.variant_ids.filter(v => v !== id)
        : [...f.variant_ids, id]
    }))
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return
    setSaving(true)
    try {
      const payload = {
        name: form.name,
        category_id: form.category_id ? Number(form.category_id) : null,
        brand_id: form.brand_id ? Number(form.brand_id) : null,
        unit_id: form.unit_id ? Number(form.unit_id) : null,
        price: Number(form.price),
        status: form.status,
        variant_ids: form.variant_ids
      }
      if (modal.mode === 'add') await api.post('/products', payload)
      else await api.put(`/products/${modal.item.ID}`, payload)
      fetchData()
      setModal({ open: false })
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${confirm.id}`)
      fetchData()
    } catch (err) { console.error(err) }
    finally { setConfirm({ open: false, id: null }) }
  }

  const columns = [
    { key: 'no', label: 'No', render: (row) => filtered.indexOf(row) + 1 },
    { key: 'Name', label: 'Nama Produk' },
    { key: 'category', label: 'Kategori', render: (row) => row.category?.Name || '-' },
    { key: 'price', label: 'Harga Jual', render: (row) => `Rp ${Number(row.Price).toLocaleString('id-ID')}` },
    {
      key: 'status', label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.Status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {row.Status === 'active' ? 'Aktif' : 'Nonaktif'}
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
    <Layout title="Produk">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Produk</h1>
            <p className="text-gray-500 text-sm">Kelola data produk</p>
          </div>
          <button onClick={openAdd} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Tambah
          </button>
        </div>
        <div className="mb-4">
          <input type="text" placeholder="Cari produk..." value={search} onChange={e => setSearch(e.target.value)} className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <Table columns={columns} data={filtered} loading={loading} />

        {/* Modal */}
        <Modal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === 'add' ? 'Tambah Produk' : 'Edit Produk'}>
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
              <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Masukkan nama produk" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  <option value="">Pilih Kategori</option>
                  {categories.map(c => <option key={c.ID} value={c.ID}>{c.Name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Merek</label>
                <select value={form.brand_id} onChange={e => setForm(f => ({ ...f, brand_id: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  <option value="">Pilih Merek</option>
                  {brands.map(b => <option key={b.ID} value={b.ID}>{b.Name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
                <select value={form.unit_id} onChange={e => setForm(f => ({ ...f, unit_id: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  <option value="">Pilih Satuan</option>
                  {units.map(u => <option key={u.ID} value={u.ID}>{u.Name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
            {variants.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Varian</label>
                <div className="flex flex-wrap gap-2">
                  {variants.map(v => (
                    <button
                      key={v.ID}
                      type="button"
                      onClick={() => toggleVariant(v.ID)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${form.variant_ids.includes(v.ID) ? 'bg-emerald-600 text-white border-emerald-600' : 'border-gray-200 text-gray-600 hover:border-emerald-400'}`}
                    >
                      {v.Name}
                    </button>
                  ))}
                </div>
              </div>
            )}
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