// src/pages/Address.jsx — saved delivery addresses, gated. Backed by the real API
// (src/api/addresses.js) — used to be a localStorage-only mock.
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import AccountNav from '../components/AccountNav.jsx'
import { listAddresses, createAddress, makeDefaultAddress, deleteAddress } from '../api/addresses.js'
import { isValidPhMobile, PH_MOBILE_HINT } from '../utils/phone.js'
import '../design/dashboard.css'

const EMPTY = { label: '', recipient: '', phone: '', line: '', city: '' }

export default function Address() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    listAddresses().then(setList).finally(() => setLoading(false))
  }, [])

  const upd = (patch) => setForm((f) => ({ ...f, ...patch }))

  const add = async () => {
    if (!form.recipient.trim() || !form.line.trim() || !form.city.trim()) {
      setError('Recipient, street, and city are required.')
      return
    }
    if (!isValidPhMobile(form.phone)) {
      setError(PH_MOBILE_HINT)
      return
    }
    setError('')
    setSaving(true)
    try {
      const created = await createAddress(form)
      setList((l) => [created, ...l])
      setForm(EMPTY)
    } catch (e) {
      setError(e.message || 'Could not save address.')
    } finally {
      setSaving(false)
    }
  }

  const remove = async (id) => {
    await deleteAddress(id)
    setList(await listAddresses())
  }
  const makeDefault = async (id) => {
    await makeDefaultAddress(id)
    setList(await listAddresses())
  }

  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <div className="dash">
          <div className="dash-head">
            <div>
              <div className="dash-eyebrow">Account</div>
              <h1 className="dash-title">Addresses</h1>
            </div>
          </div>
          <AccountNav />

          <div className="panel">
            <div className="panel-h">Saved addresses</div>
            {loading ? (
              <p style={{ color: 'var(--muted)', margin: 0 }}>Loading…</p>
            ) : list.length === 0 ? (
              <p style={{ color: 'var(--muted)', margin: 0 }}>No saved addresses yet.</p>
            ) : (
              <div className="addr-list">
                {list.map((a) => (
                  <div className="addr-item" key={a.id}>
                    <div>
                      <div className="addr-name">
                        {a.recipient} {a.label ? `· ${a.label}` : ''} {a.isDefault && <span className="addr-default">Default</span>}
                      </div>
                      <div className="addr-line">{a.line}, {a.city}{a.phone ? ` · ${a.phone}` : ''}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                      {!a.isDefault && <button className="addr-del" style={{ color: 'var(--ink)' }} onClick={() => makeDefault(a.id)}>Set default</button>}
                      <button className="addr-del" onClick={() => remove(a.id)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="panel">
            <div className="panel-h">Add an address</div>
            <div className="addr-form">
              <input className="addr-input" placeholder="Recipient name" value={form.recipient} onChange={(e) => upd({ recipient: e.target.value })} />
              <input className="addr-input" placeholder="Label (Home, Office…)" value={form.label} onChange={(e) => upd({ label: e.target.value })} />
              <input className="addr-input full" placeholder="Street / building / unit" value={form.line} onChange={(e) => upd({ line: e.target.value })} />
              <input className="addr-input" placeholder="City" value={form.city} onChange={(e) => upd({ city: e.target.value })} />
              <input className="addr-input" placeholder="Mobile number (09XX XXX XXXX)" value={form.phone} onChange={(e) => upd({ phone: e.target.value })} />
              {error && <p className="addr-error full">{error}</p>}
              <button className="btn btn-gold full" disabled={saving} onClick={add}>{saving ? 'Saving…' : 'Save address'}</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
