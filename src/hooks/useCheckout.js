// src/hooks/useCheckout.js — the convergence point for all three ordering paths.
// Both online paths (and, when they choose to log in, walk-ins) funnel through placeOrder():
//   guest  → save draft, bounce to sign-in, resume in Checkout (spec §2 gate)
//   authed → create the order (state machine starts at waiting_for_seller) → payment
import { useSession } from '../context/SessionContext.jsx'
import { useOrders } from '../context/OrderContext.jsx'
import { navigate } from '../utils/navigation.js'
import { saveDraft, clearDraft } from '../utils/draftOrder.js'

export function useCheckout() {
  const { isAuthenticated, user } = useSession()
  const { createOrderRecord } = useOrders()

  /**
   * Place an online order from a completed quote.
   * @param path 'guided' | 'instant' | 'walkin'
   * @param form full form incl. hasDesign
   * @param qty  production quantity
   * @param delivery {recipient, phone, line, city} — where to actually deliver the
   *   order. Required: the order used to be able to reach 'delivered' with the system
   *   never knowing where to. Resolved by AddressPicker (either a saved address or one
   *   typed inline at checkout).
   */
  async function placeOrder({ path, form, qty, delivery }) {
    // Always stash the draft so nothing is lost on the auth redirect.
    saveDraft({ path, form, qty, delivery })

    if (!isAuthenticated) {
      // Locked gate (spec §2): sign in before placing. Resume at Checkout afterwards.
      navigate('?page=auth&next=' + encodeURIComponent('?page=checkout&resume=1'))
      return null
    }

    // Generic passthrough: if any path's form ever carries a phone (none currently do —
    // WalkInForm's own "Contact number" field was removed 2026-08-13, and the online paths
    // never had one), it lands in orders.customer_phone instead of being silently dropped.
    // Right now this always resolves to null; see CLAUDE.md §8 for the resulting gap.
    const customer = { name: user.name, email: user.email, phone: form.phone || null }
    const order = await createOrderRecord({ path, form, qty, customer, delivery })
    clearDraft()
    navigate('?page=payment&id=' + order.id)
    return order
  }

  /**
   * A guest reaching the address step (not yet resolved a delivery — AddressPicker is
   * gated behind sign-in, so they can never produce one). Stash the garment-spec draft
   * (no `delivery` yet) and bounce to sign-in; Checkout resumes with a real, authenticated
   * AddressPicker so the address they pick actually gets saved, not just typed and lost.
   */
  function redirectToSignIn({ path, form, qty }) {
    saveDraft({ path, form, qty })
    // resume=1 is what authorises Checkout to re-apply the draft above. Without it
    // Checkout reads no draft and bounces to ?page=start, throwing the quote away —
    // same gate WalkInForm.jsx's signInToContinue() uses for the kiosk.
    navigate('?page=auth&next=' + encodeURIComponent('?page=checkout&resume=1'))
  }

  return { placeOrder, redirectToSignIn }
}
