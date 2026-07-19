// src/pages/WalkInForm.jsx — in-store QR kiosk (?page=walk-in). On-site experience.
// Ported from design-reference/01-Website-Prototype/Walk-in Form.dc.html (garment → details →
// confirm). Two changes from the prototype:
//   1. Pricing runs through the canonical orderConfig engine, not the stale ₱290/₱650 numbers.
//   2. Walk-in guests are SMS-tracked (spec §2) — we collect a phone and fire a mock SMS on
//      placement instead of assuming a login. No auth gate here (cash stays available in store).
import { useState } from 'react'
import { IoStorefrontOutline, IoClose } from 'react-icons/io5'
import { navigate } from '../utils/navigation.js'
import { useOrders } from '../context/OrderContext.jsx'
import { sendSMS } from '../mocks/sms.js'
import { quoteTotals, peso, MIN_QTY } from '../data/orderConfig.js'
import '../design/WalkInForm.css'

// The kiosk is deliberately simple (2 garments). Map each to a canonical orderConfig
// style + sensible in-store defaults so the estimate comes from the real pricing engine.
const GARMENTS = [
  { id: 'tee', label: 'T-shirt', glyph: 'T', style: 'plain-tee' },
  { id: 'hoodie', label: 'Hoodie', glyph: 'H', style: 'hoodie' },
]
const BASE_FORM = {
  fit: 'Standard', size: 'M',
  collar: 'Standard ribbed crew', sleeve: 'Standard cuff', hem: 'Standard open hem',
  fabric: 'CVC 240 GSM', color: 'Black',
  hasDesign: false, printColors: 1, placement: 'Front only',
}

export default function WalkInForm() {
  const { createOrderRecord } = useOrders()
  const [step, setStep] = useState(1)
  const [garment, setGarment] = useState('tee')
  const [label, setLabel] = useState('')
  const [notes, setNotes] = useState('')
  const [qty, setQty] = useState(MIN_QTY)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [placing, setPlacing] = useState(false)

  const g = GARMENTS.find((x) => x.id === garment)
  const form = { ...BASE_FORM, style: g.style }
  const t = quoteTotals(form, qty)

  const back = () => setStep((s) => Math.max(1, s - 1))

  const placeWalkIn = async () => {
    if (placing) return
    setPlacing(true)
    const customer = { name: name.trim() || 'Walk-in guest', phone: phone.trim() || null }
    const order = await createOrderRecord({
      path: 'walkin',
      form,
      qty,
      customer,
      // extra intake captured at the counter
    })
    // Walk-in guests are tracked by SMS (spec §2/§4), not a login.
    if (customer.phone) {
      // TODO: replace with real SMS gateway — see FRONTEND-BUILD-SPEC.md §3/§4 (src/mocks/sms.js)
      sendSMS(customer.phone, `Sorbetes: walk-in order ${order.ref} received. We'll text you when your sample is ready.`)
    }
    navigate('?page=payment&id=' + order.id)
  }

  return (
    <div className="wk-page">
      <header className="wk-head">
        <button className="wk-exit" aria-label="Exit" onClick={() => navigate('?page=walk-ins')}>
          <IoClose />
        </button>
        <span className="wk-step-label">
          <IoStorefrontOutline /> Walk-in order · Step {step} of 3
        </span>
      </header>

      <main className="wk-main">
        <div className="wk-inner">
          {step === 1 && (
            <div className="wk-panel">
              <h1 className="wk-h1">What are you ordering today?</h1>
              <div className="wk-garments">
                {GARMENTS.map((x) => (
                  <button
                    key={x.id}
                    className={'wk-garment' + (garment === x.id ? ' wk-garment--on' : '')}
                    onClick={() => setGarment(x.id)}
                  >
                    <span className="wk-garment-glyph">{x.glyph}</span>
                    <span className="wk-garment-label">{x.label}</span>
                  </button>
                ))}
              </div>
              <button className="wk-primary" onClick={() => setStep(2)}>Continue</button>
            </div>
          )}

          {step === 2 && (
            <div className="wk-panel">
              <h1 className="wk-h1">Order details</h1>
              <div className="wk-fields">
                <input className="wk-input" type="text" value={label} placeholder="Design name / label"
                  onChange={(e) => setLabel(e.target.value)} />
                <textarea className="wk-input" rows="3" value={notes}
                  placeholder="Describe the print or show a reference at the counter"
                  onChange={(e) => setNotes(e.target.value)} />
                <div className="wk-qty-row">
                  <span className="wk-qty-label">Quantity</span>
                  <button className="wk-qty-btn" onClick={() => setQty((q) => Math.max(MIN_QTY, q - 10))}>−</button>
                  <span className="wk-qty-val">{qty}</span>
                  <button className="wk-qty-btn" onClick={() => setQty((q) => q + 10)}>+</button>
                </div>
                <div className="wk-hint">Minimum {MIN_QTY} pcs · steps of 10</div>
                <div className="wk-contact">
                  <input className="wk-input" type="text" value={name} placeholder="Your name"
                    onChange={(e) => setName(e.target.value)} />
                  <input className="wk-input" type="tel" value={phone} placeholder="Mobile number (for SMS updates)"
                    onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
              <div className="wk-actions">
                <button className="wk-ghost" onClick={back}>Back</button>
                <button className="wk-primary wk-grow" onClick={() => setStep(3)}>Continue</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="wk-panel">
              <h1 className="wk-h1">Confirm your order</h1>
              <div className="wk-summary">
                {[
                  ['Garment', g.label],
                  ['Design / label', label || '—'],
                  ['Notes', notes || '—'],
                  ['Quantity', qty + ' pcs'],
                  ['Contact', phone ? `${name || 'Guest'} · ${phone}` : name || '—'],
                ].map(([k, v]) => (
                  <div className="wk-summary-row" key={k}>
                    <span className="wk-summary-k">{k}</span>
                    <span className="wk-summary-v">{v}</span>
                  </div>
                ))}
              </div>

              <div className="wk-total">
                <span className="wk-total-k">In-store estimate</span>
                <span className="wk-total-v">{peso(t.grandTotal)}</span>
              </div>
              <p className="wk-note">
                Estimate includes the ₱1,000 sample fee. Staff confirms your final quote, sizes,
                and payment (cash or e-wallet) at the counter.
              </p>

              <div className="wk-actions">
                <button className="wk-ghost" onClick={back}>Back</button>
                <button className="wk-primary wk-grow wk-gold" onClick={placeWalkIn} disabled={placing}>
                  {placing ? 'Placing…' : 'Place walk-in order'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
