import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../api/axios'

export default function CategoryFormPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const isEdit = !!id

    const [form, setForm] = useState({ name: '' })
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(isEdit)

    useEffect(() => {
        if (isEdit) fetchCategory()
    }, [])

    const fetchCategory = async () => {
        setLoading(true)
        try {
            const res = await api.get(`/categories/${id}`)
            if (res.data && res.data.data) {
                setForm({ name: res.data.data.name || '' })
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) return

        setSaving(true)
        try {
            if (isEdit) {
                await api.put(`/categories/${id}`, { name: form.name })
            } else {
                await api.post('/categories', { name: form.name })
            }
            navigate('/categories')
        } catch (err) {
            console.error('Error:', err.response?.data || err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <Layout title={isEdit ? 'Edit Kategori' : 'Tambah Kategori'}>
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title={isEdit ? 'Edit Kategori' : 'Tambah Kategori'}>
            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSave} className="bg-white rounded-lg shadow-sm p-6 mb-4">

                    {/* Header Internal Form - tidak butuh judul dalam card sesuai referensi */}

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-800 mb-2">
                            Nama Kategori
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm({ name: e.target.value })}
                            placeholder="Enter Name"
                            className="w-full px-4 py-3 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent"
                            autoFocus
                        />
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
