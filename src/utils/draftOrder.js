// src/utils/draftOrder.js — persist an in-progress quote across the sign-in redirect.
// Guests can build a full quote; placing the order requires Google sign-in (spec §2), so
// we stash the draft here, bounce through Auth, and resume it in Checkout. Mirrors the
// prototype's localStorage summaries (SYSTEM-FLOW §2) but unified into one key.
import { getJSON, setJSON, remove } from './storage.js'

const KEY = 'sorbetes_draft_order'

/** @param draft { path:'guided'|'instant'|'walkin', form, qty } */
export function saveDraft(draft) {
  setJSON(KEY, { ...draft, savedAt: new Date().toISOString() })
}

export function loadDraft() {
  return getJSON(KEY)
}

export function clearDraft() {
  remove(KEY)
}

// ---- reorder: seed the Instant builder from a past order ------------------
const REORDER_KEY = 'sorbetes_reorder'

/** @param seed { form, qty } — stashed by "Reorder", consumed by DirectForm on mount. */
export function saveReorder(seed) {
  setJSON(REORDER_KEY, seed)
}

export function loadReorder() {
  return getJSON(REORDER_KEY)
}

export function clearReorder() {
  remove(REORDER_KEY)
}
