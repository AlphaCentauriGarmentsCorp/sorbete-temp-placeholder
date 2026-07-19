// src/utils/draftOrder.js — persist an in-progress quote across the sign-in redirect.
// Guests can build a full quote; placing the order requires Google sign-in (spec §2), so
// we stash the draft here, bounce through Auth, and resume it in Checkout. Mirrors the
// prototype's localStorage summaries (SYSTEM-FLOW §2) but unified into one key.

const KEY = 'sorbetes_draft_order'

/** @param draft { path:'guided'|'instant'|'walkin', form, qty } */
export function saveDraft(draft) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...draft, savedAt: new Date().toISOString() }))
  } catch {
    /* ignore quota */
  }
}

export function loadDraft() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

// ---- reorder: seed the Instant builder from a past order ------------------
const REORDER_KEY = 'sorbetes_reorder'

/** @param seed { form, qty } — stashed by "Reorder", consumed by DirectForm on mount. */
export function saveReorder(seed) {
  try {
    localStorage.setItem(REORDER_KEY, JSON.stringify(seed))
  } catch {
    /* ignore */
  }
}

export function loadReorder() {
  try {
    const raw = localStorage.getItem(REORDER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearReorder() {
  try {
    localStorage.removeItem(REORDER_KEY)
  } catch {
    /* ignore */
  }
}
