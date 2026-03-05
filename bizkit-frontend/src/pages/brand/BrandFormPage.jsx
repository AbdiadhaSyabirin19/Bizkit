import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../api/axios'

export default function BrandFormPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEdit = !!id

    const [form, setForm] = useState({ name: '', logo: '' })
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(isEdit)
    const fileInputRef = useRef(null)

    useEffect(() => {
        if (isEdit) fetchBrand()
    }, [])

    const fetchBrand = async () => {
        setLoading(true)
        try {
            const res = await api.get(`/brands/${id}`)
            if (res.data && res.data.data) {
                setForm({
                    name: res.data.data.name || '',
                    logo: res.data.data.logo || ''
                })
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleFileChange = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            if (res.data && res.data.url) {
                setForm(prev => ({ ...prev, logo: res.data.url }))
            }
        } catch (err) {
            console.error('Upload failed:', err)
            alert('Gagal mengupload gambar')
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) return

        setSaving(true)
        try {
            if (isEdit) {
                await api.put(`/brands/${id}`, form)
            } else {
                await api.post('/brands', form)
            }
            navigate('/brands')
        } catch (err) {
            console.error('Error:', err.response?.data || err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <Layout title={isEdit ? 'Edit Merek' : 'Tambah Merek'}>
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title={isEdit ? 'Edit Merek' : 'Tambah Merek'}>
            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSave} className="bg-white rounded-lg shadow-sm p-6 mb-4">

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                            Produk Brand Name
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            placeholder="Enter Name"
                            className="w-full px-4 py-3 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                            autoFocus
                        />
                    </div>

                    <div className="mb-8">
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                            Upload Brand Logo
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 border border-gray-300 rounded bg-gray-50 text-gray-700 text-sm hover:bg-gray-100 transition"
                            >
                                Choose File
                            </button>
                            <span className="text-sm text-gray-500">
                                {form.logo ? 'File selected' : 'No file chosen'}
                            </span>
                        </div>
                        {form.logo && (
                            <div className="mt-4">
                                <img
                                    src={`http://localhost:8080${form.logo}`}
                                    alt="Preview"
                                    className="w-32 h-32 object-contain border border-gray-200 rounded p-1"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Tombol Simpan (dark slate/gray) */}
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full bg-[#414A53] hover:bg-[#343b42] disabled:opacity-70 text-white font-medium py-3 rounded-lg transition duration-200 text-sm shadow-sm"
                    >
                        {saving ? 'Menyimpan...' : 'Simpan'}
                    </button>

                </form>
            </div>
        </Layout>
    )
}
