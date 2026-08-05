// src/components/GarmentScrub.jsx — scroll-scrubbed video preview for the two garment
// combos with real footage (see src/data/garmentScrub.js). Mirrors the scroll→progress
// math in components/three/GarmentStage.jsx's Rig so the two stages feel consistent,
// but drives a <video>'s currentTime instead of a 3D camera. The "color" part has no
// filmed equivalent (a video can't be recolored live), so once scroll reaches it we
// crossfade to a static photo of the selected color and stay there for the rest of
// the walkthrough.
//
// Scrubbing feel notes (do not "smooth" these away — they fix real stiffness/lag):
// - Video time follows scroll LINEARLY, no easing/damping. Any lag between input and
//   the displayed frame reads as stiffness — the 3D stage's eased, spring-damped
//   camera works because it's animating a continuous scene; a video is already a
//   sequence of discrete frames, so added lag just compounds with frame quantization.
// - Only issue a new seek when the target has actually moved past one frame's worth
//   of time, and never while a previous seek is still resolving (video.seeking).
//   Comparing against the *requested* time (not video.currentTime, which snaps to
//   the nearest frame and may never exactly equal the request) avoids a re-seek loop
//   that fires every animation frame even while the scroll position is static.
// - The source videos are re-encoded at 60fps with a keyframe on every frame (see
//   repo notes) so any seek is instant — without that, standard long-GOP H.264
//   seeking is what actually causes stiff/laggy scrubbing, no amount of JS fixes it.
// - Every known variant's <video> stays mounted and preloaded the whole time (never
//   key-remounted on switch) — switching collar just swaps which one is opacity:1.
//   An early version remounted the video element on switch, which threw away the
//   already-buffered data and caused a visible black flash while it reloaded.
import { useEffect, useRef, useState } from 'react'
import { timeForPart, SCRUB_VARIANTS } from '../data/garmentScrub.js'

const ALL_VARIANTS = Object.values(SCRUB_VARIANTS)
const FRAME_EPS = 1 / 60 // one frame at the source videos' 60fps
const COLOR_HYSTERESIS = 0.2 // part-units of scroll "slack" before flipping back to video

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v))
const lerp = (m, n, e) => m + (n - m) * e

export default function GarmentScrub({ trackRef, parts, variant, colorName, onStep }) {
  const videoRefs = useRef({})
  const lastIdxRef = useRef(-1)
  const lastRequestedTRef = useRef(-1)
  const modeRef = useRef('video') // 'video' | 'image' — mirrored into state for render
  const [mode, setMode] = useState('video')

  const N = parts.length
  const colorIdx = parts.findIndex((p) => p.key === 'color')

  // Switching variant doesn't reload anything (see file header), but the newly-active
  // video still needs one catch-up seek to the current scroll position.
  useEffect(() => {
    lastRequestedTRef.current = -1
  }, [variant.key])

  useEffect(() => {
    let raf
    const update = () => {
      const track = trackRef.current
      const video = videoRefs.current[variant.key]
      if (track && video) {
        const vh = window.innerHeight
        const rect = track.getBoundingClientRect()
        const denom = rect.height - vh
        const p = clamp(denom > 0 ? -rect.top / denom : 0, 0, 0.9999)

        const pf = p * N
        const idx = clamp(Math.floor(pf), 0, N - 1)
        const e = clamp(pf - idx, 0, 1) // linear — see file header
        const a = timeForPart(parts[idx]?.key)
        const b = timeForPart(parts[Math.min(N - 1, idx + 1)]?.key)
        const t = lerp(a, b, e)

        if (
          video.readyState >= 1 &&
          !video.seeking &&
          Math.abs(t - lastRequestedTRef.current) > FRAME_EPS
        ) {
          video.currentTime = t
          lastRequestedTRef.current = t
        }

        if (colorIdx !== -1) {
          if (modeRef.current === 'video' && pf >= colorIdx) modeRef.current = 'image'
          else if (modeRef.current === 'image' && pf < colorIdx - COLOR_HYSTERESIS) modeRef.current = 'video'
          setMode((m) => (m === modeRef.current ? m : modeRef.current))
        }

        if (idx !== lastIdxRef.current) {
          lastIdxRef.current = idx
          onStep?.(idx)
        }
      }
      raf = requestAnimationFrame(update)
    }
    raf = requestAnimationFrame(update)
    return () => cancelAnimationFrame(raf)
  }, [trackRef, parts, N, colorIdx, onStep, variant.key])

  const activeColor = variant.colors.find((c) => c.name === colorName) || variant.colors[0]

  return (
    <div className="gw-scrub-stage">
      {ALL_VARIANTS.map((v) => (
        <video
          key={v.key}
          ref={(el) => { videoRefs.current[v.key] = el }}
          className={'gw-scrub-video' + (mode === 'video' && v.key === variant.key ? ' gw-scrub-video--on' : '')}
          src={v.video}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />
      ))}
      <img
        className={'gw-scrub-image' + (mode === 'image' ? ' gw-scrub-image--on' : '')}
        src={activeColor.src}
        alt=""
      />
    </div>
  )
}
