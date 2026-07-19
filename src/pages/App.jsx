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

// Phase 4 — signed-in dashboard (all gated)
import MyOrders from './MyOrders.jsx'
import OrderInfo from './OrderInfo.jsx'
import TrackOrder from './TrackOrder.jsx'
import Account from './Account.jsx'
import Address from './Address.jsx'
import Rewards from './Rewards.jsx'
import Notifications from './Notifications.jsx'
import Chatbot from './Chatbot.jsx'

// Phase 5 — marketing / content
import OurStory from './OurStory.jsx'
import Services from './Services.jsx'
import Portfolio from './Portfolio.jsx'
import OrderingGuide from './OrderingGuide.jsx'
import FabricPrintGuide from './FabricPrintGuide.jsx'
import FoundersClub from './FoundersClub.jsx'
import GetInTouch from './GetInTouch.jsx'
import QuickQuote from './QuickQuote.jsx'
import Pricing from './Pricing.jsx'

// Subscribe the whole app to route changes with one external store.
function usePage() {
  return useSyncExternalStore(onNavigate, getPageParam, getPageParam)
}

// Pages not yet built get a branded placeholder so navigation stays live.
const STUBS = {
  mockup: { title: 'Logo Mockup Tool', phase: 6 },
}

const gate = (el) => <RequireAuth>{el}</RequireAuth>

export default function App() {
  const page = usePage()

  // Public / built pages
  if (page === 'home') return <Home />
  if (page === 'start') return <ChoosePath />
  if (page === 'auth') return <Auth />

  // Marketing / content (Phase 5)
  if (page === 'our-story') return <OurStory />
  if (page === 'services') return <Services />
  if (page === 'portfolio' || page === 'portfolio-expanded') return <Portfolio />
  if (page === 'guide') return <OrderingGuide />
  if (page === 'fabric-print-guide') return <FabricPrintGuide />
  if (page === 'founders-club' || page === 'founders-club-guide') return <FoundersClub />
  if (page === 'get-in-touch') return <GetInTouch />
  if (page === 'quick-quote') return <QuickQuote />
  if (page === 'pricing') return <Pricing />

  // Ordering flow (Phase 2) — quote-building is open to guests
  if (page === 'walkthrough') return <GuidedWalkthrough />
  if (page === 'direct-form') return <DirectForm />
  if (page === 'walk-ins') return <WalkInsInfo />
  if (page === 'walk-in') return <WalkInForm />
  if (page === 'payment') return <Payment /> // reachable by online (authed) + walk-in (SMS) orders

  // Sign-in-gated (spec §2): placement resume + dashboard/tracking
  if (page === 'checkout') return gate(<Checkout />)
  if (page === 'my-orders') return gate(<MyOrders />)
  if (page === 'my-orders-info') return gate(<OrderInfo />)
  if (page === 'track-order') return gate(<TrackOrder />)
  if (page === 'account') return gate(<Account />)
  if (page === 'address') return gate(<Address />)
  if (page === 'rewards') return gate(<Rewards />)
  if (page === 'notifications') return gate(<Notifications />)
  if (page === 'chatbot') return gate(<Chatbot />)

  // Public placeholders (Phase 5 / 6)
  if (STUBS[page]) {
    const s = STUBS[page]
    return <Stub title={s.title} phase={s.phase} />
  }

  // Unknown route → Home (query-param routing has no 404 surface of its own).
  return <Home />
}
