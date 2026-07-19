// src/pages/GuidedWalkthrough.jsx  — Path A (Online / Guided, scroll-scrub)
// A sticky video/model stage is scrubbed by scroll position; each "part" zooms the stage to
// the relevant garment area while its options show on the right. Options come from
// src/data/orderConfig.js. Ends in QuoteSummary → placeOrder (sign-in gate).
// Ported from design-reference/04-Frontend-Update-React-Code/GuidedWalkthrough.jsx; changes:
// chrome import path + onProceed routes through the checkout hook.
//
// ASSET: vertical garment clip at /public/scrub-tee.mp4. Frames are driven by scroll —
// the video is never played, only seeked.
import { useEffect, useMemo, useRef, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import QuoteSummary from './QuoteSummary.jsx'
import { navigateBack } from '../utils/navigation.js'
import { useCheckout } from '../hooks/useCheckout.js'
import {
  STYLES, FITS, SIZES, SIZE_PRICES, COLLARS, SLEEVES, FABRICS, colorsFor, COLOR_HEX,
  PRINT_COLOR_OPTIONS, PRINT_CHOICES, PLACEMENTS, hemsFor, showFor, showsPrice,
  styleById, peso, quoteTotals, MIN_QTY,
} from '../data/orderConfig.js'

const fabricLabel = (value) => (FABRICS.find((f) => f.value === value) || {}).label || value
import '../design/GuidedWalkthrough.css'

const SCRUB_SRC = '/scrub-tee.mp4'
const PART_VH = 130 // scroll height per part

const smoother = (r) => r * r * r * (r * (r * 6 - 15) + 10)

// Per-part zoom focus {s: scale, x/y: transform-origin %}. Collar→neck, sleeve→cuff, hem→bottom.
const FOCUS = {
  style:       { s: 1.0, x: 50, y: 32 }, size: { s: 1.0, x: 50, y: 40 },
  collar:      { s: 2.9, x: 50, y: 13 }, sleeve: { s: 2.3, x: 30, y: 30 },
  hem:         { s: 2.1, x: 52, y: 56 }, fabric: { s: 1.7, x: 50, y: 40 },
  color:       { s: 1.7, x: 50, y: 40 }, printChoice: { s: 1.0, x: 50, y: 32 },
  printColors: { s: 1.8, x: 50, y: 34 }, placement: { s: 1.6, x: 50, y: 36 },
}

const DEFAULT_FORM = {
  style: 'plain-tee', fit: 'Standard', size: 'M',
  collar: 'Standard ribbed crew', sleeve: 'Standard cuff', hem: 'Standard open hem',
  fabric: 'CVC 240 GSM', color: 'Black',
  printChoice: 'has', printColors: 1, placement: 'Front only', qty: MIN_QTY,
}

function Card({ title, sub, selected, onClick }) {
  return (
    <div className={'gw-card' + (selected ? ' gw-card--on' : '')} onClick={onClick}>
      <div className="gw-card-t">{title}</div>
      {sub ? <div className="gw-card-s">{sub}</div> : null}
    </div>
  )
}

export default function GuidedWalkthrough() {
  const [form, setForm] = useState(DEFAULT_FORM)
  const [step, setStep] = useState(0)
  const [showQuote, setShowQuote] = useState(false)
  const { placeOrder } = useCheckout()
  const set = (patch) => setForm((f) => ({ ...f, ...patch }))

  const sh = useMemo(() => showFor(form.style, form.printChoice), [form.style, form.printChoice])
  const hasDesign = sh.printDesign

  // Build the ordered part list from the current style/print choice.
  const parts = useMemo(() => {
    const list = [
      { key: 'style', section: 'Apparel', label: 'Apparel style', hint: 'Pick the garment you’re producing.' },
      { key: 'size', section: 'Apparel', label: 'Sample size', hint: 'Pick one size — quantity comes later.' },
      sh.collar && { key: 'collar', section: 'Apparel', label: 'Collar type', hint: 'Look closely at the neckline.' },
      sh.sleeve && { key: 'sleeve', section: 'Apparel', label: 'Sleeve', hint: 'Sleeve cuff finish.' },
      { key: 'hem', section: 'Apparel', label: sh.isPant ? 'Leg opening' : 'Hem', hint: sh.isPant ? 'The leg opening finish.' : 'The bottom hem finish.' },
      { key: 'fabric', section: 'Fabric & Color', label: 'Fabric & weight', hint: 'Choose the fabric and GSM.' },
      { key: 'color', section: 'Fabric & Color', label: 'Color / colorway', hint: 'Pick from the catalog for your fabric.' },
      sh.needsPrintChoice && { key: 'printChoice', section: 'Print & Design', label: 'Print', hint: 'Plain piece, or a printed design?' },
      hasDesign && { key: 'printColors', section: 'Print & Design', label: 'Print colors', hint: 'How many ink colors in your print.' },
      hasDesign && { key: 'placement', section: 'Print & Design', label: 'Placement', hint: 'Where the print lands.' },
    ].filter(Boolean)
    return list
  }, [sh, hasDesign])

  const N = parts.length
  const trackRef = useRef(null)
  const videoRef = useRef(null)
  const zoomRef = useRef(null)
  const rafRef = useRef(null)
  const stepRef = useRef(0)
  const appliedRef = useRef({ s: 1, x: 50, y: 32 }) // eased values carried across frames

  // Continuous, damped rAF loop. Reads scroll each frame and eases the applied
  // transform toward the target (no CSS transition — that fought the per-frame writes
  // and made the zoom lag the scroll). Video is seeked only on meaningful change.
  useEffect(() => {
    let running = true
    const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
    const lerp = (m, n, e) => m + (n - m) * e

    const loop = () => {
      if (!running) return
      rafRef.current = requestAnimationFrame(loop) // schedule next up-front
      if (document.hidden) return
      const track = trackRef.current
      if (!track) return

      const vh = window.innerHeight
      const rect = track.getBoundingClientRect()
      const denom = rect.height - vh
      const p = clamp(denom > 0 ? -rect.top / denom : 0, 0, 0.9999)

      // target focus for this scroll position, eased within the active part
      const pf = p * N
      const idx = clamp(Math.floor(pf), 0, N - 1)
      const e = smoother(clamp(pf - idx, 0, 1))
      const a = FOCUS[parts[idx]?.key] || FOCUS.style
      const b = FOCUS[parts[Math.min(N - 1, idx + 1)]?.key] || a
      const tx = { s: lerp(a.s, b.s, e), x: lerp(a.x, b.x, e), y: lerp(a.y, b.y, e) }

      // damped follow → smooth motion decoupled from scroll-event cadence
      const k = 0.16
      const ap = appliedRef.current
      ap.s += (tx.s - ap.s) * k
      ap.x += (tx.x - ap.x) * k
      ap.y += (tx.y - ap.y) * k

      const z = zoomRef.current
      if (z) {
        z.style.transform = `scale(${ap.s.toFixed(4)})`
        z.style.transformOrigin = `${ap.x.toFixed(2)}% ${ap.y.toFixed(2)}%`
      }

      // seek the video (scrub only) — skip sub-frame deltas to avoid decode stutter
      const v = videoRef.current
      if (v && v.duration) {
        const tt = p * v.duration
        if (Math.abs(v.currentTime - tt) > 1 / 30) {
          try { v.currentTime = tt } catch { /* not seekable yet */ }
        }
      }

      if (idx !== stepRef.current) { stepRef.current = idx; setStep(idx) }
    }

    rafRef.current = requestAnimationFrame(loop)
    return () => {
      running = false
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [N, parts])

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

  const t = quoteTotals({ ...form, hasDesign }, form.qty)
  const active = parts[Math.min(step, N - 1)] || parts[0]
  const priced = showsPrice(form.style)

  if (showQuote) {
    return (
      <div className="gw-page">
        <Navbar />
        <div className="gw-quote-wrap">
          <QuoteSummary form={{ ...form, hasDesign }} qty={form.qty}
            onChange={() => { setShowQuote(false); window.scrollTo(0, 0) }}
            onProceed={() => placeOrder({ path: 'guided', form: { ...form, hasDesign }, qty: form.qty })} />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="gw-page">
      <Navbar />

      <div className="gw-intro">
        <button className="gw-back" onClick={() => navigateBack('?page=start')}>← Back to options</button>
        <h1 className="gw-title">Design it as you scroll.</h1>
        <p className="gw-lead">
          Scroll through three sections — apparel, fabric &amp; color, print &amp; design.
          The preview reacts as you choose, and your quote moves live.
        </p>
      </div>

      {/* scroll-scrub track: tall spacer + sticky text / stage / options */}
      <div ref={trackRef} className="gw-track" style={{ height: `${N * PART_VH}vh` }}>
        <div className="gw-stick">
          <div className="gw-part-meta">
            <span className="gw-sec">{active.section}</span>
            <h2 className="gw-part-title">{active.label}</h2>
            <p className="gw-part-hint">{active.hint}</p>
          </div>

          <div className="gw-stage-col">
            <div className="gw-stage">
              <span className="gw-stage-badge">{styleById(form.style).label}</span>
              <div ref={zoomRef} className="gw-zoom">
                <video ref={videoRef} src={SCRUB_SRC} muted playsInline preload="auto" />
              </div>
              <div className="gw-stage-cap">Scroll to explore · 360° view</div>
            </div>

            <div className="gw-spec">
              <div className="gw-spec-label">Live preview spec</div>
              <div className="gw-spec-chips">
                <span className="gw-chip"><b>Style:</b> {styleById(form.style).label}</span>
                {sh.fit && <span className="gw-chip"><b>Fit:</b> {form.fit}</span>}
                <span className="gw-chip"><b>Sizes:</b> {form.size}</span>
                {sh.collar && <span className="gw-chip"><b>Collar:</b> {form.collar}</span>}
                {sh.sleeve && <span className="gw-chip"><b>Sleeve:</b> {form.sleeve}</span>}
                <span className="gw-chip"><b>{sh.isPant ? 'Leg opening' : 'Hem'}:</b> {form.hem}</span>
                <span className="gw-chip"><b>Fabric:</b> {fabricLabel(form.fabric)}</span>
                <span className="gw-chip"><b>Color:</b> {form.color}</span>
              </div>
            </div>
          </div>

          <aside className="gw-options">
            {active.key === 'style' && (
              <>
                <div className="gw-cards">
                  {STYLES.map((s) => (
                    <Card key={s.id} title={s.label} sub={s.sub} selected={form.style === s.id} onClick={() => pickStyle(s.id)} />
                  ))}
                </div>
                {sh.fit && (
                  <div className="gw-inline">
                    <div className="gw-inline-label">Fit — {styleById(form.style).label}</div>
                    <div className="gw-cards gw-cards--row">
                      {FITS.map((fit) => (
                        <Card key={fit} title={fit} selected={form.fit === fit} onClick={() => set({ fit })} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {active.key === 'size' && (
              <div className="gw-cards gw-cards--sizes">
                {SIZES.map((sz) => {
                  const p = (SIZE_PRICES[form.fit] || SIZE_PRICES.Standard)[sz]
                  const add = styleById(form.style).addPerPc
                  return (
                    <Card key={sz} title={sz} sub={priced ? peso(p + add) + ' / pc' : 'Sample size'}
                      selected={form.size === sz} onClick={() => set({ size: sz })} />
                  )
                })}
              </div>
            )}

            {active.key === 'collar' && (
              <div className="gw-cards">
                {COLLARS.map((c) => <Card key={c.label} title={c.label} sub={c.sub} selected={form.collar === c.label} onClick={() => set({ collar: c.label })} />)}
              </div>
            )}
            {active.key === 'sleeve' && (
              <div className="gw-cards">
                {SLEEVES.map((c) => <Card key={c.label} title={c.label} sub={c.sub} selected={form.sleeve === c.label} onClick={() => set({ sleeve: c.label })} />)}
              </div>
            )}
            {active.key === 'hem' && (
              <div className="gw-cards">
                {hemsFor(form.style).map((h) => <Card key={h.label} title={h.label} sub={h.sub} selected={form.hem === h.label} onClick={() => set({ hem: h.label })} />)}
              </div>
            )}

            {active.key === 'fabric' && (
              <div className="gw-cards">
                {FABRICS.map((fb) => <Card key={fb.value} title={fb.label} sub={fb.sub} selected={form.fabric === fb.value} onClick={() => pickFabric(fb.value)} />)}
              </div>
            )}
            {active.key === 'color' && (
              <div className="gw-swatches">
                {colorsFor(form.fabric).map((c) => (
                  <button key={c} className={'gw-swatch' + (form.color === c ? ' gw-swatch--on' : '')} title={c} onClick={() => set({ color: c })}>
                    <span style={{ background: COLOR_HEX[c] || '#ccc' }} />{c}
                  </button>
                ))}
              </div>
            )}

            {active.key === 'printChoice' && (
              <div className="gw-cards">
                {PRINT_CHOICES.map((pc) => <Card key={pc.id} title={pc.label} sub={pc.sub} selected={form.printChoice === pc.id} onClick={() => set({ printChoice: pc.id })} />)}
              </div>
            )}
            {active.key === 'printColors' && (
              <>
                <div className="gw-cards">
                  {PRINT_COLOR_OPTIONS.map((o) => (
                    <Card key={o.n} title={o.label} sub={o.sub}
                      selected={o.n === 5 ? (form.printColors || 1) >= 5 : form.printColors === o.n}
                      onClick={() => set({ printColors: o.n === 5 ? Math.max(5, form.printColors || 5) : o.n })} />
                  ))}
                </div>
                {(form.printColors || 1) >= 5 && (
                  <div className="gw-others">
                    <div className="gw-inline-label">Number of colors</div>
                    <input type="number" min="5" max="99" value={form.printColors}
                      onChange={(e) => set({ printColors: Math.max(5, Math.min(99, parseInt(e.target.value, 10) || 5)) })} />
                    <div className="gw-part-hint">{form.printColors} colors · +{peso(20 * (form.printColors - 1))} / pc</div>
                  </div>
                )}
              </>
            )}
            {active.key === 'placement' && (
              <div className="gw-cards">
                {PLACEMENTS.map((p) => <Card key={p.label} title={p.label} sub={p.sub} selected={form.placement === p.label} onClick={() => set({ placement: p.label })} />)}
              </div>
            )}

            <div className="gw-progress">{Math.min(step + 1, N)} / {N}</div>
          </aside>
        </div>
      </div>

      {/* sticky live estimate + see-quote */}
      <div className="gw-bar">
        <div className="gw-bar-stats">
          <div>
            <div className="gw-bar-k">Per piece</div>
            <div className="gw-bar-v">{peso(t.perPc)}</div>
          </div>
          <div>
            <div className="gw-bar-k">Quantity</div>
            <div className="gw-bar-v gw-bar-v--sm">{form.qty} pcs</div>
          </div>
          <div>
            <div className="gw-bar-k">Total (incl. sample fee)</div>
            <div className="gw-bar-v gw-bar-v--sm">{peso(t.grandTotal)}</div>
          </div>
        </div>
        <div className="gw-bar-actions">
          <button className="gw-bar-ghost" onClick={() => setShowQuote(true)}>Breakdown</button>
          <button className="gw-bar-cta" onClick={() => setShowQuote(true)}>See quotation →</button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
