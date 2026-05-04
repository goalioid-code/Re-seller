import React, { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminResellerAPI, adminTiersAPI } from '../utils/apiClient'

export default function ResellerDetailPage() {
  const { resellerId } = useParams()
  const [detail, setDetail] = useState(null)
  const [perf, setPerf] = useState(null)
  const [tiers, setTiers] = useState([])
  const [tierId, setTierId] = useState('')
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    setErr('')
    try {
      const [d, p, t] = await Promise.all([
        adminResellerAPI.getResellerDetail(resellerId),
        adminResellerAPI.getPerformance(resellerId),
        adminTiersAPI.list(),
      ])
      setDetail(d.reseller)
      setPerf(p.performance)
      setTiers(t.tiers || [])
      setTierId(d.reseller?.tier_id || '')
    } catch (e) {
      setErr(e.message || 'Gagal memuat')
    }
  }, [resellerId])

  useEffect(() => {
    load()
  }, [load])

  const saveTier = async () => {
    setErr('')
    if (!tierId) {
      setErr('Pilih tier terlebih dahulu.')
      return
    }
    try {
      await adminResellerAPI.setResellerTier(resellerId, tierId)
      await load()
    } catch (e) {
      setErr(e.message || 'Gagal set tier')
    }
  }

  if (!detail && !err) return <p className="muted">Memuat…</p>
  if (err && !detail) return <p className="error-banner">{err}</p>

  const by = perf?.orders_by_status || {}

  return (
    <>
      <header className="content-header">
        <div>
          <Link to="/app/resellers" className="back-link">
            ← Reseller
          </Link>
          <h2>{detail?.name}</h2>
          <p className="muted">{detail?.email}</p>
        </div>
      </header>

      {err && <p className="error-banner">{err}</p>}

      <section className="module-card">
        <h3>Profil &amp; status</h3>
        <p>
          Status: <span className={`status-badge ${detail?.status}`}>{detail?.status}</span>
        </p>
        {detail?.phone && <p>HP: {detail.phone}</p>}
        {detail?.address && <p>Alamat: {detail.address}</p>}
      </section>

      <section className="module-card">
        <h3>Performa</h3>
        <p>Order selesai: <strong>{perf?.orders_completed ?? 0}</strong></p>
        <p>Komisi terkonfirmasi: Rp {Number(perf?.commission_confirmed_total || 0).toLocaleString('id-ID')}</p>
        <p>Total pengajuan pencairan (pending+): Rp {Number(perf?.withdrawals_total || 0).toLocaleString('id-ID')}</p>
        <h4 className="subheading">Order per status</h4>
        <ul className="kv-list">
          {Object.keys(by).map((k) => (
            <li key={k}>
              <span>{k}</span> <strong>{by[k]}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="module-card">
        <h3>Tier komisi</h3>
        <select className="text-input" value={tierId} onChange={(e) => setTierId(e.target.value)}>
          <option value="">— pilih tier —</option>
          {tiers.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} ({t.percentage}%) · min {t.min_orders} order
            </option>
          ))}
        </select>
        <button type="button" className="primary-button mt" onClick={saveTier}>
          Simpan tier
        </button>
      </section>

      <section className="module-card">
        <h3>Riwayat singkat</h3>
        <h4 className="subheading">Order terbaru</h4>
        <ul className="simple-list">
          {(detail?.orders || []).map((o) => (
            <li key={o.id}>
              <Link to={`/app/orders/${o.id}`}>{o.po_number}</Link> — {o.status}
            </li>
          ))}
        </ul>
      </section>
    </>
  )
}
