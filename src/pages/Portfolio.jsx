// src/pages/Portfolio.jsx — filterable case-study grid + detail sheet (marketing).
// Ports the prototype's filter-chips + tap-to-expand + empty-state pattern (Portfolio.dc.html).
// ?page=portfolio-expanded&id=… opens a specific case directly.
import { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import MarketingHero from '../components/MarketingHero.jsx'
import { IoClose, IoArrowForward } from 'react-icons/io5'
import { navigate, getParam } from '../utils/navigation.js'
import { PORTFOLIO } from '../data/mockData.js'
import '../design/marketing.css'

const CATEGORIES = ['All', ...Array.from(new Set(PORTFOLIO.map((p) => p.category)))]
const initial = (brand) => brand.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()

function Sheet({ item, onClose }) {
  return (
    <div className="pf-backdrop" onClick={onClose}>
      <div className="pf-sheet" style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
        <button className="pf-sheet-x" onClick={onClose}><IoClose /></button>
        <div className="pf-sheet-hero">{initial(item.brand)}</div>
        <div className="pf-sheet-body">
          <div className="mk-eyebrow">{item.category}</div>
          <h2 className="mk-h2" style={{ fontSize: 26, margin: '6px 0 4px' }}>{item.brand}</h2>
          <p className="mk-feature-body">{item.blurb}</p>
          <div className="pf-spec">
            <div className="pf-spec-cell"><div className="spec-k">Quantity</div><div className="spec-v">{item.qty} pcs</div></div>
            <div className="pf-spec-cell"><div className="spec-k">Style</div><div className="spec-v">{item.style}</div></div>
            <div className="pf-spec-cell"><div className="spec-k">Fabric</div><div className="spec-v">{item.fabric}</div></div>
            <div className="pf-spec-cell"><div className="spec-k">Print</div><div className="spec-v">{item.colors}-color</div></div>
          </div>
          <button className="btn btn-gold" onClick={() => navigate(`?page=quick-quote&qty=${item.qty}&colors=${item.colors}`)}>
            Get this spec quoted <IoArrowForward />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Portfolio() {
  const [cat, setCat] = useState('All')
  const preId = getParam('id')
  const [openId, setOpenId] = useState(preId || null)
  const shown = PORTFOLIO.filter((p) => cat === 'All' || p.category === cat)
  const open = PORTFOLIO.find((p) => p.id === openId && !p.empty)

  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <MarketingHero eyebrow="Portfolio" title="Real runs, real brands.">
          A sample of what we've cut, sewn, and printed — filter by the kind of work you're planning.
        </MarketingHero>

        <section className="mk-section">
          <div className="pf-filters">
            {CATEGORIES.map((c) => (
              <button key={c} className={'pf-chip' + (cat === c ? ' pf-chip--on' : '')} onClick={() => setCat(c)}>{c}</button>
            ))}
          </div>

          <div className="pf-grid">
            {shown.map((p) =>
              p.empty ? (
                <div className="pf-empty" key={p.id}>
                  <strong>{p.category}</strong>
                  <div style={{ marginTop: 6 }}>Coming soon — we're onboarding our first live-selling brands. Want to be one?</div>
                  <button className="btn btn-ghost" style={{ marginTop: 14 }} onClick={() => navigate('?page=get-in-touch')}>Get in touch</button>
                </div>
              ) : (
                <button className="pf-card" key={p.id} onClick={() => setOpenId(p.id)}>
                  <div className="pf-thumb">{initial(p.brand)}</div>
                  <div className="pf-card-body">
                    <div className="pf-card-brand">{p.brand}</div>
                    <div className="pf-card-meta">{p.qty} pcs · {p.style} · {p.colors}-color</div>
                  </div>
                </button>
              ),
            )}
          </div>
        </section>
      </div>
      {open && <Sheet item={open} onClose={() => setOpenId(null)} />}
      <Footer />
    </div>
  )
}
