// src/utils/storage.js — safe localStorage read/write shared by the mock persistence layer.
// Every localStorage call site in this app wrapped get/set in its own try/catch (quota,
// disabled storage, malformed JSON) — that shape is defined once here instead.

export function getJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function setJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* quota / disabled storage — ignore for the mock persistence layer */
  }
}

export function remove(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}
