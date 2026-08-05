// src/pages/OrderInfo.jsx — read-only order summary (?page=my-orders-info&id=…), gated.
// Fixes SYSTEM-FLOW §7: adds a "Reorder" re-entry control (seeds the Instant builder).
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import StubScreen from '../components/StubScreen.jsx'
import StatusPill from '../components/StatusPill.jsx'
import { IoArrowBack, IoArrowForward, IoRepeatOutline } from 'react-icons/io5'
import { getParam, navigate } from '../utils/navigation.js'
import { useOrders } from '../context/OrderContext.jsx'
import { getState, isTerminal } from '../data/orderStates.js'
import { styleById, peso } from '../data/orderConfig.js'
import { saveReorder } from '../utils/draftOrder.js'
import { fmtDateTime } from '../utils/format.js'
import '../design/dashboard.css'

const PAY_LABEL = { sampleFee: 'Sample fee', dp: '60% downpayment', bal: '40% balance' }

export default function OrderInfo() {
  const { getById, pathLabel } = useOrders()
  const id = getParam('id')
  const order = id ? getById(id) : null

  if (!order) {
    return (
      <StubScreen
        eyebrow="Order"
        title="Order not found"
        actions={<button className="btn btn-gold" onClick={() => navigate('?page=my-orders')}>My orders</button>}
      >
        We couldn’t find that order in your account.
      </StubScreen>
    )
  }

  const s = getState(order.status)
  const f = order.form
  const cells = [
    ['Style / fit', styleById(f.style).label + ' · ' + (f.fit || '—')],
    ['Size', f.size || '—'],
    ['Collar', f.collar || '—'],
    ['Sleeve', f.sleeve || '—'],
    ['Hem', f.hem || '—'],
    ['Fabric', f.fabric || '—'],
    ['Color', f.color || '—'],
    ['Print', f.hasDesign ? (f.printColors || 1) + '-color' : 'Plain'],
    ['Placement', f.hasDesign ? f.placement || '—' : '—'],
  ]

  const reorder = () => {
    saveReorder({ form: { ...f, printChoice: f.hasDesign ? 'has' : 'none' }, qty: order.qty })
    navigate('?page=direct-form')
  }

  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <div className="dash">
          <button className="btn btn-ghost" style={{ marginBottom: 16 }} onClick={() => navigate('?page=my-orders')}>
            <IoArrowBack /> My orders
          </button>

          <div className="dash-head">
            <div>
              <div className="dash-eyebrow">{pathLabel(order.path)} · {order.qty} pcs</div>
              <h1 className="dash-title">{order.ref}</h1>
            </div>
            <StatusPill tone={s.tone}>{s.label}</StatusPill>
          </div>

          <div className="panel">
            <div className="panel-h">Specification</div>
            <div className="spec-grid">
              {cells.map(([k, v]) => (
                <div className="spec-cell" key={k}>
                  <div className="spec-k">{k}</div>
                  <div className="spec-v">{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <div className="panel-h">Totals</div>
            <div className="tot-row"><span>Per piece</span><span>{peso(order.totals.perPc)}</span></div>
            <div className="tot-row"><span>Garment × {order.qty} pcs</span><span>{peso(order.totals.total)}</span></div>
            <div className="tot-row"><span>Sample fee</span><span>{peso(order.totals.sampleFee)}</span></div>
            <div className="tot-row tot-row--grand"><span>Total (incl. sample fee)</span><span>{peso(order.totals.grandTotal)}</span></div>
            <div className="tot-row"><span>60% downpayment</span><span>{peso(order.totals.dp)}</span></div>
            <div className="tot-row"><span>40% balance</span><span>{peso(order.totals.bal)}</span></div>
          </div>

          {order.payments.length > 0 && (
            <div className="panel">
              <div className="panel-h">Payments</div>
              {order.payments.map((p) => (
                <div className="tot-row" key={p.id}>
                  <span>{PAY_LABEL[p.type] || p.type} · {p.channel}{p.ref ? ` · ${p.ref}` : ''}</span>
                  <StatusPill tone={p.status === 'approved' ? 'done' : p.status === 'rejected' ? 'danger' : 'wait'}>
                    {peso(p.amount)} · {p.status.replace('_', ' ')}
                  </StatusPill>
                </div>
              ))}
            </div>
          )}

          <div className="panel">
            <div className="panel-h">Activity</div>
            {[...order.timeline].reverse().map((e, i) => (
              <div className="tot-row" key={i}>
                <span>{e.note || getState(e.status).label}</span>
                <span className="trk-date">{fmtDateTime(e.at)}</span>
              </div>
            ))}
          </div>

          <div className="detail-actions">
            {!isTerminal(order.status) && (
              <button className="btn btn-gold" onClick={() => navigate('?page=payment&id=' + order.id)}>
                Continue / take action <IoArrowForward />
              </button>
            )}
            <button className="btn btn-ghost" onClick={() => navigate('?page=track-order&id=' + order.id)}>
              Track order
            </button>
            <button className="btn btn-ghost" onClick={reorder}>
              <IoRepeatOutline /> Reorder
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
