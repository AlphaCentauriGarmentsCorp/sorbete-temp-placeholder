// src/pages/Checkout.jsx — post-sign-in resume step (gated by RequireAuth in App).
// A guest who hit "Place order" was bounced to Google sign-in with next=?page=checkout.
// Now authenticated, we read the stashed draft, create the order, and continue to payment.
import { useEffect, useRef, useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import { useSession } from '../context/SessionContext.jsx'
import { useOrders } from '../context/OrderContext.jsx'
import { navigate } from '../utils/navigation.js'
import { loadDraft, clearDraft } from '../utils/draftOrder.js'

export default function Checkout() {
  const { user } = useSession()
  const { createOrderRecord } = useOrders()
  const ran = useRef(false)
  const [err, setErr] = useState(false)

  useEffect(() => {
    if (ran.current) return // guard double-create (StrictMode / re-render)
    ran.current = true
    const draft = loadDraft()
    if (!draft) {
      navigate('?page=start')
      return
    }
    createOrderRecord({
      path: draft.path,
      form: draft.form,
      qty: draft.qty,
      customer: { name: user.name, email: user.email },
    })
      .then((order) => {
        clearDraft()
        navigate('?page=payment&id=' + order.id)
      })
      .catch(() => setErr(true))
  }, [createOrderRecord, user])

  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <div className="stub">
          <div className="stub-eyebrow">Placing your order</div>
          <h1>{err ? 'Something went wrong' : 'Finalizing…'}</h1>
          <p>
            {err
              ? 'We couldn’t place your order. Please head back and try again.'
              : 'Creating your order and taking you to payment.'}
          </p>
          {err && (
            <div className="stub-links">
              <button className="btn btn-gold" onClick={() => navigate('?page=start')}>
                Back to start
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
