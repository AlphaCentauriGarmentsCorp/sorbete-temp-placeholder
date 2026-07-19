// src/pages/QuickQuote.jsx — ballpark calculator (?page=quick-quote), marketing.
// Simpler than the full builder: style + qty + print colors → per-piece + total, computed
// from the canonical orderConfig (Standard fit, size M, front print). Accepts prefill params
// (?qty=&colors=&style=) from Portfolio's "Get this spec quoted".
import { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { IoArrowForward } from 'react-icons/io5'
import { navigate, getParam } from '../utils/navigation.js'
import { quoteTotals, peso, MIN_QTY, styleById } from '../data/orderConfig.js'
import '../design/marketing.css'

const STYLE_OPTS = [
  { id: 'printed-tee', label: 'Tee' },
  { id: 'long-sleeve', label: 'Long sleeve' },
  { id: 'hoodie', label: 'Hoodie' },
]
const COLOR_OPTS = [1, 2, 3, 4, 5]

export default function QuickQuote() {
  const paramStyle = STYLE_OPTS.find((s) => s.id === getParam('style'))?.id
  const [style, setStyle] = useState(paramStyle || 'printed-tee')
  const [colors, setColors] = useState(Math.max(1, Number(getParam('colors')) || 1))
  const [qty, setQty] = useState(Math.max(MIN_QTY, Number(getParam('qty')) || MIN_QTY))

  const form = {
    style, fit: 'Standard', size: 'M',
    collar: 'Standard ribbed crew', sleeve: 'Standard cuff', hem: 'Standard open hem',
    fabric: 'CVC 240 GSM', color: 'Black',
    hasDesign: true, printColors: colors, placement: 'Front only',
  }
  const t = quoteTotals(form, qty)

  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <section className="mk-hero">
          <div className="mk-eyebrow">Quick quote</div>
          <h1 className="mk-h1">Ballpark in seconds.</h1>
          <p className="mk-lead">A rough per-piece estimate for a Standard-fit, size-M, front-print run. Want exact numbers by size, fabric, and placement? Use the full builder.</p>
        </section>

        <section className="mk-section">
          <div className="qq-wrap">
            <div className="qq-panel">
              <div className="qq-label">Garment</div>
              <div className="qq-opts">
                {STYLE_OPTS.map((s) => (
                  <button key={s.id} className={'qq-opt' + (style === s.id ? ' qq-opt--on' : '')} onClick={() => setStyle(s.id)}>{s.label}</button>
                ))}
              </div>

              <div className="qq-label">Print colors</div>
              <div className="qq-opts">
                {COLOR_OPTS.map((n) => (
                  <button key={n} className={'qq-opt' + ((n === 5 ? colors >= 5 : colors === n) ? ' qq-opt--on' : '')}
                    onClick={() => setColors(n === 5 ? Math.max(5, colors) : n)}>
                    {n === 5 ? '5+' : n}
                  </button>
                ))}
              </div>
              {colors >= 5 && (
                <input type="number" min="5" max="99" value={colors} className="git-input" style={{ marginTop: 10, width: 120 }}
                  onChange={(e) => setColors(Math.max(5, Math.min(99, parseInt(e.target.value, 10) || 5)))} />
              )}

              <div className="qq-label">Quantity</div>
              <div className="qq-qty">
                <button onClick={() => setQty((q) => Math.max(MIN_QTY, q - 10))}>−</button>
                <input type="number" min={MIN_QTY} step="10" value={qty}
                  onChange={(e) => setQty(Math.max(MIN_QTY, parseInt(e.target.value, 10) || MIN_QTY))} />
                <button onClick={() => setQty((q) => q + 10)}>+</button>
              </div>
              <div className="mk-feature-body" style={{ marginTop: 8 }}>Minimum {MIN_QTY} pcs · 1-color print included.</div>
            </div>

            <div className="qq-result">
              <div className="mk-eyebrow" style={{ color: 'var(--gold)' }}>{styleById(style).label} · {colors}-color</div>
              <div className="qq-perpc">{peso(t.perPc)} <span>/ pc</span></div>
              <div className="qq-line"><span>Garment × {qty} pcs</span><span>{peso(t.total)}</span></div>
              <div className="qq-line"><span>+ Sample fee</span><span>{peso(t.sampleFee)}</span></div>
              <div className="qq-line qq-line--total"><span>Total (incl. sample)</span><span>{peso(t.grandTotal)}</span></div>
              <div className="qq-line"><span>60% downpayment</span><span>{peso(t.dp)}</span></div>
              <div className="qq-line"><span>40% balance</span><span>{peso(t.bal)}</span></div>
              <p className="qq-note">Ballpark only — final quote depends on size, fabric, collar/sleeve, and placement.</p>
              <button className="btn btn-gold" style={{ width: '100%', marginTop: 14, justifyContent: 'center' }} onClick={() => navigate('?page=start')}>
                Use the full builder <IoArrowForward />
              </button>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
