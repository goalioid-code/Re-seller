import React, { useCallback, useEffect, useState } from 'react'
import { adminRedemptionsAPI } from '../utils/apiClient'

export default function RedemptionsAdminPage() {
  const [status, setStatus] = useState('pending')
  const [rows, setRows] = useState([])
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    setErr('')
    try {
      const data = await adminRedemptionsAPI.list({ status: status || undefined })
      setRows(data.redemptions || [])
    } catch (e) {
      setErr(e.message || 'Gagal memuat')
    }
  }, [status])

  useEffect(() => {
    load()
  }, [load])

  const approve = async (id) => {
    if (!window.confirm('Setujui penukaran?')) return
    try {
      await adminRedemptionsAPI.approve(id)
      await load()
    } catch (e) {
      setErr(e.message || 'Gagal')
    }
  }

  const reject = async (id) => {
    const reason = window.prompt('Alasan:') || 'Ditolak'
    try {
      await adminRedemptionsAPI.reject(id, reason)
      await load()
    } catch (e) {
      setErr(e.message || 'Gagal')
    }
  }

  return (
    <>
      <header className="content-header">
        <div>
          <h2>Approve penukaran poin</h2>
          <p>Verifikasi pengiriman hadiah ke reseller.</p>
        </div>
      </header>

      <section className="module-card">
        <div className="module-toolbar">
          <div className="toolbar-left">
            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="pending">pending</option>
              <option value="">Semua</option>
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
                <th>Hadiah</th>
                <th>Poin</th>
                <th>Alamat</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-cell">
                    Tidak ada data.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.reseller?.name || r.reseller?.email}</td>
                  <td>{r.reward?.name}</td>
                  <td>{r.points_used}</td>
                  <td className="cell-clip">{r.address || '—'}</td>
                  <td>{r.status}</td>
                  <td>
                    {r.status === 'pending' ? (
                      <div className="actions compact">
                        <button type="button" className="approve-button" onClick={() => approve(r.id)}>
                          Setujui
                        </button>
                        <button type="button" className="reject-button" onClick={() => reject(r.id)}>
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
