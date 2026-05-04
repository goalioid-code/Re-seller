import React, { useCallback, useEffect, useState } from 'react'
import { adminRewardsAPI } from '../utils/apiClient'

const emptyForm = { name: '', description: '', points_cost: '', stock: '', is_active: true }

export default function RewardsAdminPage() {
  const [rows, setRows] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    setErr('')
    try {
      const data = await adminRewardsAPI.list()
      setRows(data.rewards || [])
    } catch (e) {
      setErr(e.message || 'Gagal memuat')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const create = async (e) => {
    e.preventDefault()
    try {
      await adminRewardsAPI.create({
        name: form.name,
        description: form.description || undefined,
        points_cost: parseInt(form.points_cost, 10),
        stock: parseInt(form.stock, 10),
        is_active: form.is_active,
      })
      setForm(emptyForm)
      await load()
    } catch (e) {
      setErr(e.message || 'Gagal simpan')
    }
  }

  const toggle = async (r) => {
    try {
      await adminRewardsAPI.update(r.id, { is_active: !r.is_active })
      await load()
    } catch (e) {
      setErr(e.message || 'Gagal')
    }
  }

  const remove = async (id) => {
    if (!window.confirm('Hapus hadiah ini?')) return
    try {
      await adminRewardsAPI.delete(id)
      await load()
    } catch (e) {
      setErr(e.message || 'Gagal hapus')
    }
  }

  return (
    <>
      <header className="content-header">
        <div>
          <h2>Katalog hadiah</h2>
          <p>Kelola stok, poin, dan status aktif hadiah.</p>
        </div>
      </header>

      <section className="module-card">
        <h3>Tambah hadiah</h3>
        {err && <p className="error-banner">{err}</p>}
        <form className="stack-form" onSubmit={create}>
          <input
            className="text-input"
            placeholder="Nama"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="text-input"
            placeholder="Deskripsi"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            className="text-input"
            placeholder="Poin"
            type="number"
            value={form.points_cost}
            onChange={(e) => setForm({ ...form, points_cost: e.target.value })}
            required
          />
          <input
            className="text-input"
            placeholder="Stok"
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: e.target.value })}
            required
          />
          <label className="checkbox-line">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Aktif
          </label>
          <button type="submit" className="primary-button">
            Simpan
          </button>
        </form>
      </section>

      <section className="module-card">
        <h3>Daftar</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>Poin</th>
                <th>Stok</th>
                <th>Aktif</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.name}</td>
                  <td>{r.points_cost}</td>
                  <td>{r.stock}</td>
                  <td>{r.is_active ? 'ya' : 'tidak'}</td>
                  <td>
                    <button type="button" className="secondary-button small" onClick={() => toggle(r)}>
                      Toggle aktif
                    </button>{' '}
                    <button type="button" className="delete-button small" onClick={() => remove(r.id)}>
                      Hapus
                    </button>
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
