// src/pages/TrackOrder.jsx — read-only §6 stage tracker (?page=track-order&id=…), gated.
// Fixes SYSTEM-FLOW §7 item 10: adds the missing "order not found" state for unknown ids.
import { useState } from 'react'
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import StatusPill from '../components/StatusPill.jsx'
import OrderCard from '../components/OrderCard.jsx'
import { IoSearch, IoArrowForward } from 'react-icons/io5'
import { getParam, navigate } from '../utils/navigation.js'
import { useSession } from '../context/SessionContext.jsx'
import { useOrders } from '../context/OrderContext.jsx'
import { HAPPY_PATH, getState } from '../data/orderStates.js'
import { styleById } from '../data/orderConfig.js'
import { fmtDateTime } from '../utils/format.js'
import '../design/dashboard.css'

// Latest timeline entry for a given state (states can recur via the major-defect loop).
function reachedAt(order, status) {
  for (let i = order.timeline.length - 1; i >= 0; i--) {
    if (order.timeline[i].status === status) return order.timeline[i]
  }
  return null
}

function Tracker({ order }) {
  const cur = HAPPY_PATH.indexOf(order.status)
  return (
    <div className="trk-steps">
      {HAPPY_PATH.map((st, i) => {
        const phase = i < cur ? 'done' : i === cur ? 'active' : 'todo'
        const s = getState(st)
        const hit = reachedAt(order, st)
        return (
          <div className={'trk-step trk-step--' + phase} key={st}>
            <div className="trk-rail">
              <span className="trk-node">{phase === 'done' ? '✓' : i + 1}</span>
              <span className="trk-line" />
            </div>
            <div className="trk-body">
              <div className="trk-label">{s.label}</div>
              {phase !== 'todo' && <div className="trk-note">{hit?.note || s.desc}</div>}
              {hit && <div className="trk-date">{fmtDateTime(hit.at)}</div>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function TrackOrder() {
  const { user } = useSession()
  const { getById, listForUser } = useOrders()
  const id = getParam('id')
  const order = id ? getById(id) : null
  const [query, setQuery] = useState('')
  const mine = [...listForUser(user.email)].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

  const lookup = () => {
    const q = query.trim().toLowerCase()
    if (!q) return
    const hit = mine.find((o) => o.ref.toLowerCase() === q || o.id.toLowerCase() === q)
    navigate('?page=track-order&id=' + (hit ? hit.id : encodeURIComponent(query.trim())))
  }

  // With an id that doesn't resolve → not found (the §7 gap).
  const notFound = id && !order

  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <div className="dash">
          <div className="dash-head">
            <div>
              <div className="dash-eyebrow">Order status</div>
              <h1 className="dash-title">Track order</h1>
            </div>
          </div>

          {/* lookup */}
          <div className="trk-lookup">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && lookup()}
              placeholder="Enter an order number (e.g. SB-2601)"
            />
            <button className="btn btn-dark" onClick={lookup}><IoSearch /> Track</button>
          </div>

          {notFound && (
            <div className="panel trk-notfound">
              <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 900, margin: '0 0 8px' }}>Order not found</h2>
              <p style={{ color: 'var(--muted)', margin: 0 }}>
                No order matches <strong>{decodeURIComponent(id)}</strong> in your account. Check the
                number and try again, or pick one below.
              </p>
            </div>
          )}

          {order && (
            <>
              <div className="panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div>
                  <div className="order-ref">{order.ref}</div>
                  <div className="order-meta">{order.qty} pcs · {styleById(order.form.style).label}</div>
                </div>
                <StatusPill tone={getState(order.status).tone}>{getState(order.status).label}</StatusPill>
              </div>
              <div className="panel">
                <div className="panel-h">Progress</div>
                <Tracker order={order} />
              </div>
              <div className="detail-actions">
                <button className="btn btn-ghost" onClick={() => navigate('?page=my-orders-info&id=' + order.id)}>Order details</button>
                {getState(order.status).tone === 'action' && (
                  <button className="btn btn-gold" onClick={() => navigate('?page=payment&id=' + order.id)}>
                    Take action <IoArrowForward />
                  </button>
                )}
              </div>
            </>
          )}

          {/* pick from my orders (shown when no order is loaded) */}
          {!order && (
            <div className="panel">
              <div className="panel-h">Your orders</div>
              {mine.length === 0 ? (
                <p style={{ color: 'var(--muted)', margin: 0 }}>No orders yet.</p>
              ) : (
                <div className="orders">
                  {mine.map((o) => (
                    <OrderCard
                      key={o.id}
                      order={o}
                      meta={`${o.qty} pcs · ${styleById(o.form.style).label}`}
                      icon={IoArrowForward}
                      onClick={() => navigate('?page=track-order&id=' + o.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
