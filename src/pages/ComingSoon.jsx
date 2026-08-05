// src/pages/ComingSoon.jsx — stand-in for online-ordering paths that aren't open yet.
// Current focus is the Guided walkthrough (scroll-and-scrub) and the in-store walk-in
// kiosk — every other online-ordering entry point (Instant builder, and any button that
// pointed to it) routes here instead of the real page, regardless of which button was
// clicked (App.jsx renders this for the route itself, so nothing else needs editing).
import StubScreen from '../components/StubScreen.jsx'
import { navigate } from '../utils/navigation.js'

export default function ComingSoon() {
  return (
    <StubScreen
      eyebrow="Coming soon"
      title="This ordering path isn't open yet"
      actions={
        <>
          <button className="btn btn-gold" onClick={() => navigate('?page=walkthrough')}>
            Try the guided walkthrough
          </button>
          <button className="btn btn-ghost" onClick={() => navigate('?page=walk-ins')}>
            Order in-store instead
          </button>
        </>
      }
    >
      We're still building this one out. For now, order online through the guided
      walkthrough, or visit our Quezon City studio to order in person.
    </StubScreen>
  )
}
