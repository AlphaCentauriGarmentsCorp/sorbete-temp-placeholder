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
