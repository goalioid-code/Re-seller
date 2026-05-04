import React, { useEffect, useState } from 'react'
import { adminSettingsAPI, adminTiersAPI } from '../utils/apiClient'

export default function SettingsPage() {
  const [minW, setMinW] = useState('1000000')
  const [tiers, setTiers] = useState([])
  const [edit, setEdit] = useState({})
  const [err, setErr] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const [cfg, t] = await Promise.all([adminSettingsAPI.get(), adminTiersAPI.list()])
        setMinW(String(cfg.config?.min_commission_withdrawal ?? 1_000_000))
        setTiers(t.tiers || [])
      } catch (e) {
        setErr(e.message || 'Gagal memuat')
      }
    })()
  }, [])

  const saveMin = async (e) => {
    e.preventDefault()
    setErr('')
    setMsg('')
    try {
      const v = parseFloat(minW)
      await adminSettingsAPI.patch({ min_commission_withdrawal: v })
      setMsg('Minimal pencairan disimpan.')
    } catch (e) {
      setErr(e.message || 'Gagal')
    }
  }

  const saveTier = async (t) => {
    setErr('')
    setMsg('')
    const e = edit[t.id] || {}
    try {
      await adminTiersAPI.update(t.id, {
        name: e.name !== undefined ? e.name : t.name,
        percentage: e.percentage !== undefined ? parseFloat(e.percentage) : t.percentage,
        min_orders: e.min_orders !== undefined ? parseInt(e.min_orders, 10) : t.min_orders,
        is_active: e.is_active !== undefined ? e.is_active : t.is_active,
      })
      setMsg(`Tier ${t.name} diperbarui.`)
      const data = await adminTiersAPI.list()
      setTiers(data.tiers || [])
    } catch (err2) {
      setErr(err2.message || 'Gagal')
    }
  }

  return (
    <>
      <header className="content-header">
        <div>
          <h2>Pengaturan sistem</h2>
          <p>Threshold pencairan komisi &amp; master tier komisi (poin tetap mengikuti logika backend).</p>
        </div>
      </header>

      {err && <p className="error-banner">{err}</p>}
      {msg && <p className="success-banner">{msg}</p>}

      <section className="module-card">
        <h3>Minimal nominal pencairan komisi (Rp)</h3>
        <form className="stack-form" onSubmit={saveMin}>
          <input className="text-input" value={minW} onChange={(e) => setMinW(e.target.value)} />
          <button type="submit" className="primary-button">
            Simpan
          </button>
        </form>
      </section>

      <section className="module-card">
        <h3>Tier komisi</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Nama</th>
                <th>%</th>
                <th>Min order</th>
                <th>Aktif</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {tiers.map((t) => (
                <tr key={t.id}>
                  <td>
                    <input
                      className="text-input inline"
                      defaultValue={t.name}
                      onChange={(ev) => setEdit({ ...edit, [t.id]: { ...edit[t.id], name: ev.target.value } })}
                    />
                  </td>
                  <td>
                    <input
                      className="text-input inline narrow"
                      type="number"
                      step="0.1"
                      defaultValue={t.percentage}
                      onChange={(ev) =>
                        setEdit({ ...edit, [t.id]: { ...edit[t.id], percentage: ev.target.value } })
                      }
                    />
                  </td>
                  <td>
                    <input
                      className="text-input inline narrow"
                      type="number"
                      defaultValue={t.min_orders}
                      onChange={(ev) =>
                        setEdit({ ...edit, [t.id]: { ...edit[t.id], min_orders: ev.target.value } })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      defaultChecked={t.is_active}
                      onChange={(ev) =>
                        setEdit({ ...edit, [t.id]: { ...edit[t.id], is_active: ev.target.checked } })
                      }
                    />
                  </td>
                  <td>
                    <button type="button" className="secondary-button" onClick={() => saveTier(t)}>
                      Simpan baris
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
