import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../api/axios'

export default function UnitFormPage() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '' })
    const [saving, setSaving] = useState(false)

    const handleSave = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) return
        setSaving(true)
        try {
            await api.post('/units', { name: form.name })
            navigate('/units')
        } catch (err) {
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    return (
        <Layout title="Tambah Satuan">
            <div className="w-full relative min-h-[calc(100vh-100px)] pt-6">
                <div className="bg-white rounded shadow-sm p-6 max-w-full border border-gray-100">
                    <form onSubmit={handleSave} className="space-y-6">

                        {/* Input Group */}
                        <div>
                            <label className="block text-sm font-bold text-gray-800 mb-2">
                                Unit Name
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm({ name: e.target.value })}
                                placeholder="Enter Name"
                                className="w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 placeholder-gray-300"
                                required
                            />
                        </div>

                        {/* Gray Submit Button */}
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
