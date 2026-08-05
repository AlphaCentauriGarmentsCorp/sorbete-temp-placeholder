// src/pages/ChoosePath.jsx — order entry chooser (?page=start).
// Three equal-weight cards — Guided, Instant, and In-store — all the same level, same
// card treatment. Walk-in used to be a separate dashed banner below the two online
// cards; it's now a third card in the same grid (still routes to the in-person info
// page, NOT the on-site QR kiosk — ?page=walk-ins vs ?page=walk-in).
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { IoSparklesOutline, IoFlashOutline, IoStorefrontOutline, IoArrowForward } from 'react-icons/io5'
import { navigate } from '../utils/navigation.js'
import '../design/ChoosePath.css'

const OPTIONS = [
  {
    id: 'guided',
    eyebrow: 'Online · Guided',
    title: 'See what it looks like as you order!',
    body: 'Customize your design step by step and see it update instantly as you choose colors, fabric, and style.',
    cta: 'Start guided walkthrough',
    page: 'walkthrough',
    icon: <IoSparklesOutline />,
  },
  {
    id: 'instant',
    eyebrow: 'Online · Instant',
    title: 'Order Online',
    body: 'Know exactly what you want? Fill out a quick form and place your order in minutes — fast and straightforward.',
    cta: 'Open instant builder',
    page: 'direct-form',
    icon: <IoFlashOutline />,
  },
  {
    id: 'walkin',
    eyebrow: 'In-Person',
    title: 'Order in our physical store',
    body: 'Prefer a hands-on experience? Visit our store and get guided assistance while placing your order.',
    cta: 'Visit in-store',
    page: 'walk-ins',
    icon: <IoStorefrontOutline />,
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
              Three ways in — all end on the same quote and payment flow, so you can't pick
              wrong. Browsing and quoting are free; you only sign in when you place the order.
            </p>
          </header>

          <div className="cp-grid">
            {OPTIONS.map((c) => (
              <button key={c.id} className="cp-card" onClick={() => navigate('?page=' + c.page)} title={c.cta}>
                <span className="cp-card-icon">{c.icon}</span>
                <span className="cp-card-text">
                  <span className="cp-card-eyebrow">{c.eyebrow}</span>
                  <span className="cp-card-title">{c.title}</span>
                  <span className="cp-card-body">{c.body}</span>
                </span>
                <span className="cp-card-cta" aria-hidden="true">
                  <IoArrowForward />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
