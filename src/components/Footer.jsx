// src/components/Footer.jsx — site-wide footer + persistent "Chat with us" trigger.
//
// Reorganised 2026-08-13 (owner: "dun sa huling part ng website medj disorganize sya"), taking
// the OLD frontend's footer as inspiration for how the content is GROUPED rather than copying
// its layout: every block now sits under its own label — Order / Studio / Help / Contact us /
// Business hours / Follow us — instead of the previous mix of three tidy link columns beside a
// loose brand block that held a bare address and a stray button with nothing naming them.
//
// What that reorganisation actually added, all of it previously missing from the site
// entirely: an email address, a phone number, opening hours, and social links. The real
// business details come from the old frontend's own footer, which is the only place they were
// written down.
import { useState } from 'react'
import {
  IoLocationOutline, IoMailOutline, IoCallOutline, IoChatbubbleEllipsesOutline,
  IoLogoFacebook, IoLogoInstagram, IoLogoTiktok,
} from 'react-icons/io5'
import { navigate } from '../utils/navigation.js'
import ChatSheet from './ChatSheet.jsx'
import '../design/chrome.css'

const COLS = [
  {
    heading: 'Order',
    links: [
      { label: 'Start an order', page: 'start' },
      { label: 'Guided walkthrough', page: 'walkthrough' },
      { label: 'Instant builder', page: 'direct-form' },
      { label: 'For walk-ins', page: 'walk-ins' },
    ],
  },
  {
    heading: 'Studio',
    links: [
      { label: 'Our story', page: 'our-story' },
      { label: 'Services', page: 'services' },
      { label: 'Portfolio', page: 'portfolio' },
      { label: "Founder's Club", page: 'founders-club' },
    ],
  },
  {
    heading: 'Help',
    links: [
      { label: 'Ordering guide', page: 'guide' },
      { label: 'Fabric & print guide', page: 'fabric-print-guide' },
      { label: 'Get in touch', page: 'get-in-touch' },
      { label: 'Quick quote', page: 'quick-quote' },
    ],
  },
]

const SOCIALS = [
  { icon: <IoLogoFacebook />, label: 'Facebook', href: 'https://www.facebook.com/SorbetesApparel' },
  { icon: <IoLogoInstagram />, label: 'Instagram', href: 'https://www.instagram.com/sorbetesapparelstudio/' },
  { icon: <IoLogoTiktok />, label: 'TikTok', href: 'https://www.tiktok.com/@sorbetesapparelstudio.ph' },
]

export default function Footer() {
  const [chatOpen, setChatOpen] = useState(false)

  return (
    <footer className="foot">
      <div className="foot-inner">
        <div className="foot-brand">
          <div className="foot-word">Sorbetes</div>
          <p className="foot-tag">
            In-house custom apparel manufacturing. No middleman — we cut, sew, and print your
            order under one roof in Quezon City.
          </p>

          {/* Socials sit with the brand rather than at the tail of the contact column: they
              belong to the identity, and putting them here also evens the two outer columns
              out — contact + hours made the right side far taller than the left, leaving a
              block of dead space under the brand. */}
          <h2 className="foot-h foot-h--spaced">Follow us</h2>
          <div className="foot-socials">
            {SOCIALS.map((s) => (
              <a
                key={s.label}
                className="foot-social"
                href={s.href}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={s.label}
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {COLS.map((col) => (
          <nav className="foot-col" key={col.heading} aria-label={col.heading}>
            <h2 className="foot-h">{col.heading}</h2>
            <ul className="foot-list">
              {col.links.map((l) => (
                <li key={l.page}>
                  <button className="foot-link" onClick={() => navigate('?page=' + l.page)}>
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div className="foot-col foot-contact">
          <h2 className="foot-h">Contact us</h2>
          <ul className="foot-list">
            <li className="foot-line">
              <span className="foot-ico" aria-hidden="true"><IoLocationOutline /></span>
              <span>117 Mother Ignacia Ave., Diliman, Quezon City, Philippines</span>
            </li>
            <li className="foot-line">
              <span className="foot-ico" aria-hidden="true"><IoMailOutline /></span>
              <a href="mailto:sales@alphacentauri.ph">sales@alphacentauri.ph</a>
            </li>
            <li className="foot-line">
              <span className="foot-ico" aria-hidden="true"><IoCallOutline /></span>
              <a href="tel:+639614427409">0961 442 7409</a>
            </li>
            {/* Chat lives here with the other ways to reach the studio rather than as a lone
                gold button in the brand block, where it sat directly above the sticky bar's
                own "Chat with us" and read as a duplicate of it. */}
            <li className="foot-line">
              <span className="foot-ico" aria-hidden="true"><IoChatbubbleEllipsesOutline /></span>
              <button className="foot-link foot-link--inline" onClick={() => setChatOpen(true)}>
                Chat with us
              </button>
            </li>
          </ul>

          <h2 className="foot-h foot-h--spaced">Business hours</h2>
          <ul className="foot-list">
            <li className="foot-hours"><span>Mon – Sat</span><span>9:00 AM – 5:00 PM</span></li>
            <li className="foot-hours"><span>Sunday</span><span>Closed</span></li>
          </ul>
        </div>
      </div>

      <div className="foot-legal">
        <span>© 2002–2026 Sorbetes Apparel Studio. All rights reserved.</span>
        <span className="foot-legal-links">
          <button onClick={() => navigate('?page=our-story')}>About</button>
          <button onClick={() => navigate('?page=get-in-touch')}>Contact</button>
        </span>
      </div>

      <ChatSheet open={chatOpen} onClose={() => setChatOpen(false)} />
    </footer>
  )
}
