// src/pages/WalkInsInfo.jsx
// "For Walk-Ins" page — shown when an online visitor chooses walk-in.
// In-person instruction (address + live map), NOT the on-site QR kiosk flow.
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import { FaLocationDot } from 'react-icons/fa6'
import { navigate } from '../utils/navigation.js'
import '../design/WalkInsInfo.css'

const STUDIO_ADDRESS = '117 Mother Ignacia Ave, Diliman, Quezon City, Metro Manila'
const MAPS_LINK = 'https://maps.google.com/?q=117+Mother+Ignacia+Ave+Diliman+Quezon+City'
const MAPS_EMBED =
  'https://maps.google.com/maps?q=117%20Mother%20Ignacia%20Ave%2C%20Diliman%2C%20Quezon%20City&t=&z=16&ie=UTF8&iwloc=&output=embed'

export default function WalkInsInfo() {
  return (
    <div className="walkins-page">
      <Navbar />

      <section className="walkins-hero">
        <div className="walkins-copy">
          <span className="walkins-eyebrow">This tab is for in-store visits</span>
          <h1 className="walkins-title">This one’s<br />in person.</h1>
          <p className="walkins-lead">
            The For Walk-Ins experience is our guided, in-store ordering flow — it starts
            when you scan the QR code at our entrance. To use it, drop by our Quezon City
            studio at the address below.
          </p>

          <div className="walkins-address">
            <span className="walkins-pin"><FaLocationDot /></span>
            <div>
              <div className="walkins-address-label">Visit us at</div>
              <div className="walkins-address-value">
                117 Mother Ignacia Ave, Diliman,<br />Quezon City, Metro Manila
              </div>
            </div>
          </div>

          <div className="walkins-actions">
            <a className="walkins-btn walkins-btn--dark" href={MAPS_LINK} target="_blank" rel="noopener noreferrer">
              Get directions →
            </a>
            <button className="walkins-btn walkins-btn--ghost" onClick={() => navigate('?page=direct-form')}>
              Get instant quote
            </button>
          </div>

          <p className="walkins-foot">
            Ordering online instead? Skip the trip and use{' '}
            <a onClick={() => navigate('?page=direct-form')}>Get Instant Quote</a> or{' '}
            <a onClick={() => navigate('?page=walkthrough')}>Start an Order</a> — no visit required.
          </p>
        </div>

        <div className="walkins-map-card">
          <iframe
            title="Sorbetes Apparel Studio map"
            src={MAPS_EMBED}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <div className="walkins-map-foot">
            <div>
              <div className="walkins-map-name">Sorbetes Apparel Studio</div>
              <div className="walkins-map-addr">{STUDIO_ADDRESS}</div>
            </div>
            <a href={MAPS_LINK} target="_blank" rel="noopener noreferrer">Open in maps ↗</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
