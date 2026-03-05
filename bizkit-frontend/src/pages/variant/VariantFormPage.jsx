import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../api/axios'

export default function VariantFormPage() {
    const navigate = useNavigate()
    const { id } = useParams()
    const mode = id ? 'edit' : 'add'
    const title = mode === 'add' ? 'Tambah Varian' : 'Edit Varian'

    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(mode === 'edit')

    const [form, setForm] = useState({
        name: '',
        min_select: 1,
        max_select: 1,
        status: 'active',
        options: [{ name: '', additional_price: 0, status: 'active' }]
    })

    useEffect(() => {
        if (mode === 'edit') {
            fetchVariant()
        }
    }, [id])

    const fetchVariant = async () => {
        try {
            const res = await api.get(`/variants/${id}`)
            const data = res.data.data
            setForm({
                name: data.name || '',
                min_select: data.min_select || 0,
                max_select: data.max_select || 1,
                status: data.status || 'active',
                options: data.options?.length > 0
                    ? data.options.map(o => ({
                        name: o.name,
                        additional_price: o.additional_price || 0,
                        status: 'active' // assuming default active in reference
                    }))
                    : [{ name: '', additional_price: 0, status: 'active' }]
            })
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const addOption = () => {
        setForm(f => ({ ...f, options: [...f.options, { name: '', additional_price: 0, status: 'active' }] }))
    }

    const removeOption = (idx) => {
        setForm(f => ({ ...f, options: f.options.filter((_, i) => i !== idx) }))
    }

    const updateOption = (idx, key, val) => {
        setForm(f => ({
            ...f,
            options: f.options.map((o, i) => i === idx ? { ...o, [key]: val } : o)
        }))
    }

    const handleSave = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) return

        setSaving(true)
        try {
            const payload = {
                name: form.name,
                min_select: Number(form.min_select),
                max_select: Number(form.max_select),
                status: form.status,
                options: form.options.filter(o => o.name.trim()).map(o => ({
                    name: o.name,
                    additional_price: Number(o.additional_price)
                }))
            }

            if (mode === 'add') {
                await api.post('/variants', payload)
            } else {
                await api.put(`/variants/${id}`, payload)
            }
            navigate('/variants')
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
            <form onSubmit={handleSave} className="w-full relative min-h-[calc(100vh-100px)] pt-6 space-y-6">

                {/* Card Utama */}
                <div className="bg-white rounded shadow-sm p-6 border border-gray-100">
                    <div className="space-y-6">

                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-2">Nama Kategori Varian</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-2">Deskripsi Kategori Varian</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-2">Dipilih Minimal</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.min_select}
                                    onChange={e => setForm(f => ({ ...f, min_select: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-800 mb-2">Dipilih Maksimal</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={form.max_select}
                                    onChange={e => setForm(f => ({ ...f, max_select: e.target.value }))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="activeStatus"
                                checked={form.status === 'active'}
                                onChange={e => setForm(f => ({ ...f, status: e.target.checked ? 'active' : 'inactive' }))}
                                className="w-4 h-4 text-[#0284c7] border-gray-300 rounded focus:ring-[#0284c7]"
                            />
                            <label htmlFor="activeStatus" className="text-sm font-bold text-gray-800">Aktif</label>
                        </div>

                    </div>
                </div>

                {/* Card Varian Khusus */}
                <div className="bg-[#eef2ff] rounded shadow-sm p-6 border border-gray-100">
                    <h2 className="text-lg font-bold text-gray-700 mb-6">Varian</h2>

                    <div className="space-y-4">
                        {form.options.map((opt, idx) => (
                            <div key={idx} className="bg-white rounded border border-gray-200 p-4 relative">

                                {form.options.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOption(idx)}
                                        className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center transition"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                )}

                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-800 mb-2">Varian #{idx + 1}</label>
                                        <input
                                            type="text"
                                            value={opt.name}
                                            onChange={e => updateOption(idx, 'name', e.target.value)}
                                            placeholder="Nama Varian"
                                            className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-800 mb-2">Harga Varian / Extra Tambahan</label>
                                        <input
                                            type="number"
                                            value={opt.additional_price}
                                            onChange={e => updateOption(idx, 'additional_price', e.target.value)}
                                            placeholder="Harga Varian"
                                            className="w-full px-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id={`optActive-${idx}`}
                                        checked={opt.status === 'active'}
                                        onChange={e => updateOption(idx, 'status', e.target.checked ? 'active' : 'inactive')}
                                        className="w-4 h-4 text-[#0284c7] border-gray-300 rounded focus:ring-[#0284c7]"
                                    />
                                    <label htmlFor={`optActive-${idx}`} className="text-sm font-bold text-gray-800">Aktif</label>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex justify-end">
                        <button
                            type="button"
                            onClick={addOption}
                            className="bg-[#1e3a8a] hover:bg-[#172554] text-white w-8 h-8 rounded flex items-center justify-center transition"
                            title="Tambah Opsi"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                        </button>
                    </div>

                    <div className="mt-6">
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full py-2.5 bg-[#4B5563] hover:bg-[#374151] disabled:bg-gray-300 text-white rounded-md text-sm font-medium transition-colors"
                        >
                            {saving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>

                </div>
            </form>
        </Layout>
    )
}
