// src/pages/Address.jsx — saved delivery addresses (mock, localStorage-backed), gated.
// TODO: replace with real API — see FRONTEND-BUILD-SPEC.md §3 (addresses would live server-side).
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import AccountNav from '../components/AccountNav.jsx'
import { useSession } from '../context/SessionContext.jsx'
import '../design/dashboard.css'

const KEY = 'sorbetes_addresses'
const EMPTY = { label: '', recipient: '', phone: '', line: '', city: '' }

function load() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}')
  } catch {
    return {}
  }
}

export default function Address() {
  const { user } = useSession()
  const [all, setAll] = useState(load) // keyed by user email → address list
  const [form, setForm] = useState(EMPTY)
  const list = all[user.email] || []

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(all))
    } catch {
      /* ignore */
    }
  }, [all])

  const setList = (next) => setAll((a) => ({ ...a, [user.email]: next }))

  const add = () => {
    if (!form.recipient.trim() || !form.line.trim()) return
    const entry = { id: 'addr_' + Math.random().toString(36).slice(2, 8), ...form, default: list.length === 0 }
    setList([...list, entry])
    setForm(EMPTY)
  }
  const remove = (id) => setList(list.filter((a) => a.id !== id))
  const makeDefault = (id) => setList(list.map((a) => ({ ...a, default: a.id === id })))

  const upd = (patch) => setForm((f) => ({ ...f, ...patch }))

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
            {list.length === 0 ? (
              <p style={{ color: 'var(--muted)', margin: 0 }}>No saved addresses yet.</p>
            ) : (
              <div className="addr-list">
                {list.map((a) => (
                  <div className="addr-item" key={a.id}>
                    <div>
                      <div className="addr-name">
                        {a.recipient} {a.label ? `· ${a.label}` : ''} {a.default && <span className="addr-default">Default</span>}
                      </div>
                      <div className="addr-line">{a.line}, {a.city}{a.phone ? ` · ${a.phone}` : ''}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                      {!a.default && <button className="addr-del" style={{ color: 'var(--ink)' }} onClick={() => makeDefault(a.id)}>Set default</button>}
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
              <input className="addr-input" placeholder="Mobile number" value={form.phone} onChange={(e) => upd({ phone: e.target.value })} />
              <button className="btn btn-gold full" onClick={add}>Save address</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
