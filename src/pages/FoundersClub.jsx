// src/pages/FoundersClub.jsx — loyalty/founders program (marketing).
// Also serves ?page=founders-club-guide (same content).
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import MarketingHero from '../components/MarketingHero.jsx'
import MarketingCTA from '../components/MarketingCTA.jsx'
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
          sub={isAuthenticated ? 'Check your tier and points under Rewards.' : 'Sign in with Google to start earning on your first order.'}
          ctaLabel={isAuthenticated ? 'View rewards' : 'Sign in'}
          onCta={() => navigate(isAuthenticated ? '?page=rewards' : '?page=auth')}
        />
      </div>
      <Footer />
    </div>
  )
}
