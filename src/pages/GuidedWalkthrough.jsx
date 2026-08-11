// src/pages/GuidedWalkthrough.jsx  — Path A (Online / Guided)
// A sticky, live 3D garment stage is choreographed by scroll position: each "part"
// moves the camera to the relevant garment area (collar, sleeve, hem, chest…) while
// its options show on the right, and the garment reflects the client's choices
// (color, print) in real time. Options come from src/data/orderConfig.js.
// Ends in QuoteSummary → placeOrder (sign-in gate).
//
// The 3D stage (GarmentStage) is lazy-loaded so three.js stays out of the main bundle;
// browsers without WebGL fall back to a flat, still-recoloring SVG garment.
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import GarmentScrub from '../components/GarmentScrub.jsx'
import QuoteSummary from './QuoteSummary.jsx'
import { navigateBack } from '../utils/navigation.js'
import { useCheckout } from '../hooks/useCheckout.js'
import { useGarmentForm } from '../hooks/useGarmentForm.js'
import { scrubVariantFor, backPhotoFor } from '../data/garmentScrub.js'
import {
  ORDERABLE_STYLES, FITS, SIZES, COLLARS, SLEEVES, FABRICS, SHIRT_COLORS, SHIRT_COLOR_HEX,
  PRINT_COLOR_OPTIONS, BACK_PRINT_COLOR_OPTIONS, PRINT_CHOICES, PLACEMENTS, hemsFor, showsPrice, styleById, sizePricesFor, peso,
} from '../data/orderConfig.js'
import '../design/GuidedWalkthrough.css'

const GarmentStage = lazy(() => import('../components/three/GarmentStage.jsx'))

const PART_VH = 130 // scroll height per part

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

// Flat garment that still recolors — shown when WebGL is unavailable.
function TeeFallback({ colorHex, hasPrint }) {
  return (
    <svg className="gw-tee-svg" viewBox="0 0 200 210" role="img" aria-label="Garment preview">
      <path
        d="M62 40 L40 56 L54 84 L72 74 L72 178 L128 178 L128 74 L146 84 L160 56 L138 40
           C129 55 112 59 100 59 C88 59 71 55 62 40 Z"
        fill={colorHex}
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="1.5"
      />
      {hasPrint && <circle cx="100" cy="118" r="26" fill="none" stroke="rgba(244,242,236,0.9)" strokeWidth="4" />}
    </svg>
  )
}

function Card({ title, sub, selected, onClick }) {
  return (
    <div className={'gw-card' + (selected ? ' gw-card--on' : '')} onClick={onClick}>
      <div className="gw-card-t">{title}</div>
      {sub ? <div className="gw-card-s">{sub}</div> : null}
    </div>
  )
}

const DESIGN_DEFAULT_SIZE = 30 // % of stage width
const DESIGN_MIN_SIZE = 12
const DESIGN_MAX_SIZE = 70

// File picker + per-layer controls for the design-upload preview steps. `designs` is an
// array of { id, file, url, x, y, size } (x/y/size are all % of the stage — see
// DesignLayer below for how they're actually drawn). `onAdd`/`onRemove`/`onResize` mutate
// the array up in GuidedWalkthrough (that's also where the blob: URLs get revoked).
function DesignUploadPanel({ designs, onAdd, onRemove, onResize, side }) {
  const inputRef = useRef(null)
  const handleFiles = (e) => {
    // Materialize to a plain array BEFORE resetting e.target.value below — e.target.files
    // is a live FileList tied to the input's current value, so resetting the value first
    // would empty it out from under the (batched, not-yet-run) React state update.
    const files = Array.from(e.target.files || [])
    e.target.value = '' // allow re-picking the same file(s) after Remove
    if (files.length) onAdd(files)
  }
  return (
    <div className="gw-design-panel">
      <input ref={inputRef} type="file" accept="image/*" multiple className="gw-design-input" onChange={handleFiles} />
      <button type="button" className="gw-design-pick" onClick={() => inputRef.current?.click()}>
        {designs.length ? `Add another ${side} image` : `Choose your ${side} design`}
      </button>
      {designs.map((d) => (
        <div className="gw-design-file" key={d.id}>
          <span className="gw-design-filename" title={d.file.name}>{d.file.name}</span>
          <input
            type="range" className="gw-design-size" min={DESIGN_MIN_SIZE} max={DESIGN_MAX_SIZE}
            value={d.size} onChange={(e) => onResize(d.id, Number(e.target.value))}
            aria-label={`Size of ${d.file.name}`}
          />
          <button type="button" className="gw-design-remove" onClick={() => onRemove(d.id)}>Remove</button>
        </div>
      ))}
      <div className="gw-part-hint">Drag on the photo to move · Slider to resize</div>
    </div>
  )
}

// One draggable, resizable overlay layer. Position (x/y) and size are all % of the stage
// box, so they hold up across viewport sizes. Drag is pointer-events-based (mouse + touch
// in one code path) with touch-action:none in CSS — without that, dragging on a phone would
// also scroll the page, since the whole walkthrough is itself scroll-driven.
function DesignLayer({ design, stageRef, onMove }) {
  const dragRef = useRef(null)
  const onPointerDown = (e) => {
    const stage = stageRef.current?.getBoundingClientRect()
    if (!stage) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: design.x, origY: design.y, stage }
  }
  const onPointerMove = (e) => {
    const drag = dragRef.current
    if (!drag) return
    const dxPct = ((e.clientX - drag.startX) / drag.stage.width) * 100
    const dyPct = ((e.clientY - drag.startY) / drag.stage.height) * 100
    onMove(design.id, {
      x: Math.min(95, Math.max(5, drag.origX + dxPct)),
      y: Math.min(95, Math.max(5, drag.origY + dyPct)),
    })
  }
  const onPointerUp = () => { dragRef.current = null }
  return (
    <img
      className="gw-design-overlay"
      src={design.url}
      alt="Your uploaded design"
      draggable={false}
      style={{ left: `${design.x}%`, top: `${design.y}%`, width: `${design.size}%` }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  )
}

export default function GuidedWalkthrough() {
  const { form, set, sh, hasDesign, pickStyle, pickFabric, totals: t } = useGarmentForm()
  const [step, setStep] = useState(0)
  const [showQuote, setShowQuote] = useState(false)
  const { placeOrder, redirectToSignIn } = useCheckout()

  // Filmed scroll-scrub footage takes priority when the current fit+collar has it
  // (works regardless of WebGL). Otherwise: 3D if supported, else a flat SVG fallback.
  // Computed before `parts` because the design-upload steps below are only offered where a
  // real photo already exists to preview against (see garmentScrub.js's file header).
  const scrubVariant = scrubVariantFor(form, sh)

  // Design-upload preview state — kept OUT of `form` on purpose: this is a live preview
  // only (per owner's explicit call), never sent with the order, so it must never end up in
  // the payload placeOrder()/QuoteSummary send to the backend. Each side is an array of
  // { id, file, url, x, y, size } — multiple images allowed, each independently draggable
  // (x/y), resizable (size), and removable. `url` is a local blob: URL.
  const [frontDesigns, setFrontDesigns] = useState([])
  const [backDesigns, setBackDesigns] = useState([])
  // Kept in sync via the setters below so the unmount cleanup can see the latest arrays
  // without listing them as effect deps (which would re-run the cleanup on every change).
  const frontDesignsRef = useRef(frontDesigns)
  const backDesignsRef = useRef(backDesigns)
  useEffect(() => { frontDesignsRef.current = frontDesigns }, [frontDesigns])
  useEffect(() => { backDesignsRef.current = backDesigns }, [backDesigns])
  useEffect(() => () => {
    frontDesignsRef.current.forEach((d) => URL.revokeObjectURL(d.url))
    backDesignsRef.current.forEach((d) => URL.revokeObjectURL(d.url))
  }, [])

  const makeDesignHandlers = (setter) => ({
    add: (files) => {
      setter((prev) => [
        ...prev,
        ...Array.from(files).map((file, i) => ({
          id: `${Date.now()}-${prev.length + i}-${Math.random().toString(36).slice(2, 7)}`,
          file,
          url: URL.createObjectURL(file),
          // stagger new layers a little so a multi-file drop doesn't land in one exact stack
          x: 50 + ((prev.length + i) % 3 - 1) * 10,
          y: 28 + Math.floor((prev.length + i) / 3) * 12,
          size: DESIGN_DEFAULT_SIZE,
        })),
      ])
    },
    remove: (id) => setter((prev) => {
      const found = prev.find((d) => d.id === id)
      if (found) URL.revokeObjectURL(found.url)
      return prev.filter((d) => d.id !== id)
    }),
    resize: (id, size) => setter((prev) => prev.map((d) => (d.id === id ? { ...d, size } : d))),
    move: (id, patch) => setter((prev) => prev.map((d) => (d.id === id ? { ...d, ...patch } : d))),
  })
  const frontDesignHandlers = makeDesignHandlers(setFrontDesigns)
  const backDesignHandlers = makeDesignHandlers(setBackDesigns)
  const stageBoxRef = useRef(null)

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
      // Placement comes BEFORE print colors on purpose: the customer needs to say
      // front-only vs. front+back first, so the print-colors step knows whether to ask
      // for one color count (front) or two (front and back).
      hasDesign && { key: 'placement', section: 'Print & Design', label: 'Placement', hint: 'Where the print lands.' },
      hasDesign && {
        key: 'printColors',
        section: 'Print & Design',
        label: 'Print colors',
        hint: form.placement === 'Front + back'
          ? 'How many ink colors — front and back.'
          : 'How many ink colors in your print.',
      },
      // Upload-and-preview steps come LAST, after placement + color counts are settled.
      // Gated on scrubVariant (a real photo to lay the upload over) — not offered for
      // Oversized fit, which has no photo at all (always the 3D stage). Preview only, never
      // submitted with the order — see the state declared above.
      hasDesign && scrubVariant && {
        key: 'designFront', section: 'Print & Design', label: 'Your front design',
        hint: 'Upload your artwork to see it on the front. Preview only — not saved or sent with your order.',
      },
      hasDesign && scrubVariant && form.placement === 'Front + back' && {
        key: 'designBack', section: 'Print & Design', label: 'Your back design',
        hint: 'Upload your artwork to see it on the back. Preview only — not saved or sent with your order.',
      },
    ].filter(Boolean)
    return list
  }, [sh, hasDesign, form.placement, scrubVariant])

  const N = parts.length
  const trackRef = useRef(null)
  const supports3D = useMemo(hasWebGL, [])
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  // Keep the selected color valid when switching into/between filmed combos —
  // each combo's photoshoot only covers its own palette.
  useEffect(() => {
    if (!scrubVariant) return
    if (!scrubVariant.colors.some((c) => c.name === form.color)) {
      set({ color: scrubVariant.colors[0].name })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrubVariant])

  // GarmentScrub and GarmentStage both drive `step` themselves via onStep (reading
  // scroll every frame). Only the flat-SVG fallback needs this manual listener.
  useEffect(() => {
    if (supports3D || scrubVariant) return
    const onScroll = () => {
      const track = trackRef.current
      if (!track) return
      const vh = window.innerHeight
      const rect = track.getBoundingClientRect()
      const denom = rect.height - vh
      const p = Math.max(0, Math.min(0.9999, denom > 0 ? -rect.top / denom : 0))
      const idx = Math.max(0, Math.min(N - 1, Math.floor(p * N)))
      setStep((prev) => (prev === idx ? prev : idx))
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [supports3D, scrubVariant, N])

  const active = parts[Math.min(step, N - 1)] || parts[0]
  const priced = showsPrice(form.style)
  const colorHex = SHIRT_COLOR_HEX[form.color] || '#111111'

  if (showQuote) {
    return (
      <div className="gw-page">
        <Navbar />
        <div className="gw-quote-wrap">
          <QuoteSummary form={{ ...form, hasDesign }} qty={form.qty}
            onChange={() => { setShowQuote(false); window.scrollTo(0, 0) }}
            onProceed={(delivery) => placeOrder({ path: 'guided', form: { ...form, hasDesign }, qty: form.qty, delivery })}
            onSignIn={() => redirectToSignIn({ path: 'guided', form: { ...form, hasDesign }, qty: form.qty })} />
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
          Watch the garment come together as you choose, and your quote moves live.
        </p>
      </div>

      {/* scroll track: tall spacer + sticky immersive 3D stage + floating inputs */}
      <div ref={trackRef} className="gw-track" style={{ height: `${N * PART_VH}vh` }}>
        <div className="gw-im-stage" ref={stageBoxRef}>
          <div className="gw-im-bg" aria-hidden="true" />
          {scrubVariant ? (
            <GarmentScrub
              trackRef={trackRef}
              parts={parts}
              variant={scrubVariant}
              colorName={form.color}
              onStep={setStep}
            />
          ) : supports3D ? (
            <Suspense fallback={<div className="gw-stage-loading">Loading 3D…</div>}>
              <GarmentStage
                trackRef={trackRef}
                parts={parts}
                colorHex={colorHex}
                hasPrint={hasDesign}
                reduced={reduced}
                onStep={setStep}
              />
            </Suspense>
          ) : (
            <div className="gw-stage-fallback">
              <TeeFallback colorHex={colorHex} hasPrint={hasDesign} />
            </div>
          )}

          {/* Design-preview overlays — see garmentScrub.js's file header. Front just lays
              the uploads over GarmentScrub's already-correct front photo (no need to
              duplicate it); back needs its own full-cover layer since GarmentScrub only
              ever shows the front. Each uploaded image is its own draggable/resizable
              DesignLayer (see above) — multiple can be on screen at once. */}
          {active.key === 'designFront' && frontDesigns.map((d) => (
            <DesignLayer key={d.id} design={d} stageRef={stageBoxRef} onMove={frontDesignHandlers.move} />
          ))}
          {active.key === 'designBack' && (() => {
            const backSrc = backPhotoFor(form.fit, form.color)
            return (
              <div className="gw-design-back-stage">
                {backSrc
                  ? <img className="gw-design-back-photo" src={backSrc} alt={`${form.color} back view`} />
                  : <div className="gw-design-back-missing">Back preview isn't available for this color yet.</div>}
                {backSrc && backDesigns.map((d) => (
                  <DesignLayer key={d.id} design={d} stageRef={stageBoxRef} onMove={backDesignHandlers.move} />
                ))}
              </div>
            )
          })()}

          <div className="gw-im-hud">
            <div className="gw-im-part">
              <span className="gw-sec">{active.section}</span>
              <h2 className="gw-part-title">{active.label}</h2>
              <p className="gw-part-hint">{active.hint}</p>
            </div>
            <div className="gw-im-progress">
              {String(Math.min(step + 1, N)).padStart(2, '0')} <span>/ {String(N).padStart(2, '0')}</span>
            </div>
            {step === 0 && <div className="gw-im-cue">Scroll to explore ↓</div>}

            <aside className="gw-im-panel">
            {active.key === 'style' && (
              <>
                <div className="gw-cards">
                  {ORDERABLE_STYLES.map((s) => (
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
                {(() => {
                  const prices = sizePricesFor(form.style, form.fit)
                  return SIZES.map((sz) => (
                    <Card key={sz} title={sz} sub={priced && prices ? peso(prices[sz]) + ' / pc' : 'Sample size'}
                      selected={form.size === sz} onClick={() => set({ size: sz })} />
                  ))
                })()}
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
                {scrubVariant
                  ? scrubVariant.colors.map((c) => (
                    <button key={c.name} className={'gw-swatch' + (form.color === c.name ? ' gw-swatch--on' : '')} title={c.name} onClick={() => set({ color: c.name })}>
                      <span style={{ background: c.hex }} />{c.name}
                    </button>
                  ))
                  : SHIRT_COLORS.map((c) => (
                    <button key={c.name} className={'gw-swatch' + (form.color === c.name ? ' gw-swatch--on' : '')} title={c.name} onClick={() => set({ color: c.name })}>
                      <span style={{ background: c.hex }} />{c.name}
                    </button>
                  ))}
              </div>
            )}

            {active.key === 'printChoice' && (
              <div className="gw-cards">
                {PRINT_CHOICES.map((pc) => <Card key={pc.id} title={pc.label} sub={pc.sub} selected={form.printChoice === pc.id} onClick={() => set({ printChoice: pc.id })} />)}
              </div>
            )}
            {active.key === 'placement' && (
              <div className="gw-cards">
                {PLACEMENTS.map((p) => <Card key={p.label} title={p.label} sub={p.sub} selected={form.placement === p.label} onClick={() => set({ placement: p.label })} />)}
              </div>
            )}
            {active.key === 'printColors' && (
              <>
                {form.placement === 'Front + back' && <div className="gw-inline-label">Front print colors</div>}
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

                {form.placement === 'Front + back' && (
                  <div className="gw-inline">
                    <div className="gw-inline-label">Back print colors</div>
                    <div className="gw-cards">
                      {BACK_PRINT_COLOR_OPTIONS.map((o) => (
                        <Card key={o.n} title={o.label} sub={o.sub}
                          selected={o.n === 5 ? (form.printColorsBack || 1) >= 5 : form.printColorsBack === o.n}
                          onClick={() => set({ printColorsBack: o.n === 5 ? Math.max(5, form.printColorsBack || 5) : o.n })} />
                      ))}
                    </div>
                    {(form.printColorsBack || 1) >= 5 && (
                      <div className="gw-others">
                        <div className="gw-inline-label">Number of colors</div>
                        <input type="number" min="5" max="99" value={form.printColorsBack}
                          onChange={(e) => set({ printColorsBack: Math.max(5, Math.min(99, parseInt(e.target.value, 10) || 5)) })} />
                        <div className="gw-part-hint">{form.printColorsBack} colors · +{peso(20 * form.printColorsBack)} / pc</div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
            {active.key === 'designFront' && (
              <DesignUploadPanel designs={frontDesigns} onAdd={frontDesignHandlers.add}
                onRemove={frontDesignHandlers.remove} onResize={frontDesignHandlers.resize} side="front" />
            )}
            {active.key === 'designBack' && (
              <DesignUploadPanel designs={backDesigns} onAdd={backDesignHandlers.add}
                onRemove={backDesignHandlers.remove} onResize={backDesignHandlers.resize} side="back" />
            )}

            </aside>
          </div>
        </div>
      </div>

      {/* immersive live estimate + see-quote (translucent) */}
      <div className="gw-im-bar">
        <div className="gw-bar-stats">
          <div className="gw-bar-stat--perpc">
            <div className="gw-bar-k">Per piece</div>
            <div className="gw-bar-v">{peso(t.perPc)}</div>
          </div>
          <div className="gw-bar-stat--qty">
            <div className="gw-bar-k">Quantity</div>
            <div className="gw-bar-v gw-bar-v--sm">{form.qty} pcs</div>
          </div>
          <div className="gw-bar-stat--total">
            <div className="gw-bar-k">Total (incl. sample fee)</div>
            <div className="gw-bar-v gw-bar-v--sm">{peso(t.grandTotal)}</div>
          </div>
        </div>
        <div className="gw-bar-actions">
          <button className="gw-bar-cta" onClick={() => setShowQuote(true)}>See quotation →</button>
        </div>
      </div>

      <Footer />
    </div>
  )
}
