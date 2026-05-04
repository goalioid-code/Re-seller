import React, { useEffect, useState } from 'react'
import { adminReportsAPI, API_URL } from '../utils/apiClient'

async function downloadCsv(path, filename) {
  const token = localStorage.getItem('adminToken')
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Export gagal')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ReportsPage() {
  const [fin, setFin] = useState(null)
  const [err, setErr] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const data = await adminReportsAPI.getFinancialReport()
        setFin(data.financial)
      } catch (e) {
        setErr(e.message || 'Gagal')
      }
    })()
  }, [])

  return (
    <>
      <header className="content-header">
        <div>
          <h2>Laporan &amp; analitik</h2>
          <p>Ringkasan keuangan dan export CSV (order, reseller, komisi/pencairan).</p>
        </div>
      </header>

      {err && <p className="error-banner">{err}</p>}

      <section className="module-card">
        <h3>Ringkasan keuangan</h3>
        {fin && (
          <ul className="kv-list">
            <li>
              <span>Total komisi terkonfirmasi</span>
              <strong>Rp {Number(fin.total_commission_confirmed).toLocaleString('id-ID')}</strong>
            </li>
            <li>
              <span>Total pencairan (pending + selesai)</span>
              <strong>Rp {Number(fin.total_withdrawals_locked_or_paid).toLocaleString('id-ID')}</strong>
            </li>
          </ul>
        )}
      </section>

      <section className="module-card">
        <h3>Export CSV / Excel</h3>
        <p className="muted small">File CSV dapat dibuka di Microsoft Excel.</p>
        <div className="button-row">
          <button
            type="button"
            className="primary-button"
            onClick={() => downloadCsv('/admin/reports/orders?format=csv', 'orders.csv')}
          >
            Export order
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => downloadCsv('/admin/reports/resellers?format=csv', 'resellers.csv')}
          >
            Export reseller
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => downloadCsv('/admin/reports/financial?format=csv', 'financial.csv')}
          >
            Export komisi &amp; pencairan
          </button>
        </div>
      </section>
    </>
  )
}
