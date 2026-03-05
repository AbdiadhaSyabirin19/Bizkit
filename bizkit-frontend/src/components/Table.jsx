export default function Table({ columns, data, loading }) {
  if (loading) {
    return (
      <div className="bg-white rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#cbd5e1] border-b">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-6 py-4 text-left text-sm font-bold text-gray-800 tracking-wide">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3].map(i => (
              <tr key={i} className="border-b">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-[#cbd5e1] border-b">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-4 text-left text-sm font-bold text-gray-800 tracking-wide">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                <p className="text-3xl mb-2">📭</p>
                <p>Tidak ada data</p>
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr key={row.ID || idx} className="hover:bg-gray-50 transition">
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-4 text-sm text-gray-800">
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}