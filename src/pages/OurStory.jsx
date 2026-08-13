// src/pages/OurStory.jsx — brand story (marketing).
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import MarketingHero from '../components/MarketingHero.jsx'
import MarketingCTA from '../components/MarketingCTA.jsx'
import {
  IoCutOutline, IoColorPaletteOutline, IoShieldCheckmarkOutline,
  IoFlagOutline, IoEyeOutline,
} from 'react-icons/io5'
import { navigate } from '../utils/navigation.js'
import { MIN_QTY } from '../data/orderConfig.js'
import '../design/marketing.css'

const VALUES = [
  { icon: <IoCutOutline />, title: 'Made in-house', body: 'We cut, sew, and print under one roof — no subcontracting, no reseller markup.' },
  { icon: <IoShieldCheckmarkOutline />, title: 'Sample-first', body: 'You approve a physical sample before a single bulk piece is made. No surprises.' },
  { icon: <IoColorPaletteOutline />, title: 'Built for brands', body: 'Streetwear labels, teams, and orgs — we spec to your fit, fabric, and print.' },
]

// Ported from the old frontend's `.os-mission-vision` (OurStory.jsx), 2026-08-13 — same copy,
// rebuilt as flowing markup on this site's own `.mk-*` card system instead of the old page's
// absolute-pixel-positioned layout (that page pins every section to a fixed 1920×3223 canvas
// and scales the whole thing down as one image would — not a pattern worth carrying over here).
const MISSION_VISION = [
  {
    icon: <IoFlagOutline />,
    title: 'Mission',
    body: 'To provide businesses with high-quality, thoughtfully crafted garments that combine creativity, consistency, and efficient production — helping brands turn their ideas into products they can be proud of.',
  },
  {
    icon: <IoEyeOutline />,
    title: 'Vision',
    body: 'To be a trusted apparel partner known for elevating local and growing brands through reliable manufacturing, modern design, and long-term collaboration.',
  },
]

export default function OurStory() {
  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <MarketingHero
          eyebrow="Our story"
          title="Not a middleman. The maker."
          media={<img src="/img/hero-model.webp" alt="" />}
        >
          Sorbetes Apparel Studio started in Quezon City with one idea: give local brands
          factory-direct custom apparel without the reseller games — real fabrics, real
          samples, honest pricing.
        </MarketingHero>

        <section className="mk-section">
          <div className="mk-body">
            <p>
              Most “custom apparel” sellers are middlemen — they take your order, mark it up, and
              pass it to a factory you never see. We are that factory. Every order is cut, sewn,
              and printed by our own team, so the person quoting you is the person making your tees.
            </p>
            <p>
              That means fewer surprises and a tighter loop: you build a spec, we produce a physical
              sample, you approve it, and only then do we run production. Minimum order is {MIN_QTY}{' '}
              pieces — enough for a real drop, small enough for a first run.
            </p>
          </div>
        </section>

        <section className="mk-section">
          <div className="mk-section-head"><h2 className="mk-h2">What we stand on</h2></div>
          <div className="mk-grid-3">
            {VALUES.map((v) => (
              <div className="mk-feature" key={v.title}>
                <span className="mk-feature-icon">{v.icon}</span>
                <div className="mk-feature-title">{v.title}</div>
                <div className="mk-feature-body">{v.body}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mk-section">
          <div className="mk-section-head"><h2 className="mk-h2">Mission &amp; Vision</h2></div>
          <div className="mk-mv-grid">
            {MISSION_VISION.map((m) => (
              <article className="mk-mv-card" key={m.title}>
                <div className="mk-mv-head">
                  <span className="mk-mv-icon-wrap">{m.icon}</span>
                  <h3 className="mk-mv-title">{m.title}</h3>
                </div>
                <p className="mk-mv-body">{m.body}</p>
              </article>
            ))}
          </div>
        </section>

        <MarketingCTA
          title="See what we can make with you."
          sub="Build a quote in a few minutes — no account needed to start."
          ctaLabel="Start an order"
          onCta={() => navigate('?page=start')}
        />
      </div>
      <Footer />
    </div>
  )
}
