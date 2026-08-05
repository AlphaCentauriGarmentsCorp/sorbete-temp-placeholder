// src/utils/format.js — small display formatters used across the dashboard.
export const fmtDate = (iso) => {
  try {
    return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

export const fmtDateTime = (iso) => {
  try {
    return new Date(iso).toLocaleString('en-PH', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
  } catch {
    return ''
  }
}

// Clipboard write with a hidden-textarea fallback for browsers/contexts (older WebViews,
// non-HTTPS kiosk setups) where navigator.clipboard is unavailable. Always resolves.
export function copyToClipboard(text) {
  if (navigator.clipboard?.writeText && window.isSecureContext !== false) {
    return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text))
  }
  return Promise.resolve(fallbackCopy(text))
}

function fallbackCopy(text) {
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.left = '-9999px'
    document.body.appendChild(ta)
    ta.focus(); ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  } catch { /* ignore */ }
}
