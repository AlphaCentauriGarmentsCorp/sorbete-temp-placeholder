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
