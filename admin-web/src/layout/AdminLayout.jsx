import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../context/AdminAuthContext'

const NAV = [
  { to: '/app/dashboard', label: 'Dashboard', icon: '📊' },
  { to: '/app/resellers', label: 'Reseller', icon: '👥' },
  { to: '/app/orders', label: 'Order', icon: '📦' },
  { to: '/app/payments', label: 'Pembayaran', icon: '💳' },
  { to: '/app/withdrawals', label: 'Pencairan komisi', icon: '🏦' },
  { to: '/app/rewards', label: 'Katalog hadiah', icon: '🎁' },
  { to: '/app/redemptions', label: 'Penukaran poin', icon: '✨' },
  { to: '/app/reports', label: 'Laporan', icon: '📈' },
  { to: '/app/settings', label: 'Pengaturan', icon: '⚙️' },
]

export default function AdminLayout() {
  const { admin, logout } = useAdminAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div>
          <h1 className="brand-title">CALSUB Admin</h1>
          <p className="brand-subtitle">Portal manajemen operasional</p>
        </div>

        <nav className="menu-list">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `menu-item${isActive ? ' active' : ''}`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p>{admin?.name}</p>
          <small>{admin?.role}</small>
          <button type="button" onClick={handleLogout} className="logout-button">
            Logout
          </button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
