import React, { useCallback, useEffect, useState } from 'react'
import { adminResellerAPI } from '../utils/apiClient'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Semua' },
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export default function ResellersModule() {
  const [status, setStatus] = useState('all')
  const [resellers, setResellers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [actionLoadingId, setActionLoadingId] = useState('')

  const loadResellers = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = status === 'all' ? {} : { status }
      const data = await adminResellerAPI.getResellers(params)
      setResellers(data.resellers || [])
    } catch (err) {
      setError(err.message || 'Gagal memuat reseller.')
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    loadResellers()
  }, [loadResellers])

  const updateStatus = async (resellerId, action) => {
    setActionLoadingId(resellerId)
    setError('')
    try {
      if (action === 'approve') {
        await adminResellerAPI.approveReseller(resellerId)
      } else if (action === 'reject') {
        await adminResellerAPI.rejectReseller(resellerId, 'Tidak memenuhi kriteria verifikasi admin')
      } else if (action === 'deactivate') {
        await adminResellerAPI.deactivateReseller(resellerId)
      } else if (action === 'reactivate') {
        await adminResellerAPI.reactivateReseller(resellerId)
      } else if (action === 'delete') {
        await adminResellerAPI.deleteReseller(resellerId)
      }
      await loadResellers()
    } catch (err) {
      setError(err.message || 'Gagal memperbarui status reseller.')
    } finally {
      setActionLoadingId('')
    }
  }

  return (
    <section className="module-card">
      <div className="module-toolbar">
        <div className="toolbar-left">
          <label htmlFor="status-filter">Filter status</label>
          <select
            id="status-filter"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={loading}
          >
            {STATUS_OPTIONS.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
        <button type="button" onClick={loadResellers} disabled={loading} className="secondary-button">
          {loading ? 'Memuat...' : 'Muat Ulang'}
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nama</th>
              <th>Email</th>
              <th>Status</th>
              <th>Dibuat</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {!loading && resellers.length === 0 && (
              <tr>
                <td colSpan={5} className="empty-cell">
                  Tidak ada data reseller.
                </td>
              </tr>
            )}
            {resellers.map((reseller) => {
              const isPending = reseller.status === 'pending'
              const isActive = reseller.status === 'active'
              const isInactive = reseller.status === 'inactive'
              const isActionLoading = actionLoadingId === reseller.id

              return (
                <tr key={reseller.id}>
                  <td>{reseller.name || '-'}</td>
                  <td>{reseller.email}</td>
                  <td>
                    <span className={`status-badge ${reseller.status}`}>{reseller.status}</span>
                  </td>
                  <td>{new Date(reseller.created_at).toLocaleDateString('id-ID')}</td>
                  <td>
                    <div className="actions">
                      <button
                        type="button"
                        onClick={() => updateStatus(reseller.id, 'approve')}
                        disabled={isActionLoading || !isPending}
                        className="approve-button"
                        title={isPending ? 'Approve reseller ini' : 'Hanya status pending yang bisa di-approve'}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(reseller.id, 'reject')}
                        disabled={isActionLoading || !isPending}
                        className="reject-button"
                        title={isPending ? 'Reject reseller ini' : 'Hanya status pending yang bisa di-reject'}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Deactivate akun reseller ${reseller.name || reseller.email}?`)) {
                            updateStatus(reseller.id, 'deactivate')
                          }
                        }}
                        disabled={isActionLoading || !isActive}
                        className="deactivate-button"
                        title={isActive ? 'Nonaktifkan reseller ini' : 'Hanya status active yang bisa di-deactivate'}
                      >
                        Deactivate
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Aktifkan kembali reseller ${reseller.name || reseller.email}?`)) {
                            updateStatus(reseller.id, 'reactivate')
                          }
                        }}
                        disabled={isActionLoading || !isInactive}
                        className="reactivate-button"
                        title={isInactive ? 'Aktifkan kembali reseller ini' : 'Hanya status inactive yang bisa di-reactivate'}
                      >
                        Reactivate
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            window.confirm(
                              `Hapus reseller ${reseller.name || reseller.email}? Tindakan ini hanya berhasil jika reseller belum punya transaksi.`
                            )
                          ) {
                            updateStatus(reseller.id, 'delete')
                          }
                        }}
                        disabled={isActionLoading}
                        className="delete-button"
                        title="Hapus reseller (jika tidak punya transaksi)"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
