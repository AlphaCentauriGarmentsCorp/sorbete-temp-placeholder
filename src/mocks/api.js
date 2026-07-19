// src/mocks/api.js — mock network boundary for order + payment operations.
// FRONTEND-BUILD-SPEC §3: no backend exists yet. These functions fake the request/response
// shapes a real API would use (ids, refs, timestamps, statuses) so the store + UI are built
// against realistic data and a backend can drop in behind this module unchanged.
//
// TODO: replace every function here with a real API call — see FRONTEND-BUILD-SPEC.md §3.
// Manual payment review is intentional (§3): PayMongo auto-confirm is deferred.

const delay = (ms) => new Promise((r) => setTimeout(r, ms))
const rid = (p) => p + Math.random().toString(36).slice(2, 9)

let refCounter = 2600
const nextRef = () => 'SB-' + ++refCounter

/**
 * Create an order. A real backend would persist it and return the canonical record.
 * @returns server-shaped fields to merge into the client order.
 */
export async function createOrder(payload) {
  await delay(500)
  return {
    id: rid('ord_'),
    ref: nextRef(),
    status: 'waiting_for_seller',
    createdAt: new Date().toISOString(),
    ...payload,
  }
}

/**
 * Submit a non-cash payment proof (screenshot/receipt + reference #). Moves the payment
 * into manual staff review (§3). We fake the upload — the file never leaves the browser.
 * @param proof { type:'sampleFee'|'dp'|'bal', channel, ref, file? }
 */
export async function submitPaymentProof(orderId, proof) {
  await delay(600)
  return {
    ok: true,
    payment: {
      id: rid('pay_'),
      type: proof.type,
      channel: proof.channel,
      ref: proof.ref || null,
      proofName: proof.file?.name || null,
      status: 'under_review',
      at: new Date().toISOString(),
    },
  }
}

/**
 * Staff decision on a submitted proof (manual review, §3). Simulated locally so the
 * order lifecycle is demoable without a backend/staff console.
 * @param decision 'approve' | 'reject'
 */
export async function reviewPaymentProof(orderId, { type, decision, reason } = {}) {
  await delay(400)
  return { ok: true, type, decision, reason: reason || null, at: new Date().toISOString() }
}

/** Staff marks a physical sample ready for the client to review (§4). Simulated. */
export async function markSampleReady(orderId) {
  await delay(400)
  return { ok: true, at: new Date().toISOString() }
}

/**
 * Seller classifies a requested sample change (§4). minor → no fee → downpayment;
 * major → new ₱1,000 sample fee + remake. Simulated.
 * @param classification 'minor' | 'major'
 */
export async function classifyDefect(orderId, classification) {
  await delay(400)
  return { ok: true, classification, at: new Date().toISOString() }
}
