// src/utils/id.js — random id generation shared by the mock persistence layer + mock API.
// Every prefixed id in the app (ord_, pay_, sms_, addr_…) used this same
// Math.random().toString(36).slice(2, 9) shape, hand-copied at each call site.

export function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 9)
}
