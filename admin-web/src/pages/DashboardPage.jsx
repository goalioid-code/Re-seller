import React, { useEffect, useState } from 'react'
import { adminReportsAPI } from '../utils/apiClient'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await adminReportsAPI.getDashboard()
        if (!cancelled) setData(res.dashboard)
      } catch (e) {
        if (!cancelled) setErr(e.message || 'Gagal memuat')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  if (loading) return <p className="muted">Memuat dashboard…</p>
  if (err) return <p className="error-banner">{err}</p>

  const by = data?.orders_by_status || {}
  const keys = Object.keys(by)

  return (
    <>
      <header className="content-header">
        <div>
          <h2>Dashboard</h2>
          <p>Ringkasan order, produksi, dan antrian verifikasi.</p>
        </div>
      </header>

      <section className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Total order</span>
          <strong className="stat-value">{data?.orders_total ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Reseller pending</span>
          <strong className="stat-value">{data?.pending_resellers ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Pembayaran menunggu review</span>
          <strong className="stat-value">{data?.pending_payments_review ?? 0}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Stage produksi selesai hari ini</span>
          <strong className="stat-value">{data?.production_stages_completed_today ?? 0}</strong>
        </div>
      </section>

      <section className="module-card">
        <h3>Order per status</h3>
        {keys.length === 0 ? (
          <p className="muted">Belum ada data.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              {keys.map((k) => (
                <tr key={k}>
                  <td>
                    <span className={`status-badge ${k}`}>{k}</span>
                  </td>
                  <td>{by[k]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  )
}
