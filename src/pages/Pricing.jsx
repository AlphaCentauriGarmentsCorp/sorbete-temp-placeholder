// src/pages/Pricing.jsx — pricing reference tables, generated from the canonical orderConfig.
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import MarketingHero from '../components/MarketingHero.jsx'
import MarketingCTA from '../components/MarketingCTA.jsx'
import { navigate } from '../utils/navigation.js'
import {
  FITS, SIZES, SIZE_PRICES, COLLARS, SLEEVES,
  PRINT_COLOR_FEE, SAMPLE_FEE, MIN_QTY, peso,
} from '../data/orderConfig.js'
import '../design/marketing.css'

// Placement itself is free — back print is billed per colour, so it lives in the
// print-colour rows below rather than as a flat placement surcharge.
const addOns = [
  [COLLARS[1].label, `+${peso(COLLARS[1].addPerPc)} / pc`],
  [SLEEVES[1].label, `+${peso(SLEEVES[1].addPerPc)} / pc`],
  ['Each front print color after the 1st', `+${peso(PRINT_COLOR_FEE)} / pc`],
  ['Each back print color (no free color)', `+${peso(PRINT_COLOR_FEE)} / pc`],
  ['Each sleeve print color, per sleeve', `+${peso(PRINT_COLOR_FEE)} / pc`],
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
        <MarketingHero eyebrow="Pricing" title="Straight numbers.">
          Per-piece price is driven by size and options — never by fabric alone. Here's the reference; the builder totals it for your exact spec.
        </MarketingHero>

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

        <MarketingCTA
          title="Get your exact number."
          sub="The builder totals size, options, print, and the sample fee for your spec."
          ctaLabel="Build a quote"
          onCta={() => navigate('?page=start')}
        />
      </div>
      <Footer />
    </div>
  )
}
