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
import { fetchPaymentProof, fetchTimelineAttachment } from '../api/orders.js'
import { getState, isPayment } from '../data/orderStates.js'
import { peso, styleById, DEFECT_CLASSES, SAMPLE_DEFECT_FEE } from '../data/orderConfig.js'
import '../design/Payment.css'

const ONLINE_CHANNELS = ['GCash', 'Maya', 'Bank Transfer']
const WALKIN_CHANNELS = ['GCash', 'Maya', 'Bank Transfer', 'Cash']

const PAY_LABEL = { sampleFee: 'Sample fee', dp: '60% downpayment', bal: '40% balance' }

// 5 visible milestones grouped from the 12-state happy path.
const MILESTONES = [
  { label: 'Order', states: ['waiting_for_seller'] },
  { label: 'Sample fee', states: ['sample_fee_to_pay', 'sample_fee_review'] },
  { label: 'Sample', states: ['sample_production', 'sample_approval', 'sample_changes_requested'] },
  { label: 'Downpayment', states: ['downpayment_to_pay', 'downpayment_review'] },
  { label: 'Produce → deliver', states: ['in_production', 'ready_to_ship', 'balance_review', 'out_for_delivery', 'delivered'] },
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
  const [file, setFile] = useState(null)
  const isCash = channel === 'Cash'
  const canSubmit = isCash || (ref.trim() && file)

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
          <label className="pm-upload">
            <IoCloudUploadOutline />
            <span>{file?.name || 'Upload screenshot / receipt'}</span>
            <input type="file" accept="image/*,application/pdf" hidden
              onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
        </>
      )}

      <button className="btn btn-gold pm-pay-submit" disabled={!canSubmit}
        onClick={() => onPay({ channel, ref: ref.trim(), proof: file })}>
        {isCash ? 'Confirm cash payment' : 'Submit payment for review'} <IoArrowForward />
      </button>
    </div>
  )
}

// "Request changes" used to submit with zero payload — the studio had nothing to go
// on but "something's wrong." This form makes the message required (what actually
// needs changing) and a reference photo optional, before it ever reaches the server.
function SampleReviewPanel({ order, onApprove, onRequestChanges }) {
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [file, setFile] = useState(null)
  const canSubmit = message.trim().length > 0

  return (
    <div className="pm-sample">
      <p className="pm-sample-lead">Your sample is ready. Review it in person / from photos, then decide:</p>
      {!showForm ? (
        <div className="pm-actions">
          <button className="btn btn-gold" onClick={onApprove}>Approve sample — proceed</button>
          <button className="btn btn-ghost" onClick={() => setShowForm(true)}>Request changes</button>
        </div>
      ) : (
        <div className="pm-request-changes">
          <div className="pm-field-label">What would you like changed?</div>
          <textarea
            className="pm-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. The print is off-center, please move it up by an inch"
            rows={4}
          />
          <div className="pm-field-label">Reference photo (optional)</div>
          <label className="pm-upload">
            <IoCloudUploadOutline />
            <span>{file?.name || 'Attach a photo'}</span>
            <input type="file" accept="image/*,application/pdf" hidden
              onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <div className="pm-actions">
            <button className="btn btn-gold" disabled={!canSubmit}
              onClick={() => onRequestChanges(message.trim(), file)}>
              Submit request
            </button>
            <button className="pm-link" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function Payment() {
  const { getById, pay, reviewProof, advance, requestSampleChanges } = useOrders()
  const id = getParam('id')
  const order = id ? getById(id) : null
  const st = order?.status
  const [rejectReason, setRejectReason] = useState('')
  const [proofThumb, setProofThumb] = useState(null)
  const [changeThumb, setChangeThumb] = useState(null)
  const lastPayment = order ? order.payments[order.payments.length - 1] : undefined
  const changeRequestEvent = order
    ? [...order.timeline].reverse().find((t) => t.status === 'sample_changes_requested')
    : undefined

  // Same reasoning as the proof-thumbnail effect below: staff should see the
  // client's reference photo automatically, right next to the classify buttons,
  // not have to dig for it — the whole point of request_changes carrying an
  // attachment is defeated if staff has to go find it themselves.
  useEffect(() => {
    if (!order || st !== 'sample_changes_requested' || !changeRequestEvent?.attachmentUrl) {
      setChangeThumb(null)
      return
    }
    let cancelled = false
    fetchTimelineAttachment(order.id, changeRequestEvent.id).then((url) => { if (!cancelled) setChangeThumb(url) })
    return () => { cancelled = true }
  }, [order, st, changeRequestEvent?.id, changeRequestEvent?.attachmentUrl])

  // Load the payment-under-review's proof automatically, so staff sees the actual
  // receipt right next to Approve/Reject instead of approving blind and having to
  // go dig for it separately in the payments list below.
  useEffect(() => {
    if (!order || !lastPayment?.proofUrl || lastPayment.status !== 'under_review') {
      setProofThumb(null)
      return
    }
    let cancelled = false
    fetchPaymentProof(order.id, lastPayment.id).then((url) => { if (!cancelled) setProofThumb(url) })
    return () => { cancelled = true }
  }, [order, lastPayment?.id, lastPayment?.proofUrl, lastPayment?.status])

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
  const showRejected = isPayment(st) && lastPayment?.status === 'rejected'

  // Proof files live on a private disk behind an authenticated route — a plain
  // <a href> can't carry our bearer token, so fetch it ourselves and open the blob.
  // The tab opens synchronously (inside the click's call stack) and gets pointed at
  // the blob once it's ready — opening AFTER the await would get popup-blocked.
  const viewProof = async (paymentId) => {
    const tab = window.open('', '_blank')
    const url = await fetchPaymentProof(order.id, paymentId)
    if (tab) tab.location = url
  }

  const viewChangeAttachment = async (eventId) => {
    const tab = window.open('', '_blank')
    const url = await fetchTimelineAttachment(order.id, eventId)
    if (tab) tab.location = url
  }

  // ---- current action card by state ----
  let action = null
  if (st === 'waiting_for_seller') {
    action = <p className="pm-wait"><IoTimeOutline /> Order received. Waiting for the studio to accept it and request the sample fee.</p>
  } else if (st === 'sample_fee_to_pay' || st === 'downpayment_to_pay' || st === 'ready_to_ship') {
    action = <PayPanel order={order} channels={channels} onPay={(opts) => pay(order.id, opts)} />
  } else if (st === 'sample_fee_review' || st === 'downpayment_review' || st === 'balance_review') {
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
      <SampleReviewPanel
        order={order}
        onApprove={() => advance(order.id, 'approve_sample')}
        onRequestChanges={(message, file) => requestSampleChanges(order.id, message, file)}
      />
    )
  } else if (st === 'sample_changes_requested') {
    // Deliberately no minor/major choice here — that classification (and its fee
    // consequence) is the studio's call, not the client's. See the staff panel below.
    action = (
      <p className="pm-wait">
        <IoTimeOutline /> Changes requested. The studio is reviewing your sample and will classify the change shortly.
      </p>
    )
  } else if (st === 'in_production') {
    action = <p className="pm-wait"><IoConstructOutline /> Downpayment verified. Your full order is in production.</p>
  } else if (st === 'out_for_delivery') {
    // Deliberately no customer-side "confirm receipt" action here — paid and
    // delivered are separate facts; staff/rider marks delivery, not the client.
    action = <p className="pm-wait"><IoConstructOutline /> Balance confirmed. Your order is out for delivery.</p>
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
  } else if (st === 'sample_fee_review' || st === 'downpayment_review' || st === 'balance_review') {
    staff = (
      <div className="pm-staff-review">
        {lastPayment?.proofUrl && (
          <div className="pm-staff-proof">
            <div className="pm-field-label">
              Proof of payment{lastPayment.ref ? ` — ref ${lastPayment.ref}` : ''}
            </div>
            {proofThumb ? (
              <img
                className="pm-staff-proof-img"
                src={proofThumb}
                alt="Payment proof"
                onClick={() => viewProof(lastPayment.id)}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            ) : (
              <p className="pm-wait"><IoTimeOutline /> Loading proof…</p>
            )}
            <button className="pm-link" onClick={() => viewProof(lastPayment.id)}>View full size</button>
          </div>
        )}
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
  } else if (st === 'sample_changes_requested') {
    // The classification (and its fee consequence) belongs here, staff-side — not on
    // the client's own action panel above, where they could just always pick "minor."
    staff = (
      <div className="pm-classify">
        <div className="pm-classify-head">Client requested changes — classify it:</div>
        {changeRequestEvent?.note && (
          <p className="pm-sample-lead" style={{ marginTop: 0 }}>
            “{changeRequestEvent.note.replace(/^Client requested changes: /, '')}”
          </p>
        )}
        {changeRequestEvent?.attachmentUrl && (
          <div className="pm-staff-proof">
            <div className="pm-field-label">Reference photo</div>
            {changeThumb ? (
              <img
                className="pm-staff-proof-img"
                src={changeThumb}
                alt="Client's reference"
                onClick={() => viewChangeAttachment(changeRequestEvent.id)}
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            ) : (
              <p className="pm-wait"><IoTimeOutline /> Loading attachment…</p>
            )}
            <button className="pm-link" onClick={() => viewChangeAttachment(changeRequestEvent.id)}>View full size</button>
          </div>
        )}
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
      </div>
    )
  } else if (st === 'in_production') {
    staff = <button className="pm-staff-btn" onClick={() => advance(order.id, 'ship')}>Mark ready to ship</button>
  } else if (st === 'out_for_delivery') {
    // Deliberately a separate action from approving the balance payment (above) —
    // paid and delivered are different facts; the rider/staff confirms the handoff.
    staff = <button className="pm-staff-btn" onClick={() => advance(order.id, 'confirm_delivery')}>Mark as delivered</button>
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
                  <span>
                    {PAY_LABEL[p.type] || p.type} · {p.channel}{p.ref ? ` · ${p.ref}` : ''}
                    {p.proofUrl && <button className="pm-link" onClick={() => viewProof(p.id)}>View proof</button>}
                  </span>
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
