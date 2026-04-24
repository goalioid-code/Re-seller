import React from 'react'

export default function CommissionsModule() {
  return (
    <section className="module-card placeholder">
      <h3>Modul Komisi & Pembayaran</h3>
      <p>
        Halaman komisi disiapkan sebagai fondasi monitoring finansial reseller. Akan disambungkan ke
        endpoint laporan keuangan admin.
      </p>
      <ul>
        <li>Ringkasan komisi per reseller</li>
        <li>Status payout dan approval pembayaran</li>
        <li>Export laporan periodik</li>
      </ul>
    </section>
  )
}
