import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../api/axios'

const getID = (row) => row.ID || row.id

export default function ProductFormPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEdit = !!id

    const [categories, setCategories] = useState([])
    const [brands, setBrands] = useState([])
    const [units, setUnits] = useState([])
    const [variants, setVariants] = useState([])
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(isEdit)
    const [showDescription, setShowDescription] = useState(false)
    const [showVariant, setShowVariant] = useState(false)
    const [imagePreview, setImagePreview] = useState(null)
    const [imageFile, setImageFile] = useState(null)

    const [form, setForm] = useState({
        name: '',
        code: '',
        description: '',
        image: '',
        category_id: '',
        brand_id: '',
        unit_id: '',
        price: '',
        status: 'active',
        variant_ids: []
    })

    useEffect(() => {
        fetchMasterData()
        if (isEdit) fetchProduct()
    }, [])

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
        } catch (err) {
            console.error(err)
        }
    }

    const fetchProduct = async () => {
        setLoading(true)
        try {
            const res = await api.get(`/products/${id}`)
            const p = res.data.data
            setForm({
                name: p.name || '',
                code: p.code || '',
                description: p.description || '',
                image: p.image || '',
                category_id: p.category_id || '',
                brand_id: p.brand_id || '',
                unit_id: p.unit_id || '',
                price: p.price || '',
                status: p.status || 'active',
                variant_ids: p.variants?.map(v => getID(v)) || []
            })
            if (p.description) setShowDescription(true)
            if (p.variants?.length > 0) setShowVariant(true)
            if (p.image) setImagePreview(`http://localhost:8080${p.image}`)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setImageFile(file)
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleSave = async () => {
        if (!form.name.trim()) return
        setSaving(true)
        try {
            let imageUrl = form.image

            // Upload image if new file selected
            if (imageFile) {
                const formData = new FormData()
                formData.append('file', imageFile)
                const uploadRes = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
                imageUrl = uploadRes.data.url
            }

            const payload = {
                name: form.name,
                code: form.code,
                description: showDescription ? form.description : '',
                image: imageUrl,
                category_id: form.category_id ? Number(form.category_id) : null,
                brand_id: form.brand_id ? Number(form.brand_id) : null,
                unit_id: form.unit_id ? Number(form.unit_id) : null,
                price: Number(form.price) || 0,
                status: form.status || 'active',
                variant_ids: showVariant ? (form.variant_ids || []) : []
            }

            if (isEdit) {
                await api.put(`/products/${id}`, payload)
            } else {
                await api.post('/products', payload)
            }
            navigate('/products')
        } catch (err) {
            console.error('Error:', err.response?.data || err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <Layout title={isEdit ? 'Edit Produk' : 'Tambah Produk'}>
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title={isEdit ? 'Edit Produk' : 'Tambah Produk'}>
            <div className="max-w-4xl mx-auto">

                {/* Section 1: Gambar, Kode, Nama, Deskripsi, Merek, Kategori */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-4">

                    {/* Upload Gambar */}
                    <div className="mb-5">
                        <label className="block text-sm font-semibold text-emerald-700 mb-2">Upload Gambar Produk</label>
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer px-4 py-2 bg-gray-100 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-200 transition">
                                Choose File
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                            <span className="text-sm text-gray-500">
                                {imageFile ? imageFile.name : 'No file chosen'}
                            </span>
                        </div>
                        {imagePreview && (
                            <div className="mt-3">
                                <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
                            </div>
                        )}
                    </div>

                    {/* Kode Produk */}
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-gray-800 mb-1">Kode Produk</label>
                        <input
                            type="text"
                            value={form.code}
                            onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                            placeholder="Kode Produk"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                        />
                    </div>

                    {/* Nama Produk */}
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-emerald-700 mb-1">Nama Produk</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            placeholder="Nama Produk"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                        />
                    </div>

                    {/* Deskripsi Toggle */}
                    <div className="mb-4">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showDescription}
                                onChange={e => setShowDescription(e.target.checked)}
                                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                            />
                            <span className="text-sm font-semibold text-gray-800">Deskripsi</span>
                        </label>
                        {showDescription && (
                            <textarea
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Tulis deskripsi produk..."
                                rows={3}
                                className="mt-2 w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                            />
                        )}
                    </div>

                    {/* Merek */}
                    <div className="mb-4">
                        <label className="block text-sm font-semibold text-emerald-700 mb-1">Merek</label>
                        <select
                            value={form.brand_id}
                            onChange={e => setForm(f => ({ ...f, brand_id: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                        >
                            <option value="">[Merek]</option>
                            {brands.map(b => (
                                <option key={getID(b)} value={getID(b)}>{b.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Kategori */}
                    <div className="mb-2">
                        <label className="block text-sm font-semibold text-emerald-700 mb-1">Kategori</label>
                        <select
                            value={form.category_id}
                            onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                        >
                            <option value="">[Kategori]</option>
                            {categories.map(c => (
                                <option key={getID(c)} value={getID(c)}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Section 2: Satuan Utama */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                    <label className="block text-sm font-semibold text-gray-800 mb-1">Satuan utama</label>
                    <select
                        value={form.unit_id}
                        onChange={e => setForm(f => ({ ...f, unit_id: e.target.value }))}
                        className="w-full max-w-sm px-4 py-2.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                    >
                        <option value="">[Satuan]</option>
                        {units.map(u => (
                            <option key={getID(u)} value={getID(u)}>{u.name}</option>
                        ))}
                    </select>
                </div>

                {/* Section 3: Varian */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showVariant}
                            onChange={e => setShowVariant(e.target.checked)}
                            className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                        />
                        <span className="text-sm font-semibold text-gray-800">Varian</span>
                    </label>
                    {showVariant && variants.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {variants.map(v => {
                                const vid = getID(v)
                                return (
                                    <label key={vid} className="inline-flex items-center gap-2 cursor-pointer px-3 py-2 border rounded-lg text-sm hover:border-emerald-400 transition">
                                        <input
                                            type="checkbox"
                                            checked={form.variant_ids.includes(vid)}
                                            onChange={() => {
                                                setForm(f => ({
                                                    ...f,
                                                    variant_ids: f.variant_ids.includes(vid)
                                                        ? f.variant_ids.filter(x => x !== vid)
                                                        : [...f.variant_ids, vid]
                                                }))
                                            }}
                                            className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                                        />
                                        <span className="text-gray-700">{v.name}</span>
                                    </label>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Section 4: Harga Jual */}
                <div className="bg-indigo-50 rounded-lg shadow-sm p-6 mb-4 border border-indigo-100">
                    <div className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1.5 rounded inline-block mb-3">
                        Satuan Terkecil
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1">Harga Jual</label>
                        <div className="flex items-center gap-0 max-w-md">
                            <span className="bg-gray-200 text-gray-600 px-3 py-2.5 rounded-l text-sm border border-r-0 border-gray-300 font-medium">Rp</span>
                            <input
                                type="number"
                                value={form.price}
                                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                                placeholder="0"
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-r text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Tombol Simpan */}
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold py-3 rounded-lg transition duration-200 shadow-md hover:shadow-lg text-sm"
                >
                    {saving ? 'Menyimpan...' : 'Simpan'}
                </button>

                <div className="h-8"></div>
            </div>
        </Layout>
    )
}
