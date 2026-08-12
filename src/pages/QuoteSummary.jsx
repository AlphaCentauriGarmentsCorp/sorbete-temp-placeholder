// src/pages/QuoteSummary.jsx
// Shared quotation screen for Path A (GuidedWalkthrough) and Path B (DirectForm).
// Ported from design-reference/04-Frontend-Update-React-Code/QuoteSummary.jsx; the proceed
// action is now "Place order" (routes through the sign-in gate + order creation).
// Usage: <QuoteSummary form={form} qty={qty} onChange={goEditOrder} onProceed={placeOrder} />
import { useRef, useState } from 'react'
import { IoCopyOutline, IoCheckmarkCircle, IoDownloadOutline } from 'react-icons/io5'
import {
  quoteTotals, priceBreakdown, printColorsSummary, peso, styleById,
  showFor, showsPrice, MIN_QTY, QUOTE_MIN_NOTE_TAIL,
} from '../data/orderConfig.js'
import { copyToClipboard } from '../utils/format.js'
import AddressPicker from '../components/AddressPicker.jsx'
import { useSession } from '../context/SessionContext.jsx'
import '../design/QuoteSummary.css'

// Kept structurally identical to WalkInForm.jsx's buildWalkInQuoteText() — same row order,
// same labels, same PRICE BREAKDOWN section — so a quote pasted from the online paths reads
// the same as one pasted from the kiosk. The kiosk's version additionally carries its own
// walk-in-only fields (design label / contact number) and says "Walk-in Quotation" in the
// header, which is deliberate: those identify where the quote came from.
function buildQuoteText(f, sh, breakdown, qty) {
  const { perPc, total, sampleFee, grandTotal, dp, bal } = quoteTotals(f, qty)
  const priced = showsPrice(f.style)
  return [
    'Sorbetes Apparel — Quotation', '',
    'Style: ' + styleById(f.style).label,
    sh.fit ? 'Fit: ' + f.fit : null,
    'Size: ' + (f.size || '—'),
    sh.collar ? 'Collar: ' + f.collar : null,
    sh.sleeve ? 'Sleeve: ' + f.sleeve : null,
    (sh.isPant ? 'Leg opening: ' : 'Hem: ') + (f.hem || '—'),
    'Fabric: ' + f.fabric,
    'Color: ' + (f.color || '—'),
    f.hasDesign ? 'Print: ' + printColorsSummary(f) : 'Print: Plain (no print)',
    f.hasDesign && f.placement ? 'Placement: ' + f.placement : null,
    'Quantity: ' + (qty || 0) + ' pcs', '',
    'PRICE BREAKDOWN (per piece)',
    ...breakdown.lines.map((l) => l.label + ': ' + (l.key === 'base' ? peso(l.amount) : (l.amount ? '+' + peso(l.amount) : 'Included'))),
    '',
    'Per piece: ' + (priced ? peso(perPc) : 'Quoted by staff'),
    'Garment total × ' + (qty || 0) + ' pcs: ' + (priced ? peso(total) : '—'),
    'Sample fee: ' + peso(sampleFee),
    'Total (incl. sample fee): ' + (priced ? peso(grandTotal) : '—'),
    '60% downpayment: ' + (priced ? peso(dp) : '—'),
    '40% balance at pickup: ' + (priced ? peso(bal) : '—'),
  ].filter(Boolean).join('\n')
}

export default function QuoteSummary({ form, qty = 50, onChange, onProceed, onSignIn, initialShowAddress = false }) {
  const { isAuthenticated } = useSession()
  const [copied, setCopied] = useState(false)
  const [showAddress, setShowAddress] = useState(initialShowAddress)
  const [delivery, setDelivery] = useState(null)
  const timer = useRef(null)
  const t = quoteTotals(form, qty)
  const breakdown = priceBreakdown(form)
  // Same derivation the kiosk's own panel uses, so both hide the rows that don't apply to
  // the chosen style instead of printing a "—" placeholder for them.
  const sh = showFor(form.style, form.printChoice)
  const priced = showsPrice(form.style)

  const copyQuote = () => {
    const text = buildQuoteText(form, sh, breakdown, qty)
    copyToClipboard(text).then(() => {
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2200)
    })
  }

  // First click reveals the address step (nothing asked for it until now); once an
  // address resolves, the same button's second click actually places the order.
  const handlePlaceOrder = () => {
    if (!showAddress) { setShowAddress(true); return }
    if (delivery) onProceed(delivery)
  }

  // Row order/labels/conditions deliberately mirror WalkInForm.jsx's own spec grid — see
  // the note on buildQuoteText above.
  const cells = [
    ['Style', styleById(form.style).label],
    sh.fit && ['Fit', form.fit || '—'],
    ['Size', form.size || '—'],
    sh.collar && ['Collar', form.collar || '—'],
    sh.sleeve && ['Sleeve', form.sleeve || '—'],
    [sh.isPant ? 'Leg opening' : 'Hem', form.hem || '—'],
    ['Fabric', form.fabric || '—'],
    ['Color', form.color || '—'],
    ['Print', form.hasDesign ? printColorsSummary(form) : 'Plain (no print)'],
    form.hasDesign && ['Placement', form.placement || '—'],
  ].filter(Boolean)

  return (
    <div className="quote-card" id="sbQuoteCard">
      <h2 className="quote-heading">Here’s your quote</h2>

      <div className="quote-spec-box">
        <div className="quote-spec-head">Your specs</div>
        <div className="quote-grid">
          {cells.map(([k, v]) => (
            <div className="quote-cell" key={k}>
              <div className="quote-cell-k">{k}</div>
              <div className="quote-cell-v">{v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="quote-price">
        <div className="quote-price-head">Sample quotation</div>
        {breakdown.lines.map((l) => (
          <div className="quote-price-row quote-muted" key={l.key}>
            <span>{l.label}</span>
            <span>{l.key === 'base' ? peso(l.amount) : (l.amount ? '+' + peso(l.amount) : 'Included')}</span>
          </div>
        ))}
        <div className="quote-price-row quote-price-row--hero">
          <span>Per piece</span>
          <span className="quote-perpc">{priced ? peso(t.perPc) : 'Quoted by staff'}</span>
        </div>
        <div className="quote-price-row quote-muted"><span>Garment total × {qty} pcs</span><span>{priced ? peso(t.total) : '—'}</span></div>
        <div className="quote-price-row quote-muted"><span>+ Sample fee</span><span>{peso(t.sampleFee)}</span></div>
        <div className="quote-price-row quote-total"><span>Total (incl. sample fee)</span><span>{priced ? peso(t.grandTotal) : '—'}</span></div>
        <div className="quote-split">
          <div className="quote-price-row quote-muted"><span>60% downpayment</span><span>{priced ? peso(t.dp) : '—'}</span></div>
          <div className="quote-price-row quote-muted"><span>40% balance at pickup</span><span>{priced ? peso(t.bal) : '—'}</span></div>
        </div>
        <div className="quote-min">
          Minimum order: <strong>{MIN_QTY} pcs</strong> {QUOTE_MIN_NOTE_TAIL}
        </div>
      </div>

      <div className="quote-tools">
        <button className={'quote-tool' + (copied ? ' quote-tool--ok' : '')} onClick={copyQuote}>
          <span className="quote-tool-ico">{copied ? <IoCheckmarkCircle /> : <IoCopyOutline />}</span>
          <span className="quote-tool-body">
            <span className="quote-tool-t">{copied ? 'Copied!' : 'Copy quote'}</span>
            <span className="quote-tool-s">{copied ? 'Ready to paste' : 'Text to clipboard'}</span>
          </span>
        </button>
        <button className="quote-tool" onClick={() => window.print()}>
          <span className="quote-tool-ico"><IoDownloadOutline /></span>
          <span className="quote-tool-body">
            <span className="quote-tool-t">Save as PDF</span>
            <span className="quote-tool-s">Print-ready copy</span>
          </span>
        </button>
      </div>

      {onProceed && showAddress && (
        <div className="quote-delivery">
          <h3 className="quote-delivery-h">Delivery address</h3>
          {isAuthenticated ? (
            <AddressPicker value={delivery} onChange={setDelivery} />
          ) : (
            <div className="quote-signin">
              <p className="quote-signin-copy">Sign in to add your delivery address — so it's saved to your account, not just this order.</p>
              <button type="button" className="btn btn-gold" onClick={onSignIn}>Sign in to continue</button>
            </div>
          )}
        </div>
      )}

      <div className="quote-cta">
        {onChange && <button className="quote-change" onClick={onChange}>Change</button>}
        {onProceed && (
          <button className="quote-proceed" disabled={showAddress && !delivery} onClick={handlePlaceOrder}>
            Place order →
          </button>
        )}
      </div>
      {onProceed && (
        <p className="quote-foot">The ₱1,000 sample fee is billed first; you’ll need to sign in to place the order.</p>
      )}
    </div>
  )
}
