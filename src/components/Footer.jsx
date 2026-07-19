// src/components/Footer.jsx — site-wide footer + persistent "Chat with us" trigger.
import { useState } from 'react'
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
          <div className="foot-addr">117 Mother Ignacia Ave, Diliman, Quezon City</div>
          <button className="btn btn-gold foot-chat" onClick={() => setChatOpen(true)}>
            Chat with us
          </button>
        </div>

        <div className="foot-cols">
          {COLS.map((col) => (
            <div className="foot-col" key={col.heading}>
              <div className="foot-h">{col.heading}</div>
              {col.links.map((l) => (
                <button key={l.page} className="foot-link" onClick={() => navigate('?page=' + l.page)}>
                  {l.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="foot-legal">
        <span>© {2026} Sorbetes Apparel Studio</span>
        <span className="foot-legal-links">
          <button onClick={() => navigate('?page=our-story')}>About</button>
          <button onClick={() => navigate('?page=get-in-touch')}>Contact</button>
        </span>
      </div>

      <ChatSheet open={chatOpen} onClose={() => setChatOpen(false)} />
    </footer>
  )
}
