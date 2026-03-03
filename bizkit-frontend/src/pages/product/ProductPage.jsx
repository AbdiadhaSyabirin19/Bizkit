import { useState, useEffect, useRef } from 'react'
import Layout from '../../components/Layout'
import Table from '../../components/Table'
import Modal from '../../components/Modal'
import ConfirmDialog from '../../components/ConfirmDialog'
import api from '../../api/axios'

const getID = (row) => row.ID || row.id

export default function ProductPage() {
  const [data, setData] = useState([])
  const [categories, setCategories] = useState([])
  const [brands, setBrands] = useState([])
  const [units, setUnits] = useState([])
  const [variants, setVariants] = useState([])
  const [outlets, setOutlets] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState({ open: false, mode: 'add', item: null })
  const [confirm, setConfirm] = useState({ open: false, id: null })
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const fileRef = useRef()

  const [form, setForm] = useState({
    code: '', name: '', description: '',
    category_id: '', brand_id: '', unit_id: '',
    price: '', extra_price: 0, image: '',
    status: 'active', variant_ids: [], outlet_ids: []
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
      const [catRes, brandRes, unitRes, variantRes, outletRes] = await Promise.all([
        api.get('/categories'),
        api.get('/brands'),
        api.get('/units'),
        api.get('/variants'),
        api.get('/outlets'),
      ])
      setCategories(catRes.data.data || [])
      setBrands(brandRes.data.data || [])
      setUnits(unitRes.data.data || [])
      setVariants(variantRes.data.data || [])
      setOutlets(outletRes.data.data || [])
    } catch (err) { console.error(err) }
  }

  const filtered = data.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.code?.toLowerCase().includes(search.toLowerCase())
  )

  const resetForm = () => {
    setForm({
      code: '', name: '', description: '',
      category_id: '', brand_id: '', unit_id: '',
      price: '', extra_price: 0, image: '',
      status: 'active', variant_ids: [], outlet_ids: []
    })
    setImagePreview(null)
  }

  const openAdd = () => {
    resetForm()
    setModal({ open: true, mode: 'add', item: null })
  }

  const openEdit = (item) => {
    setForm({
      code: item.code || '',
      name: item.name || '',
      description: item.description || '',
      category_id: item.category_id || '',
      brand_id: item.brand_id || '',
      unit_id: item.unit_id || '',
      price: item.price || '',
      extra_price: item.extra_price || 0,
      image: item.image || '',
      status: item.status || 'active',
      variant_ids: item.variants?.map(v => getID(v)) || [],
      outlet_ids: item.outlets?.map(o => getID(o)) || []
    })
    setImagePreview(item.image || null)
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

  const toggleOutlet = (id) => {
    setForm(f => ({
      ...f,
      outlet_ids: f.outlet_ids.includes(id)
        ? f.outlet_ids.filter(o => o !== id)
        : [...f.outlet_ids, id]
    }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result)
      setForm(f => ({ ...f, image: reader.result }))
    }
    reader.readAsDataURL(file)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.price) return
    setSaving(true)
    try {
      const payload = {
        code: form.code,
        name: form.name,
        description: form.description,
        category_id: form.category_id ? Number(form.category_id) : null,
        brand_id: form.brand_id ? Number(form.brand_id) : null,
        unit_id: form.unit_id ? Number(form.unit_id) : null,
        price: Number(form.price),
        extra_price: Number(form.extra_price) || 0,
        image: form.image,
        status: form.status || 'active',
        variant_ids: form.variant_ids || [],
        outlet_ids: form.outlet_ids || []
      }

      if (modal.mode === 'add') {
        await api.post('/products', payload)
      } else {
        await api.put(`/products/${getID(modal.item)}`, payload)
      }
      fetchData()
      setModal({ open: false })
    } catch (err) {
      console.error('Error:', err.response?.data || err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await api.delete(`/products/${confirm.id}`)
      fetchData()
    } catch (err) {
      console.error('Delete error:', err.response?.data || err.message)
    } finally {
      setConfirm({ open: false, id: null })
    }
  }

  const columns = [
    { key: 'no', label: 'No', render: (row) => filtered.indexOf(row) + 1 },
    {
      key: 'product', label: 'Produk',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.image ? (
            <img src={row.image} alt={row.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <span className="text-gray-400 text-xs">📦</span>
            </div>
          )}
          <div>
            <p className="font-medium text-gray-800 text-sm">{row.name}</p>
            {row.code && <p className="text-gray-400 text-xs">{row.code}</p>}
          </div>
        </div>
      )
    },
    { key: 'category', label: 'Kategori', render: (row) => row.category?.name || '-' },
    {
      key: 'price', label: 'Harga',
      render: (row) => (
        <div>
          <p className="text-sm font-medium">Rp {Number(row.price).toLocaleString('id-ID')}</p>
          {row.extra_price > 0 && (
            <p className="text-xs text-orange-500">+Rp {Number(row.extra_price).toLocaleString('id-ID')}</p>
          )}
        </div>
      )
    },
    {
      key: 'variants', label: 'Varian',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.variants?.length > 0 ? row.variants.slice(0, 2).map((v, i) => (
            <span key={i} className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">{v.name}</span>
          )) : <span className="text-gray-400 text-xs">-</span>}
          {row.variants?.length > 2 && <span className="text-xs text-gray-400">+{row.variants.length - 2}</span>}
        </div>
      )
    },
    {
      key: 'status', label: 'Status',
      render: (row) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
          {row.status === 'active' ? 'Aktif' : 'Nonaktif'}
        </span>
      )
    },
    {
      key: 'aksi', label: 'Aksi',
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs transition">Edit</button>
          <button onClick={() => setConfirm({ open: true, id: getID(row) })} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs transition">Hapus</button>
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah
          </button>
        </div>

        <div className="mb-4">
          <input type="text" placeholder="Cari produk atau kode..." value={search} onChange={e => setSearch(e.target.value)} className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>

        <Table columns={columns} data={filtered} loading={loading} />

        {/* Modal */}
        <Modal isOpen={modal.open} onClose={() => setModal({ open: false })} title={modal.mode === 'add' ? 'Tambah Produk' : 'Edit Produk'}>
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">

            {/* Gambar */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gambar Produk</label>
              <div className="flex items-center gap-3">
                <div
                  onClick={() => fileRef.current.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-emerald-400 overflow-hidden flex-shrink-0"
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      <p className="text-2xl">📷</p>
                      <p className="text-xs text-gray-400">Upload</p>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Klik gambar untuk upload foto produk</p>
                  <p className="text-xs text-gray-400">Format: JPG, PNG. Maks 2MB</p>
                  {imagePreview && (
                    <button onClick={() => { setImagePreview(null); setForm(f => ({ ...f, image: '' })) }} className="text-xs text-red-500 hover:text-red-600 mt-1">Hapus gambar</button>
                  )}
                </div>
              </div>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>

            {/* Kode & Nama */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kode Produk</label>
                <input type="text" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value }))} placeholder="Contoh: PRD-001" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk <span className="text-red-400">*</span></label>
                <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Nama produk" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
              <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Deskripsi produk (opsional)" rows={2} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none" />
            </div>

            {/* Kategori & Brand */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  <option value="">Pilih Kategori</option>
                  {categories.map(c => <option key={getID(c)} value={getID(c)}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Merek</label>
                <select value={form.brand_id} onChange={e => setForm(f => ({ ...f, brand_id: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  <option value="">Pilih Merek</option>
                  {brands.map(b => <option key={getID(b)} value={getID(b)}>{b.name}</option>)}
                </select>
              </div>
            </div>

            {/* Satuan & Status */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Satuan</label>
                <select value={form.unit_id} onChange={e => setForm(f => ({ ...f, unit_id: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  <option value="">Pilih Satuan</option>
                  {units.map(u => <option key={getID(u)} value={getID(u)}>{u.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </div>
            </div>

            {/* Harga & Harga Tambahan */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Jual <span className="text-red-400">*</span></label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                  <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="0" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Harga Tambahan</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                  <input type="number" value={form.extra_price} onChange={e => setForm(f => ({ ...f, extra_price: e.target.value }))} placeholder="0" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
                </div>
              </div>
            </div>

            {/* Varian */}
            {variants.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Varian Produk</label>
                <div className="border border-gray-200 rounded-xl p-3 space-y-2 max-h-40 overflow-y-auto">
                  {variants.map(v => {
                    const vid = getID(v)
                    const isSelected = form.variant_ids.includes(vid)
                    return (
                      <div
                        key={vid}
                        onClick={() => toggleVariant(vid)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${isSelected ? 'bg-emerald-50 border border-emerald-300' : 'hover:bg-gray-50 border border-transparent'}`}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-700">{v.name}</p>
                          <p className="text-xs text-gray-400">
                            {v.options?.map(o => o.name).join(', ') || '-'}
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Outlet */}
            {outlets.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Outlet</label>
                <div className="border border-gray-200 rounded-xl p-3 space-y-2 max-h-32 overflow-y-auto">
                  {outlets.map(o => {
                    const oid = getID(o)
                    const isSelected = form.outlet_ids.includes(oid)
                    return (
                      <div
                        key={oid}
                        onClick={() => toggleOutlet(oid)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${isSelected ? 'bg-emerald-50 border border-emerald-300' : 'hover:bg-gray-50 border border-transparent'}`}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-700">{o.name}</p>
                          {o.address && <p className="text-xs text-gray-400">{o.address}</p>}
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}`}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Tombol */}
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