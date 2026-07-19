// src/pages/ChoosePath.jsx — order entry chooser (?page=start).
// FRONTEND-BUILD-SPEC §1: two online cards (Guided / Instant) + Walk-in reached separately.
// This is the normalized "Choose Between Options" screen — now a real, linked entry point
// (fixes SYSTEM-FLOW §7: orphan fork + dead "Start an order" nav link).
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { IoSparklesOutline, IoFlashOutline, IoStorefrontOutline, IoArrowForward } from 'react-icons/io5'
import { navigate } from '../utils/navigation.js'
import '../design/ChoosePath.css'

const ONLINE = [
  {
    id: 'guided',
    eyebrow: 'Online · Guided',
    title: 'Design it as you scroll',
    body: 'A guided, visual builder. We walk you through apparel, fabric & color, and print — the preview reacts as you choose and your quote updates live. Best if you want to explore options.',
    cta: 'Start guided walkthrough',
    page: 'walkthrough',
    icon: <IoSparklesOutline />,
  },
  {
    id: 'instant',
    eyebrow: 'Online · Instant',
    title: 'Know what you want?',
    body: 'A compact one-page form. Fill in your spec and get a quote immediately — no scrolling story. Best if you already know your garment, fabric, and print.',
    cta: 'Open instant builder',
    page: 'direct-form',
    icon: <IoFlashOutline />,
  },
]

export default function ChoosePath() {
  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <div className="cp-wrap">
          <header className="cp-head">
            <div className="cp-eyebrow">Start an order</div>
            <h1 className="cp-title">How do you want to order?</h1>
            <p className="cp-lead">
              Three ways in — both online paths end on the same quote and payment flow, so you can't
              pick wrong. Browsing and quoting are free; you only sign in when you place the order.
            </p>
          </header>

          <div className="cp-grid">
            {ONLINE.map((c) => (
              <button key={c.id} className="cp-card" onClick={() => navigate('?page=' + c.page)}>
                <span className="cp-card-icon">{c.icon}</span>
                <span className="cp-card-eyebrow">{c.eyebrow}</span>
                <span className="cp-card-title">{c.title}</span>
                <span className="cp-card-body">{c.body}</span>
                <span className="cp-card-cta">
                  {c.cta} <IoArrowForward />
                </span>
              </button>
            ))}
          </div>

          {/* Walk-in is reached separately (§1) — routes to the in-person info page,
              NOT the on-site QR kiosk (?page=walk-in). */}
          <button className="cp-walkin" onClick={() => navigate('?page=walk-ins')}>
            <span className="cp-walkin-icon">
              <IoStorefrontOutline />
            </span>
            <span className="cp-walkin-text">
              <span className="cp-walkin-title">Prefer to do it in person?</span>
              <span className="cp-walkin-body">
                Visit our Quezon City studio for a guided, in-store order. See the address & map.
              </span>
            </span>
            <IoArrowForward className="cp-walkin-arrow" />
          </button>
        </div>
      </div>
      <Footer />
    </div>
  )
}
