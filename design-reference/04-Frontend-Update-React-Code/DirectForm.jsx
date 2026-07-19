// src/pages/DirectForm.jsx  — Path B (Online / Instant)
// Config-driven rework: all options come from src/data/orderConfig.js.
// Compact card-grid form → shared QuoteSummary. No print-method / fulfillment / upload steps.
import { useMemo, useState } from 'react'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import QuoteSummary from './QuoteSummary.jsx'
import { navigate, navigateBack } from '../utils/navigation.js'
import {
  STYLES, FITS, SIZES, SIZE_PRICES, COLLARS, SLEEVES, FABRICS, colorsFor, COLOR_HEX,
  PRINT_COLOR_OPTIONS, PRINT_CHOICES, PLACEMENTS, hemsFor, showFor, showsPrice,
  styleById, peso, quoteTotals, MIN_QTY,
} from '../data/orderConfig.js'
import '../design/DirectForm.css'

const DEFAULT_FORM = {
  style: 'plain-tee', fit: 'Standard', size: 'M',
  collar: 'Standard ribbed crew', sleeve: 'Standard cuff', hem: 'Standard open hem',
  fabric: 'CVC 240 GSM', color: 'Black',
  printChoice: 'has', hasDesign: false, printColors: 1, placement: 'Front only',
  qty: MIN_QTY,
}

// Small uniform option card
function Card({ title, sub, selected, onClick }) {
  return (
    <div className={'df-card' + (selected ? ' df-card--on' : '')} onClick={onClick}>
      <div className="df-card-t">{title}</div>
      {sub ? <div className="df-card-s">{sub}</div> : null}
    </div>
  )
}

export default function DirectForm() {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [showQuote, setShowQuote] = useState(false)
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const sh = useMemo(() => showFor(form.style, form.printChoice), [form.style, form.printChoice])
  const hasDesign = sh.printDesign
  const hems = hemsFor(form.style)
  const colors = colorsFor(form.fabric)
  const priced = showsPrice(form.style)
  const t = quoteTotals({ ...form, hasDesign }, form.qty)

  // keep dependent fields valid when style/fabric change
  const pickStyle = (id) => {
    const s = showFor(id, form.printChoice)
    const nextHems = hemsFor(id)
    set({
      style: id,
      fit: s.isPant ? form.fit : (FITS.includes(form.fit) ? form.fit : 'Standard'),
      hem: nextHems.some((h) => h.label === form.hem) ? form.hem : nextHems[0].label,
    })
  }
  const pickFabric = (value) => {
    const avail = colorsFor(value)
    set({ fabric: value, color: avail.includes(form.color) ? form.color : (avail[0] || form.color) })
  }

  if (showQuote) {
    return (
      <div className="df-page">
        <Navbar />
        <div className="df-quote-wrap">
          <QuoteSummary
            form={{ ...form, hasDesign }}
            qty={form.qty}
            onChange={() => setShowQuote(false)}
            onProceed={() => navigate('?page=my-orders')}
          />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="df-page">
      <Navbar />

      <div className="df-body">
        <button className="df-back" onClick={() => navigateBack('?page=home')}>← Back</button>
        <h1 className="df-title">Build your order</h1>
        <p className="df-lead">Know exactly what you want? Fill it in — your quote updates live.</p>

        {/* 1 · Apparel */}
        <section className="df-section">
          <h2 className="df-h2">1 · Apparel</h2>

          <div className="df-label">Style</div>
          <div className="df-grid">
            {STYLES.map((s) => (
              <Card key={s.id} title={s.label} sub={s.sub} selected={form.style === s.id} onClick={() => pickStyle(s.id)} />
            ))}
          </div>

          {sh.fit && (
            <>
              <div className="df-label">Fit</div>
              <div className="df-grid">
                {FITS.map((fit) => (
                  <Card key={fit} title={fit} selected={form.fit === fit} onClick={() => set({ fit })} />
                ))}
              </div>
            </>
          )}

          <div className="df-label">Sample size <span className="df-hint">(pick one — quantity is set below)</span></div>
          <div className="df-grid df-grid--sizes">
            {SIZES.map((sz) => {
              const p = (SIZE_PRICES[form.fit] || SIZE_PRICES.Standard)[sz]
              const add = styleById(form.style).addPerPc
              return (
                <Card
                  key={sz}
                  title={sz}
                  sub={priced ? peso(p + add) + ' / pc' : 'Sample size'}
                  selected={form.size === sz}
                  onClick={() => set({ size: sz })}
                />
              )
            })}
          </div>

          {sh.collar && (
            <>
              <div className="df-label">Collar type</div>
              <div className="df-grid">
                {COLLARS.map((c) => (
                  <Card key={c.label} title={c.label} sub={c.sub} selected={form.collar === c.label} onClick={() => set({ collar: c.label })} />
                ))}
              </div>
            </>
          )}

          {sh.sleeve && (
            <>
              <div className="df-label">Sleeve</div>
              <div className="df-grid">
                {SLEEVES.map((c) => (
                  <Card key={c.label} title={c.label} sub={c.sub} selected={form.sleeve === c.label} onClick={() => set({ sleeve: c.label })} />
                ))}
              </div>
            </>
          )}

          <div className="df-label">{sh.isPant ? 'Leg opening' : 'Hem'}</div>
          <div className="df-grid">
            {hems.map((h) => (
              <Card key={h.label} title={h.label} sub={h.sub} selected={form.hem === h.label} onClick={() => set({ hem: h.label })} />
            ))}
          </div>
        </section>

        {/* 2 · Fabric & Color */}
        <section className="df-section">
          <h2 className="df-h2">2 · Fabric &amp; color</h2>
          <div className="df-label">Fabric &amp; weight</div>
          <div className="df-grid">
            {FABRICS.map((fb) => (
              <Card key={fb.value} title={fb.label} sub={fb.sub} selected={form.fabric === fb.value} onClick={() => pickFabric(fb.value)} />
            ))}
          </div>

          <div className="df-label">Color <span className="df-hint">(available for {form.fabric})</span></div>
          <div className="df-swatches">
            {colors.map((c) => (
              <button
                key={c}
                className={'df-swatch' + (form.color === c ? ' df-swatch--on' : '')}
                title={c}
                onClick={() => set({ color: c })}
              >
                <span style={{ background: COLOR_HEX[c] || '#ccc' }} />
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* 3 · Print & Design */}
        {(sh.needsPrintChoice || hasDesign) && (
          <section className="df-section">
            <h2 className="df-h2">3 · Print &amp; design</h2>

            {sh.needsPrintChoice && (
              <div className="df-grid df-grid--wide">
                {PRINT_CHOICES.map((pc) => (
                  <Card key={pc.id} title={pc.label} sub={pc.sub} selected={form.printChoice === pc.id} onClick={() => set({ printChoice: pc.id })} />
                ))}
              </div>
            )}

            {hasDesign && (
              <>
                <div className="df-label">Print colors</div>
                <div className="df-grid">
                  {PRINT_COLOR_OPTIONS.map((o) => (
                    <Card
                      key={o.n}
                      title={o.label}
                      sub={o.sub}
                      selected={o.n === 5 ? (form.printColors || 1) >= 5 : form.printColors === o.n}
                      onClick={() => set({ printColors: o.n === 5 ? Math.max(5, form.printColors || 5) : o.n })}
                    />
                  ))}
                </div>
                {(form.printColors || 1) >= 5 && (
                  <div className="df-others">
                    <div className="df-label">Number of colors</div>
                    <input
                      type="number" min="5" max="99" value={form.printColors}
                      onChange={(e) => set({ printColors: Math.max(5, Math.min(99, parseInt(e.target.value, 10) || 5)) })}
                    />
                    <div className="df-hint">{form.printColors} colors · +{peso(20 * (form.printColors - 1))} / pc</div>
                  </div>
                )}

                <div className="df-label">Placement</div>
                <div className="df-grid">
                  {PLACEMENTS.map((p) => (
                    <Card key={p.label} title={p.label} sub={p.sub} selected={form.placement === p.label} onClick={() => set({ placement: p.label })} />
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {/* 4 · Quantity */}
        <section className="df-section">
          <h2 className="df-h2">4 · Quantity</h2>
          <div className="df-qty">
            <button onClick={() => set({ qty: Math.max(MIN_QTY, (form.qty || MIN_QTY) - 10) })}>−</button>
            <input
              type="number" min={MIN_QTY} step="10" value={form.qty}
              onChange={(e) => set({ qty: Math.max(MIN_QTY, parseInt(e.target.value, 10) || MIN_QTY) })}
            />
            <button onClick={() => set({ qty: (form.qty || MIN_QTY) + 10 })}>+</button>
          </div>
          <div className="df-hint">Minimum {MIN_QTY} pcs · steps of 10</div>
        </section>
      </div>

      {/* sticky live estimate */}
      <div className="df-bar">
        <div>
          <div className="df-bar-k">Live estimate</div>
          <div className="df-bar-v">{peso(t.perPc)} <span>/ pc</span></div>
          <div className="df-bar-sub">{peso(t.total)} total · {peso(t.grandTotal)} incl. sample fee</div>
        </div>
        <button className="df-bar-cta" onClick={() => setShowQuote(true)}>See quotation →</button>
      </div>

      <Footer />
    </div>
  )
}
