import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../api/axios'

export default function PriceCategoryFormPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const mode = id ? 'edit' : 'add'
    const title = mode === 'add' ? 'Tambah Multi Harga' : 'Edit Multi Harga'

    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(mode === 'edit')

    const [form, setForm] = useState({
        name: ''
    })

    useEffect(() => {
        if (mode === 'edit') {
            fetchPriceCategory()
        }
    }, [id])

    const fetchPriceCategory = async () => {
        try {
            const res = await api.get(`/price-categories/${id}`)
            const data = res.data.data
            setForm({
                name: data.name || ''
            })
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
            const payload = {
                name: form.name
            }

            if (mode === 'add') {
                await api.post('/price-categories', payload)
            } else {
                await api.put(`/price-categories/${id}`, payload)
            }
            navigate('/price-categories')
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <Layout title={title}>
                <div className="flex justify-center mt-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
                </div>
            </Layout>
        )
    }

    return (
        <Layout title={title}>
            <div className="w-full relative min-h-[calc(100vh-100px)] pt-6">
                <div className="bg-white rounded shadow-sm p-6 max-w-full border border-gray-100 mb-6">
                    <form onSubmit={handleSave} className="space-y-6">

                        {/* Input Nama */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-2">
                                Nama Kategori Harga Tambahan
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm({ name: e.target.value })}
                                placeholder="Harga Grab, Harga A, Harga B"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 placeholder-gray-300"
                                required
                            />
                        </div>

                        {/* Tombol Simpan (Gray) */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={saving || !form.name.trim()}
                                className="w-full py-2.5 bg-[#4B5563] hover:bg-[#374151] disabled:bg-gray-300 text-white rounded-md text-sm font-medium transition-colors"
                            >
                                {saving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </Layout>
    )
}
