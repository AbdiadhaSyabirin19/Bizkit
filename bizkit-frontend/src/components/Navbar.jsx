export default function Navbar({ setIsOpen }) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">

      {/* Hamburger */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Kanan */}
      <div className="flex items-center gap-3 ml-auto">
        <div className="text-right">
          <p className="text-xs text-gray-400">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })}
          </p>
        </div>
      </div>
    </header>
  )
}