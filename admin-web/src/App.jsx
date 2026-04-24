import React, { useMemo, useState } from 'react'
import './App.css'
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext'
import Login from './screens/Login'
import ResellersModule from './modules/ResellersModule'
import OrdersModule from './modules/OrdersModule'
import ProductionModule from './modules/ProductionModule'
import CommissionsModule from './modules/CommissionsModule'

const MODULES = [
  { key: 'resellers', label: 'Reseller', icon: '👥' },
  { key: 'orders', label: 'Orders', icon: '📦' },
  { key: 'production', label: 'Produksi', icon: '🏭' },
  { key: 'commissions', label: 'Komisi', icon: '💰' },
]

function Dashboard() {
  const { admin, logout } = useAdminAuth()
  const [activeModule, setActiveModule] = useState('resellers')

  const moduleTitle = useMemo(
    () => MODULES.find((m) => m.key === activeModule)?.label ?? 'Dashboard',
    [activeModule]
  )

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <div>
          <h1 className="brand-title">CALSUB Admin</h1>
          <p className="brand-subtitle">Portal manajemen operasional</p>
        </div>

        <nav className="menu-list">
          {MODULES.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`menu-item ${activeModule === item.key ? 'active' : ''}`}
              onClick={() => setActiveModule(item.key)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p>{admin?.name}</p>
          <small>{admin?.role}</small>
          <button type="button" onClick={logout} className="logout-button">
            Logout
          </button>
        </div>
      </aside>

      <main className="content">
        <header className="content-header">
          <div>
            <h2>{moduleTitle}</h2>
            <p>Kelola modul {moduleTitle.toLowerCase()} dari panel admin.</p>
          </div>
        </header>

        {activeModule === 'resellers' && <ResellersModule />}
        {activeModule === 'orders' && <OrdersModule />}
        {activeModule === 'production' && <ProductionModule />}
        {activeModule === 'commissions' && <CommissionsModule />}
      </main>
    </div>
  )
}

function MainContent() {
  const { isLoggedIn, loading } = useAdminAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Memuat sistem...</p>
      </div>
    )
  }

  return isLoggedIn ? <Dashboard /> : <Login />
}

function App() {
  return (
    <AdminAuthProvider>
      <MainContent />
    </AdminAuthProvider>
  )
}

export default App
