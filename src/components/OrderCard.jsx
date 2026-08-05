// src/components/OrderCard.jsx — order list-item row (design/dashboard.css .order-card).
import { getState } from '../data/orderStates.js'
import StatusPill from './StatusPill.jsx'

/**
 * @param order - the order record (reads .ref and .status)
 * @param meta - the meta line under the ref (e.g. "50 pcs · Plain Tee · ...")
 * @param total - optional right-aligned price (MyOrders shows it, TrackOrder doesn't)
 * @param icon - trailing icon component (IoChevronForward / IoArrowForward)
 * @param onClick
 */
export default function OrderCard({ order, meta, total, icon: Icon, onClick }) {
  const s = getState(order.status)
  return (
    <button className="order-card" onClick={onClick}>
      <div className="order-card-main">
        <div className="order-top">
          <span className="order-ref">{order.ref}</span>
          <StatusPill tone={s.tone}>{s.short}</StatusPill>
        </div>
        <div className="order-meta">{meta}</div>
      </div>
      {total != null && (
        <div className="order-right">
          <span className="order-meta">{total}</span>
        </div>
      )}
      <Icon className="order-arrow" />
    </button>
  )
}
