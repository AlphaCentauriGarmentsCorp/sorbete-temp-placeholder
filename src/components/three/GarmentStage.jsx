// src/components/three/GarmentStage.jsx
// The live 3D garment stage for Path A (guided builder). Drops into the center
// stage slot in place of the old video. Scroll position (read from the guided
// track) choreographs the camera through the active part (collar → sleeve → hem
// → chest, etc.), while color / print reflect the client's live selections.
//
// Lazy-loaded by GuidedWalkthrough so three.js stays out of the main bundle.
// Swap the placeholder in TeeModel.jsx for a real .glb and nothing here changes.
import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import TeeModel from './TeeModel.jsx'

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const smoother = (r) => r * r * r * (r * (r * 6 - 15) + 10)
const lerp = (m, n, e) => m + (n - m) * e

// Camera framing per part key (tuned for the immersive full-viewport stage —
// wide aspect gives horizontal room, so detail parts can zoom in dramatically).
const CAM = {
  style: { pos: [0.2, 0.12, 5.0], target: [0, 0.02, 0] },
  size: { pos: [0.2, 0.1, 5.1], target: [0, 0.02, 0] },
  collar: { pos: [0, 1.0, 2.4], target: [0, 1.0, 0] },
  sleeve: { pos: [2.1, 0.74, 2.5], target: [0.5, 0.72, 0] },
  hem: { pos: [0, -1.0, 2.7], target: [0, -1.05, 0] },
  fabric: { pos: [0.2, 0.06, 3.9], target: [0, 0.02, 0] },
  color: { pos: [0.2, 0.08, 4.4], target: [0, 0.02, 0] },
  printChoice: { pos: [0, 0.2, 3.0], target: [0, 0.2, 0] },
  printColors: { pos: [0, 0.24, 2.4], target: [0, 0.22, 0] },
  placement: { pos: [0, 0.2, 2.8], target: [0, 0.2, 0] },
}
const FALLBACK = CAM.style
const SWAY = new Set(['style', 'size', 'color', 'fabric'])

function Rig({ trackRef, parts, groupRef, reduced, onStep }) {
  const N = parts.length
  const ap = useRef({
    px: FALLBACK.pos[0], py: FALLBACK.pos[1], pz: FALLBACK.pos[2],
    tx: 0, ty: 0, tz: 0, yaw: 0,
  })
  const lastIdx = useRef(-1)

  useFrame((state, dt) => {
    const track = trackRef.current
    if (!track) return
    const vh = window.innerHeight
    const rect = track.getBoundingClientRect()
    const denom = rect.height - vh
    const p = clamp(denom > 0 ? -rect.top / denom : 0, 0, 0.9999)

    // Same scroll→part mapping the options panel uses (idx = floor(p * N)).
    const pf = p * N
    const idx = clamp(Math.floor(pf), 0, N - 1)
    const e = smoother(clamp(pf - idx, 0, 1))
    const a = CAM[parts[idx]?.key] || FALLBACK
    const b = CAM[parts[Math.min(N - 1, idx + 1)]?.key] || a

    const tPx = lerp(a.pos[0], b.pos[0], e)
    const tPy = lerp(a.pos[1], b.pos[1], e)
    const tPz = lerp(a.pos[2], b.pos[2], e)
    const tTx = lerp(a.target[0], b.target[0], e)
    const tTy = lerp(a.target[1], b.target[1], e)
    const tTz = lerp(a.target[2], b.target[2], e)

    const key = parts[idx]?.key
    let yaw = 0
    if (key === 'sleeve') yaw = -0.5
    else if (!reduced && SWAY.has(key)) yaw = Math.sin(state.clock.elapsedTime * 0.5) * 0.4

    const k = reduced ? 1 : Math.min(1, dt * 9)
    const s = ap.current
    s.px += (tPx - s.px) * k
    s.py += (tPy - s.py) * k
    s.pz += (tPz - s.pz) * k
    s.tx += (tTx - s.tx) * k
    s.ty += (tTy - s.ty) * k
    s.tz += (tTz - s.tz) * k
    s.yaw += (yaw - s.yaw) * k

    // Aspect compensation: CAM is tuned for a wide (~1.6) desktop stage. On narrow /
    // portrait viewports (mobile) the garment would over-zoom and clip, so pull the
    // camera back from its look-target proportionally to keep the whole garment framed.
    const aspect = state.size.height > 0 ? state.size.width / state.size.height : 1.6
    const zoomK = clamp(1.6 / aspect, 1, 2.6)
    state.camera.position.set(
      s.tx + (s.px - s.tx) * zoomK,
      s.ty + (s.py - s.ty) * zoomK,
      s.tz + (s.pz - s.tz) * zoomK,
    )
    state.camera.lookAt(s.tx, s.ty, s.tz)
    if (groupRef.current) groupRef.current.rotation.y = s.yaw

    if (idx !== lastIdx.current) {
      lastIdx.current = idx
      onStep?.(idx)
    }
  })
  return null
}

export default function GarmentStage({ trackRef, parts, colorHex = '#111111', hasPrint = false, reduced = false, onStep }) {
  const groupRef = useRef(null)
  return (
    <Canvas
      className="gw-canvas"
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ fov: 32, position: FALLBACK.pos, near: 0.1, far: 100 }}
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
      <directionalLight position={[-4, 2.5, -3.5]} intensity={0.8} />
      <group ref={groupRef}>
        <TeeModel color={colorHex} hasPrint={hasPrint} />
      </group>
      <ContactShadows position={[0, -1.35, 0]} opacity={0.32} scale={6} blur={2.6} far={3} resolution={512} />
      <Rig trackRef={trackRef} parts={parts} groupRef={groupRef} reduced={reduced} onStep={onStep} />
    </Canvas>
  )
}
