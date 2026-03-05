import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import Table from '../../components/Table'
import ConfirmDialog from '../../components/ConfirmDialog'
import api from '../../api/axios'

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
    { key: 'name', label: 'Nama Kategori Varian' },
    { key: 'description', label: 'Deskripsi', render: (row) => row.description || '-' },
    { key: 'min_select', label: 'Minimal Pemilihan' },
    { key: 'max_select', label: 'Maksimal Pemilihan' },
    {
      key: 'options', label: 'Varian',
      render: (row) => (
        <button
          onClick={() => navigate(`/variants/edit/${row.ID}`)}
          className="px-4 py-1.5 bg-[#14b8a6] hover:bg-[#0d9488] text-white rounded-md text-xs font-semibold transition shadow-sm"
        >
          Lihat
        </button>
      )
    },
    {
      key: 'status', label: 'Status',
      render: (row) => (
        <span className="text-gray-800 text-sm">
          {row.status === 'active' ? 'Aktif' : 'Nonaktif'}
        </span>
      )
    },
    {
      key: 'aksi', label: 'Aksi',
      render: (row) => (
        <div className="flex gap-4 items-center">
          <button
            onClick={() => navigate(`/variants/edit/${row.ID}`)}
            className="text-[#0284c7] hover:text-[#0369a1] transition"
            title="Edit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => setConfirm({ open: true, id: row.ID })}
            className="text-[#0284c7] hover:text-[#0369a1] transition"
            title="Hapus"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )
    },
  ]

  return (
    <Layout title="Varian">
      <div className="w-full relative min-h-[calc(100vh-100px)]">

        {/* Search Bar aligned to right */}
        <div className="flex justify-end mb-4">
          <div className="relative w-64 mr-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-gray-300"
            />
          </div>
        </div>

        <Table columns={columns} data={filtered} loading={loading} />

        <ConfirmDialog isOpen={confirm.open} onClose={() => setConfirm({ open: false })} onConfirm={handleDelete} />

        {/* Floating Action Button (Tambah) */}
        <button
          onClick={() => navigate('/variants/add')}
          className="fixed bottom-8 right-8 w-14 h-14 bg-[#00A651] hover:bg-[#008f45] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-40"
          title="Tambah Varian"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

      </div>
    </Layout>
  )
}