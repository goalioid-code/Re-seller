import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminOrderAPI } from '../utils/apiClient'

export default function OrdersPage() {
  const [status, setStatus] = useState('')
  const [q, setQ] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setErr('')
    try {
      const params = {}
      if (status) params.status = status
      if (q.trim()) params.q = q.trim()
      const data = await adminOrderAPI.getOrders(params)
      setOrders(data.orders || [])
    } catch (e) {
      setErr(e.message || 'Gagal memuat order')
    } finally {
      setLoading(false)
    }
  }, [status, q])

  useEffect(() => {
    load()
  }, [load])

  return (
    <>
      <header className="content-header">
        <div>
          <h2>Manajemen order</h2>
          <p>Daftar semua order reseller — filter status &amp; pencarian PO / pelanggan.</p>
        </div>
      </header>

      <section className="module-card">
        <div className="module-toolbar">
          <div className="toolbar-left">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Semua</option>
              <option value="draft">draft</option>
              <option value="design">design</option>
              <option value="production">production</option>
              <option value="completed">completed</option>
              <option value="cancelled">cancelled</option>
            </select>
          </div>
          <div className="toolbar-left">
            <label>Cari</label>
            <input
              className="text-input"
              placeholder="PO / customer / brand"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <button type="button" className="secondary-button" onClick={load} disabled={loading}>
            Muat
          </button>
        </div>
        {err && <p className="error-banner">{err}</p>}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>PO</th>
                <th>Reseller</th>
                <th>Status</th>
                <th>Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Tidak ada order.
                  </td>
                </tr>
              )}
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.po_number}</td>
                  <td>{o.reseller?.name || o.reseller?.email}</td>
                  <td>
                    <span className={`status-badge ${o.status}`}>{o.status}</span>
                  </td>
                  <td>Rp {Number(o.total_amount).toLocaleString('id-ID')}</td>
                  <td>
                    <Link to={`/app/orders/${o.id}`} className="link-button">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
