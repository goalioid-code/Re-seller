import React from 'react'

export default function OrdersModule() {
  return (
    <section className="module-card placeholder">
      <h3>Modul Orders</h3>
      <p>
        Struktur modul orders sudah siap. Integrasi endpoint admin orders akan diaktifkan setelah backend
        menyediakan route khusus admin.
      </p>
      <ul>
        <li>Daftar order + filter status</li>
        <li>Detail order + timeline produksi</li>
        <li>Update status order oleh admin</li>
      </ul>
    </section>
  )
}
