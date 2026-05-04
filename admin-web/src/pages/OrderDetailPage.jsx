import React, { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminOrderAPI, adminProductionAPI } from '../utils/apiClient'

const STAGES = ['pending', 'in_progress', 'completed']

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [notes, setNotes] = useState('')
  const [err, setErr] = useState('')
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setErr('')
    try {
      const data = await adminOrderAPI.getOrderDetail(orderId)
      setOrder(data.order)
      setNotes(data.order?.internal_notes || '')
    } catch (e) {
      setErr(e.message || 'Gagal memuat')
    }
  }, [orderId])

  useEffect(() => {
    load()
  }, [load])

  const saveNotes = async () => {
    setSaving(true)
    try {
      const data = await adminOrderAPI.patchInternalNotes(orderId, notes)
      setOrder(data.order)
    } catch (e) {
      setErr(e.message || 'Gagal simpan')
    } finally {
      setSaving(false)
    }
  }

  const updateStage = async (stageId, status) => {
    setErr('')
    try {
      await adminProductionAPI.updateStageStatus(orderId, stageId, { status })
      await load()
    } catch (e) {
      setErr(e.message || 'Gagal update tahap')
    }
  }

  if (!order && !err) return <p className="muted">Memuat…</p>
  if (err && !order) return <p className="error-banner">{err}</p>

  return (
    <>
      <header className="content-header">
        <div>
          <Link to="/app/orders" className="back-link">
            ← Order
          </Link>
          <h2>{order?.po_number}</h2>
          <p>
            {order?.customer_name} · {order?.brand_name} ·{' '}
            <span className={`status-badge ${order?.status}`}>{order?.status}</span>
          </p>
        </div>
      </header>

      {err && <p className="error-banner">{err}</p>}

      <section className="module-card">
        <h3>Ringkasan</h3>
        <p className="muted">
          Reseller: {order?.reseller?.name} ({order?.reseller?.email})
        </p>
        <p>Total: Rp {Number(order?.total_amount || 0).toLocaleString('id-ID')}</p>
      </section>

      <section className="module-card">
        <h3>Catatan internal</h3>
        <p className="muted small">Hanya terlihat di admin — tidak ke reseller.</p>
        <textarea
          className="notes-area"
          rows={5}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Catatan operasional, komplain, follow-up…"
        />
        <button type="button" className="primary-button" onClick={saveNotes} disabled={saving}>
          {saving ? 'Menyimpan…' : 'Simpan catatan'}
        </button>
      </section>

      <section className="module-card">
        <h3>Tahapan produksi (8)</h3>
        <p className="muted small">Ubah status per tahap — urutan validasi di backend.</p>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tahap</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {(order?.production_statuses || []).map((ps) => (
                <tr key={ps.id}>
                  <td>
                    #{ps.stage?.order_index} {ps.stage?.name}
                  </td>
                  <td>
                    <span className={`status-badge ${ps.status}`}>{ps.status}</span>
                  </td>
                  <td>
                    <div className="actions compact">
                      {STAGES.map((st) => (
                        <button
                          key={st}
                          type="button"
                          className="secondary-button small"
                          disabled={ps.status === st}
                          onClick={() => updateStage(ps.stage?.id || ps.stage_id, st)}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="module-card">
        <h3>Pembayaran terkait</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tipe</th>
                <th>Jumlah</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {(order?.payments || []).map((p) => (
                <tr key={p.id}>
                  <td>{p.payment_type}</td>
                  <td>Rp {Number(p.amount).toLocaleString('id-ID')}</td>
                  <td>{p.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  )
}
