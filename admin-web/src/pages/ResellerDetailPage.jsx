import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { adminResellerAPI, adminTiersAPI } from '../utils/apiClient'

// Onboarding data dikirim user-app sebagai object lalu di-stringify ke kolom TEXT
// di tabel resellers. Helper ini parse balik supaya bisa ditampilkan terstruktur.
function parseOnboarding(value) {
  if (!value) return null
  if (typeof value === 'object') return value
  if (typeof value === 'string') {
    try {
      return JSON.parse(value)
    } catch {
      return null
    }
  }
  return null
}

function formatAddress(addr) {
  if (!addr || typeof addr !== 'object') return null
  const parts = [
    addr.detail,
    addr.kelurahan,
    addr.kecamatan,
    addr.kota,
    addr.provinsi,
    addr.kodePos,
  ].filter(Boolean)
  return parts.length ? parts.join(', ') : null
}

/** URL yang bisa ditampilkan di browser admin (bukan file:// di HP). */
function isPublicImageUrl(u) {
  return typeof u === 'string' && /^https?:\/\//i.test(u.trim())
}

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

  const onboarding = useMemo(
    () => parseOnboarding(detail?.onboarding_data),
    [detail?.onboarding_data]
  )
  const businessProfile = onboarding?.businessProfile || {}
  const bankDetails = onboarding?.bankDetails || {}
  const ktpData = onboarding?.ktpData || {}
  const addressDetails = onboarding?.addressDetails || {}
  const media = onboarding?.media || {}
  const fullAddress = formatAddress(addressDetails) || detail?.address

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

  const handleApprove = async () => {
    setErr('')
    if (!window.confirm(`Approve reseller ${detail?.name}?`)) return
    // Optimistic: langsung set status 'active' supaya badge berubah tanpa lag.
    setDetail((prev) => (prev ? { ...prev, status: 'active' } : prev))
    try {
      const resp = await adminResellerAPI.approveReseller(resellerId)
      if (resp?.reseller) setDetail(resp.reseller)
      else await load()
    } catch (e) {
      setErr(e.message || 'Gagal approve reseller')
      await load()
    }
  }

  const handleReject = async () => {
    setErr('')
    const reason = window.prompt('Alasan reject (opsional):') ?? ''
    if (!window.confirm(`Reject reseller ${detail?.name}?`)) return
    setDetail((prev) => (prev ? { ...prev, status: 'inactive' } : prev))
    try {
      const resp = await adminResellerAPI.rejectReseller(resellerId, reason)
      if (resp?.reseller) setDetail(resp.reseller)
      else await load()
    } catch (e) {
      setErr(e.message || 'Gagal reject reseller')
      await load()
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
        {fullAddress && <p>Alamat: {fullAddress}</p>}

        {detail?.status === 'pending' && (
          <div className="action-row" style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button type="button" className="primary-button" onClick={handleApprove}>
              ✓ Approve
            </button>
            <button type="button" className="danger-button" onClick={handleReject}>
              ✕ Reject
            </button>
          </div>
        )}
      </section>

      {onboarding && (
        <section className="module-card">
          <h3>Data onboarding</h3>

          {(addressDetails.provinsi || addressDetails.kota) && (
            <>
              <h4 className="subheading">Alamat lengkap</h4>
              <ul className="kv-list">
                {addressDetails.detail && <li><span>Detail</span> <strong>{addressDetails.detail}</strong></li>}
                {addressDetails.kelurahan && <li><span>Kelurahan</span> <strong>{addressDetails.kelurahan}</strong></li>}
                {addressDetails.kecamatan && <li><span>Kecamatan</span> <strong>{addressDetails.kecamatan}</strong></li>}
                {addressDetails.kota && <li><span>Kota</span> <strong>{addressDetails.kota}</strong></li>}
                {addressDetails.provinsi && <li><span>Provinsi</span> <strong>{addressDetails.provinsi}</strong></li>}
                {addressDetails.kodePos && <li><span>Kode Pos</span> <strong>{addressDetails.kodePos}</strong></li>}
              </ul>
            </>
          )}

          {(businessProfile.brand || businessProfile.fokus || businessProfile.target || businessProfile.targetPO) && (
            <>
              <h4 className="subheading">Profil bisnis</h4>
              <ul className="kv-list">
                {businessProfile.brand && <li><span>Brand</span> <strong>{businessProfile.brand}</strong></li>}
                {businessProfile.fokus && <li><span>Fokus</span> <strong>{businessProfile.fokus}</strong></li>}
                {businessProfile.target && <li><span>Target pasar</span> <strong>{businessProfile.target}</strong></li>}
                {businessProfile.targetPO && <li><span>Target PO/bln</span> <strong>{businessProfile.targetPO}</strong></li>}
              </ul>
            </>
          )}

          {(bankDetails.bank || bankDetails.accountNumber) && (
            <>
              <h4 className="subheading">Rekening</h4>
              <ul className="kv-list">
                {bankDetails.bank && <li><span>Bank</span> <strong>{bankDetails.bank}</strong></li>}
                {bankDetails.accountNumber && <li><span>No. Rekening</span> <strong>{bankDetails.accountNumber}</strong></li>}
                {bankDetails.accountName && <li><span>Atas Nama</span> <strong>{bankDetails.accountName}</strong></li>}
              </ul>
            </>
          )}

          {(ktpData.nik || ktpData.nama) && (
            <>
              <h4 className="subheading">Data KTP</h4>
              <ul className="kv-list">
                {ktpData.nik && <li><span>NIK</span> <strong>{ktpData.nik}</strong></li>}
                {ktpData.nama && <li><span>Nama</span> <strong>{ktpData.nama}</strong></li>}
                {ktpData.tempatTglLahir && <li><span>TTL</span> <strong>{ktpData.tempatTglLahir}</strong></li>}
                {ktpData.jenisKelamin && <li><span>Jenis Kelamin</span> <strong>{ktpData.jenisKelamin}</strong></li>}
                {ktpData.alamat && <li><span>Alamat di KTP</span> <strong>{ktpData.alamat}</strong></li>}
              </ul>
              {bankDetails.accountName && ktpData.nama && (
                <p className="muted" style={{ marginTop: 6 }}>
                  Pencocokan nama rekening &amp; KTP:{' '}
                  <strong>
                    {bankDetails.accountName.trim().toLowerCase() === ktpData.nama.trim().toLowerCase()
                      ? '✓ Cocok'
                      : '⚠ Tidak cocok'}
                  </strong>
                </p>
              )}
            </>
          )}

          {(media.ktpUri || media.selfieUri) && (
            <>
              <h4 className="subheading">Foto verifikasi</h4>
              <p className="muted" style={{ fontSize: 12 }}>
                Jika backend sudah mengunggah ke R2, gambar tampil di bawah. Path <code>file:///</code> hanya ada di HP user dan tidak bisa dibuka dari web.
              </p>
              {media.ktpUri && (
                <div style={{ marginTop: 12 }}>
                  <p style={{ fontWeight: 600, marginBottom: 6 }}>KTP</p>
                  {isPublicImageUrl(media.ktpUri) ? (
                    <img
                      src={media.ktpUri}
                      alt="Foto KTP"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 420,
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.15)',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <p className="muted" style={{ fontSize: 12 }}>
                      Belum ada URL publik. Isi <code>R2_*</code> dan <code>R2_PUBLIC_URL</code> di backend, lalu pendaftar baru akan otomatis upload ke cloud.
                    </p>
                  )}
                  <p className="muted" style={{ fontSize: 11, wordBreak: 'break-all', marginTop: 6 }}>
                    {media.ktpUri}
                  </p>
                </div>
              )}
              {media.selfieUri && (
                <div style={{ marginTop: 20 }}>
                  <p style={{ fontWeight: 600, marginBottom: 6 }}>Selfie</p>
                  {isPublicImageUrl(media.selfieUri) ? (
                    <img
                      src={media.selfieUri}
                      alt="Selfie verifikasi"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 420,
                        borderRadius: 8,
                        border: '1px solid rgba(255,255,255,0.15)',
                        objectFit: 'contain',
                      }}
                    />
                  ) : (
                    <p className="muted" style={{ fontSize: 12 }}>
                      Belum ada URL publik (sama seperti KTP).
                    </p>
                  )}
                  <p className="muted" style={{ fontSize: 11, wordBreak: 'break-all', marginTop: 6 }}>
                    {media.selfieUri}
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      )}

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
