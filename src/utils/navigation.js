// src/utils/navigation.js
// Query-param routing (?page=…). No react-router — this is the whole router primitive.
// App.jsx subscribes via onNavigate() and reads getPageParam(); pages call navigate().

const NAV_EVENT = 'sorbetes:navigate'

// Normalize any of: 'home' | '?page=home' | '?page=home&id=3' | 'page=home'
function toSearch(to) {
  if (!to) return '?page=home'
  let s = String(to).trim()
  if (s.startsWith('?')) return s
  if (s.startsWith('page=')) return '?' + s
  if (s.includes('=')) return '?' + s // already a query fragment like "page=x&id=1"
  return '?page=' + s // bare page name
}

/** Current ?page= value (defaults to 'home'). */
export function getPageParam() {
  return new URLSearchParams(window.location.search).get('page') || 'home'
}

/** Read any query param (e.g. getParam('id')). */
export function getParam(key) {
  return new URLSearchParams(window.location.search).get(key)
}

/** All query params as a plain object. */
export function getParams() {
  return Object.fromEntries(new URLSearchParams(window.location.search).entries())
}

/** Navigate to a page. Accepts '?page=x&id=1', 'page=x', or a bare 'x'. */
export function navigate(to) {
  const search = toSearch(to)
  if (search === window.location.search) {
    // Same URL — still scroll to top (e.g. re-click "Home").
    window.scrollTo(0, 0)
    return
  }
  window.history.pushState({}, '', search)
  window.scrollTo(0, 0)
  window.dispatchEvent(new Event(NAV_EVENT))
}

/** Convenience: navigate to a page with optional extra params object. */
export function navigateToPage(page, extra = {}) {
  const params = new URLSearchParams({ page, ...extra })
  navigate('?' + params.toString())
}

/** Go back if we have in-app history, else fall back to a known page. */
export function navigateBack(fallback = '?page=home') {
  if (window.history.length > 1) {
    window.history.back() // fires popstate → onNavigate subscribers re-render
  } else {
    navigate(fallback)
  }
}

/** Subscribe to route changes (pushState via navigate + browser back/forward). */
export function onNavigate(cb) {
  window.addEventListener(NAV_EVENT, cb)
  window.addEventListener('popstate', cb)
  return () => {
    window.removeEventListener(NAV_EVENT, cb)
    window.removeEventListener('popstate', cb)
  }
}
