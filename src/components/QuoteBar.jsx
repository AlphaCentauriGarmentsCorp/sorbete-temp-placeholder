// src/components/QuoteBar.jsx — the live-estimate / "See quotation" bar, shared by all three
// order paths (guided walkthrough, instant builder, walk-in kiosk).
//
// Built 2026-08-13 to the owner's spec: the ELEMENT FORMATION from the instant builder (one
// row — label, big per-piece price, a quieter totals sub-line, then the pill CTA) with the
// BACKGROUND from the guided walkthrough (translucent black + backdrop blur). Before this the
// three had drifted into genuinely different bars: 75px one-row on the instant builder, a
// 112px two-row block with three separate stat columns on the walkthrough, and a 75px bar with
// no sub-line at all on the kiosk.
//
// It's ONE component rather than three mirrored CSS blocks on purpose — the same "two
// implementations serving three paths" duplication is exactly what let the quote screens drift
// apart before (see CLAUDE.md §7). There is nothing to keep in sync here.
import '../design/QuoteBar.css'

/**
 * @param label    small uppercase caption above the price
 * @param price    the hero figure (already formatted; may be a non-price like "Ask CSR")
 * @param sub      quieter second line — qty + grand total
 * @param cta      button text
 * @param onCta    button handler
 * @param fixed    true (default) pins it to the viewport; false makes it an ordinary flex
 *                 child, which is what the kiosk needs — its bar lives inside the phone-frame
 *                 device shell, not over the page.
 */
export default function QuoteBar({ label, price, sub, cta = 'See quotation →', onCta, disabled = false, fixed = true }) {
  return (
    <div className={'qbar' + (fixed ? ' qbar--fixed' : '')}>
      <div className="qbar-info">
        <span className="qbar-k">{label}</span>
        <span className="qbar-v">{price}</span>
        {sub ? <span className="qbar-sub">{sub}</span> : null}
      </div>
      <button type="button" className="qbar-cta" onClick={onCta} disabled={disabled}>{cta}</button>
    </div>
  )
}
