// src/pages/App.jsx — query-param router (?page=…). Single source of route → component.
import { useSyncExternalStore } from 'react'
import { getPageParam, onNavigate } from '../utils/navigation.js'
import RequireAuth from '../components/RequireAuth.jsx'

import Home from './Home.jsx'
import ChoosePath from './ChoosePath.jsx'
import Auth from './Auth.jsx'
import Stub from './Stub.jsx'

// Phase 2 — ordering flow
import GuidedWalkthrough from './GuidedWalkthrough.jsx'
import DirectForm from './DirectForm.jsx'
import WalkInsInfo from './WalkInsInfo.jsx'
import WalkInForm from './WalkInForm.jsx'
import Checkout from './Checkout.jsx'
import Payment from './Payment.jsx'

// Subscribe the whole app to route changes with one external store.
function usePage() {
  return useSyncExternalStore(onNavigate, getPageParam, getPageParam)
}

// Pages not yet built get a branded placeholder so navigation stays live.
// Real components replace these entries phase by phase.
const STUBS = {
  'our-story': { title: 'Our Story', phase: 5 },
  services: { title: 'Services', phase: 5 },
  portfolio: { title: 'Portfolio', phase: 5 },
  'portfolio-expanded': { title: 'Portfolio — Case Study', phase: 5 },
  guide: { title: 'Ordering Guide', phase: 5 },
  'fabric-print-guide': { title: 'Fabric & Print Guide', phase: 5 },
  'founders-club': { title: "Founder's Club", phase: 5 },
  'founders-club-guide': { title: "Founder's Club Guide", phase: 5 },
  'get-in-touch': { title: 'Get in Touch', phase: 5 },
  'quick-quote': { title: 'Quick Quote', phase: 5 },
  pricing: { title: 'Pricing', phase: 5 },
  mockup: { title: 'Logo Mockup Tool', phase: 6 },
}

// Auth-gated dashboard routes — Phase 4. Wrapped in RequireAuth (Google sign-in).
const GATED_STUBS = {
  'my-orders': { title: 'My Orders', phase: 4 },
  'my-orders-info': { title: 'Order Details', phase: 4 },
  'track-order': { title: 'Track Order', phase: 4 },
  account: { title: 'Account', phase: 4 },
  address: { title: 'Saved Addresses', phase: 4 },
  rewards: { title: 'Rewards', phase: 4 },
  notifications: { title: 'Notifications', phase: 4 },
  chatbot: { title: 'Support Chat', phase: 4 },
}

export default function App() {
  const page = usePage()

  // Fully built pages
  if (page === 'home') return <Home />
  if (page === 'start') return <ChoosePath />
  if (page === 'auth') return <Auth />

  // Ordering flow (Phase 2) — quote-building is open to guests
  if (page === 'walkthrough') return <GuidedWalkthrough />
  if (page === 'direct-form') return <DirectForm />
  if (page === 'walk-ins') return <WalkInsInfo />
  if (page === 'walk-in') return <WalkInForm />
  if (page === 'payment') return <Payment /> // reachable by online (authed) + walk-in (SMS) orders

  // Order placement resume — requires sign-in (spec §2 gate)
  if (page === 'checkout') {
    return (
      <RequireAuth>
        <Checkout />
      </RequireAuth>
    )
  }

  // Auth-gated placeholders
  if (GATED_STUBS[page]) {
    const s = GATED_STUBS[page]
    return (
      <RequireAuth>
        <Stub title={s.title} phase={s.phase} />
      </RequireAuth>
    )
  }

  // Public placeholders
  if (STUBS[page]) {
    const s = STUBS[page]
    return <Stub title={s.title} phase={s.phase} />
  }

  // Unknown route → Home (query-param routing has no 404 surface of its own).
  return <Home />
}
