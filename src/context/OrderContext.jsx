// src/context/OrderContext.jsx — client-side order store (mock persistence).
// Source of truth for the frontend build: orders live in localStorage, seeded from
// mockData. Calls the mock API boundary (src/mocks/api.js) for "server" actions and
// applies the §6 state machine via transition(). A real backend replaces the persistence
// + api calls without changing this component's public shape.
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { quoteTotals } from '../data/orderConfig.js'
import { transition, INITIAL_STATE } from '../data/orderStates.js'
import * as api from '../mocks/api.js'
import { SEED_ORDERS } from '../data/mockData.js'

const STORAGE_KEY = 'sorbetes_orders'
const OrderContext = createContext(null)

const PATH_LABEL = {
  guided: 'Guided walkthrough',
  instant: 'Instant builder',
  walkin: 'Walk-in',
}

const now = () => new Date().toISOString()

function loadOrders() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return SEED_ORDERS
}

// Human-readable default timeline note for a transition event.
function noteFor(event, payload) {
  switch (event) {
    case 'accept_order': return 'Seller accepted — sample fee requested'
    case 'submit_proof': return `Payment proof submitted${payload.channel ? ` (${payload.channel})` : ''}`
    case 'approve_payment': return 'Payment verified'
    case 'reject_payment': return `Payment rejected${payload.reason ? `: ${payload.reason}` : ''}`
    case 'sample_ready': return 'Sample ready for review'
    case 'approve_sample': return 'Sample approved (no changes)'
    case 'classify_defect':
      return payload.classification === 'major'
        ? 'Major change — new sample fee, remaking'
        : 'Minor change — fixed in-house'
    case 'ship': return 'Order ready for pickup/delivery'
    case 'pay_balance': return 'Balance settled — delivered'
    default: return ''
  }
}

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState(loadOrders)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(orders))
    } catch {
      /* quota — ignore for the mock */
    }
  }, [orders])

  const patchOrder = useCallback((id, patch) => {
    setOrders((os) => os.map((o) => (o.id === id ? { ...o, ...patch, updatedAt: now() } : o)))
  }, [])

  /** Create + persist a new order from a completed quote. Returns the record. */
  const createOrderRecord = useCallback(async ({ form, qty, path, customer }) => {
    const totals = quoteTotals(form, qty)
    // TODO: replace with real API — see FRONTEND-BUILD-SPEC.md §3 (src/mocks/api.js)
    const server = await api.createOrder({ form, qty, path, customer, totals })
    const record = {
      ...server,
      totals,
      payments: [],
      timeline: [{ status: INITIAL_STATE, at: server.createdAt, note: `Order placed via ${PATH_LABEL[path] || path}` }],
      updatedAt: server.createdAt,
    }
    setOrders((os) => [record, ...os])
    return record
  }, [])

  const getById = useCallback((id) => orders.find((o) => o.id === id), [orders])

  const listForUser = useCallback(
    (email) => (email ? orders.filter((o) => o.customer?.email === email) : orders),
    [orders],
  )

  /**
   * Apply a state-machine event to an order (appends a timeline entry).
   * payload may carry { classification, reason, channel, note, patch } — `patch` merges
   * extra fields (e.g. an appended payment record). Returns the next status, or null if invalid.
   */
  const advance = useCallback(
    (id, event, payload = {}) => {
      const order = orders.find((o) => o.id === id)
      if (!order) return null
      let next
      try {
        next = transition(order.status, event, payload)
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn(err.message)
        return null
      }
      const entry = { status: next, at: now(), note: payload.note || noteFor(event, payload) }
      patchOrder(id, {
        status: next,
        timeline: [...order.timeline, entry],
        ...(payload.patch || {}),
      })
      return next
    },
    [orders, patchOrder],
  )

  const value = {
    orders,
    createOrderRecord,
    getById,
    listForUser,
    advance,
    patchOrder,
    pathLabel: (p) => PATH_LABEL[p] || p,
  }

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}

export function useOrders() {
  const ctx = useContext(OrderContext)
  if (!ctx) throw new Error('useOrders must be used within <OrderProvider>')
  return ctx
}
