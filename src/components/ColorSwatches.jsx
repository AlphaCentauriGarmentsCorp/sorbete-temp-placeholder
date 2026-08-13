// src/components/ColorSwatches.jsx — the fabric-catalog colour picker, shared by all three
// order paths.
//
// Built 2026-08-13 (owner: "gusto ko lahat ng path is consistent, and prefer ko yung existing
// na bilog type"). The guided walkthrough had square paint-chips with a cut corner while the
// two forms had round ones — three separate implementations that had drifted in shape, size,
// name handling and selected-ring treatment. One component now, round chips everywhere.
//
// Layout stays per-path CSS on purpose: the two forms are always a horizontal strip, while
// the walkthrough's dock is a vertical column on desktop and a horizontal strip on mobile.
// That difference is real; the chips themselves are not.
import { useLayoutEffect, useRef } from 'react'
import { groupColorsByCategory } from '../data/orderConfig.js'
import { scrollSelectionIntoView } from '../utils/scrollSelectionIntoView.js'
import '../design/ColorSwatches.css'

/**
 * @param colors    already filtered for the chosen fabric (colorsForFabric(...))
 * @param value     selected colour name
 * @param onChange  (name) => void
 * @param className path-specific wrapper class controlling direction/size only
 */
export default function ColorSwatches({ colors, value, onChange, className = '' }) {
  const ref = useRef(null)

  // Keep the customer's current colour on screen: a 124-colour tier is ~9,000px of strip and
  // the default Black sits ~6,700px in, so without this the selection is silently off-view.
  // The wrapper is passed as the boundary so nothing OUTSIDE the picker scrolls — see the
  // util's own note; omitting it once dragged whole forms down to the colour section.
  useLayoutEffect(() => {
    const el = ref.current
    scrollSelectionIntoView(el?.querySelector('.cpick-sw--on'), el)
  }, [value, colors])

  return (
    <div className={'cpick ' + className} ref={ref}>
      {groupColorsByCategory(colors).map((group) => (
        <div className="cpick-group" key={group.slug}>
          <div className="cpick-label">{group.label}</div>
          <div className="cpick-row">
            {group.colors.map((c) => (
              <button
                key={c.name}
                type="button"
                title={c.name}
                className={'cpick-sw' + (value === c.name ? ' cpick-sw--on' : '')}
                onClick={() => onChange(c.name)}
              >
                <span className="cpick-chip" style={{ background: c.hex }} />
                <span className="cpick-name">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
