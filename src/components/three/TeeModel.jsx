// src/components/three/TeeModel.jsx
// Placeholder garment for the immersive 3D builder. It is an extruded T-shirt
// SILHOUETTE — intentionally clean/stylized, not photoreal — so the entire 3D
// interaction (scroll camera, live recolor, print decal) can be felt right now
// with zero external assets.
//
// SWAP TARGET: when the real garment .glb arrives (see the asset brief), replace
// the <mesh> body here with a <primitive object={gltf.scene}> / useGLTF load and
// point the material color + print plane at the model's body mesh. The scene,
// camera choreography, and scroll rig around this component do not change.
import { useMemo } from 'react'
import * as THREE from 'three'

function useTeeGeometry() {
  return useMemo(() => {
    // Half-symmetric tee outline (collar dip → shoulder → sleeve → body → hem).
    const s = new THREE.Shape()
    s.moveTo(-0.34, 1.12)
    s.lineTo(-0.74, 1.24) // left shoulder
    s.lineTo(-1.24, 0.92) // left sleeve top
    s.lineTo(-1.12, 0.52) // left sleeve bottom
    s.lineTo(-0.70, 0.74) // left underarm
    s.lineTo(-0.72, -1.22) // left hem
    s.lineTo(0.72, -1.22) // right hem
    s.lineTo(0.70, 0.74) // right underarm
    s.lineTo(1.12, 0.52) // right sleeve bottom
    s.lineTo(1.24, 0.92) // right sleeve top
    s.lineTo(0.74, 1.24) // right shoulder
    s.lineTo(0.34, 1.12)
    s.quadraticCurveTo(0, 0.82, -0.34, 1.12) // neckline scoop

    const geo = new THREE.ExtrudeGeometry(s, {
      depth: 0.4,
      bevelEnabled: true,
      bevelThickness: 0.14,
      bevelSize: 0.11,
      bevelSegments: 5,
      curveSegments: 24,
      steps: 1,
    })
    geo.center()
    geo.computeVertexNormals()
    return geo
  }, [])
}

// A transparent "badge" print, drawn on a canvas so we need no image file.
function usePrintTexture() {
  return useMemo(() => {
    if (typeof document === 'undefined') return null
    const c = document.createElement('canvas')
    c.width = c.height = 512
    const x = c.getContext('2d')
    x.clearRect(0, 0, 512, 512)
    x.strokeStyle = '#f4f2ec'
    x.lineWidth = 24
    x.beginPath()
    x.arc(256, 256, 150, 0, Math.PI * 2)
    x.stroke()
    x.fillStyle = '#f4f2ec'
    x.textAlign = 'center'
    x.textBaseline = 'middle'
    x.font = '900 68px Archivo, Helvetica, Arial, sans-serif'
    x.fillText('YOUR', 256, 222)
    x.fillText('PRINT', 256, 296)
    const tex = new THREE.CanvasTexture(c)
    tex.anisotropy = 4
    tex.needsUpdate = true
    return tex
  }, [])
}

export default function TeeModel({ color = '#111111', hasPrint = false }) {
  const geo = useTeeGeometry()
  const printTex = usePrintTexture()
  const frontZ = 0.34 // ≈ half depth (0.4) + bevel, after center()

  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.86} metalness={0.03} />
      </mesh>

      {hasPrint && printTex && (
        <mesh position={[0, 0.2, frontZ + 0.002]}>
          <planeGeometry args={[0.92, 0.92]} />
          <meshStandardMaterial map={printTex} transparent roughness={0.9} metalness={0} />
        </mesh>
      )}
    </group>
  )
}
