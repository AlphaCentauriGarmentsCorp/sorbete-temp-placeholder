// src/pages/FabricPrintGuide.jsx — fabric weights, colors & print options (?page=fabric-print-guide).
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { IoArrowForward } from 'react-icons/io5'
import { navigate } from '../utils/navigation.js'
import { FABRICS, COLORS_BY_FABRIC, COLOR_HEX, PRINT_COLOR_OPTIONS, PLACEMENTS, peso } from '../data/orderConfig.js'
import '../design/marketing.css'

const FABRIC_NOTE = {
  '220 GSM': 'Lightweight, breathable — everyday tees and warm-weather drops.',
  'CVC 240 GSM': 'Our classic everyday weight — soft hand, holds print well.',
  'CVC 280 GSM': 'Heavier drape, more structure — premium-feeling classic tees.',
  'Premium 280 GSM': 'Top of the line hand-feel — our premium line.',
}

export default function FabricPrintGuide() {
  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <section className="mk-hero">
          <div className="mk-eyebrow">Fabric &amp; print guide</div>
          <h1 className="mk-h1">Pick the right base.</h1>
          <p className="mk-lead">
            Fabric sets the feel; print sets the look. Here's what we stock and how the options
            affect your price — the builder shows exact numbers as you choose.
          </p>
        </section>

        <section className="mk-section">
          <div className="mk-section-head">
            <h2 className="mk-h2">Fabrics &amp; weights</h2>
            <p className="mk-section-sub">Price depends on size, not fabric — pick the feel you want.</p>
          </div>
          <div className="mk-grid-2">
            {FABRICS.map((f) => (
              <div className="mk-feature" key={f.value}>
                <div className="mk-feature-title">{f.label}</div>
                <div className="mk-feature-body">{FABRIC_NOTE[f.value] || f.sub}</div>
                <div className="mk-swatches" style={{ marginTop: 12 }}>
                  {(COLORS_BY_FABRIC[f.value] || []).map((c) => (
                    <div className="mk-swatch" key={c}>
                      <span style={{ background: COLOR_HEX[c] || '#ccc' }} />{c}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mk-section">
          <div className="mk-section-head">
            <h2 className="mk-h2">Print options</h2>
            <p className="mk-section-sub">1-color print is included. Each extra color adds a screen.</p>
          </div>
          <div className="mk-grid-2">
            <div className="mk-feature">
              <div className="mk-feature-title">Colors</div>
              <ul className="mk-list" style={{ marginTop: 10 }}>
                {PRINT_COLOR_OPTIONS.map((o) => (
                  <li key={o.n} style={{ display: 'block', fontSize: 14 }}><strong>{o.label}</strong> — {o.sub}</li>
                ))}
              </ul>
            </div>
            <div className="mk-feature">
              <div className="mk-feature-title">Placement</div>
              <ul className="mk-list" style={{ marginTop: 10 }}>
                {PLACEMENTS.map((p) => (
                  <li key={p.label} style={{ display: 'block', fontSize: 14 }}>
                    <strong>{p.label}</strong> — {p.addPerPc ? `+${peso(p.addPerPc)} / pc` : 'included'}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="mk-cta">
          <div className="mk-cta-inner">
            <div>
              <h2 className="mk-cta-title">See it priced live.</h2>
              <p className="mk-cta-sub">The builder updates your per-piece price as you change fabric, color, and print.</p>
            </div>
            <button className="btn btn-gold btn-lg" onClick={() => navigate('?page=walkthrough')}>Open the builder <IoArrowForward /></button>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
