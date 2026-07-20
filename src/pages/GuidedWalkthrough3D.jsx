// src/pages/GuidedWalkthrough3D.jsx
// PROTOTYPE — immersive real-time 3D builder (Path A, "video-game" feel).
// A sticky full-viewport WebGL canvas holds a live garment; scroll choreographs
// the camera through it (overview → collar → sleeve → hem → color → print) while
// a floating HUD lets you recolor the fabric and toggle a chest print in real time.
//
// This is the interaction shell. The garment itself is a code-generated placeholder
// (src/components/three/TeeModel.jsx); the scroll rig, camera keyframes, lighting,
// and HUD are the real deliverable and stay unchanged when the final .glb is dropped in.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import * as THREE from 'three'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import TeeModel from '../components/three/TeeModel.jsx'
import { navigate, navigateBack } from '../utils/navigation.js'
import { colorsFor, COLOR_HEX, peso, SIZE_PRICES, SAMPLE_FEE, MIN_QTY } from '../data/orderConfig.js'
import '../design/Walkthrough3D.css'

// Scroll-keyframed camera per part: where the lens sits + what it looks at.
const CAM = {
  overview: { pos: [0.2, 0.15, 5.4], target: [0, 0, 0] },
  collar: { pos: [0, 1.0, 2.7], target: [0, 1.0, 0] },
  sleeve: { pos: [2.15, 0.75, 2.7], target: [0.5, 0.72, 0] },
  hem: { pos: [0, -1.0, 3.0], target: [0, -1.05, 0] },
  color: { pos: [0.15, 0.1, 4.4], target: [0, 0, 0] },
  print: { pos: [0, 0.22, 2.75], target: [0, 0.2, 0] },
}
const PARTS = [
  { key: 'overview', section: 'Live 3D', label: 'Your tee, in 3D', hint: 'Scroll to explore — rotate, zoom, and customize live.' },
  { key: 'collar', section: 'Apparel', label: 'Collar', hint: 'Standard ribbed crew — up close.' },
  { key: 'sleeve', section: 'Apparel', label: 'Sleeve', hint: 'Clean set-in cuff.' },
  { key: 'hem', section: 'Apparel', label: 'Hem', hint: 'Folded straight hem.' },
  { key: 'color', section: 'Fabric & Color', label: 'Colorway', hint: 'Tap a swatch — the fabric recolors instantly.' },
  { key: 'print', section: 'Print & Design', label: 'Print', hint: 'Toggle a chest print — it sits on the fabric.' },
]
const PART_VH = 88

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const smoother = (r) => r * r * r * (r * (r * 6 - 15) + 10)
const lerp = (m, n, e) => m + (n - m) * e

function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch {
    return false
  }
}

// Runs inside <Canvas>: reads scroll each frame, eases the camera + garment yaw.
function Rig({ trackRef, groupRef, reduced, onPart }) {
  const N = PARTS.length
  const ap = useRef({
    px: CAM.overview.pos[0], py: CAM.overview.pos[1], pz: CAM.overview.pos[2],
    tx: 0, ty: 0, tz: 0, yaw: 0,
  })
  const lookAt = useRef(new THREE.Vector3())
  const lastIdx = useRef(0)

  useFrame((state, dt) => {
    const track = trackRef.current
    if (!track) return
    const vh = window.innerHeight
    const rect = track.getBoundingClientRect()
    const denom = rect.height - vh
    const p = clamp(denom > 0 ? -rect.top / denom : 0, 0, 0.9999)

    const pf = p * (N - 1)
    const i = clamp(Math.floor(pf), 0, N - 1)
    const e = smoother(clamp(pf - i, 0, 1))
    const a = CAM[PARTS[i].key]
    const b = CAM[PARTS[Math.min(N - 1, i + 1)].key]

    const tPx = lerp(a.pos[0], b.pos[0], e)
    const tPy = lerp(a.pos[1], b.pos[1], e)
    const tPz = lerp(a.pos[2], b.pos[2], e)
    const tTx = lerp(a.target[0], b.target[0], e)
    const tTy = lerp(a.target[1], b.target[1], e)
    const tTz = lerp(a.target[2], b.target[2], e)

    // Garment yaw: gentle idle sway on the "open" parts, front-on for detail parts.
    const key = PARTS[Math.round(pf)]?.key
    const t = state.clock.elapsedTime
    let yaw = 0
    if (!reduced) {
      if (key === 'overview' || key === 'color') yaw = Math.sin(t * 0.5) * 0.42
      else if (key === 'sleeve') yaw = -0.55
    } else if (key === 'sleeve') {
      yaw = -0.55
    }

    // Frame-rate-independent damping (snaps instantly under reduced-motion).
    const k = reduced ? 1 : Math.min(1, dt * 9)
    const s = ap.current
    s.px += (tPx - s.px) * k
    s.py += (tPy - s.py) * k
    s.pz += (tPz - s.pz) * k
    s.tx += (tTx - s.tx) * k
    s.ty += (tTy - s.ty) * k
    s.tz += (tTz - s.tz) * k
    s.yaw += (yaw - s.yaw) * k

    state.camera.position.set(s.px, s.py, s.pz)
    lookAt.current.set(s.tx, s.ty, s.tz)
    state.camera.lookAt(lookAt.current)
    if (groupRef.current) groupRef.current.rotation.y = s.yaw

    const idx = clamp(Math.round(pf), 0, N - 1)
    if (idx !== lastIdx.current) {
      lastIdx.current = idx
      onPart(idx)
    }
  })
  return null
}

export default function GuidedWalkthrough3D() {
  const supported = useMemo(hasWebGL, [])
  const reduced = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    [],
  )
  const SWATCHES = useMemo(() => colorsFor('CVC 240 GSM').slice(0, 8), [])
  const trackRef = useRef(null)
  const groupRef = useRef(null)

  const [color, setColor] = useState('Black')
  const [hasPrint, setHasPrint] = useState(false)
  const [partIdx, setPartIdx] = useState(0)

  const active = PARTS[Math.min(partIdx, PARTS.length - 1)]
  const perPc = SIZE_PRICES.Standard.M // plain tee, M
  const hex = COLOR_HEX[color] || '#111111'

  if (!supported) {
    return (
      <div className="w3-page">
        <Navbar />
        <div className="w3-fallback">
          <span className="w3-eyebrow">Immersive 3D builder</span>
          <h1>Your browser can’t run the 3D preview.</h1>
          <p>
            This experience needs WebGL. You can still design your tee in the classic
            guided builder — same options, same live quote.
          </p>
          <div className="w3-fallback-cta">
            <button className="btn btn-dark btn-lg" onClick={() => navigate('?page=walkthrough')}>
              Open the classic builder
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="w3-page">
      <Navbar />

      <div className="w3-intro">
        <button className="w3-back" onClick={() => navigateBack('?page=start')}>← Back to options</button>
        <span className="w3-eyebrow">Immersive builder · beta</span>
        <h1 className="w3-title">Design it in 3D.</h1>
        <p className="w3-lead">
          Scroll to move around the garment. Recolor the fabric and drop a print — the
          preview reacts live, like a fitting room you can spin.
        </p>
      </div>

      <div ref={trackRef} className="w3-track" style={{ height: `${PARTS.length * PART_VH}vh` }}>
        <div className="w3-stick">
          <div className="w3-stage-bg" aria-hidden="true" />

          <Canvas
            className="w3-canvas"
            shadows
            dpr={[1, 2]}
            gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
            camera={{ fov: 34, position: CAM.overview.pos, near: 0.1, far: 100 }}
          >
            <ambientLight intensity={0.5} />
            <hemisphereLight args={['#ffffff', '#d8d4c8', 0.4]} />
            <directionalLight
              position={[3.4, 5, 4.2]}
              intensity={1.5}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            {/* rim/back light — defines the silhouette edge on dark fabrics */}
            <directionalLight position={[-4, 2.5, -3.5]} intensity={0.8} />
            <group ref={groupRef}>
              <TeeModel color={hex} hasPrint={hasPrint} />
            </group>
            <ContactShadows position={[0, -1.35, 0]} opacity={0.34} scale={6} blur={2.6} far={3} resolution={512} />
            <Rig trackRef={trackRef} groupRef={groupRef} reduced={reduced} onPart={setPartIdx} />
          </Canvas>

          {/* floating HUD */}
          <div className="w3-hud">
            <div className="w3-part">
              <span className="w3-part-sec">{active.section}</span>
              <h2 className="w3-part-title">{active.label}</h2>
              <p className="w3-part-hint">{active.hint}</p>
            </div>

            <div className="w3-progress">
              {String(partIdx + 1).padStart(2, '0')} <span>/ {String(PARTS.length).padStart(2, '0')}</span>
            </div>

            {partIdx === 0 && <div className="w3-scrollcue">Scroll to explore ↓</div>}

            <div className="w3-controls">
              <div className="w3-swatches" role="group" aria-label="Color">
                {SWATCHES.map((c) => (
                  <button
                    key={c}
                    className={'w3-swatch' + (color === c ? ' w3-swatch--on' : '')}
                    style={{ background: COLOR_HEX[c] || '#ccc' }}
                    title={c}
                    aria-label={c}
                    aria-pressed={color === c}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
              <button
                className={'w3-print-toggle' + (hasPrint ? ' w3-print-toggle--on' : '')}
                onClick={() => setHasPrint((v) => !v)}
                aria-pressed={hasPrint}
              >
                {hasPrint ? '✓ Print on' : '+ Add print'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* bottom bar — live spec + hand-off to the full builder */}
      <div className="w3-bar">
        <div className="w3-bar-stats">
          <div>
            <div className="w3-bar-k">Style</div>
            <div className="w3-bar-v w3-bar-v--sm">Plain Tee · {color}</div>
          </div>
          <div>
            <div className="w3-bar-k">Per piece</div>
            <div className="w3-bar-v">{peso(perPc)}</div>
          </div>
          <div>
            <div className="w3-bar-k">From (incl. sample)</div>
            <div className="w3-bar-v w3-bar-v--sm">{peso(perPc * MIN_QTY + SAMPLE_FEE)}</div>
          </div>
        </div>
        <button className="w3-bar-cta" onClick={() => navigate('?page=walkthrough')}>
          Continue in full builder →
        </button>
      </div>

      <Footer />
    </div>
  )
}
