// src/pages/WalkInForm.jsx — in-store QR kiosk (?page=walk-in). On-site experience.
// Guest-friendly up to the quote: browsing, building, and the quotation itself need no
// account (same as the online paths). The sign-in gate sits at the ADDRESS step — a
// customer signs in (or creates an account) right before adding a delivery address, so
// the address is saved to their account and the order shows up in My Orders. The built
// order survives the auth round-trip via a localStorage draft (WALKIN_DRAFT_KEY).
//
// Full garment config reusing the SAME engine as the online paths (useGarmentForm /
// data/orderConfig.js) — a walk-in order prices and states identically to a guided or
// instant one, it's just entered at the in-store kiosk. The color step reads
// colorsForFabric(form.fabric) — as of 2026-08-11 all three paths briefly shared one flat
// 20(+)-color list regardless of fabric, then as of 2026-08-12 that was reversed: each
// fabric now only offers the colors in its own fabric-catalog category pool. See
// orderConfig.js's own comment on colorsForFabric()/SHIRT_COLORS for the full history.
//
// Screen structure is a direct port of the team's sorbetes-walkin.html prototype: a
// single scrolling order form (numbered sections, not paginated steps) that hands off
// to a separate itemized quote screen — not the earlier step-1..step-5 wizard this file
// used to have.
import { useEffect, useRef, useState } from 'react'
import {
  IoStorefrontOutline, IoClose, IoCopyOutline, IoCheckmarkCircle, IoDownloadOutline,
  IoArrowForward, IoPeopleOutline, IoLocationOutline, IoInformationCircleOutline,
  IoRefreshOutline,
} from 'react-icons/io5'
import { navigate } from '../utils/navigation.js'
import { copyToClipboard } from '../utils/format.js'
import { useCheckout } from '../hooks/useCheckout.js'
import { useSession } from '../context/SessionContext.jsx'
import { getJSON, setJSON, remove } from '../utils/storage.js'
import AddressPicker from '../components/AddressPicker.jsx'
import { useGarmentForm, DEFAULT_GARMENT_FORM } from '../hooks/useGarmentForm.js'
import {
  STYLES, ORDERABLE_STYLES, FITS, SIZES, COLLARS, SLEEVES, FABRICS, colorsForFabric, groupColorsByCategory,
  PRINT_COLOR_OPTIONS, BACK_PRINT_COLOR_OPTIONS, PRINT_CHOICES, PLACEMENTS, PRINT_COLOR_FEE,
  hemsFor, showsPrice, styleById, sizePricesFor, priceBreakdown, printColorsSummary, peso, MIN_QTY,
  QUOTE_MIN_NOTE_TAIL,
} from '../data/orderConfig.js'
import floorplanSrc from '../assets/walkin-floorplan.webp'
import '../design/WalkInForm.css'

// Studio floor plan — station coordinates (% of the square plan image) and the walking
// routes between them, ported from the store's own floor plan asset/waypoints.
const STATIONS = {
  qr:       { num: 1, name: 'QR Station',     x: 76,   y: 72,   amenity: false },
  rack:     { num: 2, name: 'Display Rack',   x: 49.5, y: 59.5, amenity: false },
  csr:      { num: 3, name: 'CSR',            x: 49.8, y: 41.7, amenity: false },
  artist:   { num: 4, name: 'Graphic Artist', x: 53.8, y: 19.4, amenity: false },
  staff:    { num: null, name: 'Staff',       x: 34.8, y: 19.4, amenity: true },
  entrance: { num: null, name: 'Entrance',    x: 63.6, y: 84.7, amenity: true },
  restroom: { num: null, name: 'Restroom',    x: 86.5, y: 12.7, amenity: true },
}
const PIN_ORDER = ['entrance', 'qr', 'rack', 'csr', 'artist', 'staff', 'restroom']
const ROUTES = {
  'qr>rack': [[76, 72], [74, 79], [66, 82], [58, 80], [52, 73], [50, 66], [49.5, 60]],
  'rack>csr': [[49.5, 60], [54, 56], [57, 51], [56, 47], [51, 45], [49.8, 42]],
}
// Which map state each phase shows — only these three screens carry the map, matching
// the prototype (the order form itself and the quote screen render no map).
const MAP_BY_PHASE = {
  welcome: { current: 'qr', destination: 'rack', visited: ['qr'] },
  browse: { current: 'rack', destination: null, visited: ['qr', 'rack'] },
  'assist-yes': { current: 'rack', destination: 'csr', visited: ['qr', 'rack'] },
}

function MapArrows({ route }) {
  if (!route || route.length < 2) return null
  const arrows = []
  let idx = 0
  for (let i = 0; i < route.length - 1; i++) {
    const [ax, ay] = route[i]
    const [bx, by] = route[i + 1]
    const dx = bx - ax, dy = by - ay
    const dist = Math.hypot(dx, dy)
    if (!dist) continue
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI
    const n = Math.max(2, Math.round(dist / 8))
    for (let j = 0; j < n; j++) {
      const t = (j + 0.9) / (n + 0.8)
      arrows.push({ x: ax + dx * t, y: ay + dy * t, angle, delay: (idx * 0.16).toFixed(2) })
      idx++
    }
  }
  return arrows.map((a, i) => (
    <div key={i} className="wk-map-arrow" style={{ left: a.x + '%', top: a.y + '%', transform: `translate(-50%,-50%) rotate(${a.angle}deg)` }}>
      <IoArrowForward style={{ animationDelay: a.delay + 's' }} />
    </div>
  ))
}

function MapBlock({ current, destination, visited }) {
  const route = destination ? ROUTES[current + '>' + destination] : null
  return (
    <div className="wk-map">
      <div className="wk-map-label">
        <span className="wk-map-label-l"><IoLocationOutline /> Store map · where to go</span>
        {destination && <span className="wk-map-dest">{STATIONS[destination].name}</span>}
      </div>
      <div className="wk-map-frame">
        <img src={floorplanSrc} alt="Studio floor plan" />
        <MapArrows route={route} />
        {PIN_ORDER.map((k) => {
          const s = STATIONS[k]
          const isCurrent = k === current
          const isNext = k === destination
          const isDone = !isCurrent && !isNext && visited.includes(k)
          const cls = ['wk-map-pin', s.amenity && 'amenity', isCurrent && 'current', isNext && 'next', isDone && 'done'].filter(Boolean).join(' ')
          return (
            <div key={k} className={cls} style={{ left: s.x + '%', top: s.y + '%' }}>
              <span className="wk-map-dot">{s.num || ''}</span>
              {(isCurrent || isNext || s.amenity) && (
                <span className="wk-map-lbl">{s.num ? `Station ${s.num} — ` : ''}{s.name}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Option({ title, sub, selected, onClick }) {
  return (
    <button type="button" className={'wk-opt' + (selected ? ' wk-opt--on' : '')} onClick={onClick}>
      <span className="wk-opt-t">{title}</span>
      {sub ? <span className="wk-opt-s">{sub}</span> : null}
    </button>
  )
}

// Placement used to be appended here because this grid had no Placement row of its own;
// as of 2026-08-12 it has one (matching QuoteSummary.jsx), so this is now just the shared
// colour-count text, identical on all three paths.

// Disclosure-gate quote text (§3 of CLAUDE.md — the customer must see the ×MIN_QTY
// minimum and the full total before the sample fee is charged, not just per-piece price).
function buildWalkInQuoteText(form, sh, hasDesign, breakdown, t, label, phone) {
  return [
    'Sorbetes Apparel — Walk-in Quotation', '',
    'Style: ' + styleById(form.style).label,
    sh.fit ? 'Fit: ' + form.fit : null,
    'Size: ' + form.size,
    sh.collar ? 'Collar: ' + form.collar : null,
    sh.sleeve ? 'Sleeve: ' + form.sleeve : null,
    (sh.isPant ? 'Leg opening: ' : 'Hem: ') + form.hem,
    'Fabric: ' + form.fabric,
    'Color: ' + form.color,
    hasDesign ? 'Print: ' + printColorsSummary(form) : 'Print: Plain (no print)',
    hasDesign && form.placement ? 'Placement: ' + form.placement : null,
    'Quantity: ' + form.qty + ' pcs',
    label ? 'Design / label: ' + label : null,
    phone ? 'Contact: ' + phone : null,
    '',
    'PRICE BREAKDOWN (per piece)',
    ...breakdown.lines.map((l) => l.label + ': ' + (l.key === 'base' ? peso(l.amount) : (l.amount ? '+' + peso(l.amount) : 'Included'))),
    '',
    'Per piece: ' + peso(t.perPc),
    'Garment total × ' + form.qty + ' pcs: ' + peso(t.total),
    'Sample fee: ' + peso(t.sampleFee),
    'Total (incl. sample fee): ' + peso(t.grandTotal),
    '60% downpayment: ' + peso(t.dp),
    '40% balance at pickup: ' + peso(t.bal),
  ].filter(Boolean).join('\n')
}

// Per-piece base price for a style/fit/size (correctly branches plain vs printed, and
// collapses Boxy+Oversized to one tier — the deprecated flat SIZE_PRICES table this used
// to read from only covered plain-tee and referenced a non-existent addPerPc field,
// silently showing ₱0 for every size). Returns null for un-priced styles.
function priceFor(styleId, fit, size) {
  return sizePricesFor(styleId, fit)?.[size] ?? null
}

// Browse screen — a few real, correctly-priced tags (not the full rack). Styles with no
// standard pricing (hoodie, jogger, long sleeve, cargo) are deliberately left off here;
// the hint below the grid sends those customers to the CSR instead of guessing a price.
const RACK_TAGS = [
  { styleId: 'plain-tee', fit: 'Standard', size: 'M', fabric: 'CVC 240 GSM' },
  { styleId: 'printed-tee', fit: 'Standard', size: 'M', fabric: 'CVC 240 GSM' },
  { styleId: 'plain-tee', fit: 'Oversized', size: 'L', fabric: 'CVC 280 GSM' },
]

// What each field on a rack tag means — tapped from the legend to highlight the matching
// line on the enlarged tag in the inspector sheet.
const TAG_FIELDS = [
  { id: 'size', label: 'Size', desc: "The sample size you'll build first — production quantity is set later." },
  { id: 'fabric', label: 'Fabric', desc: 'The GSM / weight of the shirt.' },
  { id: 'price', label: 'Price / pc', desc: 'Per piece — your quote multiplies this by your final quantity.' },
]

// Add-on prices for the catalog sheet, read straight from the pricing tables so this
// can't drift from the numbers actually charged.
const CATALOG_ADDONS = [
  { label: COLLARS[1].label, amount: COLLARS[1].addPerPc },
  { label: SLEEVES[1].label, amount: SLEEVES[1].addPerPc },
  { label: 'Each extra print color (any placement)', amount: PRINT_COLOR_FEE },
]

function RackTagCard({ tag, large, activeField, onFieldTap, onClick }) {
  const price = priceFor(tag.styleId, tag.fit, tag.size)
  const field = (id, label, value) => (
    <button
      type="button"
      data-field={id}
      className={'wk-tag-field' + (activeField === id ? ' wk-tag-field--hi' : '') + (onFieldTap ? ' wk-tag-field--tappable' : '')}
      onClick={onFieldTap ? (e) => { e.stopPropagation(); onFieldTap(id) } : undefined}
    >
      <span className="wk-tag-field-label">{label}</span>
      <span className="wk-tag-field-val">{value}</span>
    </button>
  )
  return (
    <div className={'wk-tag' + (large ? ' wk-tag--lg' : '')} onClick={onClick} role={onClick ? 'button' : undefined} tabIndex={onClick ? 0 : undefined}>
      <div className="wk-tag-bar">{styleById(tag.styleId).label} · {tag.fit}</div>
      <div className="wk-tag-body">
        <span className="wk-tag-logo" aria-hidden="true">S</span>
        {field('size', 'Size', tag.size)}
        {field('fabric', 'Fabric', tag.fabric)}
        {field('price', 'Price / pc', price != null ? peso(price) : 'Ask CSR')}
      </div>
    </div>
  )
}

// Mini hangtag for the Browse fan — a small replica of the physical rack tag (dark
// header bar, big size, print method, fabric, price), absolutely positioned + rotated
// into the prototype's fanned stack. Oversized cuts get the blue header bar, same as
// the physical tags.
function RackTagMini({ tag, className, onClick }) {
  const price = priceFor(tag.styleId, tag.fit, tag.size)
  const oversized = tag.fit !== 'Standard'
  return (
    <button
      type="button"
      className={'wk-rtag ' + className + (oversized ? ' wk-rtag--ovr' : '')}
      onClick={onClick}
      aria-label={`Inspect tag: ${styleById(tag.styleId).label} · ${tag.fit}`}
    >
      <span className="wk-rtag-bar">{styleById(tag.styleId).label} · {tag.fit}</span>
      <span className="wk-rtag-body">
        <span className="wk-rtag-lbl">Size</span>
        <span className="wk-rtag-row">
          <span className="wk-rtag-size">{tag.size}</span>
          <span className="wk-rtag-method">{tag.styleId === 'printed-tee' ? <>Silkscreen<br />(Waterbased)</> : 'No print'}</span>
        </span>
        <span className="wk-rtag-lbl">Fabric</span>
        <span className="wk-rtag-fabric">{tag.fabric}</span>
        <span className="wk-rtag-price">{price != null ? peso(price) : 'Ask CSR'}</span>
      </span>
    </button>
  )
}

// Inspector stage — the prototype's annotated-tag view: hand-drawn-style ink rings
// circle each field of the enlarged tag one after another (stroke-dashoffset draw-in,
// staggered), with numbered badges and a Replay button. Ring geometry is MEASURED from
// the live DOM (each field's real box), so it stays locked to the right line at any
// text length or viewport width. Tapping a legend row (or the field itself) redraws
// just that ring.
function TagInspector({ tag, activeField, onFieldTap }) {
  const stageRef = useRef(null)
  const timers = useRef([])
  const [rings, setRings] = useState([])
  const [drawn, setDrawn] = useState([])

  const measure = () => {
    const stage = stageRef.current
    if (!stage) return []
    const sRect = stage.getBoundingClientRect()
    return TAG_FIELDS.map((f, i) => {
      // Ring the VALUE ("M", "CVC 240 GSM", "₱200"), not the whole row — full-width
      // rows would produce three card-wide ellipses stacked on top of each other.
      const el = stage.querySelector(`[data-field="${f.id}"] .wk-tag-field-val`)
      if (!el) return null
      const r = el.getBoundingClientRect()
      const cx = r.left - sRect.left + r.width / 2
      const cy = r.top - sRect.top + r.height / 2
      const rx = Math.max(r.width / 2 + 14, 26)
      const ry = Math.max(r.height / 2 + 9, 17)
      // Ramanujan's ellipse-perimeter approximation — close enough for a dash length.
      const len = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)))
      // Number badge: top-right of the ring, flipped to the left when it'd overflow.
      const overflowsRight = cx + rx + 16 > sRect.width
      const nx = overflowsRight ? cx - rx - 12 : cx + rx + 6
      return { id: f.id, n: i + 1, cx, cy, rx, ry, len, nx, ny: cy - ry + 2, rot: i % 2 ? 3 : -3 }
    }).filter(Boolean)
  }

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = [] }

  // Circle each field in turn, legend row lighting up in step (via activeField).
  const play = () => {
    clearTimers()
    setDrawn([])
    const rs = measure()
    setRings(rs)
    rs.forEach((r, i) => {
      timers.current.push(setTimeout(() => {
        setDrawn((d) => [...d, r.id])
        onFieldTap(r.id)
      }, 120 + i * 560))
    })
  }

  // Draw only the tapped field's ring (legend tap / tag-line tap).
  const highlight = (id) => {
    clearTimers()
    setRings((rs) => (rs.length ? rs : measure()))
    setDrawn([id])
    onFieldTap(id)
  }

  useEffect(() => {
    // Double-rAF: wait for the sheet's slide-up + font layout before measuring.
    let raf2
    const raf1 = requestAnimationFrame(() => { raf2 = requestAnimationFrame(play) })
    const remeasure = () => setRings(measure())
    window.addEventListener('resize', remeasure)
    return () => {
      cancelAnimationFrame(raf1)
      if (raf2) cancelAnimationFrame(raf2)
      window.removeEventListener('resize', remeasure)
      clearTimers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="wk-insp-stage" ref={stageRef}>
        <RackTagCard tag={tag} large activeField={activeField} onFieldTap={highlight} />
        <svg className="wk-insp-svg" aria-hidden="true">
          {rings.map((r) => (
            <g key={r.id} transform={`rotate(${r.rot} ${r.cx} ${r.cy})`}>
              <ellipse
                className="wk-insp-ring"
                cx={r.cx} cy={r.cy} rx={r.rx} ry={r.ry}
                style={{ strokeDasharray: r.len, strokeDashoffset: drawn.includes(r.id) ? 0 : r.len }}
              />
              <text
                className={'wk-insp-num' + (drawn.includes(r.id) ? ' wk-insp-num--on' : '')}
                x={r.nx} y={r.ny}
              >
                {r.n}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <button type="button" className="wk-insp-replay" onClick={play}>
        <IoRefreshOutline /> Replay
      </button>
      <div className="wk-tag-legend">
        {TAG_FIELDS.map((f, i) => (
          <button
            key={f.id}
            type="button"
            className={'wk-tag-legend-item' + (activeField === f.id ? ' wk-tag-legend-item--on' : '')}
            onClick={() => highlight(f.id)}
          >
            <span className="wk-tag-legend-n">{i + 1}</span>
            <span className="wk-tag-legend-body">
              <span className="wk-tag-legend-t">{f.label}</span>
              <span className="wk-tag-legend-d">{f.desc}</span>
            </span>
          </button>
        ))}
      </div>
    </>
  )
}

function Sheet({ title, subtitle, onClose, children }) {
  return (
    <div className="wk-sheet-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="wk-sheet" role="dialog" aria-modal="true" aria-label={title}>
        <span className="wk-sheet-grip" aria-hidden="true" />
        <div className="wk-sheet-top">
          <div>
            <div className="wk-sheet-title">{title}</div>
            {subtitle && <div className="wk-sheet-sub">{subtitle}</div>}
          </div>
          <button type="button" className="wk-sheet-close" aria-label="Close" onClick={onClose}><IoClose /></button>
        </div>
        <div className="wk-sheet-body">{children}</div>
      </div>
    </div>
  )
}

// The built order survives the sign-in round-trip here — saved right before the auth
// redirect, consumed once on the way back (same idea as the online draftOrder).
const WALKIN_DRAFT_KEY = 'sorbetes_walkin_draft'

export default function WalkInForm() {
  const { placeOrder } = useCheckout()
  const { isAuthenticated, ready } = useSession()
  // Consume a stashed draft once (guest built a quote, went to sign in, came back):
  // resume straight at the quote with the address step already open.
  const draft = useRef(getJSON(WALKIN_DRAFT_KEY)).current
  useEffect(() => { remove(WALKIN_DRAFT_KEY) }, [])
  const { form, set, sh, hasDesign, pickStyle, pickFabric, totals: t } = useGarmentForm(
    draft?.form ? { ...DEFAULT_GARMENT_FORM, ...draft.form } : DEFAULT_GARMENT_FORM,
  )
  // 'welcome' | 'browse' | 'assist' | 'assist-yes' | 'form' | 'quote'
  const [phase, setPhase] = useState(draft ? 'quote' : 'welcome')
  const [label, setLabel] = useState(draft?.label || '')
  const [notes, setNotes] = useState(draft?.notes || '')
  const [phone, setPhone] = useState(draft?.phone || '')
  const [showAddress, setShowAddress] = useState(!!draft)
  const [delivery, setDelivery] = useState(null)
  const [placing, setPlacing] = useState(false)
  const [copied, setCopied] = useState(false)
  const copyTimer = useRef(null)
  const [sheet, setSheet] = useState(null) // null | { type: 'inspect', tag } | { type: 'catalog' }
  const [activeField, setActiveField] = useState('size')

  const openInspector = (tag) => { setActiveField('size'); setSheet({ type: 'inspect', tag }) }
  const closeSheet = () => setSheet(null)

  const hems = hemsFor(form.style)
  const priced = showsPrice(form.style)
  const hasPrintStep = sh.needsPrintChoice || sh.printDesign
  const breakdown = priceBreakdown({ ...form, hasDesign })
  const sampleSectionNum = hasPrintStep ? 4 : 3

  const copyQuote = () => {
    const text = buildWalkInQuoteText(form, sh, hasDesign, breakdown, t, label, phone)
    copyToClipboard(text).then(() => {
      setCopied(true)
      clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 2200)
    })
  }

  // First click reveals the address step (nothing asked for it until now); once an
  // address resolves, the same button's second click actually places the order.
  const handlePlaceOrder = () => {
    if (!showAddress) { setShowAddress(true); return }
    if (delivery) placeWalkIn()
  }

  // Guest reached the address step — stash the built order and bounce to sign-in.
  // AddressPicker never mounts for a guest here (same rule as the online paths), so
  // an address can only ever be added while signed in and lands in their account.
  const signInToContinue = () => {
    setJSON(WALKIN_DRAFT_KEY, { form: { ...form }, label, notes, phone })
    navigate('?page=auth&next=' + encodeURIComponent('?page=walk-in'))
  }

  const placeWalkIn = async () => {
    if (placing) return
    setPlacing(true)
    try {
      await placeOrder({
        path: 'walkin',
        form: { ...form, hasDesign, label: label.trim() || null, notes: notes.trim() || null, phone: phone.trim() || null },
        qty: form.qty,
        delivery,
      })
    } finally {
      setPlacing(false)
    }
  }

  const phaseDotKey = phase === 'assist-yes' ? 'assist' : phase === 'quote' ? 'form' : phase

  // Scrolling lives INSIDE the device shell (the phone-frame card on desktop), so a
  // phase change must reset the shell's own scroll, not the window's.
  const mainRef = useRef(null)
  useEffect(() => { mainRef.current?.scrollTo?.({ top: 0 }) }, [phase])

  return (
    <div className="wk-page">
      <div className="wk-device">
      <header className="wk-head">
        <button className="wk-exit" aria-label="Exit" onClick={() => navigate('?page=walk-ins')}>
          <IoClose />
        </button>
        <span className="wk-step-label">
          <IoStorefrontOutline />
          {phase === 'welcome' && ' Welcome in'}
          {phase === 'browse' && ' Step 1 · Browse'}
          {phase === 'assist' && ' Before you order'}
          {phase === 'assist-yes' && ' Assistance'}
          {phase === 'form' && ' Step 2 · Sample order'}
          {phase === 'quote' && ' Sample quotation · per piece'}
        </span>
      </header>
      <div className="wk-phase-nav" aria-hidden="true">
        {[['welcome', 'Welcome'], ['browse', 'Browse'], ['assist', 'Assistance'], ['form', 'Order form']].map(([p, lbl]) => (
          <span key={p} className={'wk-phase-step' + (p === phaseDotKey ? ' wk-phase-step--on' : '')}>
            <span className="wk-phase-dot" />{lbl}
          </span>
        ))}
      </div>

      <main className="wk-main" ref={mainRef}>
        <div className="wk-inner">

          {MAP_BY_PHASE[phase] && <MapBlock {...MAP_BY_PHASE[phase]} />}

          {/* Welcome */}
          {phase === 'welcome' && (
            <div className="wk-panel wk-welcome">
              <div className="wk-eyebrow">Welcome in</div>
              <h1 className="wk-h1 wk-hero">Build your<br />quote.</h1>
              <p className="wk-note">Order on your phone. Follow each step.</p>
              <div className="wk-welcome-steps">
                <div className="wk-welcome-step"><span className="wk-welcome-n">1</span>Browse</div>
                <div className="wk-welcome-step"><span className="wk-welcome-n">2</span>Build &amp; get a quote</div>
                <div className="wk-welcome-step"><span className="wk-welcome-n">3</span>Pay</div>
              </div>
            </div>
          )}

          {/* Browse — the prototype's split: a fanned stack of mini hangtags at the
              left (each tappable → inspector), copy at the right, and the full-rack
              note-row below. */}
          {phase === 'browse' && (
            <div className="wk-panel">
              <div className="wk-browse-split">
                <div className="wk-rack-visual">
                  <div className="wk-rack-stack">
                    {RACK_TAGS.map((tag, i) => (
                      <RackTagMini key={i} tag={tag} className={'wk-rtag--' + 'abc'[i]} onClick={() => openInspector(tag)} />
                    ))}
                  </div>
                  <span className="wk-rack-tap">Tap a tag to inspect</span>
                </div>
                <div className="wk-browse-copy">
                  <h1 className="wk-h1 wk-h1--browse">Choose your<br />apparel</h1>
                  <p className="wk-note">Check the <strong>Product Display Rack and Clothing Tag</strong>. Note the style, fit and fabric you like.</p>
                </div>
              </div>
              <button type="button" className="wk-rack-open" onClick={() => setSheet({ type: 'catalog' })}>
                <IoInformationCircleOutline className="wk-rack-open-ico" aria-hidden="true" />
                <span>See the full rack list, specs &amp; prices</span>
                <IoArrowForward className="wk-rack-open-chev" aria-hidden="true" />
              </button>
              <div className="wk-hint">Ordering a hoodie, jogger, long sleeve or cargo? Ask our CSR — those are quoted case-by-case.</div>
            </div>
          )}

          {/* Assistance */}
          {phase === 'assist' && (
            <div className="wk-panel">
              <div className="wk-eyebrow">Before you order</div>
              <h1 className="wk-h1">Need any<br />assistance?</h1>
              <p className="wk-note">Order on your own, or have a Customer Service Rep help you.</p>
              <div className="wk-choicewrap">
                <button type="button" className="wk-choice" onClick={() => setPhase('assist-yes')}>
                  <IoPeopleOutline className="wk-choice-icon" />
                  <span className="wk-choice-body">
                    <span className="wk-choice-t">Yes, I need help</span>
                    <span className="wk-choice-s">We'll point you to the CSR</span>
                  </span>
                  <IoArrowForward className="wk-choice-chev" />
                </button>
                <button type="button" className="wk-choice wk-choice--dark" onClick={() => setPhase('form')}>
                  <IoCheckmarkCircle className="wk-choice-icon" />
                  <span className="wk-choice-body">
                    <span className="wk-choice-t">No, I'll continue</span>
                    <span className="wk-choice-s">Go straight to the order form</span>
                  </span>
                  <IoArrowForward className="wk-choice-chev" />
                </button>
              </div>
            </div>
          )}

          {/* Assistance: routed to CSR */}
          {phase === 'assist-yes' && (
            <div className="wk-panel">
              <h1 className="wk-h1">Head to<br />the CSR</h1>
              <p className="wk-note">Head to <strong>Customer Service · Station 3</strong> — a staff member will help you.</p>
              <div className="wk-callout">Staff give <strong>guidance only</strong> — you still place the order on your phone.</div>
            </div>
          )}

          {/* Order form — single scroll, numbered sections, matches the prototype's
              screen-order (no per-field pagination). */}
          {phase === 'form' && (
            <div className="wk-panel">
              <div className="wk-eyebrow">Step 2 · Sample order</div>
              <h1 className="wk-h1 wk-h1--sub">Build your sample</h1>

              <div className="wk-dark-note">
                <IoInformationCircleOutline className="wk-dark-note-ico" aria-hidden="true" />
                <span>This quote is for a <strong>sample, priced per piece</strong>. A sample is required before mass production.</span>
              </div>

              <div className="wk-section">
                <div className="wk-section-num"><span className="wk-section-n">1</span>Apparel</div>

                <div className="wk-field-label">Style</div>
                <div className="wk-grid">
                  {ORDERABLE_STYLES.map((s) => (
                    <Option key={s.id} title={s.label} sub={s.sub} selected={form.style === s.id} onClick={() => pickStyle(s.id)} />
                  ))}
                </div>

                {sh.fit && (
                  <>
                    <div className="wk-field-label">Fit</div>
                    <div className="wk-grid">
                      {FITS.map((fit) => (
                        <Option key={fit} title={fit} selected={form.fit === fit} onClick={() => set({ fit })} />
                      ))}
                    </div>
                  </>
                )}

                <div className="wk-field-label">Size · price per piece</div>
                <div className="wk-grid wk-grid--sizes">
                  {SIZES.map((sz) => {
                    const p = priceFor(form.style, form.fit, sz)
                    return (
                      <Option key={sz} title={sz} sub={p != null ? peso(p) + ' / pc' : null}
                        selected={form.size === sz} onClick={() => set({ size: sz })} />
                    )
                  })}
                </div>
                <div className="wk-hint">For your sample only — we'll confirm production quantity next.</div>

                {sh.collar && (
                  <>
                    <div className="wk-field-label">Collar type</div>
                    <div className="wk-grid">
                      {COLLARS.map((c) => (
                        <Option key={c.label} title={c.label} sub={c.sub} selected={form.collar === c.label} onClick={() => set({ collar: c.label })} />
                      ))}
                    </div>
                  </>
                )}

                {sh.sleeve && (
                  <>
                    <div className="wk-field-label">Sleeve</div>
                    <div className="wk-grid">
                      {SLEEVES.map((c) => (
                        <Option key={c.label} title={c.label} sub={c.sub} selected={form.sleeve === c.label} onClick={() => set({ sleeve: c.label })} />
                      ))}
                    </div>
                  </>
                )}

                <div className="wk-field-label">{sh.isPant ? 'Leg opening' : 'Hem'}</div>
                <div className="wk-grid">
                  {hems.map((h) => (
                    <Option key={h.label} title={h.label} sub={h.sub} selected={form.hem === h.label} onClick={() => set({ hem: h.label })} />
                  ))}
                </div>
              </div>

              <div className="wk-section">
                <div className="wk-section-num"><span className="wk-section-n">2</span>Fabric &amp; Color</div>

                <div className="wk-field-label">Fabric</div>
                <div className="wk-grid">
                  {FABRICS.map((fb) => (
                    <Option key={fb.value} title={fb.label} sub={fb.sub} selected={form.fabric === fb.value} onClick={() => pickFabric(fb.value)} />
                  ))}
                </div>

                <div className="wk-field-label">Color</div>
                {groupColorsByCategory(colorsForFabric(form.fabric)).map((group) => (
                  <div className="wk-color-group" key={group.slug}>
                    <div className="wk-color-group-label">{group.label}</div>
                    <div className="wk-swatches">
                      {group.colors.map((c) => (
                        <button key={c.name} type="button" className={'wk-swatch' + (form.color === c.name ? ' wk-swatch--on' : '')}
                          onClick={() => set({ color: c.name })}>
                          <span className="wk-swatch-chip" style={{ background: c.hex }} />
                          <span className="wk-swatch-name">{c.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {hasPrintStep && (
                <div className="wk-section">
                  <div className="wk-section-num"><span className="wk-section-n">3</span>Print &amp; Design</div>

                  {sh.needsPrintChoice && (
                    <div className="wk-grid wk-grid--wide">
                      {PRINT_CHOICES.map((pc) => (
                        <Option key={pc.id} title={pc.label} sub={pc.sub} selected={form.printChoice === pc.id} onClick={() => set({ printChoice: pc.id })} />
                      ))}
                    </div>
                  )}

                  {hasDesign && (
                    <>
                      {/* Placement asked FIRST, on purpose — the print-colors fields below
                          read form.placement directly, no separate "did they tap it" gate.
                          Every field in this form (fit, collar, fabric...) already shows its
                          default-driven content immediately without requiring an explicit
                          tap first; placement's default ('Front only') is no different — see
                          CLAUDE.md §12, 2026-08-11. */}
                      <div className="wk-field-label">Placement</div>
                      <div className="wk-grid">
                        {PLACEMENTS.map((p) => (
                          <Option key={p.label} title={p.label} sub={p.sub} selected={form.placement === p.label}
                            onClick={() => set({ placement: p.label })} />
                        ))}
                      </div>

                      <div className="wk-field-label">{form.placement === 'Front + back' ? 'Front print colors' : 'Print colors'}</div>
                      <div className="wk-grid">
                        {PRINT_COLOR_OPTIONS.map((o) => (
                          <Option
                            key={o.n}
                            title={o.label}
                            sub={o.sub}
                            selected={o.n === 5 ? (form.printColors || 1) >= 5 : form.printColors === o.n}
                            onClick={() => set({ printColors: o.n === 5 ? Math.max(5, form.printColors || 5) : o.n })}
                          />
                        ))}
                      </div>
                      {(form.printColors || 1) >= 5 && (
                        <div className="wk-fields">
                          <input className="wk-input" type="number" min="5" max="99" value={form.printColors}
                            onChange={(e) => set({ printColors: Math.max(5, Math.min(99, parseInt(e.target.value, 10) || 5)) })} />
                          <div className="wk-hint">{form.printColors} colors · +{peso(20 * (form.printColors - 1))} / pc</div>
                        </div>
                      )}

                      {form.placement === 'Front + back' && (
                        <>
                          <div className="wk-field-label">Back print colors</div>
                          <div className="wk-grid">
                            {BACK_PRINT_COLOR_OPTIONS.map((o) => (
                              <Option
                                key={o.n}
                                title={o.label}
                                sub={o.sub}
                                selected={o.n === 5 ? (form.printColorsBack || 1) >= 5 : form.printColorsBack === o.n}
                                onClick={() => set({ printColorsBack: o.n === 5 ? Math.max(5, form.printColorsBack || 5) : o.n })}
                              />
                            ))}
                          </div>
                          {(form.printColorsBack || 1) >= 5 && (
                            <div className="wk-fields">
                              <input className="wk-input" type="number" min="5" max="99" value={form.printColorsBack}
                                onChange={(e) => set({ printColorsBack: Math.max(5, Math.min(99, parseInt(e.target.value, 10) || 5)) })} />
                              <div className="wk-hint">{form.printColorsBack} colors · +{peso(20 * form.printColorsBack)} / pc</div>
                            </div>
                          )}
                        </>
                      )}

                      <div className="wk-field-label">Design details</div>
                      <textarea className="wk-input" rows="3" value={notes}
                        placeholder="Describe the print, or bring a reference / file to show at the counter"
                        onChange={(e) => setNotes(e.target.value)} />
                    </>
                  )}
                </div>
              )}

              <div className="wk-section">
                <div className="wk-section-num"><span className="wk-section-n">{sampleSectionNum}</span>Sample &amp; next steps</div>
                <div className="wk-note-box">
                  <span>You're ordering <strong>one sample piece</strong>, priced per piece. Set your production quantity and contact info below so we can prep your quotation.</span>
                </div>

                <div className="wk-qty-row">
                  <span className="wk-qty-label">Quantity</span>
                  <button className="wk-qty-btn" onClick={() => set({ qty: Math.max(MIN_QTY, (form.qty || MIN_QTY) - 10) })}>−</button>
                  <span className="wk-qty-val">{form.qty}</span>
                  <button className="wk-qty-btn" onClick={() => set({ qty: (form.qty || MIN_QTY) + 10 })}>+</button>
                </div>
                <div className="wk-hint">Minimum {MIN_QTY} pcs · steps of 10</div>

                <div className="wk-fields wk-contact">
                  <input className="wk-input" type="text" value={label} placeholder="Design name / label (optional)"
                    onChange={(e) => setLabel(e.target.value)} />
                  <input className="wk-input" type="tel" value={phone} placeholder="Contact number (optional — for staff to reach you)"
                    onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Quotation — separate screen, itemized breakdown built from the SAME
              priceBreakdown() the backend prices from, so it can't drift from the quote. */}
          {phase === 'quote' && (
            <div className="wk-panel">
              <div className="wk-eyebrow">Sample quotation · per piece</div>
              <h1 className="wk-h1 wk-h1--sub">Here’s your quote</h1>
              <p className="wk-note">A ballpark based on your specs — final figure confirmed before your sample.</p>

              <div className="wk-spec-box">
                <div className="wk-spec-head">Your specs</div>
                <div className="wk-spec-grid">
                  {[
                    ['Style', styleById(form.style).label],
                    sh.fit && ['Fit', form.fit],
                    ['Size', form.size],
                    sh.collar && ['Collar', form.collar],
                    sh.sleeve && ['Sleeve', form.sleeve],
                    [sh.isPant ? 'Leg opening' : 'Hem', form.hem],
                    ['Fabric', form.fabric],
                    ['Color', form.color],
                    ['Print', hasDesign ? printColorsSummary(form) : 'Plain (no print)'],
                    hasDesign && ['Placement', form.placement || '—'],
                  ].filter(Boolean).map(([k, v]) => (
                    <div className="wk-spec-cell" key={k}>
                      <div className="wk-spec-lbl">{k}</div>
                      <div className="wk-spec-val">{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="wk-quote" id="wkQuoteCard">
                <div className="wk-quote-head">Sample quotation</div>
                {breakdown.lines.map((l) => (
                  <div className="wk-quote-row wk-quote-muted" key={l.key}>
                    <span>{l.label}</span>
                    <span>{l.key === 'base' ? peso(l.amount) : (l.amount ? '+' + peso(l.amount) : 'Included')}</span>
                  </div>
                ))}
                <div className="wk-quote-row wk-quote-row--hero">
                  <span>Per piece</span>
                  <span className="wk-quote-perpc">{priced ? peso(t.perPc) : 'Quoted by staff'}</span>
                </div>
                <div className="wk-quote-row wk-quote-muted">
                  <span>Garment total × {form.qty} pcs</span><span>{priced ? peso(t.total) : '—'}</span>
                </div>
                <div className="wk-quote-row wk-quote-muted">
                  <span>+ Sample fee</span><span>{peso(t.sampleFee)}</span>
                </div>
                <div className="wk-quote-row wk-quote-total">
                  <span>Total (incl. sample fee)</span><span>{priced ? peso(t.grandTotal) : '—'}</span>
                </div>
                <div className="wk-quote-split">
                  <div className="wk-quote-row wk-quote-muted"><span>60% downpayment</span><span>{priced ? peso(t.dp) : '—'}</span></div>
                  <div className="wk-quote-row wk-quote-muted"><span>40% balance at pickup</span><span>{priced ? peso(t.bal) : '—'}</span></div>
                </div>
                <div className="wk-quote-min">
                  Minimum order: <strong>{MIN_QTY} pcs</strong> {QUOTE_MIN_NOTE_TAIL}
                </div>
              </div>

              <div className="wk-quote-tools">
                <button type="button" className={'wk-quote-tool' + (copied ? ' wk-quote-tool--ok' : '')} onClick={copyQuote}>
                  <span className="wk-quote-tool-ico">{copied ? <IoCheckmarkCircle /> : <IoCopyOutline />}</span>
                  <span className="wk-quote-tool-body">
                    <span className="wk-quote-tool-t">{copied ? 'Copied!' : 'Copy quote'}</span>
                    <span className="wk-quote-tool-s">{copied ? 'Ready to paste' : 'Text to clipboard'}</span>
                  </span>
                </button>
                <button type="button" className="wk-quote-tool" onClick={() => window.print()}>
                  <span className="wk-quote-tool-ico"><IoDownloadOutline /></span>
                  <span className="wk-quote-tool-body">
                    <span className="wk-quote-tool-t">Save as PDF</span>
                    <span className="wk-quote-tool-s">Print-ready copy</span>
                  </span>
                </button>
              </div>

              {showAddress && (
                <div className="wk-spec-box">
                  <div className="wk-spec-head">Delivery address</div>
                  {ready && (isAuthenticated ? (
                    <AddressPicker value={delivery} onChange={setDelivery} />
                  ) : (
                    <div className="wk-signin">
                      <p className="wk-signin-copy">
                        Sign in to add your delivery address — so it's saved to your account
                        and your order shows up in My Orders.
                      </p>
                      <button type="button" className="wk-signin-btn" onClick={signInToContinue}>
                        Sign in to continue <IoArrowForward />
                      </button>
                      <p className="wk-signin-sub">Your built order is kept — you'll come right back here.</p>
                    </div>
                  ))}
                </div>
              )}

              <p className="wk-note">Want to place this order? Staff confirms your final quote at the counter before you pay.</p>
            </div>
          )}
        </div>
      </main>

      {/* wk-foot--rail: the form phase flips the bar to the prototype's black "live
          estimate" rail (tiny label + big Anton price + gold CTA); every other phase
          is a white action bar. Visual modifier only — same buttons, same handlers. */}
      <footer className={'wk-foot' + (phase === 'form' ? ' wk-foot--rail' : '')}>
        {phase === 'form' && (
          <>
            <div className="wk-foot-price">
              <span className="wk-foot-k">Sample price · per pc</span>
              <span className="wk-foot-v">{priced ? peso(t.perPc) : 'Ask CSR'}</span>
            </div>
            <div className="wk-foot-actions">
              <button className="wk-foot-primary wk-foot-gold" onClick={() => setPhase('quote')}>See quotation <IoArrowForward /></button>
            </div>
          </>
        )}
        {phase === 'quote' && (
          <div className="wk-foot-actions wk-foot-actions--full">
            <button className="wk-foot-ghost" onClick={() => setPhase('form')}>Change</button>
            <button className="wk-foot-primary wk-foot-gold" onClick={handlePlaceOrder} disabled={placing || (showAddress && !delivery)}>
              {placing ? 'Placing…' : <>Place order <IoArrowForward /></>}
            </button>
          </div>
        )}
        {phase !== 'form' && phase !== 'quote' && (
          <div className="wk-foot-actions wk-foot-actions--full">
            {phase !== 'welcome' && (
              <button
                className="wk-foot-ghost"
                onClick={() => setPhase(phase === 'browse' ? 'welcome' : phase === 'assist' ? 'browse' : 'assist')}
              >
                Back
              </button>
            )}
            {phase === 'welcome' && <button className="wk-foot-primary wk-foot-gold" onClick={() => setPhase('browse')}>Get started <IoArrowForward /></button>}
            {phase === 'browse' && <button className="wk-foot-primary" onClick={() => setPhase('assist')}>Continue <IoArrowForward /></button>}
            {phase === 'assist-yes' && <button className="wk-foot-primary wk-foot-gold" onClick={() => setPhase('form')}>Continue <IoArrowForward /></button>}
          </div>
        )}
      </footer>

      {sheet?.type === 'inspect' && (
        <Sheet title="Reading a rack tag" subtitle="What each line on the tag means" onClose={closeSheet}>
          <TagInspector tag={sheet.tag} activeField={activeField} onFieldTap={setActiveField} />
          <div className="wk-hint">Every piece on the rack carries a tag like this. Tap any line to circle it.</div>
        </Sheet>
      )}

      {sheet?.type === 'catalog' && (
        <Sheet title="On the rack" subtitle="Styles, fabrics & per-piece prices" onClose={closeSheet}>
          <div className="wk-cat">
            {STYLES.map((s) => (
              <div className="wk-cat-item" key={s.id}>
                <div className="wk-cat-name">{s.label}</div>
                <div className="wk-cat-desc">{s.sub}</div>
                {s.priceClass ? (
                  <table className="wk-cat-table">
                    <thead><tr><th>Size</th><th>Standard</th><th>Boxy / Oversized</th></tr></thead>
                    <tbody>
                      {SIZES.map((sz) => (
                        <tr key={sz}>
                          <td>{sz}</td>
                          <td>{peso(sizePricesFor(s.id, 'Standard')[sz])}</td>
                          <td>{peso(sizePricesFor(s.id, 'Oversized')[sz])}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="wk-cat-quote">Quoted case-by-case — ask our CSR.</div>
                )}
              </div>
            ))}
            <div className="wk-cat-item">
              <div className="wk-cat-name">Add-ons</div>
              <div className="wk-cat-desc">Added on top of the size price</div>
              {CATALOG_ADDONS.map((a) => (
                <div className="wk-cat-addline" key={a.label}><span>{a.label}</span><span>+{peso(a.amount)}/pc</span></div>
              ))}
            </div>
          </div>
          <div className="wk-hint">Prices are per piece for your sample. 1-color print is included in the printed base price.</div>
        </Sheet>
      )}
      </div>
    </div>
  )
}
