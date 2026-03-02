import { useState, useEffect } from 'react'
import Layout from '../../components/Layout'
import api from '../../api/axios'

export default function SettingPage() {
  const [form, setForm] = useState({ store_name: '', tax: 0, receipt_format: 'default' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const res = await api.get('/settings')
      const d = res.data.data
      setForm({ store_name: d.StoreName || '', tax: d.Tax || 0, receipt_format: d.ReceiptFormat || 'default' })
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    setSaving(true)
    setSuccess(false)
    try {
      await api.put('/settings', form)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) { console.error(err) }
    finally { setSaving(false) }
  }

  return (
    <Layout title="Pengaturan Umum">
      <div className="max-w-2xl mx-auto">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-gray-800">Pengaturan Umum</h1>
          <p className="text-gray-500 text-sm">Konfigurasi sistem</p>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-green-700 text-sm">Pengaturan berhasil disimpan!</p>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Toko</label>
              <input type="text" value={form.store_name} onChange={e => setForm(f => ({ ...f, store_name: e.target.value }))} placeholder="Masukkan nama toko" className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pajak (%)</label>
              <input type="number" min="0" max="100" value={form.tax} onChange={e => setForm(f => ({ ...f, tax: Number(e.target.value) }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format Struk</label>
              <select value={form.receipt_format} onChange={e => setForm(f => ({ ...f, receipt_format: e.target.value }))} className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                <option value="default">Default</option>
                <option value="compact">Compact</option>
              </select>
            </div>
            <button onClick={handleSave} disabled={saving} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-xl text-sm font-semibold transition">
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </button>
          </div>
        )}
      </div>
    </Layout>
  )
}