// src/pages/QuoteSummary.jsx
// Shared quotation screen for Path A (GuidedWalkthrough) and Path B (DirectForm).
// Usage: <QuoteSummary form={form} qty={qty} onChange={goEditOrder} onProceed={goCheckout} />
import { useRef, useState } from 'react'
import { IoCopyOutline, IoCheckmarkCircle, IoDownloadOutline } from 'react-icons/io5'
import { quoteTotals, peso, styleById } from '../data/orderConfig.js'
import '../design/QuoteSummary.css'

function buildQuoteText(f, qty) {
  const { perPc, total, sampleFee, grandTotal } = quoteTotals(f, qty)
  const colors = f.printColors || 1
  return [
    'Sorbetes Apparel — Quotation', '',
    'Style: ' + styleById(f.style).label,
    'Fit: ' + (f.fit || '—'),
    'Size: ' + (f.size || '—'),
    'Collar: ' + (f.collar || '—'),
    'Sleeve: ' + (f.sleeve || '—'),
    'Hem: ' + (f.hem || '—'),
    'Fabric: ' + f.fabric,
    'Color: ' + (f.color || '—'),
    f.hasDesign ? 'Print colors: ' + colors : 'Print: Plain (no print)',
    f.hasDesign && f.placement ? 'Placement: ' + f.placement : null,
    'Quantity: ' + (qty || 0) + ' pcs', '',
    'Price per piece: ' + peso(perPc),
    'Garment total: ' + peso(total),
    'Sample fee: ' + peso(sampleFee),
    'Total (incl. sample fee): ' + peso(grandTotal),
  ].filter(Boolean).join('\n')
}

export default function QuoteSummary({ form, qty = 50, onChange, onProceed }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef(null)
  const t = quoteTotals(form, qty)
  const colors = form.printColors || 1

  const copyQuote = () => {
    const text = buildQuoteText(form, qty)
    const done = () => {
      setCopied(true)
      clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 2200)
    }
    const fallback = () => {
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
      done()
    }
    if (navigator.clipboard?.writeText && window.isSecureContext !== false) {
      navigator.clipboard.writeText(text).then(done).catch(fallback)
    } else fallback()
  }

  const cells = [
    ['Style / fit', styleById(form.style).label + ' · ' + (form.fit || '—')],
    ['Size', form.size || '—'],
    ['Collar', form.collar || '—'],
    ['Sleeve', form.sleeve || '—'],
    ['Hem', form.hem || '—'],
    ['Fabric', form.fabric || '—'],
    ['Color', form.color || '—'],
    ['Print', form.hasDesign ? colors + '-color' : 'Plain (no print)'],
    ['Placement', form.hasDesign ? (form.placement || '—') : '—'],
  ]

  return (
    <div className="quote-card" id="sbQuoteCard">
      <h2 className="quote-heading">Here’s your quote</h2>

      <div className="quote-grid">
        {cells.map(([k, v]) => (
          <div className="quote-cell" key={k}>
            <div className="quote-cell-k">{k}</div>
            <div className="quote-cell-v">{v}</div>
          </div>
        ))}
      </div>

      <div className="quote-price">
        <div className="quote-price-row quote-price-row--hero">
          <span>Per piece</span>
          <span className="quote-perpc">{peso(t.perPc)}</span>
        </div>
        <div className="quote-price-row quote-muted"><span>Garment total × {qty} pcs</span><span>{peso(t.total)}</span></div>
        <div className="quote-price-row quote-muted"><span>+ Sample fee</span><span>{peso(t.sampleFee)}</span></div>
        <div className="quote-price-row quote-total"><span>Total (incl. sample fee)</span><span>{peso(t.grandTotal)}</span></div>
        <div className="quote-split">
          <div className="quote-price-row quote-muted"><span>60% downpayment</span><span>{peso(t.dp)}</span></div>
          <div className="quote-price-row quote-muted"><span>40% balance at pickup</span><span>{peso(t.bal)}</span></div>
        </div>
      </div>

      <div className="quote-tools">
        <button className="quote-tool" onClick={copyQuote}>
          {copied
            ? <><IoCheckmarkCircle className="quote-ok" /><span className="quote-ok">Copied to Clipboard</span></>
            : <><IoCopyOutline /> Copy quote</>}
        </button>
        <button className="quote-tool" onClick={() => window.print()}>
          <IoDownloadOutline /> Save as PDF
        </button>
      </div>

      <div className="quote-cta">
        {onChange && <button className="quote-change" onClick={onChange}>Change</button>}
        {onProceed && <button className="quote-proceed" onClick={onProceed}>Continue →</button>}
      </div>
    </div>
  )
}
