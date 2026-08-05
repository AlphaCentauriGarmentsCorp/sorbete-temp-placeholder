// src/pages/Payment.jsx — order lifecycle driver (Phase 3).
// Renders the action required by the order's current §6 state and drives the machine:
// pay (proof upload / cash) → manual staff review (approve/reject) → sample review
// (approve / request changes → seller classifies minor|major) → downpayment → production
// → ready (balance) → delivered. All payment verification is MANUAL (spec §3) — no PayMongo.
//
// The "Seller / staff — demo" panel stands in for the real staff console that doesn't
// exist yet (Sorbetes has no staff accounts by design) — its actions go through the
// backend's owner-authorized demo-advance endpoint (OrderContext.jsx), so they're real
// transitions, not local simulation. Replace once a real staff console is connected.
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import StubScreen from '../components/StubScreen.jsx'
import {
  IoCheckmarkCircle, IoArrowForward, IoTimeOutline, IoWarningOutline,
  IoCloudUploadOutline, IoStorefrontOutline, IoConstructOutline,
} from 'react-icons/io5'
import { getParam, navigate } from '../utils/navigation.js'
import { useOrders } from '../context/OrderContext.jsx'
import { getState, isPayment } from '../data/orderStates.js'
import { peso, styleById, DEFECT_CLASSES, SAMPLE_DEFECT_FEE } from '../data/orderConfig.js'
import '../design/Payment.css'

const ONLINE_CHANNELS = ['GCash', 'Maya', 'Bank Transfer']
const WALKIN_CHANNELS = ['GCash', 'Maya', 'Bank Transfer', 'Cash']

const PAY_LABEL = { sampleFee: 'Sample fee', dp: '60% downpayment', bal: '40% balance' }

// 5 visible milestones grouped from the 10-state happy path.
const MILESTONES = [
  { label: 'Order', states: ['waiting_for_seller'] },
  { label: 'Sample fee', states: ['sample_fee_to_pay', 'sample_fee_review'] },
  { label: 'Sample', states: ['sample_production', 'sample_approval'] },
  { label: 'Downpayment', states: ['downpayment_to_pay', 'downpayment_review'] },
  { label: 'Produce → deliver', states: ['in_production', 'ready_to_ship', 'delivered'] },
]
const milestoneIndex = (st) => Math.max(0, MILESTONES.findIndex((m) => m.states.includes(st)))

function Stepper({ status }) {
  const cur = milestoneIndex(status)
  const done = status === 'delivered'
  return (
    <div className="pm-stepper">
      {MILESTONES.map((m, i) => {
        const state = done || i < cur ? 'done' : i === cur ? 'active' : 'todo'
        return (
          <div className={'pm-step pm-step--' + state} key={m.label}>
            <span className="pm-step-dot">{state === 'done' ? '✓' : i + 1}</span>
            <span className="pm-step-label">{m.label}</span>
          </div>
        )
      })}
    </div>
  )
}

function PayPanel({ order, channels, onPay }) {
  const type = getState(order.status).payment
  const amount = order.totals[type]
  const [channel, setChannel] = useState(channels[0])
  const [ref, setRef] = useState('')
  const [fileName, setFileName] = useState('')
  const isCash = channel === 'Cash'
  const canSubmit = isCash || (ref.trim() && fileName)

  return (
    <div className="pm-pay">
      <div className="pm-pay-amount">
        <span>{PAY_LABEL[type]} due</span>
        <strong>{peso(amount)}</strong>
      </div>

      <div className="pm-field-label">Payment channel</div>
      <div className="pm-chips">
        {channels.map((c) => (
          <button
            key={c}
            className={'pm-chip-btn' + (channel === c ? ' pm-chip-btn--on' : '')}
            onClick={() => setChannel(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {isCash ? (
        <p className="pm-cash-note">
          Pay in cash at the counter — staff confirms receipt on the spot (no proof upload needed).
        </p>
      ) : (
        <>
          <div className="pm-field-label">Reference number</div>
          <input
            className="pm-input"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
            placeholder="e.g. GCash ref #, bank txn #"
          />
          <div className="pm-field-label">Proof of payment</div>
          {/* Mock upload — the file never leaves the browser; we keep the name only.
              TODO: replace with real upload — see FRONTEND-BUILD-SPEC.md §3. */}
          <label className="pm-upload">
            <IoCloudUploadOutline />
            <span>{fileName || 'Upload screenshot / receipt'}</span>
            <input type="file" accept="image/*,application/pdf" hidden
              onChange={(e) => setFileName(e.target.files?.[0]?.name || '')} />
          </label>
        </>
      )}

      <button className="btn btn-gold pm-pay-submit" disabled={!canSubmit}
        onClick={() => onPay({ channel, ref: ref.trim(), proofName: fileName || null })}>
        {isCash ? 'Confirm cash payment' : 'Submit payment for review'} <IoArrowForward />
      </button>
    </div>
  )
}

export default function Payment() {
  const { getById, pay, reviewProof, advance } = useOrders()
  const id = getParam('id')
  const order = id ? getById(id) : null
  const st = order?.status
  const [changesRequested, setChangesRequested] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    if (st !== 'sample_approval') setChangesRequested(false)
  }, [st])

  if (!order) {
    return (
      <StubScreen
        eyebrow="Order"
        title="Order not found"
        actions={
          <>
            <button className="btn btn-gold" onClick={() => navigate('?page=start')}>Start an order</button>
            <button className="btn btn-ghost" onClick={() => navigate('?page=my-orders')}>My orders</button>
          </>
        }
      >
        We couldn’t find that order. It may have been cleared, or the link is wrong.
      </StubScreen>
    )
  }

  const state = getState(st)
  const channels = order.path === 'walkin' ? WALKIN_CHANNELS : ONLINE_CHANNELS
  const lastPayment = order.payments[order.payments.length - 1]
  const showRejected = isPayment(st) && lastPayment?.status === 'rejected'

  // ---- current action card by state ----
  let action = null
  if (st === 'waiting_for_seller') {
    action = <p className="pm-wait"><IoTimeOutline /> Order received. Waiting for the studio to accept it and request the sample fee.</p>
  } else if (st === 'sample_fee_to_pay' || st === 'downpayment_to_pay' || st === 'ready_to_ship') {
    action = <PayPanel order={order} channels={channels} onPay={(opts) => pay(order.id, opts)} />
  } else if (st === 'sample_fee_review' || st === 'downpayment_review') {
    action = (
      <p className="pm-wait">
        <IoTimeOutline /> Payment submitted{lastPayment?.channel ? ` via ${lastPayment.channel}` : ''}
        {lastPayment?.ref ? ` (ref ${lastPayment.ref})` : ''}. Staff is verifying it — you’ll be notified once approved.
      </p>
    )
  } else if (st === 'sample_production') {
    action = <p className="pm-wait"><IoConstructOutline /> Payment verified. Your physical sample is being produced.</p>
  } else if (st === 'sample_approval') {
    action = (
      <div className="pm-sample">
        <p className="pm-sample-lead">Your sample is ready. Review it in person / from photos, then decide:</p>
        {!changesRequested ? (
          <div className="pm-actions">
            <button className="btn btn-gold" onClick={() => advance(order.id, 'approve_sample')}>
              Approve sample — proceed
            </button>
            <button className="btn btn-ghost" onClick={() => setChangesRequested(true)}>
              Request changes
            </button>
          </div>
        ) : (
          <div className="pm-classify">
            <div className="pm-classify-head">
              Changes requested — the <strong>studio</strong> classifies the change:
            </div>
            <div className="pm-actions">
              {DEFECT_CLASSES.map((d) => (
                <button
                  key={d.id}
                  className={'btn ' + (d.id === 'major' ? 'btn-dark' : 'btn-ghost')}
                  onClick={() => advance(order.id, 'classify_defect', { classification: d.id })}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <p className="pm-classify-note">
              Minor → fixed in-house, no fee → straight to downpayment. Major → new{' '}
              {peso(SAMPLE_DEFECT_FEE)} sample fee (not credited) and a fresh sample is made.
            </p>
            <button className="pm-link" onClick={() => setChangesRequested(false)}>← back</button>
          </div>
        )}
      </div>
    )
  } else if (st === 'in_production') {
    action = <p className="pm-wait"><IoConstructOutline /> Downpayment verified. Your full order is in production.</p>
  } else if (st === 'delivered') {
    action = (
      <div className="pm-done">
        <IoCheckmarkCircle className="pm-done-icon" />
        <div>
          <div className="pm-done-title">Delivered &amp; fully paid</div>
          <div className="pm-done-sub">Thanks for ordering with Sorbetes!</div>
        </div>
      </div>
    )
  }

  // ---- seller/staff demo controls by state ----
  let staff = null
  if (st === 'waiting_for_seller') {
    staff = <button className="pm-staff-btn" onClick={() => advance(order.id, 'accept_order')}>Accept order → request sample fee</button>
  } else if (st === 'sample_fee_review' || st === 'downpayment_review') {
    staff = (
      <div className="pm-staff-review">
        <button className="pm-staff-btn" onClick={() => reviewProof(order.id, 'approve')}>Approve payment</button>
        <div className="pm-staff-reject">
          <input className="pm-input" placeholder="Reject reason (optional)" value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)} />
          <button className="pm-staff-btn pm-staff-btn--danger"
            onClick={() => { reviewProof(order.id, 'reject', rejectReason.trim()); setRejectReason('') }}>
            Reject
          </button>
        </div>
      </div>
    )
  } else if (st === 'sample_production') {
    staff = <button className="pm-staff-btn" onClick={() => advance(order.id, 'sample_ready')}>Mark sample ready for review</button>
  } else if (st === 'in_production') {
    staff = <button className="pm-staff-btn" onClick={() => advance(order.id, 'ship')}>Mark ready to ship</button>
  }

  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <div className="pay-wrap">
          <div className="pm-head">
            <div>
              <div className="pm-ref">{order.ref}</div>
              <div className="pm-sub">
                {order.qty} pcs · {styleById(order.form.style).label} · {order.path === 'walkin' ? 'Walk-in' : 'Online'}
              </div>
            </div>
            <span className={'pm-badge pm-badge--' + state.tone}>{state.label}</span>
          </div>

          <Stepper status={st} />

          {showRejected && (
            <div className="pm-rejected">
              <IoWarningOutline />
              <span>
                Your previous payment was <strong>rejected</strong>
                {lastPayment.reason ? `: ${lastPayment.reason}` : ''}. Please re-submit below.
              </span>
            </div>
          )}

          <div className="pm-card">
            <div className="pm-card-head">
              <h2 className="pm-card-title">{state.label}</h2>
              <p className="pm-card-desc">{state.desc}</p>
            </div>
            {action}
          </div>

          {staff && (
            <div className="pm-staff">
              <div className="pm-staff-label">
                <IoStorefrontOutline /> Seller / staff — demo controls
                <span className="pm-staff-hint">stands in for the backend + staff console (not real)</span>
              </div>
              {staff}
            </div>
          )}

          {/* payments */}
          {order.payments.length > 0 && (
            <div className="pm-list">
              <div className="pm-list-h">Payments</div>
              {order.payments.map((p) => (
                <div className="pm-pay-row" key={p.id}>
                  <span>{PAY_LABEL[p.type] || p.type} · {p.channel}{p.ref ? ` · ${p.ref}` : ''}</span>
                  <span className={'pm-pay-status pm-pay-status--' + p.status}>
                    {peso(p.amount)} · {p.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* timeline */}
          <div className="pm-list">
            <div className="pm-list-h">Activity</div>
            {[...order.timeline].reverse().map((e, i) => (
              <div className="pm-tl-row" key={i}>
                <span className="pm-tl-dot" />
                <span className="pm-tl-note">{e.note || getState(e.status).label}</span>
                <span className="pm-tl-state">{getState(e.status).short}</span>
              </div>
            ))}
          </div>

          <div className="pm-foot-actions">
            <button className="btn btn-ghost" onClick={() => navigate('?page=my-orders')}>My orders</button>
            <button className="btn btn-ghost" onClick={() => navigate('?page=track-order&id=' + order.id)}>Track order</button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
