// src/pages/OrderingGuide.jsx — how ordering works (?page=guide).
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { IoArrowForward } from 'react-icons/io5'
import { navigate } from '../utils/navigation.js'
import { peso, MIN_QTY, SAMPLE_FEE } from '../data/orderConfig.js'
import '../design/marketing.css'

const STEPS = [
  { t: 'Build & quote', d: `Spec your garment online (Guided or Instant) or in-store. You get an itemized quote instantly — ${MIN_QTY}-piece minimum.` },
  { t: 'Sign in & place', d: 'Sign in with Google to place the order. Browsing and quoting stay open to guests.' },
  { t: `Pay the ${peso(SAMPLE_FEE)} sample fee`, d: 'A separate fee (not credited) that starts your physical sample. Pay by GCash, Maya, or bank transfer — upload proof, staff verifies.' },
  { t: 'Approve your sample', d: 'Review the physical sample. Approve it, or request changes — minor fixes are free; a major remake is a new sample fee.' },
  { t: 'Pay 60% downpayment', d: 'Once you approve, the 60% downpayment starts bulk production (7–15 days standard).' },
  { t: 'Settle 40% on pickup', d: 'Pay the remaining 40% at pickup or delivery. Walk-ins can pay cash at the counter.' },
]

export default function OrderingGuide() {
  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <section className="mk-hero">
          <div className="mk-eyebrow">Guide</div>
          <h1 className="mk-h1">How ordering works.</h1>
          <p className="mk-lead">
            Sample-first, then a 60 / 40 split — you never pay the full amount up front, and you
            approve a real sample before production runs.
          </p>
        </section>

        <section className="mk-section">
          <div className="gd-steps">
            {STEPS.map((s, i) => (
              <div className="gd-step" key={s.t}>
                <span className="gd-num">{i + 1}</span>
                <div>
                  <div className="gd-step-t">{s.t}</div>
                  <div className="gd-step-d">{s.d}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mk-cta">
          <div className="mk-cta-inner">
            <div>
              <h2 className="mk-cta-title">Ready when you are.</h2>
              <p className="mk-cta-sub">Start a guided or instant quote — it only takes a couple of minutes.</p>
            </div>
            <button className="btn btn-gold btn-lg" onClick={() => navigate('?page=start')}>Start an order <IoArrowForward /></button>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
