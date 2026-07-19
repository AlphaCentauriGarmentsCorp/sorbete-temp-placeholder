// src/pages/OurStory.jsx — brand story (marketing).
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { IoArrowForward, IoCutOutline, IoColorPaletteOutline, IoShieldCheckmarkOutline } from 'react-icons/io5'
import { navigate } from '../utils/navigation.js'
import { MIN_QTY } from '../data/orderConfig.js'
import '../design/marketing.css'

const VALUES = [
  { icon: <IoCutOutline />, title: 'Made in-house', body: 'We cut, sew, and print under one roof — no subcontracting, no reseller markup.' },
  { icon: <IoShieldCheckmarkOutline />, title: 'Sample-first', body: 'You approve a physical sample before a single bulk piece is made. No surprises.' },
  { icon: <IoColorPaletteOutline />, title: 'Built for brands', body: 'Streetwear labels, teams, and orgs — we spec to your fit, fabric, and print.' },
]

export default function OurStory() {
  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <section className="mk-hero mk-hero--split">
          <div>
            <div className="mk-eyebrow">Our story</div>
            <h1 className="mk-h1">Not a middleman. The maker.</h1>
            <p className="mk-lead">
              Sorbetes Apparel Studio started in Quezon City with one idea: give local brands
              factory-direct custom apparel without the reseller games — real fabrics, real
              samples, honest pricing.
            </p>
          </div>
          <div className="mk-hero-media"><img src="/img/hero-model.png" alt="" /></div>
        </section>

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

        <section className="mk-cta">
          <div className="mk-cta-inner">
            <div>
              <h2 className="mk-cta-title">See what we can make with you.</h2>
              <p className="mk-cta-sub">Build a quote in a few minutes — no account needed to start.</p>
            </div>
            <button className="btn btn-gold btn-lg" onClick={() => navigate('?page=start')}>Start an order <IoArrowForward /></button>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
