// src/mocks/auth.js — mock Google OAuth.
// FRONTEND-BUILD-SPEC §2: Google OAuth only, no email/password. No real handshake here —
// we fake the profile + session shape a real backend would return.
//
// TODO: replace with real Google OAuth (Google Identity Services + backend session) —
// see FRONTEND-BUILD-SPEC.md §2/§3. This module is the ONLY place auth is faked.
import { DEFAULT_PROFILE } from '../data/mockData.js'

const delay = (ms) => new Promise((r) => setTimeout(r, ms))
const token = () => 'mock.' + Math.random().toString(36).slice(2) + '.' + Math.random().toString(36).slice(2)

/**
 * Simulate the Google sign-in round-trip. A real implementation would open the Google
 * consent screen, exchange the code server-side, and set an httpOnly session cookie.
 * @returns session-shaped object: profile fields + a token + timestamp.
 */
export async function signInWithGoogle(profile = DEFAULT_PROFILE) {
  await delay(650)
  return {
    ...profile,
    sessionToken: token(),
    signedInAt: new Date().toISOString(),
  }
}

/** Simulate session teardown (a real backend would clear the session cookie). */
export async function signOutGoogle() {
  await delay(120)
  return { ok: true }
}
