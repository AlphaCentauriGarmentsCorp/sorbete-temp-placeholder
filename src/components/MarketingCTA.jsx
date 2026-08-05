// src/components/MarketingCTA.jsx — marketing-page bottom CTA band (design/marketing.css .mk-cta).
import { IoArrowForward } from 'react-icons/io5'

export default function MarketingCTA({ title, sub, ctaLabel, onCta }) {
  return (
    <section className="mk-cta">
      <div className="mk-cta-inner">
        <div>
          <h2 className="mk-cta-title">{title}</h2>
          <p className="mk-cta-sub">{sub}</p>
        </div>
        <button className="btn btn-gold btn-lg" onClick={onCta}>{ctaLabel} <IoArrowForward /></button>
      </div>
    </section>
  )
}
