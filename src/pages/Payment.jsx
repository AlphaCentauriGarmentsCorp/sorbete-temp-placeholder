// src/pages/Payment.jsx — INTERIM order-placed + payment-schedule screen (Phase 2).
// Both online paths and the walk-in kiosk land here after the order is created. Phase 3
// replaces this with the real payment flow: channel select → proof upload → manual staff
// review (spec §3), plus the sample-review minor/major branch (spec §4). For now it confirms
// placement, shows the 3-payment schedule read-only, and links into tracking.
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { IoCheckmarkCircle, IoArrowForward } from 'react-icons/io5'
import { getParam, navigate } from '../utils/navigation.js'
import { useOrders } from '../context/OrderContext.jsx'
import { getState } from '../data/orderStates.js'
import { peso, styleById } from '../data/orderConfig.js'
import '../design/Payment.css'

const ONLINE_CHANNELS = ['GCash', 'Maya', 'Bank Transfer']
const WALKIN_CHANNELS = ['GCash', 'Maya', 'Bank Transfer', 'Cash']

export default function Payment() {
  const { getById } = useOrders()
  const id = getParam('id')
  const order = id ? getById(id) : null

  if (!order) {
    return (
      <div className="page">
        <Navbar />
        <div className="page-body">
          <div className="stub">
            <div className="stub-eyebrow">Payment</div>
            <h1>Order not found</h1>
            <p>We couldn’t find that order. It may have been cleared, or the link is wrong.</p>
            <div className="stub-links">
              <button className="btn btn-gold" onClick={() => navigate('?page=start')}>Start an order</button>
              <button className="btn btn-ghost" onClick={() => navigate('?page=my-orders')}>My orders</button>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  const { totals, path } = order
  const channels = path === 'walkin' ? WALKIN_CHANNELS : ONLINE_CHANNELS
  const state = getState(order.status)

  const schedule = [
    { k: '1 · Sample fee', v: peso(totals.sampleFee), note: 'Billed first — separate, not credited toward the total.' },
    { k: '2 · 60% downpayment', v: peso(totals.dp), note: 'After you approve the physical sample. Starts production.' },
    { k: '3 · 40% balance', v: peso(totals.bal), note: 'At pickup / delivery.' },
  ]

  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <div className="pay-wrap">
          <div className="pay-banner">
            <IoCheckmarkCircle className="pay-banner-icon" />
            <div>
              <div className="pay-banner-title">Order placed — {order.ref}</div>
              <div className="pay-banner-sub">
                Status: <strong>{state.label}</strong> · {order.qty} pcs · {styleById(order.form.style).label}
              </div>
            </div>
          </div>

          <div className="pay-card">
            <h2 className="pay-h2">Payment schedule</h2>
            <p className="pay-lead">
              Three payments, in order. {path === 'walkin' ? 'Cash is available at the counter.' : 'Online orders pay by e-wallet or bank transfer.'}
            </p>

            <div className="pay-schedule">
              {schedule.map((s) => (
                <div className="pay-step" key={s.k}>
                  <div className="pay-step-top">
                    <span className="pay-step-k">{s.k}</span>
                    <span className="pay-step-v">{s.v}</span>
                  </div>
                  <div className="pay-step-note">{s.note}</div>
                </div>
              ))}
              <div className="pay-total">
                <span>Total (incl. sample fee)</span>
                <span>{peso(totals.grandTotal)}</span>
              </div>
            </div>

            <div className="pay-channels">
              <div className="pay-channels-label">Payment channels</div>
              <div className="pay-chips">
                {channels.map((c) => (
                  <span className="pay-chip" key={c}>{c}</span>
                ))}
              </div>
            </div>

            <div className="pay-phase3">
              Next step — paying the ₱{totals.sampleFee.toLocaleString('en-PH')} sample fee (choose a
              channel, upload proof, staff verifies) — lands in <strong>Phase 3</strong>.
            </div>

            <div className="pay-actions">
              <button className="btn btn-gold" onClick={() => navigate('?page=track-order&id=' + order.id)}>
                Track this order <IoArrowForward />
              </button>
              <button className="btn btn-ghost" onClick={() => navigate('?page=my-orders')}>My orders</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
