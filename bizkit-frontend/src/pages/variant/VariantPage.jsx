import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import Table from '../../components/Table'
import ConfirmDialog from '../../components/ConfirmDialog'
import api from '../../api/axios'

const getID = (row) => row.ID || row.id

export default function VariantPage() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [confirm, setConfirm] = useState({ open: false, id: null })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get('/variants')
      setData(res.data.data || [])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const filtered = data.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async () => {
    try {
      await api.delete(`/variants/${confirm.id}`)
      fetchData()
    } catch (err) { console.error(err) }
    finally { setConfirm({ open: false, id: null }) }
  }

  const columns = [
    { key: 'no', label: 'No', render: (row) => filtered.indexOf(row) + 1 },
    {
      key: 'name', label: 'Nama Varian',
      render: (row) => (
        <div>
          <p className="font-medium text-gray-800">{row.name}</p>
          {row.description && <p className="text-xs text-gray-400 mt-0.5">{row.description}</p>}
        </div>
      )
    },
    {
      key: 'select', label: 'Pilihan',
      render: (row) => (
        <span className="text-sm text-gray-600">{row.min_select} - {row.max_select} pilihan</span>
      )
    },
    {
      key: 'options', label: 'Opsi & Harga',
      render: (row) => (
        <div className="flex flex-wrap gap-1">
          {row.options?.slice(0, 3).map((o, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">{o.name}</span>
              {o.additional_price > 0 && (
                <span className="text-xs text-orange-500">+Rp {Number(o.additional_price).toLocaleString('id-ID')}</span>
              )}
            </div>
          ))}
          {row.options?.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs">+{row.options.length - 3} lagi</span>
          )}
          {(!row.options || row.options.length === 0) && (
            <span className="text-gray-400 text-xs">Belum ada opsi</span>
          )}
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
          <button onClick={() => navigate(`/variants/${getID(row)}`)} className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-xs transition">Detail</button>
          <button onClick={() => navigate(`/variants/${getID(row)}/edit`)} className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs transition">Edit</button>
          <button onClick={() => setConfirm({ open: true, id: getID(row) })} className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs transition">Hapus</button>
        </div>
      )
    },
  ]

  return (
    <Layout title="Varian">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Varian</h1>
            <p className="text-gray-500 text-sm">Kelola kategori varian produk</p>
          </div>
          <button
            onClick={() => navigate('/variants/add')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah
          </button>
        </div>
        <div className="mb-4">
          <input type="text" placeholder="Cari varian..." value={search} onChange={e => setSearch(e.target.value)} className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400" />
        </div>
        <Table columns={columns} data={filtered} loading={loading} />
        <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ open: false })} onConfirm={handleDelete} />
      </div>
    </Layout>
  )
}