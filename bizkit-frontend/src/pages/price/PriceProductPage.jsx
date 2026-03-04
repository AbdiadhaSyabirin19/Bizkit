import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Layout from '../../components/Layout'
import api from '../../api/axios'

const getID = (row) => row.ID || row.id

export default function PriceProductPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [category, setCategory] = useState(null)
  const [products, setProducts] = useState([])
  const [priceMap, setPriceMap] = useState({})
  const [enabledMap, setEnabledMap] = useState({})
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchData() }, [id])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [catRes, prodRes, existingRes] = await Promise.all([
        api.get(`/price-categories/${id}`),
        api.get('/products'),
        api.get(`/price-categories/${id}/products`),
      ])

      setCategory(catRes.data.data)

      const allProducts = prodRes.data.data || []
      setProducts(allProducts)

      // Bangun price map dan enabled map dari data existing
      const pm = {}
      const em = {}
      ;(existingRes.data.data || []).forEach(pp => {
        pm[pp.product_id] = pp.price
        em[pp.product_id] = true
      })
      setPriceMap(pm)
      setEnabledMap(em)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const toggleProduct = (pid) => {
    setEnabledMap(m => ({ ...m, [pid]: !m[pid] }))
    if (!enabledMap[pid] && !priceMap[pid]) {
      const product = products.find(p => getID(p) === pid)
      setPriceMap(m => ({ ...m, [pid]: product?.price || 0 }))
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const allProductIds = products.map(p => getID(p))

      await Promise.all(allProductIds.map(pid => {
        if (enabledMap[pid] && priceMap[pid] > 0) {
          return api.post(`/price-categories/${id}/products`, {
            product_id: pid,
            price: Number(priceMap[pid])
          })
        } else {
          return api.delete(`/price-categories/${id}/products/${pid}`).catch(() => {})
        }
      }))

      navigate('/price-categories')
    } catch (err) {
      console.error('Error:', err.response?.data || err.message)
    } finally {
      setSaving(false)
    }
  }

  const filteredProducts = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  )

  const enabledCount = Object.values(enabledMap).filter(Boolean).length

  if (loading) return (
    <Layout title="Atur Harga">
      <div className="flex items-center justify-center py-20 text-gray-400">Memuat data...</div>
    </Layout>
  )

  return (
    <Layout title="Atur Harga">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/multi-harga')} className="p-2 hover:bg-gray-100 rounded-lg transition">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-800">Atur Harga</h1>
              <span className="px-2.5 py-0.5 bg-orange-100 text-orange-600 rounded-full text-xs font-semibold">
                {category?.name}
              </span>
            </div>
            <p className="text-gray-500 text-sm">Aktifkan produk & atur harga untuk kategori ini</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-emerald-600">{enabledCount}</p>
            <p className="text-xs text-gray-400">produk aktif</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Cari produk..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* List Produk */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">

          {/* Header kolom */}
          <div className="grid grid-cols-12 gap-3 px-4 py-2.5 bg-gray-50 border-b border-gray-100">
            <div className="col-span-1" />
            <div className="col-span-5"><span className="text-xs font-medium text-gray-500">Produk</span></div>
            <div className="col-span-3"><span className="text-xs font-medium text-gray-500">Harga Default</span></div>
            <div className="col-span-3"><span className="text-xs font-medium text-gray-500">Harga {category?.name}</span></div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-3xl mb-2">📦</p>
              <p className="text-sm">Tidak ada produk ditemukan</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredProducts.map(p => {
                const pid = getID(p)
                const isEnabled = !!enabledMap[pid]
                return (
                  <div key={pid} className={`grid grid-cols-12 gap-3 px-4 py-3 items-center transition ${isEnabled ? 'bg-emerald-50/50' : 'hover:bg-gray-50'}`}>

                    {/* Toggle */}
                    <div className="col-span-1 flex justify-center">
                      <button
                        onClick={() => toggleProduct(pid)}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition ${isEnabled ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300 hover:border-emerald-400'}`}
                      >
                        {isEnabled && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Nama produk */}
                    <div className="col-span-5">
                      <div className="flex items-center gap-2">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xs">📦</span>
                          </div>
                        )}
                        <div>
                          <p className={`text-sm font-medium ${isEnabled ? 'text-gray-800' : 'text-gray-500'}`}>{p.name}</p>
                          {p.category?.name && <p className="text-xs text-gray-400">{p.category.name}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Harga default */}
                    <div className="col-span-3">
                      <p className="text-sm text-gray-500">Rp {Number(p.price).toLocaleString('id-ID')}</p>
                    </div>

                    {/* Input harga custom */}
                    <div className="col-span-3">
                      {isEnabled ? (
                        <div className="relative">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Rp</span>
                          <input
                            type="number"
                            value={priceMap[pid] || ''}
                            onChange={e => setPriceMap(m => ({ ...m, [pid]: e.target.value }))}
                            placeholder={p.price}
                            className="w-full pl-8 pr-2 py-1.5 border border-emerald-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
                          />
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 italic">Nonaktif</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Tombol Simpan */}
        <div className="flex gap-3 pb-6">
          <button onClick={() => navigate('/multi-harga')} className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 text-sm font-medium transition">Batal</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-xl text-sm font-medium transition">
            {saving ? 'Menyimpan...' : 'Simpan Harga'}
          </button>
        </div>
      </div>
    </Layout>
  )
}