import React from 'react'
import './App.css'
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext'
import Login from './screens/Login'

function Dashboard() {
  const { admin, logout } = useAdminAuth()

  return (
    <div className="dashboard-layout">
      <section id="center">
        <div className="hero">
          <h1>🚀 CALSUB Reseller</h1>
          <p className="subtitle">Admin Dashboard Portal</p>
        </div>
        <div className="card">
          <h2>Selamat Datang, {admin?.name}!</h2>
          <p>
            Ini adalah portal internal tim CALSUB untuk mengelola reseller, pesanan, dan produksi.
          </p>
          <div className="status-grid">
            <div className="status-item">
              <strong>Role Anda:</strong>
              <span className="badge success">{admin?.role}</span>
            </div>
            <button onClick={logout} className="logout-button">Logout</button>
          </div>
        </div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <h2>Modul Admin (Sprint 5)</h2>
          <div className="modules-grid">
            <div className="module-card">👥 Reseller</div>
            <div className="module-card">📦 Orders</div>
            <div className="module-card">🏭 Produksi</div>
            <div className="module-card">💰 Komisi</div>
          </div>
        </div>
      </section>
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
