// src/utils/phone.js — shared PH mobile number validation (checkout + account addresses).
// Matches the backend's regex exactly: 09XX XXX XXXX, optional space/dash separators.
const PH_MOBILE_RE = /^09\d{2}[\s-]?\d{3}[\s-]?\d{4}$/

export const isValidPhMobile = (phone) => PH_MOBILE_RE.test((phone || '').trim())
export const PH_MOBILE_HINT = 'Enter a valid PH mobile number, e.g. 0917 123 4567'
