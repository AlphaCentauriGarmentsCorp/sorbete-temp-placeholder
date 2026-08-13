// src/components/WhyChooseUs.jsx — the "Why Choose us?" / ABOUT US section.
//
// Third port from the old frontend (Homepage.jsx's `.hp-why`), 2026-08-13. Like
// ConceptToProduction and unlike the Founders Club carousel, this was already real markup
// over there, so it's a straight design + copy lift.
//
// The coloured icons are deliberate — they're the one spot of colour in an otherwise
// black-outline layout, and they're what makes the five rows scannable rather than a wall of
// identical pills. Kept at the original hues rather than flattened to the site's tokens.
import { FaStar, FaAward, FaLocationDot, FaUsers } from 'react-icons/fa6'
import { MdHandshake } from 'react-icons/md'
import '../design/WhyChooseUs.css'

const REASONS = [
  {
    icon: <FaStar />,
    tone: 'star',
    title: 'Established Experience',
    text: 'Operating since 2002, we bring years of industry knowledge and hands-on expertise to every project.',
  },
  {
    icon: <MdHandshake />,
    tone: 'handshake',
    title: 'Trusted by Brands',
    text: 'We have worked with respected local and national brands who continue to choose us for our reliability and results.',
  },
  {
    icon: <FaAward />,
    tone: 'medal',
    title: 'Quality-Driven',
    text: 'Every project is handled with attention to detail and a commitment to high standards.',
  },
  {
    icon: <FaLocationDot />,
    tone: 'ph',
    title: 'Local Expertise',
    text: 'Based in Quezon City, we understand the local market while delivering professional-level service.',
  },
  {
    icon: <FaUsers />,
    tone: 'people',
    title: 'Client-Focused Approach',
    text: 'We value long-term partnerships and treat every project as a collaborative effort.',
  },
]

export default function WhyChooseUs() {
  return (
    <section className="why" aria-label="Why choose us">
      <div className="why-inner">
        <div className="why-label" data-reveal>
          <span className="why-label-line" aria-hidden="true" />
          <span className="why-label-text">About us</span>
        </div>

        <div className="why-header" data-reveal>
          <h2 className="why-heading">Why Choose us?</h2>
          <p className="why-copy">
            Decades of experience, uncompromising quality, and trust you can rely on, crafted
            to deliver exceptional results you can be proud of.
          </p>
        </div>

        <div className="why-list">
          {REASONS.map((r) => (
            <article className="why-item" data-reveal key={r.title}>
              <div className="why-item-left">
                <span className={'why-icon why-icon--' + r.tone} aria-hidden="true">{r.icon}</span>
                <h3 className="why-item-title">{r.title}</h3>
              </div>
              <div className="why-item-right">
                <p className="why-item-text">{r.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
