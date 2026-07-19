// src/mocks/sms.js — SMS notification stub.
// FRONTEND-BUILD-SPEC §4: walk-in sample-ready notices (and other updates) go by SMS.
// No gateway here — we log the message and keep an in-memory outbox a dev UI could show.
//
// TODO: replace with real SMS gateway (e.g. Semaphore/Twilio via backend) —
// see FRONTEND-BUILD-SPEC.md §3/§4.

const OUTBOX = [] // in-memory; not persisted

/** Pretend to send an SMS. Returns a resolved, gateway-shaped response. */
export async function sendSMS(to, message) {
  const entry = { id: 'sms_' + Math.random().toString(36).slice(2, 9), to, message, at: new Date().toISOString() }
  OUTBOX.push(entry)
  // eslint-disable-next-line no-console
  console.info('[mock SMS →]', to, '—', message)
  return { ok: true, ...entry }
}

/** Read the mock outbox (for a future staff/dev view). */
export function getSMSOutbox() {
  return [...OUTBOX]
}
