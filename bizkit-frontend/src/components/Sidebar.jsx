import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const menus = [
  {
    label: 'Penjualan',
    icon: '≡',
    children: [
      { label: 'Promo & Voucher', path: '/promos' },
    ],
  },
  {
    label: 'Produk',
    icon: '≡',
    children: [
      { label: 'Produk', path: '/products' },
      { label: 'Kategori', path: '/categories' },
      { label: 'Merek', path: '/brands' },
      { label: 'Satuan', path: '/units' },
      { label: 'Varian', path: '/variants' },
      { label: 'Multi Harga', path: '/price-categories' },
    ],
  },
  {
    label: 'Laporan',
    icon: '≡',
    children: [
      {
        groupLabel: 'UMUM',
        items: [
          { label: 'Laporan Absensi', path: '/reports/attendance' },
          { label: 'Pergantian Shift', path: '/reports/shift' },
        ]
      },
      {
        groupLabel: 'PENJUALAN',
        items: [
          { label: 'Penjualan Harian', path: '/reports/daily' },
          { label: 'Trend Penjualan', path: '/reports/trend' },
          { label: 'Riwayat Penjualan', path: '/reports/sales' },
        ]
      },
    ],
  },
  {
    label: 'Pengaturan',
    icon: '≡',
    children: [
      { label: 'User', path: '/users' },
      { label: 'Hak Akses', path: '/roles' },
      { label: 'Metode Pembayaran', path: '/payment-methods' },
      { label: 'Pengaturan Umum', path: '/settings' },
    ],
  },
]

const MenuIcon = ({ label }) => {
  const icons = {
    Penjualan: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    Produk: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    Laporan: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    Pengaturan: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  }
  return icons[label] || null
}

export default function Sidebar({ isOpen, setIsOpen }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [openMenus, setOpenMenus] = useState(['Produk'])

  const toggleMenu = (label) => {
    setOpenMenus(prev =>
      prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]
    )
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-48 bg-emerald-800 text-white z-30 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>

        {/* Logo */}
        <div className="flex items-center gap-2 px-4 py-4 bg-emerald-900">
          <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-emerald-900 font-bold text-xs">Biz</span>
          </div>
          <div>
            <p className="text-white font-bold text-xs leading-tight">KASIR</p>
            <p className="text-yellow-400 font-bold text-xs leading-tight">KULINER</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-2">
          {menus.map((menu) => (
            <div key={menu.label}>
              {/* Parent */}
              <button
                onClick={() => toggleMenu(menu.label)}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-emerald-100 hover:bg-emerald-700 transition text-sm font-medium"
              >
                <MenuIcon label={menu.label} />
                <span className="flex-1 text-left">{menu.label}</span>
                <svg
                  className={`w-3 h-3 transition-transform ${openMenus.includes(menu.label) ? 'rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Children */}
              {openMenus.includes(menu.label) && (
                <div className="bg-emerald-900">
                  {menu.children.map((child) => {
                    // Kalau ada groupLabel (laporan)
                    if (child.groupLabel) {
                      return (
                        <div key={child.groupLabel}>
                          <p className="px-4 pt-2 pb-1 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                            {child.groupLabel}
                          </p>
                          {child.items.map((item) => (
                            <NavLink
                              key={item.path}
                              to={item.path}
                              className={({ isActive }) =>
                                `flex items-center gap-2 pl-6 pr-4 py-2 text-xs transition
                                ${isActive
                                  ? 'bg-emerald-600 text-white font-medium'
                                  : 'text-emerald-200 hover:bg-emerald-700 hover:text-white'
                                }`
                              }
                              onClick={() => setIsOpen(false)}
                            >
                              <span className="w-1 h-1 rounded-full bg-current"></span>
                              {item.label}
                            </NavLink>
                          ))}
                        </div>
                      )
                    }

                    // Item biasa
                    return (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          `flex items-center gap-2 pl-6 pr-4 py-2 text-xs transition
                          ${isActive
                            ? 'bg-emerald-600 text-white font-medium'
                            : 'text-emerald-200 hover:bg-emerald-700 hover:text-white'
                          }`
                        }
                        onClick={() => setIsOpen(false)}
                      >
                        <span className="w-1 h-1 rounded-full bg-current"></span>
                        {child.label}
                      </NavLink>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User */}
        <div className="border-t border-emerald-700 px-4 py-3 bg-emerald-900">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-emerald-200 hover:text-red-300 transition text-xs"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}