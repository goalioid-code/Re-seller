import React, { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { adminPaymentAPI } from '../utils/apiClient'

export default function PaymentsPage() {
  const [rows, setRows] = useState([])
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    setErr('')
    try {
      const data = await adminPaymentAPI.getPendingPayments()
      setRows(data.payments || [])
    } catch (e) {
      setErr(e.message || 'Gagal memuat')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const confirm = async (id) => {
    if (!window.confirm('Konfirmasi pembayaran ini sebagai lunas?')) return
    try {
      await adminPaymentAPI.confirmPayment(id)
      await load()
    } catch (e) {
      setErr(e.message || 'Gagal')
    }
  }

  const reject = async (id) => {
    const reason = window.prompt('Alasan penolakan (opsional):') || 'Ditolak admin'
    try {
      await adminPaymentAPI.rejectPayment(id, reason)
      await load()
    } catch (e) {
      setErr(e.message || 'Gagal')
    }
  }

  return (
    <>
      <header className="content-header">
        <div>
          <h2>Konfirmasi pembayaran</h2>
          <p>Pembayaran dengan status pending (Midtrans / bukti manual).</p>
        </div>
      </header>

      <section className="module-card">
        {err && <p className="error-banner">{err}</p>}
        <button type="button" className="secondary-button" onClick={load}>
          Muat ulang
        </button>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order</th>
                <th>Reseller</th>
                <th>Tipe</th>
                <th>Jumlah</th>
                <th>Bukti</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    Tidak ada pembayaran pending.
                  </td>
                </tr>
              )}
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/app/orders/${p.order_id}`}>{p.order?.po_number}</Link>
                  </td>
                  <td>{p.order?.reseller?.name || p.order?.reseller?.email}</td>
                  <td>{p.payment_type}</td>
                  <td>Rp {Number(p.amount).toLocaleString('id-ID')}</td>
                  <td>
                    {p.proof_url ? (
                      <a href={p.proof_url} target="_blank" rel="noreferrer">
                        Lihat
                      </a>
                    ) : (
                      <span className="muted">—</span>
                    )}
                  </td>
                  <td>
                    <div className="actions compact">
                      <button type="button" className="approve-button" onClick={() => confirm(p.id)}>
                        Konfirmasi
                      </button>
                      <button type="button" className="reject-button" onClick={() => reject(p.id)}>
                        Tolak
                      </button>
                    </div>
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
