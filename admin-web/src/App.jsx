import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext'
import Login from './screens/Login'
import AdminLayout from './layout/AdminLayout'
import DashboardPage from './pages/DashboardPage'
import ResellersModule from './modules/ResellersModule'
import ResellerDetailPage from './pages/ResellerDetailPage'
import OrdersPage from './pages/OrdersPage'
import OrderDetailPage from './pages/OrderDetailPage'
import PaymentsPage from './pages/PaymentsPage'
import WithdrawalsPage from './pages/WithdrawalsPage'
import RewardsAdminPage from './pages/RewardsAdminPage'
import RedemptionsAdminPage from './pages/RedemptionsAdminPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'

function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAdminAuth()
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Memuat sistem...</p>
      </div>
    )
  }
  if (!isLoggedIn) return <Navigate to="/login" replace />
  return children
}

function LoginRoute() {
  const { isLoggedIn, loading } = useAdminAuth()
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    )
  }
  if (isLoggedIn) return <Navigate to="/app/dashboard" replace />
  return <Login />
}

function HomeRedirect() {
  const { isLoggedIn, loading } = useAdminAuth()
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
      </div>
    )
  }
  return <Navigate to={isLoggedIn ? '/app/dashboard' : '/login'} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginRoute />} />
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="resellers" element={<ResellersModule />} />
        <Route path="resellers/:resellerId" element={<ResellerDetailPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="orders/:orderId" element={<OrderDetailPage />} />
        <Route path="payments" element={<PaymentsPage />} />
        <Route path="withdrawals" element={<WithdrawalsPage />} />
        <Route path="rewards" element={<RewardsAdminPage />} />
        <Route path="redemptions" element={<RedemptionsAdminPage />} />
        <Route path="reports" element={<ReportsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AdminAuthProvider>
        <AppRoutes />
      </AdminAuthProvider>
    </BrowserRouter>
  )
}

export default App
