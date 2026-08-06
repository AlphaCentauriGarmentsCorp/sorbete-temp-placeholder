// src/components/AddressPicker.jsx — pick a saved delivery address, or add a new one
// inline (which also saves it for next time). Used by both checkout paths that reach
// order placement: QuoteSummary.jsx (guided/instant) and WalkInForm.jsx.
//
// Controlled: `value` is the resolved {recipient, phone, line, city} delivery object
// (or null while nothing valid is selected yet), `onChange` fires whenever that
// resolves/changes. The parent gates its "place order" action on `value` being non-null.
import { useEffect, useState } from 'react'
import { listAddresses, createAddress } from '../api/addresses.js'
import { isValidPhMobile, PH_MOBILE_HINT } from '../utils/phone.js'
import '../design/AddressPicker.css'

const EMPTY_FORM = { label: '', recipient: '', phone: '', line: '', city: '' }
const NEW = '__new__'

const toDelivery = (a) => ({ recipient: a.recipient, phone: a.phone, line: a.line, city: a.city })

export default function AddressPicker({ value, onChange }) {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedId, setSelectedId] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    listAddresses().then((list) => {
      setAddresses(list)
      const def = list.find((a) => a.isDefault) || list[0]
      if (def) {
        setSelectedId(def.id)
        onChange(toDelivery(def))
      } else {
        setSelectedId(NEW)
      }
    }).catch(() => {
      // Guest browsing the quote before the sign-in gate (see useCheckout.js) — no
      // saved addresses to load yet. Falls through to "add new," typed inline below.
      setSelectedId(NEW)
    }).finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const select = (address) => {
    setSelectedId(address.id)
    setError('')
    onChange(toDelivery(address))
  }

  const selectNew = () => {
    setSelectedId(NEW)
    onChange(null)
  }

  const upd = (patch) => {
    setForm((f) => ({ ...f, ...patch }))
    onChange(null) // require confirming the new address before it counts
  }

  const confirmNew = async () => {
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
      setAddresses((l) => [created, ...l])
      setSelectedId(created.id)
      setForm(EMPTY_FORM)
      onChange(toDelivery(created))
    } catch (e) {
      if (e.status === 401) {
        // Not signed in yet — the sign-in gate is later, at "Place order." Let them
        // proceed with what they typed; it'll actually get saved once they sign in.
        onChange({ recipient: form.recipient, phone: form.phone, line: form.line, city: form.city })
      } else {
        setError(e.message || 'Could not save address.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="ap-loading">Loading your addresses…</p>

  return (
    <div className="ap">
      {addresses.length > 0 && (
        <div className="ap-list">
          {addresses.map((a) => (
            <button
              key={a.id}
              type="button"
              className={'ap-item' + (selectedId === a.id ? ' ap-item--on' : '')}
              onClick={() => select(a)}
            >
              <div className="ap-item-name">
                {a.recipient} {a.label ? `· ${a.label}` : ''}{a.isDefault && <span className="ap-item-default">Default</span>}
              </div>
              <div className="ap-item-line">{a.line}, {a.city} · {a.phone}</div>
            </button>
          ))}
        </div>
      )}

      <button type="button" className={'ap-item ap-item--new' + (selectedId === NEW ? ' ap-item--on' : '')} onClick={selectNew}>
        + Deliver to a new address
      </button>

      {selectedId === NEW && (
        <div className="ap-form">
          <input className="ap-input" placeholder="Recipient name" value={form.recipient} onChange={(e) => upd({ recipient: e.target.value })} />
          <input className="ap-input" placeholder="Label (Home, Office…) — optional" value={form.label} onChange={(e) => upd({ label: e.target.value })} />
          <input className="ap-input full" placeholder="Street / building / unit" value={form.line} onChange={(e) => upd({ line: e.target.value })} />
          <input className="ap-input" placeholder="City" value={form.city} onChange={(e) => upd({ city: e.target.value })} />
          <input className="ap-input" placeholder="Mobile number (09XX XXX XXXX)" value={form.phone} onChange={(e) => upd({ phone: e.target.value })} />
          {error && <p className="ap-error full">{error}</p>}
          <button type="button" className="btn btn-gold full" disabled={saving} onClick={confirmNew}>
            {saving ? 'Saving…' : 'Use this address'}
          </button>
        </div>
      )}

      {value && <p className="ap-confirmed">✓ Delivering to this address</p>}
    </div>
  )
}
