// src/pages/FoundersClub.jsx — loyalty/founders program (marketing).
// Also serves ?page=founders-club-guide (same content).
//
// Enhanced 2026-08-13 (owner: "gayahin mo din yung nasa founder's club") with content ported
// from the old frontend's own dedicated FoundersClub.jsx: an "About" section explaining what
// the club actually is, and a "Trusted by Growing Brands" section for social proof — both
// previously missing here, since this page jumped straight from the hero into Perks/Tiers
// with no framing.
//
// ⚠️ NOT ported: the old page's "Hear what our customers say" review grid. Its five review
// cards use real, identifiable people's names — John Lloyd Cruz, Jerald Napoles, Billie
// Eilish — as the authors of a fabricated 5-star testimonial (the exact same placeholder
// paragraph repeated under all three), alongside made-up aggregate stats ("1000+ Satisfied
// Clients", "5.0 · Based on 1.0k reviews"). That's a real problem to flag, not port: it
// presents invented reviews as if real, famous, identifiable people wrote them — a false
// endorsement, not a placeholder in the harmless lorem-ipsum sense. This site already has a
// real equivalent with actual client quotes and logos — FoundersTestimonials (§7,
// 2026-08-13) — reused below for "Trusted by Growing Brands" instead.
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import MarketingHero from '../components/MarketingHero.jsx'
import MarketingCTA from '../components/MarketingCTA.jsx'
import FoundersTestimonials from '../components/FoundersTestimonials.jsx'
import { IoCheckmarkCircle, IoStar } from 'react-icons/io5'
import { navigate } from '../utils/navigation.js'
import { useSession } from '../context/SessionContext.jsx'
import '../design/marketing.css'

const PERKS = [
  'Priority sampling — your sample jumps the queue',
  'Founding-member pricing on reorders',
  'Early access to new fabrics, colorways, and drops',
  'Free woven-label upgrade on 200+ pc runs',
  '1 reward point per ₱100 on delivered orders',
]

const TIERS = [
  { name: 'Founding Member', req: 'Join free', body: 'Every signed-in customer starts here.' },
  { name: 'Silver Founder', req: '2+ delivered orders', body: 'Priority sampling + member pricing.' },
  { name: 'Gold Founder', req: '5+ delivered orders', body: 'Everything, plus early drops & upgrades.' },
]

export default function FoundersClub() {
  const { isAuthenticated } = useSession()
  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <MarketingHero eyebrow="Founder's Club" title="Built for repeat brands.">
          The more you produce with us, the more you get — priority sampling, member pricing, and
          early access. Free to join; you're in the moment you sign in.
        </MarketingHero>

        <section className="mk-section">
          <div className="mk-body">
            <p>
              <strong>What is the Sorbetes Founders Club?</strong> A community of visionary
              brands, creators, and business owners who have trusted us to bring their apparel
              ideas to life. Their experiences reflect our commitment to quality craftsmanship,
              reliable production, and long-term partnership — inspiring new brands to grow
              with confidence alongside us.
            </p>
          </div>
        </section>

        {/* Full-bleed like it is on the Home page — the carousel's own CSS deliberately has
            no max-width, so it needs a plain wrapper rather than the 1000px .mk-section box
            the rest of this page uses. */}
        <section className="mk-founders-proof">
          <div className="mk-section-head mk-founders-proof-head">
            <h2 className="mk-h2">Trusted by Growing Brands</h2>
            <p className="mk-section-sub">Real founders, on the record — not stock quotes.</p>
          </div>
          <FoundersTestimonials />
        </section>

        <section className="mk-section">
          <div className="mk-grid-2">
            <div>
              <div className="mk-section-head"><h2 className="mk-h2">Perks</h2></div>
              <ul className="mk-list">
                {PERKS.map((p) => <li key={p}><IoCheckmarkCircle /> {p}</li>)}
              </ul>
            </div>
            <div className="mk-grid-3" style={{ gridTemplateColumns: '1fr' }}>
              {TIERS.map((t) => (
                <div className="mk-feature" key={t.name}>
                  <span className="mk-feature-icon"><IoStar /></span>
                  <div className="mk-feature-title">{t.name}</div>
                  <div className="mk-feature-body"><strong>{t.req}</strong> — {t.body}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <MarketingCTA
          title={isAuthenticated ? "You're a member." : 'Join the club.'}
          sub={isAuthenticated ? 'Check your tier and points under Rewards.' : 'Sign in to start earning on your first order.'}
          ctaLabel={isAuthenticated ? 'View rewards' : 'Sign in'}
          onCta={() => navigate(isAuthenticated ? '?page=rewards' : '?page=auth')}
        />
      </div>
      <Footer />
    </div>
  )
}
