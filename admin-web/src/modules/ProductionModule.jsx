import React from 'react'

export default function ProductionModule() {
  return (
    <section className="module-card placeholder">
      <h3>Modul Produksi</h3>
      <p>
        Modul produksi disiapkan untuk pemantauan stage kerja. UI sudah tersedia sebagai placeholder
        sampai endpoint produksi admin siap digunakan.
      </p>
      <ul>
        <li>Board tahap produksi per order</li>
        <li>Update progress produksi</li>
        <li>Riwayat kendala dan catatan QC</li>
      </ul>
    </section>
  )
}
