// src/components/ConceptToProduction.jsx — the "Concept to Production" services section.
//
// Second port from the old frontend (Homepage.jsx's `.hp-services`), 2026-08-13. Unlike the
// Founders Club carousel, this one WAS already real markup over there, so the port is a
// straight design + copy + asset lift rather than a rebuild — see CLAUDE.md §7 for why that
// distinction matters before porting anything else.
//
// The alternating text-left / image-left rhythm is the whole idea of the layout, so it's
// data-driven off `layout` exactly as the original was.
import { navigate } from '../utils/navigation.js'
import { IoArrowForward } from 'react-icons/io5'
import '../design/ConceptToProduction.css'

const SERVICES = [
  {
    slug: 'clothing-production',
    title: 'Custom Clothing Production',
    text: "Bring your ideas to life with fully customized apparel tailored to your vision. From fabrics to finishes, we help you design and produce pieces that represent your brand's style.",
    layout: 'text-image',
  },
  {
    slug: 'print-packages',
    title: 'Shirt + Print Packages',
    text: 'Pair quality shirts with full customization and scaled production options. From style selection to print execution, we help you build ready-to-sell pieces for your brand or store.',
    layout: 'image-text',
  },
  {
    slug: 'printing-services',
    title: 'Printing Services',
    text: 'We offer high-quality printing using durable ink and proven techniques like silkscreen printing, direct transfer, color details, and long-lasting prints on every garment.',
    layout: 'text-image',
  },
  {
    slug: 'garment-making',
    title: 'Cut & Sew Garment Making',
    text: 'From fabric selection to final packaging, we handle the entire production process. This end-to-end service is ideal for brands looking for custom-made apparel from concept to completion.',
    layout: 'image-text',
  },
  {
    slug: 'ready-made-items',
    title: 'Ready-Made Items',
    text: 'Choose from our collection of ready-made apparel, including shirts, hoodies, jackets, socks, shorts, and more, ready to print, brand, and merchandize.',
    layout: 'text-image',
  },
]

export default function ConceptToProduction() {
  return (
    <section className="ctp" aria-label="Our services">
      <div className="ctp-inner">
        <div className="ctp-label">
          <span className="ctp-label-line" aria-hidden="true" />
          <span className="ctp-label-text">Our services</span>
        </div>

        <div className="ctp-intro">
          <h2 className="ctp-heading">Concept to Production</h2>
          <p className="ctp-copy">
            Everything you need to bring your apparel ideas to life, thoughtfully crafted
            through expert production, precision detailing, and a seamless end-to-end process.
          </p>
        </div>

        <div className="ctp-list">
          {SERVICES.map((s) => (
            <article className={'ctp-row ctp-row--' + s.layout} key={s.slug}>
              <div className="ctp-rowcopy">
                <h3 className="ctp-title">{s.title}</h3>
                <p className="ctp-text">{s.text}</p>
              </div>
              <div className="ctp-media">
                {/* lazy + explicit ratio: five large photos below the fold otherwise cost the
                    homepage its LCP, and a missing ratio makes the rows jump as they load. */}
                <img src={`/services/${s.slug}.jpg`} alt={s.title} loading="lazy" decoding="async" />
              </div>
            </article>
          ))}
        </div>

        <button type="button" className="ctp-cta" onClick={() => navigate('?page=pricing')}>
          See pricing <IoArrowForward />
        </button>
      </div>
    </section>
  )
}
