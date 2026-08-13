// src/utils/scrollSelectionIntoView.js
// Brings a selected option into view inside whatever containers it's nested in, WITHOUT ever
// scrolling the window.
//
// Why not just scrollIntoView({ block: 'nearest', inline: 'nearest' })? Because that also
// walks up to the document and can nudge window scroll — and on GuidedWalkthrough the current
// STEP is derived from window scroll position, so even a few px would jump the customer to a
// different step. This only ever touches element scroll containers.
//
// Needed because the colour pickers became scrolling strips (2026-08-13): a 124-colour fabric
// tier is ~9,000px wide, and the default Black sits ~6,700px in, so the customer's own current
// selection was off-screen with nothing to indicate it. Handles both axes because the guided
// walkthrough's panel scrolls vertically on desktop and horizontally on mobile.

const scrolls = (node, axis) => {
  const o = getComputedStyle(node)[axis === 'x' ? 'overflowX' : 'overflowY']
  if (!/(auto|scroll)/.test(o)) return false
  return axis === 'x' ? node.scrollWidth > node.clientWidth : node.scrollHeight > node.clientHeight
}

/**
 * Centres `el` inside its scrollable ancestors, only on the axes where it's out of view, and
 * only up to and including `boundary`.
 *
 * ⚠️ `boundary` is required in practice, and leaving it off caused a real bug (owner-reported
 * 2026-08-13): without it this walked EVERY scrollable ancestor, so on the walk-in kiosk it
 * also scrolled `.wk-main` — the whole form — down to centre the colour section. The customer
 * landed on the order form already scrolled to Colour instead of starting at the top, and on
 * the way back from the quote it fought the scroll-restore effect. Pass the strip/panel that
 * genuinely owns the selection and nothing outside it moves.
 *
 * @param {Element|null} el       the selected option
 * @param {Element|null} boundary outermost container allowed to scroll (inclusive)
 */
export function scrollSelectionIntoView(el, boundary) {
  if (!el) return
  let node = el.parentElement
  while (node && node !== document.body && node !== document.documentElement) {
    // Re-read each time: scrolling an inner container moves everything outside it.
    const n = node.getBoundingClientRect()
    const e = el.getBoundingClientRect()
    if (scrolls(node, 'x') && (e.left < n.left || e.right > n.right)) {
      node.scrollLeft += (e.left - n.left) - (n.width - e.width) / 2
    }
    if (scrolls(node, 'y') && (e.top < n.top || e.bottom > n.bottom)) {
      node.scrollTop += (e.top - n.top) - (n.height - e.height) / 2
    }
    if (node === boundary) return
    node = node.parentElement
  }
}
