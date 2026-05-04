import React, { useCallback, useEffect, useState } from 'react'
import { adminPaymentAPI } from '../utils/apiClient'

export default function WithdrawalsPage() {
  const [status, setStatus] = useState('pending')
  const [rows, setRows] = useState([])
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    setErr('')
    try {
      const data = await adminPaymentAPI.getWithdrawals({ status: status || undefined })
      setRows(data.withdrawals || [])
    } catch (e) {
      setErr(e.message || 'Gagal memuat')
    }
  }, [status])

  useEffect(() => {
    load()
  }, [load])

  const approve = async (id) => {
    if (!window.confirm('Setujui pencairan ini?')) return
    try {
      await adminPaymentAPI.approveWithdrawal(id)
      await load()
    } catch (e) {
      setErr(e.message || 'Gagal')
    }
  }

  const reject = async (id) => {
    const reason = window.prompt('Alasan penolakan:') || 'Ditolak'
    try {
      await adminPaymentAPI.rejectWithdrawal(id, reason)
      await load()
    } catch (e) {
      setErr(e.message || 'Gagal')
    }
  }

  return (
    <>
      <header className="content-header">
        <div>
          <h2>Pencairan komisi</h2>
          <p>Approve / tolak pengajuan pencairan reseller.</p>
        </div>
      </header>

      <section className="module-card">
        <div className="module-toolbar">
          <div className="toolbar-left">
            <label>Filter status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Semua</option>
              <option value="pending">pending</option>
              <option value="completed">completed</option>
              <option value="rejected">rejected</option>
            </select>
          </div>
          <button type="button" className="secondary-button" onClick={load}>
            Muat
          </button>
        </div>
        {err && <p className="error-banner">{err}</p>}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Reseller</th>
                <th>Nominal</th>
                <th>Bank</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="empty-cell">
                    Tidak ada data.
                  </td>
                </tr>
              )}
              {rows.map((w) => (
                <tr key={w.id}>
                  <td>{w.reseller?.name || w.reseller?.email}</td>
                  <td>Rp {Number(w.amount).toLocaleString('id-ID')}</td>
                  <td>
                    {w.bank_name} / {w.bank_account}
                  </td>
                  <td>{w.status}</td>
                  <td>
                    {w.status === 'pending' ? (
                      <div className="actions compact">
                        <button type="button" className="approve-button" onClick={() => approve(w.id)}>
                          Setujui
                        </button>
                        <button type="button" className="reject-button" onClick={() => reject(w.id)}>
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span className="muted">—</span>
                    )}
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
