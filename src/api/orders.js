// src/api/orders.js — real order/payment calls against the Laravel backend.
// Replaces src/mocks/api.js for everything the real backend already supports.
import { api, API_URL, getToken } from './client.js'

export function createOrder({ path, form, qty, customer, delivery }) {
  return api.post('/orders', { path, form, qty, customer, delivery }).then((r) => r.order)
}

/** The signed-in user's own orders — already scoped server-side by user_id. */
export function listOrders() {
  return api.get('/orders').then((r) => r.orders)
}

export function getOrder(id) {
  return api.get(`/orders/${id}`).then((r) => r.order)
}

/**
 * Public — no auth. Requires BOTH the ref and its tracking token (see the backend's
 * OrderController::track() doc comment) — ref alone is sequential/guessable.
 */
export function trackOrder(ref, token) {
  return api.get(`/track/${encodeURIComponent(ref)}/${encodeURIComponent(token)}`, { auth: false })
}

/**
 * Submit a payment for whatever *_to_pay step the order is currently on — the
 * backend derives the type and amount from the order's own state, never the client.
 * `proof` (a File, from an <input type="file">) is sent as multipart/form-data so
 * the backend can actually store it — see api/client.js's FormData handling.
 */
export function submitPayment(orderId, { channel, ref, proof }) {
  const body = new FormData()
  body.append('channel', channel)
  if (ref) body.append('ref', ref)
  if (proof) body.append('proof', proof)
  return api.post(`/orders/${orderId}/payments`, body).then((r) => r.order)
}

/**
 * Payment proofs are stored on a private disk and served through an authenticated
 * route (bearer token), so a plain <img src="..."> can't load one — the browser
 * never attaches our Authorization header to a bare image request. Fetch it
 * ourselves and hand back a blob: URL the caller CAN drop into <img>/<a href>.
 */
export async function fetchPaymentProof(orderId, paymentId) {
  const res = await fetch(`${API_URL}/orders/${orderId}/payments/${paymentId}/proof`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error('Could not load payment proof')
  return URL.createObjectURL(await res.blob())
}

export function approveSample(orderId) {
  return api.post(`/orders/${orderId}/approve-sample`, {}).then((r) => r.order)
}

/**
 * Client flags the sample for changes, with a required message describing what to
 * change and an optional reference photo — does NOT pick minor/major itself (that
 * fee decision is the studio's alone). Moves the order to sample_changes_requested,
 * where a staff console (demoAdvance's classify_defect, for now) classifies it.
 */
export function requestChanges(orderId, message, attachment) {
  const body = new FormData()
  body.append('message', message)
  if (attachment) body.append('attachment', attachment)
  return api.post(`/orders/${orderId}/request-changes`, body).then((r) => r.order)
}

/**
 * Same blob-fetch workaround as fetchPaymentProof — timeline attachments (e.g. a
 * request-changes reference photo) live behind the same bearer-token-gated route.
 */
export async function fetchTimelineAttachment(orderId, eventId) {
  const res = await fetch(`${API_URL}/orders/${orderId}/timeline/${eventId}/attachment`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  })
  if (!res.ok) throw new Error('Could not load attachment')
  return URL.createObjectURL(await res.blob())
}

/**
 * Approve/reject the order's currently pending payment. Has its own endpoint (not
 * demoAdvance) because it must also flip the Payment row itself (approved/rejected +
 * reason) — demoAdvance's generic dispatch used to skip that, leaving every payment
 * stuck showing "under review" forever and silently dropping the rejection reason,
 * so the client never saw why their payment bounced back to *_to_pay.
 */
export function reviewPayment(orderId, decision, reason) {
  return api.post(`/orders/${orderId}/review-payment`, { decision, reason: reason || null }).then((r) => r.order)
}

/**
 * Temporary stand-in for the staff console (see the backend's OrderActionController::
 * demoAdvance doc comment) — lets the order owner drive the staff-side transitions for
 * demoing/testing the full lifecycle. Remove once a real staff console is connected.
 */
export function demoAdvance(orderId, event, payload = {}) {
  return api.post(`/orders/${orderId}/demo-advance`, { event, payload }).then((r) => r.order)
}
