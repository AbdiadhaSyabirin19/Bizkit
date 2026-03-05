import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../../components/Layout'
import ConfirmDialog from '../../components/ConfirmDialog'
import api from '../../api/axios'

const getID = (row) => row.ID || row.id
const ITEMS_PER_PAGE = 10

export default function BrandPage() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [confirm, setConfirm] = useState({ open: false, id: null })

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await api.get('/brands')
      setData(res.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Filter by search
  const filtered = data.filter(d =>
    d.name?.toLowerCase().includes(search.toLowerCase())
  )

  // Pagination
  const totalItems = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE
  const pageItems = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE)

  // Reset page on search change
  useEffect(() => { setCurrentPage(1) }, [search])

  const handleDelete = async () => {
    try {
      await api.delete(`/brands/${confirm.id}`)
      fetchData()
    } catch (err) {
      console.error(err)
    } finally {
      setConfirm({ open: false, id: null })
    }
  }

  return (
    <Layout title="Merek">
      <div className="max-w-6xl mx-auto">

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

        {/* Table */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-[#cbd5e1] border-b">
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 tracking-wide w-24">No</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-gray-800 tracking-wide">Merek</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-800 tracking-wide w-32">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="border-b">
                    {[1, 2, 3].map(j => (
                      <td key={j} className="px-6 py-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-gray-400">
                    <p className="text-3xl mb-2">📭</p>
                    <p>Tidak ada data</p>
                  </td>
                </tr>
              ) : (
                pageItems.map((item, idx) => (
                  <tr key={getID(item)} className="border-b hover:bg-gray-50 transition">
                    <td className="px-6 py-3 text-gray-600">{startIdx + idx + 1}</td>
                    <td className="px-6 py-3 text-gray-700">{item.name}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center justify-center gap-4">
                        <button
                          onClick={() => navigate(`/brands/edit/${getID(item)}`)}
                          className="text-[#0284c7] hover:text-[#0369a1] transition"
                          title="Edit"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setConfirm({ open: true, id: getID(item) })}
                          className="text-[#0284c7] hover:text-[#0369a1] transition"
                          title="Hapus"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-end gap-1 px-4 py-3 border-t bg-white">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-2.5 py-1 text-sm rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                ←
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 text-sm rounded border transition ${currentPage === page
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'border-gray-300 text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-2.5 py-1 text-sm rounded border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                →
              </button>
            </div>
          )}
        </div>

        {/* Floating Action Button (FAB) */}
        <button
          onClick={() => navigate('/brands/add')}
          className="fixed bottom-8 right-8 w-14 h-14 bg-[#00A651] hover:bg-[#008f45] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all z-40"
          title="Tambah Merek"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        {/* Confirm Delete */}
        <ConfirmDialog
          isOpen={confirm.open}
          onClose={() => setConfirm({ open: false })}
          onConfirm={handleDelete}
        />
      </div>
    </Layout>
  )
}