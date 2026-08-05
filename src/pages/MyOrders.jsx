// src/pages/MyOrders.jsx — signed-in order list (gated by RequireAuth in App).
// Fixes SYSTEM-FLOW §7: adds the missing "＋ New order" re-entry control to the dashboard.
import Navbar from '../components/Navbar.jsx'
import Footer from '../components/Footer.jsx'
import OrderCard from '../components/OrderCard.jsx'
import { IoAddCircleOutline, IoChevronForward } from 'react-icons/io5'
import { navigate } from '../utils/navigation.js'
import { useSession } from '../context/SessionContext.jsx'
import { useOrders } from '../context/OrderContext.jsx'
import { styleById, peso } from '../data/orderConfig.js'
import { fmtDate } from '../utils/format.js'
import '../design/dashboard.css'

export default function MyOrders() {
  const { user } = useSession()
  const { listForUser, pathLabel } = useOrders()
  const orders = [...listForUser(user.email)].sort(
    (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt),
  )

  return (
    <div className="page">
      <Navbar />
      <div className="page-body">
        <div className="dash">
          <div className="dash-head">
            <div>
              <div className="dash-eyebrow">Signed in as {user.email}</div>
              <h1 className="dash-title">My orders</h1>
            </div>
            <button className="btn btn-gold" onClick={() => navigate('?page=start')}>
              <IoAddCircleOutline /> New order
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="empty">
              <h2>No orders yet</h2>
              <p>Start your first custom-apparel order — it only takes a couple of minutes.</p>
              <button className="btn btn-gold" onClick={() => navigate('?page=start')}>Start an order</button>
            </div>
          ) : (
            <div className="orders">
              {orders.map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  meta={`${o.qty} pcs · ${styleById(o.form.style).label} · ${pathLabel(o.path)} · ${fmtDate(o.createdAt)}`}
                  total={peso(o.totals.grandTotal)}
                  icon={IoChevronForward}
                  onClick={() => navigate('?page=my-orders-info&id=' + o.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
