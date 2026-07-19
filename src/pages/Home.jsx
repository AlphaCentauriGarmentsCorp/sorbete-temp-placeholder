// src/pages/Home.jsx — landing page (front door).
// Phase 1 delivers a real, on-brand landing wired to the order entry + quote CTAs;
// Phase 5 expands the marketing sections (testimonials, portfolio teaser, proof blocks).
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import {
  IoArrowForward, IoSparklesOutline, IoFlashOutline, IoStorefrontOutline,
  IoCheckmarkCircle,
} from 'react-icons/io5'
import { navigate } from '../utils/navigation.js'
import { peso, MIN_QTY, SAMPLE_FEE } from '../data/orderConfig.js'
import '../design/Home.css'

const STATS = [
  { k: 'In-house', v: 'Cut, sew & print' },
  { k: `${MIN_QTY} pcs`, v: 'Minimum order' },
  { k: '7–15 days', v: 'Standard turnaround' },
  { k: 'No middleman', v: 'Factory-direct pricing' },
]

const PATHS = [
  { icon: <IoSparklesOutline />, title: 'Guided', body: 'Design as you scroll — visual builder, live preview.', page: 'walkthrough' },
  { icon: <IoFlashOutline />, title: 'Instant', body: 'Know your spec? One-page form, instant quote.', page: 'direct-form' },
  { icon: <IoStorefrontOutline />, title: 'Walk-in', body: 'Order in person at our Quezon City studio.', page: 'walk-ins' },
]

const STEPS = [
  { n: 1, t: 'Build & quote', d: 'Spec your garment online or in-store. Your quote is instant and itemized.' },
  { n: 2, t: 'Sample first', d: `Pay the ${peso(SAMPLE_FEE)} sample fee — we produce a physical sample for you to approve.` },
  { n: 3, t: '60% to produce', d: 'Approve the sample, pay the 60% downpayment, and bulk production starts.' },
  { n: 4, t: '40% on pickup', d: 'Settle the 40% balance at pickup or delivery. Done.' },
]

export default function Home() {
  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        {/* hero */}
        <section className="hm-hero">
          <div className="hm-hero-copy">
            <div className="hm-eyebrow">Sorbetes Apparel Studio · B2B custom apparel</div>
            <h1 className="hm-h1">
              Your brand,
              <br />
              made in-house.
            </h1>
            <p className="hm-lead">
              Custom tees, hoodies, and pants — designed, sewn, and printed under one roof. No
              middleman, no reseller markup. Build a quote in minutes.
            </p>
            <div className="hm-hero-cta">
              <button className="btn btn-gold btn-lg" onClick={() => navigate('?page=start')}>
                Start an order <IoArrowForward />
              </button>
              <button className="btn btn-ghost btn-lg" onClick={() => navigate('?page=quick-quote')}>
                Get a quick quote
              </button>
            </div>
            <div className="hm-trust">
              <IoCheckmarkCircle /> Free etiketa + ziploc packing · 1-color print included
            </div>
            <button className="hm-mockup-link" onClick={() => navigate('?page=mockup')}>
              👕 See your brand on our tee <IoArrowForward />
            </button>
          </div>
          <div className="hm-hero-media" aria-hidden="true">
            <img src="/img/hero-model.png" alt="" loading="eager" />
          </div>
        </section>

        {/* stats bar */}
        <section className="hm-stats">
          {STATS.map((s) => (
            <div className="hm-stat" key={s.k}>
              <div className="hm-stat-k">{s.k}</div>
              <div className="hm-stat-v">{s.v}</div>
            </div>
          ))}
        </section>

        {/* three paths */}
        <section className="hm-section">
          <div className="hm-section-head">
            <h2 className="hm-h2">Three ways to order</h2>
            <p className="hm-section-sub">Both online paths land on the same quote & payment flow.</p>
          </div>
          <div className="hm-paths">
            {PATHS.map((p) => (
              <button key={p.page} className="hm-path" onClick={() => navigate('?page=' + p.page)}>
                <span className="hm-path-icon">{p.icon}</span>
                <span className="hm-path-title">{p.title}</span>
                <span className="hm-path-body">{p.body}</span>
                <span className="hm-path-arrow">
                  <IoArrowForward />
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* how it works */}
        <section className="hm-section hm-steps-section">
          <div className="hm-section-head">
            <h2 className="hm-h2">How ordering works</h2>
            <p className="hm-section-sub">
              Sample-first, then a 60 / 40 payment split — no full payment up front.
            </p>
          </div>
          <div className="hm-steps">
            {STEPS.map((s) => (
              <div className="hm-step" key={s.n}>
                <div className="hm-step-n">{s.n}</div>
                <div className="hm-step-t">{s.t}</div>
                <div className="hm-step-d">{s.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* price anchor / final CTA */}
        <section className="hm-cta">
          <div className="hm-cta-inner">
            <div>
              <div className="hm-cta-eyebrow">Factory-direct pricing</div>
              <h2 className="hm-cta-title">Tees from {peso(200)} / pc.</h2>
              <p className="hm-cta-sub">
                {MIN_QTY}-piece minimum · {peso(SAMPLE_FEE)} sample fee · 60% to produce · 40% on
                pickup. Build a quote to see your exact numbers.
              </p>
            </div>
            <button className="btn btn-gold btn-lg" onClick={() => navigate('?page=start')}>
              Build your quote <IoArrowForward />
            </button>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
