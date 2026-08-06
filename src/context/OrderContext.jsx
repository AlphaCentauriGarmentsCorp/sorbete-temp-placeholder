// src/context/OrderContext.jsx — order store backed by the real Laravel API.
// Every action here calls the real backend (src/api/orders.js) — the server is the
// source of truth. Staff-side transitions (accept_order, approve/reject payment review,
// sample_ready, classify_defect, ship) go through demoAdvance(), a temporary owner-
// authorized stand-in for the staff console that doesn't exist yet (see the backend's
// OrderActionController::demoAdvance doc comment) — Sorbetes has no staff accounts by
// design, so this is what lets the "Seller / staff — demo" panel in Payment.jsx actually
// drive the order forward for real instead of just mutating local state.
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import * as ordersApi from '../api/orders.js'
import { useSession } from './SessionContext.jsx'

const OrderContext = createContext(null)

const PATH_LABEL = {
  guided: 'Guided walkthrough',
  instant: 'Instant builder',
  walkin: 'Walk-in',
}
const pathLabel = (p) => PATH_LABEL[p] || p

export function OrderProvider({ children }) {
  const { isAuthenticated } = useSession()
  const [orders, setOrders] = useState([])

  // Load the signed-in user's real orders from the server. Guests (not signed in)
  // simply have none to load — walk-in and online order creation both require sign-in.
  useEffect(() => {
    if (!isAuthenticated) {
      setOrders([])
      return
    }
    let cancelled = false
    ordersApi.listOrders().then((list) => {
      if (!cancelled) setOrders(list)
    })
    return () => { cancelled = true }
  }, [isAuthenticated])

  const replaceOrder = useCallback((updated) => {
    setOrders((os) => (os.some((o) => o.id === updated.id)
      ? os.map((o) => (o.id === updated.id ? updated : o))
      : [updated, ...os]))
  }, [])

  /** Create + persist a new order via the real API. Returns the server record. */
  const createOrderRecord = useCallback(async ({ form, qty, path, customer, delivery }) => {
    const order = await ordersApi.createOrder({ form, qty, path, customer, delivery })
    setOrders((os) => [order, ...os])
    return order
  }, [])

  const getById = useCallback((id) => orders.find((o) => o.id === id), [orders])

  // Orders are already scoped to the signed-in user server-side (user_id) —
  // the email param is kept only for backward compatibility with existing callers.
  const listForUser = useCallback(() => orders, [orders])

  /**
   * Apply a state-machine event. 'approve_sample' is a client action with its own
   * dedicated endpoint; every other event (the staff-side ones) goes through
   * demoAdvance (see file header). 'request_changes' needs a message/attachment
   * payload demoAdvance has no room for — see requestSampleChanges below.
   */
  const advance = useCallback(
    async (id, event, payload = {}) => {
      const updated = event === 'approve_sample'
        ? await ordersApi.approveSample(id)
        : await ordersApi.demoAdvance(id, event, payload)
      replaceOrder(updated)
    },
    [replaceOrder],
  )

  /** Client flags the sample for changes, with what they actually want changed. */
  const requestSampleChanges = useCallback(
    async (id, message, attachment) => {
      const updated = await ordersApi.requestChanges(id, message, attachment)
      replaceOrder(updated)
    },
    [replaceOrder],
  )

  /**
   * Client pays the currently-due step. The backend derives the type/amount from the
   * order's own state and decides review vs. auto-approval (balance settles straight
   * through; sample fee/downpayment always go to manual review, cash included — there's
   * no fast-path shortcut server-side).
   */
  const pay = useCallback(
    async (id, { channel, ref, proof } = {}) => {
      const updated = await ordersApi.submitPayment(id, { channel, ref, proof })
      replaceOrder(updated)
    },
    [replaceOrder],
  )

  /** Staff decision on the latest under-review proof. */
  const reviewProof = useCallback(
    async (id, decision, reason) => {
      const updated = await ordersApi.reviewPayment(id, decision, reason)
      replaceOrder(updated)
    },
    [replaceOrder],
  )

  const patchOrder = useCallback((id, patch) => {
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, ...patch, updatedAt: new Date().toISOString() } : o)))
  }, [])

  const value = useMemo(
    () => ({ orders, createOrderRecord, getById, listForUser, advance, requestSampleChanges, pay, reviewProof, patchOrder, pathLabel }),
    [orders, createOrderRecord, getById, listForUser, advance, requestSampleChanges, pay, reviewProof, patchOrder],
  )

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export function useOrders() {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrders must be used within <OrderProvider>')
  return ctx
}
