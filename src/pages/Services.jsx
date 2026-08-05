// src/pages/Services.jsx — what we make + how (marketing).
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import MarketingHero from '../components/MarketingHero.jsx'
import MarketingCTA from '../components/MarketingCTA.jsx'
import {
  IoShirtOutline, IoBrushOutline, IoLayersOutline, IoConstructOutline,
  IoPricetagsOutline, IoCheckmarkCircle,
} from 'react-icons/io5'
import { navigate } from '../utils/navigation.js'
import { peso, MIN_QTY, SAMPLE_FEE } from '../data/orderConfig.js'
import '../design/marketing.css'

const SERVICES = [
  { icon: <IoShirtOutline />, title: 'Tees & long sleeves', body: 'Plain or printed, Standard / Boxy / Oversized fits, 220–280 GSM cotton & CVC.' },
  { icon: <IoLayersOutline />, title: 'Hoodies & pants', body: 'Pullover hoodies, joggers, and cargos — same in-house cut & sew.' },
  { icon: <IoBrushOutline />, title: 'Custom printing', body: 'Silkscreen up to multi-color, front and/or back placement. 1-color is free.' },
  { icon: <IoConstructOutline />, title: 'Sampling', body: 'A physical sample before production — approve it, or request changes.' },
  { icon: <IoPricetagsOutline />, title: 'Labels & packing', body: 'Free etiketa + ziploc packing on every order; woven-label upgrades available.' },
]

export default function Services() {
  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <MarketingHero eyebrow="Services" title="Everything, under one roof.">
          From blank tees to fully-printed capsule drops — we handle cut, sew, print, sampling,
          labeling, and packing in-house. One team, one point of contact.
        </MarketingHero>

        <section className="mk-section">
          <div className="mk-grid-3">
            {SERVICES.map((s) => (
              <div className="mk-feature" key={s.title}>
                <span className="mk-feature-icon">{s.icon}</span>
                <div className="mk-feature-title">{s.title}</div>
                <div className="mk-feature-body">{s.body}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="mk-section">
          <div className="mk-section-head"><h2 className="mk-h2">The essentials</h2></div>
          <ul className="mk-list">
            <li><IoCheckmarkCircle /> {MIN_QTY}-piece minimum order — enough for a real run, small enough to start.</li>
            <li><IoCheckmarkCircle /> Tees from {peso(200)} / pc; price depends on size & options, never on fabric alone.</li>
            <li><IoCheckmarkCircle /> {peso(SAMPLE_FEE)} sample fee up front, then 60% downpayment → 40% balance at pickup.</li>
            <li><IoCheckmarkCircle /> Free etiketa + ziploc packing, and 1-color print, included on every order.</li>
          </ul>
        </section>

        <MarketingCTA
          title="Spec your order."
          sub="Guided or instant — both give you an itemized quote on the spot."
          ctaLabel="Start an order"
          onCta={() => navigate('?page=start')}
        />
      </div>
      <Footer />
    </div>
  )
}
