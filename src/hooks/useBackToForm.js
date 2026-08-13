// src/hooks/useBackToForm.js — makes the browser/device Back button close an in-page
// overlay step (the quotation screen, the kiosk's Graphic Artist screen) and return to the
// form underneath, instead of walking out of the whole ordering flow.
//
// WHY THIS IS NEEDED AT ALL: the quote screen is not a route. All three order paths render
// it from local state at the SAME ?page= URL — `showQuote` in GuidedWalkthrough/DirectForm,
// `phase === 'quote'` in WalkInForm. So the browser's history had nothing recorded between
// "form" and "quote", and Back popped straight past the entire flow to whatever came before
// it (?page=start online, ?page=walk-ins from the kiosk), throwing away everything the
// customer had built. Reported by the owner 2026-08-13.
//
// THE FIX: push a same-URL history entry when the overlay opens, purely so Back has
// something of ours to consume. App.jsx's router reads ?page= through
// useSyncExternalStore, and that value doesn't change here — so the pushed entry causes no
// re-render, no remount, and (importantly) no loss of the form state living in the page
// component. Popping it just runs onBack().
import { useEffect, useRef } from 'react'

/**
 * @param {boolean}  open    - is the overlay currently showing?
 * @param {Function} onBack  - close it and return to the form (restore scroll here too).
 */
export function useBackToForm(open, onBack) {
  // Kept in a ref so a re-created onBack (an inline arrow, in every caller) doesn't tear
  // down and re-run the effect below — which would push a duplicate history entry on
  // every render while the overlay is open.
  const onBackRef = useRef(onBack)
  useEffect(() => { onBackRef.current = onBack })

  useEffect(() => {
    if (!open) return

    window.history.pushState({ sbOverlay: true }, '', window.location.search)
    const onPop = () => onBackRef.current?.()
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [open])
}

/**
 * The counterpart for any explicit "go back to the form" control that remains in the UI.
 * Going through history.back() (rather than setting state directly) keeps our pushed entry
 * and the visible screen in sync — setting state directly would leave the entry orphaned,
 * costing the customer a dead Back press later.
 */
export function goBackToForm() {
  window.history.back()
}
