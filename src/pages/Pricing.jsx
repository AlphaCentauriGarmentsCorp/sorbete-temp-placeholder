// src/pages/Pricing.jsx — pricing reference tables, generated from the canonical orderConfig.
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { IoArrowForward } from 'react-icons/io5'
import { navigate } from '../utils/navigation.js'
import {
  FITS, SIZES, SIZE_PRICES, STYLES, COLLARS, SLEEVES, PLACEMENTS,
  SAMPLE_FEE, MIN_QTY, peso,
} from '../data/orderConfig.js'
import '../design/marketing.css'

const addOns = [
  ...STYLES.filter((s) => s.addPerPc).map((s) => [s.label, `+${peso(s.addPerPc)} / pc`]),
  [COLLARS[1].label, `+${peso(COLLARS[1].addPerPc)} / pc`],
  [SLEEVES[1].label, `+${peso(SLEEVES[1].addPerPc)} / pc`],
  [PLACEMENTS[1].label, `+${peso(PLACEMENTS[1].addPerPc)} / pc`],
  ['Each print color after the 1st', '+₱20 / pc'],
]

const terms = [
  ['Sample fee (separate, not credited)', peso(SAMPLE_FEE)],
  ['Downpayment (starts production)', '60%'],
  ['Balance (at pickup / delivery)', '40%'],
  ['Minimum order', `${MIN_QTY} pcs`],
  ['1-color print', 'Included'],
  ['Etiketa + ziploc packing', 'Included'],
]

export default function Pricing() {
  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <section className="mk-hero">
          <div className="mk-eyebrow">Pricing</div>
          <h1 className="mk-h1">Straight numbers.</h1>
          <p className="mk-lead">Per-piece price is driven by size and options — never by fabric alone. Here's the reference; the builder totals it for your exact spec.</p>
        </section>

        <section className="mk-section">
          <div className="mk-section-head"><h2 className="mk-h2">Per-piece base (tees)</h2><p className="mk-section-sub">By fit &amp; size. Long Sleeve adds +{peso(70)}/pc on top.</p></div>
          <div className="pr-scroll">
            <table className="pr-table">
              <thead><tr><th>Size</th>{FITS.map((f) => <th key={f} style={{ textAlign: 'right' }}>{f}</th>)}</tr></thead>
              <tbody>
                {SIZES.map((sz) => (
                  <tr key={sz}>
                    <td style={{ fontWeight: 700 }}>{sz}</td>
                    {FITS.map((f) => <td key={f}>{peso(SIZE_PRICES[f][sz])}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mk-section">
          <div className="mk-section-head"><h2 className="mk-h2">Add-ons</h2></div>
          <div className="pr-scroll">
            <table className="pr-table">
              <thead><tr><th>Option</th><th style={{ textAlign: 'right' }}>Price</th></tr></thead>
              <tbody>{addOns.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="mk-section">
          <div className="mk-section-head"><h2 className="mk-h2">Terms</h2></div>
          <div className="pr-scroll">
            <table className="pr-table">
              <tbody>{terms.map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="mk-cta">
          <div className="mk-cta-inner">
            <div>
              <h2 className="mk-cta-title">Get your exact number.</h2>
              <p className="mk-cta-sub">The builder totals size, options, print, and the sample fee for your spec.</p>
            </div>
            <button className="btn btn-gold btn-lg" onClick={() => navigate('?page=start')}>Build a quote <IoArrowForward /></button>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  )
}
