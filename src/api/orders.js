// src/api/orders.js — real order/payment calls against the Laravel backend.
// Replaces src/mocks/api.js for everything the real backend already supports.
import { api } from './client.js'

export function createOrder({ path, form, qty, customer }) {
  return api.post('/orders', { path, form, qty, customer }).then((r) => r.order)
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
 * There's no file-storage endpoint yet, so `proofUrl` stays null for now (the
 * receipt/screenshot is captured client-side for display only, same as before).
 */
export function submitPayment(orderId, { channel, ref }) {
  return api
    .post(`/orders/${orderId}/payments`, { channel, ref: ref || null, proofUrl: null })
    .then((r) => r.order)
}

export function approveSample(orderId) {
  return api.post(`/orders/${orderId}/approve-sample`, {}).then((r) => r.order)
}

/**
 * Temporary stand-in for the staff console (see the backend's OrderActionController::
 * demoAdvance doc comment) — lets the order owner drive the staff-side transitions for
 * demoing/testing the full lifecycle. Remove once a real staff console is connected.
 */
export function demoAdvance(orderId, event, payload = {}) {
  return api.post(`/orders/${orderId}/demo-advance`, { event, payload }).then((r) => r.order)
}
