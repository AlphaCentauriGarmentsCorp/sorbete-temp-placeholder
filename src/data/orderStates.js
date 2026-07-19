// src/data/orderStates.js
// Order state machine — FRONTEND-BUILD-SPEC §6 (from Sorbetes_Flowchart_v8.pdf, p.8).
//
//   waiting_for_seller → sample_fee_to_pay → sample_fee_review
//     → sample_production → sample_approval
//       ├─ (minor / none) ─────────────────────┐
//       └─ (major: new fee + remake) → sample_fee_to_pay (loop)
//     → downpayment_to_pay → downpayment_review → in_production
//     → ready_to_ship → delivered
//   Side states: waiting_for_user (info requested), rejected (payment proof rejected,
//   returns to the *_to_pay step with a reason).
//
// `kind` drives UI treatment: payment steps show a pay CTA, review steps show
// "under review", production/action steps are informational.

export const STATES = {
  waiting_for_seller: {
    label: 'Waiting for seller',
    short: 'Order received',
    desc: 'Your request is in. The studio is reviewing it before the sample stage.',
    actor: 'seller',
    kind: 'action',
    tone: 'neutral',
  },
  sample_fee_to_pay: {
    label: 'Sample fee to pay',
    short: 'Pay sample fee',
    desc: 'Pay the ₱1,000 sample fee to start your physical sample. Separate from the order total — not credited.',
    actor: 'client',
    kind: 'payment',
    tone: 'action',
    payment: 'sampleFee',
  },
  sample_fee_review: {
    label: 'Sample fee under review',
    short: 'Verifying payment',
    desc: 'We received your proof of payment. Staff is verifying the amount and reference number.',
    actor: 'seller',
    kind: 'review',
    tone: 'wait',
  },
  sample_production: {
    label: 'Sample in production',
    short: 'Making your sample',
    desc: 'Payment confirmed. Your physical sample is being produced.',
    actor: 'seller',
    kind: 'production',
    tone: 'neutral',
  },
  sample_approval: {
    label: 'Sample review',
    short: 'Review your sample',
    desc: 'Your sample is ready. Approve it, or request changes — the studio will classify any change as minor or major.',
    actor: 'client',
    kind: 'decision',
    tone: 'action',
  },
  downpayment_to_pay: {
    label: 'Downpayment to pay',
    short: 'Pay 60% downpayment',
    desc: 'Sample approved. Pay the 60% downpayment to start bulk production.',
    actor: 'client',
    kind: 'payment',
    tone: 'action',
    payment: 'dp',
  },
  downpayment_review: {
    label: 'Downpayment under review',
    short: 'Verifying payment',
    desc: 'We received your downpayment proof. Staff is verifying it.',
    actor: 'seller',
    kind: 'review',
    tone: 'wait',
  },
  in_production: {
    label: 'In production',
    short: 'Producing your order',
    desc: 'Downpayment confirmed. Your full order is in production.',
    actor: 'seller',
    kind: 'production',
    tone: 'neutral',
  },
  ready_to_ship: {
    label: 'Ready — balance due',
    short: 'Ready for pickup/delivery',
    desc: 'Your order is done. Settle the 40% balance at pickup or delivery to release it.',
    actor: 'client',
    kind: 'payment',
    tone: 'action',
    payment: 'bal',
  },
  delivered: {
    label: 'Delivered',
    short: 'Complete',
    desc: 'Order delivered and fully paid. Thank you!',
    actor: 'none',
    kind: 'terminal',
    tone: 'done',
  },

  // ---- side states ----
  waiting_for_user: {
    label: 'Action needed',
    short: 'Info requested',
    desc: 'The studio needs more information from you before continuing.',
    actor: 'client',
    kind: 'side',
    tone: 'action',
  },
  rejected: {
    label: 'Payment rejected',
    short: 'Payment rejected',
    desc: 'Your last payment proof was rejected. See the reason and re-submit.',
    actor: 'client',
    kind: 'side',
    tone: 'danger',
  },
}

// The happy-path order used by the progress tracker.
export const HAPPY_PATH = [
  'waiting_for_seller',
  'sample_fee_to_pay',
  'sample_fee_review',
  'sample_production',
  'sample_approval',
  'downpayment_to_pay',
  'downpayment_review',
  'in_production',
  'ready_to_ship',
  'delivered',
]

export const INITIAL_STATE = 'waiting_for_seller'

// Which *_to_pay step a review approves into, and where a rejection returns to.
const REVIEW_TO_NEXT = {
  sample_fee_review: 'sample_production',
  downpayment_review: 'in_production',
}
const PAY_TO_REVIEW = {
  sample_fee_to_pay: 'sample_fee_review',
  downpayment_to_pay: 'downpayment_review',
}

// Pure transition function. Returns the next state id, or throws on an invalid event.
// payload: { classification: 'minor'|'major' } for sample_approval; { reason } is stored
// by the caller (OrderContext), not needed to compute the next state.
export function transition(current, event, payload = {}) {
  switch (event) {
    case 'accept_order':
      if (current === 'waiting_for_seller') return 'sample_fee_to_pay'
      break
    case 'submit_proof':
      if (PAY_TO_REVIEW[current]) return PAY_TO_REVIEW[current]
      break
    case 'approve_payment':
      if (REVIEW_TO_NEXT[current]) return REVIEW_TO_NEXT[current]
      break
    case 'reject_payment':
      // Review → back to the paying step it came from.
      if (current === 'sample_fee_review') return 'sample_fee_to_pay'
      if (current === 'downpayment_review') return 'downpayment_to_pay'
      break
    case 'sample_ready':
      if (current === 'sample_production') return 'sample_approval'
      break
    case 'approve_sample':
      // Client approves outright — treated as the minor/none branch.
      if (current === 'sample_approval') return 'downpayment_to_pay'
      break
    case 'classify_defect':
      if (current === 'sample_approval') {
        return payload.classification === 'major' ? 'sample_fee_to_pay' : 'downpayment_to_pay'
      }
      break
    case 'pay_balance':
      if (current === 'ready_to_ship') return 'delivered'
      break
    case 'ship':
      if (current === 'in_production') return 'ready_to_ship'
      break
    default:
      break
  }
  throw new Error(`Invalid transition: "${event}" from "${current}"`)
}

// ---- helpers -------------------------------------------------------------
export const getState = (id) => STATES[id] || STATES.waiting_for_seller
export const isTerminal = (id) => id === 'delivered'
export const isPayment = (id) => getState(id).kind === 'payment'
export const isReview = (id) => getState(id).kind === 'review'
export const isSide = (id) => getState(id).kind === 'side'

// 0..1 progress along the happy path (side states report their pre-side position).
export function progress(id, fallbackId) {
  const idx = HAPPY_PATH.indexOf(id)
  if (idx >= 0) return idx / (HAPPY_PATH.length - 1)
  const fb = HAPPY_PATH.indexOf(fallbackId)
  return fb >= 0 ? fb / (HAPPY_PATH.length - 1) : 0
}
