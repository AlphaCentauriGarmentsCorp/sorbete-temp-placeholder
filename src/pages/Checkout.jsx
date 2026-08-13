// src/pages/Checkout.jsx — post-sign-in resume step (gated by RequireAuth in App).
// A guest who reached the address step was bounced to sign-in with next=?page=checkout,
// BEFORE picking a delivery address (AddressPicker only ever renders when authenticated —
// see QuoteSummary.jsx). So the resumed draft almost never carries a `delivery` yet; we
// re-show the quote here, address step already open, now against a real, authenticated
// AddressPicker so whatever they pick actually gets saved to their address book.
//
// `draft.delivery` can still be truthy in one rare case: the token expired between an
// already-resolved AddressPicker selection and the final "Place order" click (placeOrder()
// in useCheckout.js has its own defensive `if (!isAuthenticated)` bounce for that). That
// case is safe to finalize immediately — the address was already real when it was chosen.
import { useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import QuoteSummary from './QuoteSummary.jsx'
import StubScreen from '../components/StubScreen.jsx'
import { useSession } from '../context/SessionContext.jsx'
import { useOrders } from '../context/OrderContext.jsx'
import { navigate, getParam } from '../utils/navigation.js'
import { loadDraft, clearDraft } from '../utils/draftOrder.js'
import '../design/Checkout.css'

export default function Checkout() {
  const { user } = useSession()
  const { createOrderRecord } = useOrders()
  const ran = useRef(false) // guards double-submit (StrictMode / re-render)
  const [err, setErr] = useState(false)
  const [finalizing, setFinalizing] = useState(false)
  // Read once, not on every render — and ONLY when we actually came back from the sign-in
  // redirect, which useCheckout.js marks with ?resume=1. Without that gate an abandoned
  // sign-in leaves a draft in localStorage that silently resumes on some unrelated later
  // visit; see WalkInForm.jsx, where the same defect was reported on the kiosk.
  const [draft] = useState(() => (getParam('resume') === '1' ? loadDraft() : null))

  function finalize(delivery) {
    if (ran.current) return
    ran.current = true
    setFinalizing(true)
    createOrderRecord({
      path: draft.path,
      form: draft.form,
      qty: draft.qty,
      customer: { name: user.name, email: user.email, phone: draft.form?.phone || null },
      delivery,
    })
      .then((order) => {
        clearDraft()
        navigate('?page=payment&id=' + order.id)
      })
      .catch(() => {
        ran.current = false
        setFinalizing(false)
        setErr(true)
      })
  }

  useEffect(() => {
    if (!draft) {
      navigate('?page=start')
      return
    }
    // Defensive path: a delivery was already resolved (real, persisted) before the
    // sign-in bounce — finalize straight away, same as before this change.
    if (draft.delivery) finalize(draft.delivery)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!draft) return null

  if (draft.delivery || finalizing) {
    return (
      <StubScreen
        eyebrow="Placing your order"
        title={err ? 'Something went wrong' : 'Finalizing…'}
        actions={err && (
          <button className="btn btn-gold" onClick={() => navigate('?page=start')}>
            Back to start
          </button>
        )}
      >
        {err
          ? 'We couldn’t place your order. Please head back and try again.'
          : 'Creating your order and taking you to payment.'}
      </StubScreen>
    )
  }

  return (
    <div className="checkout-page">
      <Navbar />
      <div className="checkout-quote-wrap">
        <QuoteSummary form={draft.form} qty={draft.qty} initialShowAddress onProceed={finalize} />
        {err && <p className="checkout-err">We couldn’t place your order. Please try again.</p>}
      </div>
      <Footer />
    </div>
  )
}
