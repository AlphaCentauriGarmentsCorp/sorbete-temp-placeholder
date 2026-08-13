// src/components/TrustedBrands.jsx — the auto-scrolling "Trusted by Brands" logo strip.
//
// Fourth port from the old frontend (Homepage.jsx's `.hp-trusted`), 2026-08-13. The rolling
// marquee is the point of the section (owner: "dapat nagrorolyo din katulad nung nasa old
// website"), so it's reproduced here rather than shown as a static grid.
//
// HOW THE SEAMLESS LOOP WORKS — read before editing either this file or the CSS:
// the list is rendered TWICE and the track slides exactly -50%, so the moment the first copy
// has fully left the frame the second copy is sitting precisely where the first started and
// the animation restarts invisibly. That only holds while both copies are the exact same
// width, which is why the CSS spaces the cards with `margin-right` on every card rather than
// a flex `gap`: a gap sits BETWEEN items only, so the two halves differ by one gap and the
// loop visibly jumps. (The old site papered over that by subtracting half a gap in its
// keyframes — two magic numbers that had to stay in sync. This needs none.)
//
// The second copy is aria-hidden: it's the same four logos again, and a screen reader
// announcing eight brands would misrepresent the list.
import '../design/TrustedBrands.css'

const BRANDS = [
  { slug: 'daily-grind', file: 'daily-grind.jpg', name: 'Daily Grind' },
  { slug: 'team-mnl', file: 'team-mnl.jpg', name: 'Team MNL' },
  { slug: 'kush', file: 'kush.png', name: 'KUSH' },
  { slug: 'linya-linya', file: 'linya-linya.jpg', name: 'Linya Linya' },
]

export default function TrustedBrands() {
  return (
    <section className="tb" aria-label="Trusted brands">
      <div className="tb-head" data-reveal>
        <h2 className="tb-title">Trusted by Brands</h2>
        <p className="tb-sub">Built on credibility and results.</p>
      </div>

      <div className="tb-marquee">
        <div className="tb-track">
          {[0, 1].map((copy) =>
            BRANDS.map((b) => (
              <div className="tb-card" key={`${copy}-${b.slug}`} aria-hidden={copy === 1 || undefined}>
                {/* Deliberately NOT loading="lazy", unlike ConceptToProduction's photos: a
                    lazy image only loads once it intersects the viewport, and half these
                    cards live off-screen to the right until the animation carries them in —
                    so they'd flash blank mid-roll, or never load at all. All four logos are
                    85KB combined and the second copy is a cache hit, so eager is cheap here
                    in a way five 200KB service photos would not be. */}
                <img src={`/brands/${b.file}`} alt={copy === 0 ? b.name : ''} decoding="async" />
              </div>
            )),
          )}
        </div>
      </div>

      <p className="tb-caption">...and the list goes on</p>
    </section>
  )
}
