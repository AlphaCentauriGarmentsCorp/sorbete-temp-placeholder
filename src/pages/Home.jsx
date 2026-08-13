// src/pages/Home.jsx — landing page (front door).
// Hero art: a fanned stack of cards behind a framed product photo, auto-rotating through
// real Sorbetes product shots every few seconds with a clickable dot rail — the same
// carousel the old sorbetes-frontend project's own homepage used (hp-hero-media), ported
// here with its actual 7 photos (public/img/hero/hero-1..7.jpg). Thick black stats band and
// light scroll-reveal / hover motion throughout the rest of the page.
import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import {
  IoArrowForward, IoSparklesOutline, IoFlashOutline, IoStorefrontOutline,
  IoCheckmarkCircle,
} from 'react-icons/io5'
import { navigate } from '../utils/navigation.js'
import { peso, MIN_QTY, SAMPLE_FEE, SIZE_PRICES } from '../data/orderConfig.js'
import { useScrollReveal } from '../hooks/useScrollReveal.js'
import FoundersTestimonials from '../components/FoundersTestimonials.jsx'
import ConceptToProduction from '../components/ConceptToProduction.jsx'
import WhyChooseUs from '../components/WhyChooseUs.jsx'
import TrustedBrands from '../components/TrustedBrands.jsx'
import FollowUs from '../components/FollowUs.jsx'
import '../design/Home.css'

const HERO_IMAGES = [1, 2, 3, 4, 5, 6, 7].map((n) => `/img/hero/hero-${n}.jpg`)
const HERO_INTERVAL_MS = 3000

// Figures taken from the client's reference design (their own marketing copy). Swap any that
// aren't accurate for the business — unlike prices, these aren't derived from orderConfig.
const STATS = [
  { k: '12', v: 'Years operating' },
  { k: '40k', v: 'Pcs / month capacity' },
  { k: '300+', v: 'Brands served' },
  { k: '6', v: 'Stages in-house' },
]

const PATHS = [
  {
    icon: <IoSparklesOutline />,
    title: 'See what it looks like as you order!',
    body: 'Customize your design step by step and see it update instantly as you choose colors, fabric, and style.',
    page: 'walkthrough',
  },
  {
    icon: <IoFlashOutline />,
    title: 'Order Online',
    body: 'Know exactly what you want? Fill out a quick form and place your order in minutes — fast and straightforward.',
    page: 'direct-form',
  },
  {
    icon: <IoStorefrontOutline />,
    title: 'Order in our physical store',
    body: 'Prefer a hands-on experience? Visit our store and get guided assistance while placing your order.',
    page: 'walk-ins',
  },
]

const STEPS = [
  { n: 1, t: 'Build & quote', d: 'Spec your garment online or in-store. Your quote is instant and itemized.' },
  { n: 2, t: 'Sample first', d: `Pay the ${peso(SAMPLE_FEE)} sample fee — we produce a physical sample for you to approve.` },
  { n: 3, t: '60% to produce', d: 'Approve the sample, pay the 60% downpayment, and bulk production starts.' },
  { n: 4, t: '40% on pickup', d: 'Settle the 40% balance at pickup or delivery. Done.' },
]

export default function Home() {
  useScrollReveal()
  const [heroIndex, setHeroIndex] = useState(0)

  // Auto-advance, same 3s cadence as the old homepage's carousel — paused implicitly
  // whenever the tab isn't the active one costs nothing extra to handle since the
  // interval just keeps ticking in the background at negligible cost.
  useEffect(() => {
    const id = setInterval(() => setHeroIndex((i) => (i + 1) % HERO_IMAGES.length), HERO_INTERVAL_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        {/* hero — framed product photo on a fanned stack of cards */}
        <section className="hm-hero">
          <div className="hm-hero-inner">
            <div className="hm-hero-copy">
              <div className="hm-eyebrow" data-reveal>Custom apparel studio · B2B</div>
              <h1 className="hm-h1" data-reveal>Your brand,<br />produced to spec.</h1>
              <p className="hm-lead" data-reveal>
                Custom tees from <strong>{peso(SIZE_PRICES.Standard.XS)}/pc</strong> · min. {MIN_QTY} pcs ·
                made in our own Quezon City factory. From first sample to final delivery.
              </p>
              <div className="hm-hero-cta" data-reveal>
                <button className="btn btn-dark btn-lg" onClick={() => navigate('?page=start')}>
                  Start an order <IoArrowForward />
                </button>
                <button className="btn btn-ghost btn-lg" onClick={() => navigate('?page=direct-form')}>
                  Get instant quote
                </button>
              </div>
              <button className="hm-work-link" data-reveal onClick={() => navigate('?page=portfolio')}>
                See our client work <IoArrowForward />
              </button>
              <div className="hm-hero-meta" data-reveal>
                <span className="hm-trust"><IoCheckmarkCircle /> Free etiketa + ziploc packing · 1-color print included</span>
              </div>
            </div>

            <div className="hm-hero-art" data-reveal>
              <span className="hm-hero-fan hm-hero-fan--a" aria-hidden="true" />
              <span className="hm-hero-fan hm-hero-fan--b" aria-hidden="true" />
              <span className="hm-hero-fan hm-hero-fan--c" aria-hidden="true" />
              <div className="hm-hero-card">
                <img
                  key={heroIndex}
                  className="hm-hero-photo"
                  src={HERO_IMAGES[heroIndex]}
                  alt="A custom garment produced by Sorbetes"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
              <div className="hm-hero-rail" role="tablist" aria-label="Hero photos">
                {HERO_IMAGES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    role="tab"
                    aria-selected={i === heroIndex}
                    aria-label={`Show photo ${i + 1}`}
                    className={'hm-hero-rail-dot' + (i === heroIndex ? ' hm-hero-rail-dot--on' : '')}
                    onClick={() => setHeroIndex(i)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* stats band */}
        <section className="hm-stats">
          <div className="hm-stats-inner">
            {STATS.map((s) => (
              <div className="hm-stat" key={s.v}>
                <div className="hm-stat-k">{s.k}</div>
                <div className="hm-stat-v">{s.v}</div>
              </div>
            ))}
          </div>
        </section>

        {/* three paths */}
        <section className="hm-section">
          <div className="hm-section-head" data-reveal>
            <h2 className="hm-h2">Three ways to order</h2>
            <p className="hm-section-sub">Both online paths land on the same quote & payment flow.</p>
          </div>
          <div className="hm-paths">
            {PATHS.map((p) => (
              <button key={p.page} className="hm-path" data-reveal onClick={() => navigate('?page=' + p.page)}>
                <span className="hm-path-icon">{p.icon}</span>
                <span className="hm-path-text">
                  <span className="hm-path-title">{p.title}</span>
                  <span className="hm-path-body">{p.body}</span>
                </span>
                <span className="hm-path-arrow" aria-hidden="true">
                  <IoArrowForward />
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* how it works */}
        <section className="hm-section hm-steps-section">
          <div className="hm-section-head" data-reveal>
            <h2 className="hm-h2">How ordering works</h2>
            <p className="hm-section-sub">
              Sample-first, then a 60 / 40 payment split — no full payment up front.
            </p>
          </div>
          <div className="hm-steps">
            {STEPS.map((s) => (
              <div className="hm-step" data-reveal key={s.n}>
                <div className="hm-step-n">{s.n}</div>
                <div className="hm-step-t">{s.t}</div>
                <div className="hm-step-d">{s.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Founders Club testimonials — ported from the old frontend's homepage section,
            rebuilt as real markup so it works on a phone (see the component's own note). */}
        {/* Ported from the old frontend's OUR SERVICES section. */}
        <ConceptToProduction />

        {/* Ported from the old frontend's ABOUT US section. Sits after the services so the
            page reads "what we do" → "why us" → proof, same order as over there. */}
        <WhyChooseUs />

        {/* Full-bleed like .hm-stats — the heading stays in the 1100px column, the card runs
            edge to edge (owner: "gusto ko nakasagad sya sa gilid"). */}
        <section className="hm-founders">
          <div className="hm-section-head hm-founders-head" data-reveal>
            <h2 className="hm-h2">The Founders Club</h2>
            <p className="hm-section-sub">What the brands we produce for say about working with us.</p>
          </div>
          <FoundersTestimonials />
        </section>

        {/* Ported from the old frontend. Sits right after the testimonials so the two pieces
            of social proof land together — who vouches for us, then who we produce for. */}
        <TrustedBrands />

        {/* Fifth port from the old frontend, same order as over there (trusted brands →
            follow us). Distinct from the small "Follow us" link group in the footer itself
            (§7) — the old site has both, at two different scales for two different jobs. */}
        <FollowUs />

        {/* price anchor / final CTA */}
        <section className="hm-cta">
          <div className="hm-cta-inner" data-reveal>
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
