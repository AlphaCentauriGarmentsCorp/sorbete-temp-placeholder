// src/components/StickyCTA.jsx — global sticky action bar (Get Quote + Chat with us).
// Hidden at the top of the page; docks to the bottom once the visitor starts scrolling.
// "Get Quote" routes straight to the Instant builder (not the ballpark Quick Quote —
// that's the Navbar's separate "Get a quote" pill). Suppressed on pages that already
// carry their own sticky action bar (the Instant/Guided builders, the walk-in kiosk).
import { useEffect, useState } from 'react'
import { navigate } from '../utils/navigation.js'
import ChatSheet from './ChatSheet.jsx'
import '../design/chrome.css'

export default function StickyCTA() {
  const [visible, setVisible] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <div className={'sticky-cta' + (visible ? ' sticky-cta--on' : '')} aria-hidden={!visible}>
        <button className="sticky-cta-get" onClick={() => navigate('?page=direct-form')}>
          Get Quote
        </button>
        <button className="sticky-cta-chat" onClick={() => setChatOpen(true)}>
          Chat with us
        </button>
      </div>
      <ChatSheet open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  )
}
