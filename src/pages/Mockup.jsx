// src/pages/Mockup.jsx — logo-on-tee mockup playground (Phase 6).
// Ported from design-reference/01-Website-Prototype/Mockup.dc.html: upload a PNG logo,
// drag to place + resize on a color-switchable tee stage (multiply/screen blend), toggle
// print-size guides, copy a mockup summary. State persists to localStorage.
import { useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { IoCloudUploadOutline, IoArrowForward, IoCheckmarkCircle } from 'react-icons/io5'
import { navigate } from '../utils/navigation.js'
import { getJSON, setJSON } from '../utils/storage.js'
import '../design/Mockup.css'

const SWATCHES = [
  { key: 'white', hex: '#f2f2f0', label: 'White' },
  { key: 'black', hex: '#1d1d1d', label: 'Black' },
  { key: 'ash', hex: '#b9bdbd', label: 'Ash grey' },
]
const KEY = 'sorbetes_mockup'
const DEFAULTS = { teeColor: 'white', logoSrc: '', logoName: '', x: 50, y: 42, size: 32, guide: false }
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

const load = () => ({ ...DEFAULTS, ...getJSON(KEY, {}) })

export default function Mockup() {
  const [st, setSt] = useState(load)
  const [dragging, setDragging] = useState(false)
  const [copied, setCopied] = useState(false)
  const stageRef = useRef(null)
  const fileRef = useRef(null)
  const copyTimer = useRef(null)
  const set = (patch) => setSt((s) => ({ ...s, ...patch }))

  useEffect(() => setJSON(KEY, st), [st])

  const loadFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const r = new FileReader()
    r.onload = () => set({ logoSrc: r.result, logoName: file.name })
    r.readAsDataURL(file)
  }

  const movePointer = (e) => {
    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    set({
      x: clamp(((e.clientX - rect.left) / rect.width) * 100, 8, 92),
      y: clamp(((e.clientY - rect.top) / rect.height) * 100, 8, 92),
    })
  }

  const cur = SWATCHES.find((w) => w.key === st.teeColor) || SWATCHES[0]
  const printCm = Math.round(st.size * 0.55)
  const placement = st.y < 35 ? 'upper chest' : st.y > 55 ? 'lower front' : 'chest'

  const copyMockup = () => {
    const text = [
      'SORBETES — MOCKUP',
      'Tee: ' + cur.label + ' Classic Tee',
      'Print: ~' + printCm + 'cm wide, ' + placement + ' placement',
      'Logo file: ' + (st.logoName || '—'),
    ].join('\n')
    const done = () => {
      setCopied(true)
      clearTimeout(copyTimer.current)
      copyTimer.current = setTimeout(() => setCopied(false), 2400)
    }
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).then(done).catch(done)
    else done()
  }

  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <div className="mo-head">
          <h1 className="mo-title">See your brand on our tee.</h1>
          <span className="mo-sub">Drop a PNG logo, drag to place, pick a tee color.</span>
        </div>

        <div className="mo-play">
          {/* STAGE */}
          <div className="mo-stage-wrap">
            <div
              ref={stageRef}
              className="mo-stage"
              style={{ background: cur.hex }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); loadFile(e.dataTransfer?.files?.[0]) }}
            >
              {st.guide && (
                <>
                  <div className="mo-guide mo-guide--os">
                    <span className="mo-guide-tag mo-guide-tag--os">OVERSIZED 35×45</span>
                  </div>
                  <div className="mo-guide mo-guide--a4">
                    <span className="mo-guide-tag mo-guide-tag--a4">A4 21×29.7</span>
                  </div>
                </>
              )}

              {st.logoSrc ? (
                <div
                  className="mo-logo"
                  style={{ left: st.x + '%', top: st.y + '%', width: st.size + '%', cursor: dragging ? 'grabbing' : 'grab', outline: dragging ? '1.5px dashed rgba(17,17,17,0.5)' : 'none' }}
                  onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); setDragging(true); movePointer(e) }}
                  onPointerMove={(e) => { if (dragging) movePointer(e) }}
                  onPointerUp={() => setDragging(false)}
                >
                  <img src={st.logoSrc} alt="Your logo" draggable={false}
                    style={{ mixBlendMode: st.teeColor === 'black' ? 'screen' : 'multiply' }} />
                </div>
              ) : (
                <button className="mo-drop" onClick={() => fileRef.current?.click()}>
                  <IoCloudUploadOutline />
                  <span className="mo-drop-t">Drop your PNG logo here</span>
                  <span className="mo-drop-s">or tap to browse — transparent PNG works best</span>
                </button>
              )}
            </div>
          </div>

          {/* CONTROLS */}
          <div className="mo-panel">
            <input type="file" accept="image/png,image/webp,image/jpeg" ref={fileRef} hidden
              onChange={(e) => { loadFile(e.target.files?.[0]); e.target.value = '' }} />

            <div className="mo-group">
              <div className="mo-group-h">Your logo</div>
              {st.logoSrc ? (
                <div className="mo-logo-row">
                  <img src={st.logoSrc} alt="" className="mo-logo-thumb" />
                  <span className="mo-logo-name">{st.logoName}</span>
                  <button className="mo-btn-sm" onClick={() => fileRef.current?.click()}>Replace</button>
                  <button className="mo-btn-sm mo-btn-sm--ghost" onClick={() => set({ logoSrc: '', logoName: '' })}>✕</button>
                </div>
              ) : (
                <button className="mo-upload" onClick={() => fileRef.current?.click()}>Upload PNG logo</button>
              )}
            </div>

            <div className="mo-group">
              <div className="mo-group-h">Tee color</div>
              <div className="mo-swatches">
                {SWATCHES.map((w) => (
                  <button key={w.key} className={'mo-swatch' + (st.teeColor === w.key ? ' mo-swatch--on' : '')} onClick={() => set({ teeColor: w.key })}>
                    <span className="mo-swatch-dot" style={{ background: w.hex }} />
                    {w.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mo-group">
              <div className="mo-group-h mo-group-h--row">
                <span>Print size</span>
                <span className="mo-print-cm">≈ {printCm} cm wide</span>
              </div>
              <input type="range" min="12" max="60" value={st.size} className="mo-range"
                onChange={(e) => set({ size: parseInt(e.target.value, 10) })} />
              <div className="mo-hint">Drag the logo on the tee to reposition.</div>
            </div>

            <button className="mo-toggle" onClick={() => set({ guide: !st.guide })}>
              <span className={'mo-track' + (st.guide ? ' mo-track--on' : '')}><span className="mo-knob" /></span>
              <span>
                <span className="mo-toggle-t">Print-size guide</span>
                <span className="mo-toggle-s">Show A4 + oversized print bounds</span>
              </span>
            </button>

            <div className="mo-actions">
              <button className="btn btn-gold" onClick={() => navigate('?page=start')}>
                Get a quote with this design <IoArrowForward />
              </button>
              <button className="mo-copy" onClick={copyMockup}>
                {copied ? <><IoCheckmarkCircle /> Copied — paste in chat</> : 'Copy mockup summary'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
